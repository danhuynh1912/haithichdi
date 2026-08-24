/**
 * Fill in `location_images.dominant_color` for pictures uploaded before the
 * column existed.
 *
 * The colour is the image's average, taken by asking sharp to resize it to a
 * single pixel — cheap, and for a photograph it lands on something close
 * enough to the overall tone to sit behind it without jarring. Uploads made
 * from the admin panel compute the same thing in the browser, so this is a
 * one-off for the backlog rather than part of the pipeline.
 *
 * Writes nothing but that one column — it never touches the files themselves —
 * and skips any row that already has a value unless --force is passed.
 * Reports and exits unless run with --apply.
 *
 * Usage:
 *   node --env-file=.env.local scripts/backfill-dominant-color.mjs
 *   ADMIN_EMAIL=you@example.com node --env-file=.env.local scripts/backfill-dominant-color.mjs --apply
 */

import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import { createInterface } from 'node:readline/promises';

const APPLY = process.argv.includes('--apply');
const FORCE = process.argv.includes('--force');
const CDN_BASE = 'https://d1ei3xw5e5agtc.cloudfront.net';

function toHex({ r, g, b }) {
  const pair = (value) => Math.round(value).toString(16).padStart(2, '0');
  return `#${pair(r)}${pair(g)}${pair(b)}`;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const email = process.env.ADMIN_EMAIL;

  if (!url || !anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY (use --env-file=.env.local)');
  }
  if (APPLY && !email) throw new Error('--apply needs ADMIN_EMAIL (an admin account)');

  const supabase = createClient(url, anonKey);

  if (APPLY) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    const password = await rl.question(`Password for ${email}: `);
    rl.close();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(`Admin sign-in failed: ${error.message}`);
    console.log('Signed in.\n');
  }

  const { data: rows, error } = await supabase
    .from('location_images')
    .select('id, image_path, image_url, dominant_color');
  if (error) throw new Error(`Read location_images: ${error.message}`);

  const todo = rows.filter((row) => FORCE || !row.dominant_color);
  console.log(`${rows.length} rows, ${todo.length} without a colour\n`);

  let done = 0;
  const failed = [];

  for (const row of todo) {
    const source = row.image_path
      ? `${CDN_BASE}/${row.image_path}`
      : row.image_url;
    if (!source) continue;

    try {
      // Through the optimiser, so this downloads a thumbnail rather than the
      // full-size original.
      const response = await fetch(source);
      if (!response.ok) throw new Error(`GET ${response.status}`);
      const buffer = Buffer.from(await response.arrayBuffer());

      // Squashing straight to one pixel IS the average — no need to resize
      // twice. `fill` so the whole frame contributes rather than a crop.
      const [r, g, b] = await sharp(buffer)
        .resize(1, 1, { fit: 'fill' })
        .removeAlpha()
        .raw()
        .toBuffer();

      const hex = toHex({ r, g, b });

      if (APPLY) {
        const { error: writeError } = await supabase
          .from('location_images')
          .update({ dominant_color: hex })
          .eq('id', row.id);
        if (writeError) throw new Error(writeError.message);
      }

      done += 1;
      console.log(`  ${hex}  ${row.image_path ?? row.image_url}`);
    } catch (err) {
      console.log(`  !! ${row.image_path ?? row.image_url} — ${err.message}`);
      failed.push(row.id);
    }
  }

  console.log(`\n${done} ${APPLY ? 'written' : 'computed'}${failed.length ? `, ${failed.length} failed` : ''}`);
  if (!APPLY) console.log('Dry run — nothing was written. Re-run with --apply.');
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
