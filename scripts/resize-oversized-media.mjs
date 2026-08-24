/**
 * Shrink the oversized originals already sitting in S3.
 *
 * Why this exists: the optimiser has to download and decode the full original
 * every time it renders a size it has not cached, so a 6000px, 5 MB upload
 * makes the first view of that photo take seconds. `MAX_EDGE` in
 * admin/src/lib/upload.ts now caps new uploads at 2560; this brings the
 * existing ones down to the same ceiling.
 *
 * Safety, in order of how much it matters:
 *
 *   1. Nothing is ever deleted, and no key ever changes. Each image is
 *      rewritten under its own key, in its own format, so every reference to
 *      it keeps working — including the blog markdown, which embeds images by
 *      S3 key (see `markdownImageKeys` in the admin panel). Renaming would
 *      have quietly emptied those posts.
 *   2. Every original is written to a local backup directory BEFORE its
 *      replacement is uploaded. If the backup cannot be written, that image is
 *      skipped rather than replaced.
 *   3. Nothing is uploaded unless the resized copy decodes cleanly and is
 *      actually smaller.
 *   4. It reports and exits unless run with `--prepare` or `--apply`.
 *
 * To restore one: re-upload the file from the backup directory under the same
 * key. `.media-backup/manifest.json` lists every key that was touched.
 *
 * Lives here rather than in the admin panel because `sharp` ships with Next
 * and is already installed in this workspace; nothing else in the repo needs
 * it as a dependency.
 *
 * Three modes, in the order they are meant to be run:
 *
 *   (no flag)   Report what would change. Reads only.
 *   --prepare   Download, back up, and resize into `.media-resized/`, still
 *               without touching S3. Needs no credentials, and leaves the
 *               results on disk to be looked at before anything goes live.
 *   --apply     Upload the prepared files. Needs an admin login, and asks for
 *               the password at the prompt rather than reading it from the
 *               environment, so it stays out of shell history.
 *
 * Usage:
 *   node --env-file=.env.local scripts/resize-oversized-media.mjs
 *   node --env-file=.env.local scripts/resize-oversized-media.mjs --prepare
 *   ADMIN_EMAIL=you@example.com node --env-file=.env.local scripts/resize-oversized-media.mjs --apply
 */

import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
import { dirname, join } from 'node:path';

const MAX_EDGE = 2560;
/** Below this, the download cost is already small enough to leave alone. */
const SIZE_FLOOR_BYTES = 1.5 * 1024 * 1024;
/** Re-encoding always loses a little; skip anything that barely gains. */
const MIN_SAVING_RATIO = 0.15;
const QUALITY = 82;
const BACKUP_DIR = new URL('../.media-backup/', import.meta.url).pathname;
const RESIZED_DIR = new URL('../.media-resized/', import.meta.url).pathname;
const CDN_BASE = 'https://d1ei3xw5e5agtc.cloudfront.net';

const APPLY = process.argv.includes('--apply');
const PREPARE = process.argv.includes('--prepare');
/** Both writing modes need the originals fetched and re-encoded. */
const WRITES_LOCAL = APPLY || PREPARE;

/** Every column that stores an S3 key. Order is irrelevant — keys are unique. */
const SOURCES = [
  { table: 'location_images', column: 'image_path' },
  { table: 'locations', column: 'image_path' },
  { table: 'blogs', column: 'hero_path' },
  { table: 'blog_images', column: 'image_path' },
];

const ENCODERS = {
  jpeg: (pipeline) => pipeline.jpeg({ quality: QUALITY, mozjpeg: true }),
  png: (pipeline) => pipeline.png({ compressionLevel: 9 }),
  webp: (pipeline) => pipeline.webp({ quality: QUALITY }),
};

const CONTENT_TYPE = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

function fmt(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * One flaky request used to end the whole run — a `fetch failed` partway
 * through left the remaining images untouched and the operator guessing how
 * far it got. Transient network errors are retried, and whatever still fails
 * is reported at the end so it can be picked up on the next pass.
 */
async function withRetry(label, fn, attempts = 3) {
  for (let attempt = 1; ; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= attempts) throw err;
      console.log(`     .. ${label} failed (${err.message}), retry ${attempt}/${attempts - 1}`);
      await sleep(1000 * attempt);
    }
  }
}

/** True when the path already exists. */
async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const email = process.env.ADMIN_EMAIL;

  if (!url || !anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY (use --env-file=.env.local)');
  }
  if (APPLY && !email) {
    throw new Error('--apply needs ADMIN_EMAIL (an admin account)');
  }

  const supabase = createClient(url, anonKey);

  // Reading and resizing need no session; only the upload does.
  if (APPLY) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const password = await rl.question(`Password for ${email}: `);
    rl.close();

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(`Admin sign-in failed: ${error.message}`);
    console.log('Signed in.\n');
  }

  // --- Collect every stored key ---
  const keys = new Set();
  for (const { table, column } of SOURCES) {
    const { data, error } = await supabase.from(table).select(column);
    if (error) throw new Error(`Read ${table}.${column}: ${error.message}`);
    for (const row of data) if (row[column]) keys.add(row[column]);
  }
  console.log(`${keys.size} keys referenced by the database\n`);

  /**
   * Keys this script has already uploaded, from previous runs.
   *
   * Sizes cannot be read back to work this out: the only view of the bucket
   * here is through CloudFront, whose edges keep serving the pre-replacement
   * object until their TTL expires — and they expire at different times, so
   * two requests seconds apart can disagree about how big a file is. This
   * local log is the only reliable record of what has been done.
   */
  const uploadedPath = join(BACKUP_DIR, 'uploaded.json');
  const uploaded = new Set(
    await readFile(uploadedPath, 'utf8').then(JSON.parse).catch(() => []),
  );
  if (uploaded.size > 0) {
    console.log(`${uploaded.size} already uploaded by an earlier run, skipping those\n`);
  }

  const touched = [];
  const failed = [];
  let scanned = 0;
  let savedBytes = 0;
  let skippedSmall = 0;
  let skippedDone = 0;

  for (const key of [...keys].sort()) {
    scanned += 1;
    try {
      await handle(key);
    } catch (err) {
      // One bad image must not end the run; the original is untouched either
      // way, since nothing is replaced until its upload succeeds.
      console.log(`  !! ${key} — ${err.message}, skipped`);
      failed.push({ key, reason: err.message });
    }
  }

  async function handle(key) {
    if (APPLY && uploaded.has(key)) {
      skippedDone += 1;
      return;
    }

    const source = `${CDN_BASE}/${key}`;

    const head = await withRetry('HEAD', () => fetch(source, { method: 'HEAD' }));
    if (!head.ok) {
      console.log(`  ?? ${key} — HEAD ${head.status}, skipped`);
      return;
    }

    const originalBytes = Number(head.headers.get('content-length') ?? 0);
    if (originalBytes < SIZE_FLOOR_BYTES) {
      skippedSmall += 1;
      return;
    }

    const response = await withRetry('GET', () => fetch(source));
    if (!response.ok) {
      console.log(`  ?? ${key} — GET ${response.status}, skipped`);
      return;
    }
    const original = Buffer.from(await response.arrayBuffer());

    const image = sharp(original);
    const meta = await image.metadata();
    const encode = ENCODERS[meta.format];
    if (!encode) {
      console.log(`  ?? ${key} — format ${meta.format} not handled, skipped`);
      return;
    }

    const resized = await encode(
      sharp(original).resize({
        width: MAX_EDGE,
        height: MAX_EDGE,
        fit: 'inside',
        withoutEnlargement: true,
      }),
    ).toBuffer();

    // Re-decode what is about to replace a live image, rather than trusting
    // that the encode worked.
    const check = await sharp(resized).metadata();
    if (!check.width || !check.height) {
      console.log(`  !! ${key} — resized copy did not decode, skipped`);
      return;
    }

    const saving = 1 - resized.length / originalBytes;
    if (saving < MIN_SAVING_RATIO) {
      console.log(
        `  -- ${key} — only ${(saving * 100).toFixed(0)}% smaller, left alone`,
      );
      return;
    }

    console.log(
      `  => ${key}\n` +
        `     ${meta.width}x${meta.height} ${fmt(originalBytes)}` +
        ` -> ${check.width}x${check.height} ${fmt(resized.length)}` +
        ` (-${(saving * 100).toFixed(0)}%)`,
    );

    savedBytes += originalBytes - resized.length;
    touched.push({ key, originalBytes, newBytes: resized.length, format: meta.format });

    if (!WRITES_LOCAL) return;

    // --- Backup first, and treat a failed backup as a reason not to touch it ---
    const backupPath = join(BACKUP_DIR, key);
    const preparedPath = join(RESIZED_DIR, key);
    try {
      // Never overwrite a backup. On a second pass the "original" downloaded
      // here is whatever is live now — which, for an image this script already
      // replaced, is the shrunk one. Writing that over the backup would throw
      // away the only remaining copy of the true original.
      if (!(await exists(backupPath))) {
        await mkdir(dirname(backupPath), { recursive: true });
        await writeFile(backupPath, original);
      }
      await mkdir(dirname(preparedPath), { recursive: true });
      await writeFile(preparedPath, resized);
    } catch (err) {
      console.log(`     !! backup failed (${err.message}) — NOT replaced`);
      touched.pop();
      savedBytes -= originalBytes - resized.length;
      return;
    }

    if (!APPLY) return;

    // --- Overwrite under the very same key ---
    const contentType = CONTENT_TYPE[meta.format];
    const { data: session } = await supabase.auth.getSession();
    const presign = await withRetry('presign', () =>
      fetch(`${url}/functions/v1/presign-upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.session.access_token}`,
        },
        body: JSON.stringify({ key, contentType }),
      }),
    );

    if (!presign.ok) {
      const body = await presign.text();
      console.log(`     !! presign failed: ${presign.status} ${body}`);
      return;
    }

    const { uploadUrl } = await presign.json();
    const put = await withRetry('upload', () =>
      fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
        body: resized,
      }),
    );

    if (!put.ok) {
      console.log(`     !! upload failed: ${put.status} — original still in place`);
      return;
    }
    // Recorded immediately, not at the end: a run that dies partway through
    // must still leave behind an accurate account of what it replaced.
    uploaded.add(key);
    await writeFile(uploadedPath, JSON.stringify([...uploaded], null, 2));
    console.log('     ok, replaced (original kept in .media-backup/)');
  }

  console.log(
    `\nScanned ${scanned} · under ${fmt(SIZE_FLOOR_BYTES)} already: ${skippedSmall}` +
      (skippedDone > 0 ? ` · done earlier: ${skippedDone}` : '') +
      `\n${touched.length} ${APPLY ? 'replaced' : 'would shrink'}, saving ${fmt(savedBytes)}`,
  );

  if (failed.length > 0) {
    console.log(`\n${failed.length} could not be processed — re-run to pick them up:`);
    for (const { key, reason } of failed) console.log(`  ${key} (${reason})`);
  }

  if (WRITES_LOCAL && touched.length > 0) {
    const manifestPath = join(BACKUP_DIR, 'manifest.json');

    // Merge rather than replace. A second pass only sees the images it handled
    // this time, and rewriting the file with just those would lose the record
    // of everything an earlier, interrupted run had already backed up. The
    // earlier entry wins on a clash: its `originalBytes` describes the true
    // original, which is what the backup directory actually holds.
    const previous = await readFile(manifestPath, 'utf8')
      .then(JSON.parse)
      .catch(() => []);
    const merged = [...previous];
    const seen = new Set(previous.map((entry) => entry.key));
    for (const entry of touched) {
      if (!seen.has(entry.key)) merged.push(entry);
    }

    await writeFile(manifestPath, JSON.stringify(merged, null, 2));
    console.log(
      `Originals backed up under ${BACKUP_DIR}\n` +
        `Resized copies under ${RESIZED_DIR}\n` +
        `Manifest: ${manifestPath}`,
    );
  }

  if (!WRITES_LOCAL) {
    console.log('\nDry run — nothing was read beyond sizes. Use --prepare next.');
  } else if (!APPLY) {
    console.log(
      '\nPrepared only — S3 untouched. Look over the resized copies, then' +
        '\nre-run with --apply to upload them.',
    );
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
