/**
 * Rebuild the site icons from the master logo.
 *
 * Google and iOS both draw a favicon onto their own background, and neither
 * asks first: a transparent corner comes out black on a dark search result and
 * on the iOS home screen. So every icon written here is opaque, edge to edge.
 *
 * Only the emblem goes in. The full logo carries the wordmark and the tagline
 * under it, and at the 16-32px a tab or a search result actually renders they
 * are a smudge — dropping them buys the mark the room to be recognisable.
 *
 * Usage:
 *   node scripts/build-icons.mjs
 */

import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.join(root, 'public/haithichdi-logo-red.png');

/**
 * The emblem's box inside the 2366px master, measured from its alpha channel
 * — the master is a committed asset, so this does not drift. The wordmark
 * bands start at y=1465.
 */
const EMBLEM = { left: 631, top: 329, width: 1091, height: 1092 };

/** Paper white, so the icon reads as the logo's own card rather than a hole. */
const BACKGROUND = { r: 255, g: 255, b: 255, alpha: 1 };

/**
 * How much of the square the emblem fills. A circular crop — which is what a
 * Google result does — takes the corners, and at 0.8 the mark clears the
 * inscribed circle with a hair to spare.
 */
const FILL = 0.8;

async function square(size) {
  const inner = Math.round(size * FILL);
  const emblem = await sharp(SOURCE)
    .extract(EMBLEM)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  return sharp({
    create: { width: size, height: size, channels: 4, background: BACKGROUND },
  })
    .composite([{ input: emblem, gravity: 'centre' }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

/**
 * An .ico is a 6-byte header, one 16-byte directory entry per image, then the
 * images themselves — PNG payloads are legal since Vista and are what every
 * browser that still reads .ico expects at these sizes.
 */
function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(images.length, 4);

  const directory = Buffer.alloc(16 * images.length);
  let offset = header.length + directory.length;

  images.forEach(({ size, data }, index) => {
    const entry = index * 16;
    // 256 does not fit in a byte and is written as 0, which is the format's
    // own convention for it.
    directory.writeUInt8(size >= 256 ? 0 : size, entry);
    directory.writeUInt8(size >= 256 ? 0 : size, entry + 1);
    directory.writeUInt8(0, entry + 2); // palette size: none
    directory.writeUInt8(0, entry + 3); // reserved
    directory.writeUInt16LE(1, entry + 4); // colour planes
    directory.writeUInt16LE(32, entry + 6); // bits per pixel
    directory.writeUInt32LE(data.length, entry + 8);
    directory.writeUInt32LE(offset, entry + 12);
    offset += data.length;
  });

  return Buffer.concat([header, directory, ...images.map((image) => image.data)]);
}

// Google asks for a favicon that is a multiple of 48px; the smaller entries are
// for the browser tab, which picks the nearest size itself.
const ICO_SIZES = [16, 32, 48, 96, 192];

const [icon, appleIcon, ...icoImages] = await Promise.all([
  square(512),
  square(180),
  ...ICO_SIZES.map((size) => square(size)),
]);

await writeFile(path.join(root, 'app/icon.png'), icon);
await writeFile(path.join(root, 'app/apple-icon.png'), appleIcon);
await writeFile(
  path.join(root, 'app/favicon.ico'),
  ico(ICO_SIZES.map((size, index) => ({ size, data: icoImages[index] }))),
);

console.log('Wrote app/icon.png, app/apple-icon.png, app/favicon.ico');
