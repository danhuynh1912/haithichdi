/**
 * Guards the message catalogues: every locale must expose exactly the same key
 * paths (and the same ICU placeholders) as the reference catalogue, vi.json.
 *
 * Run with `npm run i18n:check`.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const MESSAGES_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'messages');
const REFERENCE_LOCALE = 'vi';

const read = (locale) =>
  JSON.parse(readFileSync(join(MESSAGES_DIR, `${locale}.json`), 'utf8'));

/** Flattens to `a.b.0.c` paths so arrays are compared element by element. */
function flatten(value, prefix = '', out = new Map()) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => flatten(item, `${prefix}.${index}`, out));
  } else if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      flatten(item, prefix ? `${prefix}.${key}` : key, out);
    }
  } else {
    out.set(prefix, String(value));
  }
  return out;
}

/** `{count, plural, ...}` and `{name}` both contribute the argument name. */
function placeholders(message) {
  return new Set(
    [...message.matchAll(/\{\s*([a-zA-Z0-9_]+)\s*[,}]/g)].map((match) => match[1]),
  );
}

const reference = flatten(read(REFERENCE_LOCALE));
const locales = readdirSync(MESSAGES_DIR)
  .filter((file) => file.endsWith('.json'))
  .map((file) => file.replace(/\.json$/, ''))
  .filter((locale) => locale !== REFERENCE_LOCALE);

const problems = [];

for (const locale of locales) {
  const current = flatten(read(locale));

  for (const [path, referenceMessage] of reference) {
    if (!current.has(path)) {
      problems.push(`${locale}: missing key "${path}"`);
      continue;
    }

    const expected = placeholders(referenceMessage);
    const actual = placeholders(current.get(path));
    for (const name of expected) {
      if (!actual.has(name)) {
        problems.push(`${locale}: "${path}" is missing the {${name}} placeholder`);
      }
    }
  }

  for (const path of current.keys()) {
    if (!reference.has(path)) {
      problems.push(`${locale}: extra key "${path}" (not in ${REFERENCE_LOCALE}.json)`);
    }
  }
}

if (problems.length > 0) {
  console.error(`✗ ${problems.length} i18n problem(s):`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log(
  `✓ ${locales.length + 1} locales in sync (${reference.size} keys each).`,
);
