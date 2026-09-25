// Fill in cover and backdrop art URLs from Steam's public store search.
//
//   node scripts/fetch-covers.mjs
//
// Steam serves a 600x900 portrait for every app at a predictable URL and needs
// no API key, which makes it the fastest route to real box art before the IGDB
// catalogue exists. Games that are not on Steam keep their typographic cover —
// that fallback is a normal state, not an error (see CLAUDE.md).
//
// This writes coverUrl and backdropUrl values straight into src/data.ts.
// Re-run it any time you add titles; it never overwrites a URL that is already
// there, so it is safe to run repeatedly.

import { readFile, writeFile } from 'node:fs/promises';

const DATA = new URL('../src/data.ts', import.meta.url);
const ART = (id) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${id}/library_600x900.jpg`;

// The wide atmospheric image Steam uses behind a game's library page. Bigger
// and better framed than header.jpg for a screen backdrop. Not every app has
// one — the app falls back rather than showing a broken image.
const BACKDROP = (id) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${id}/library_hero.jpg`;

/** Ask Steam for the best match, and make sure it really is a match. */
async function findAppId(title) {
  const url =
    'https://store.steampowered.com/api/storesearch/?cc=us&l=en&term=' +
    encodeURIComponent(title);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Steam returned ${res.status}`);

  const { items = [] } = await res.json();
  if (items.length === 0) return null;

  // Steam's search is fuzzy enough to return Elden Ring for "Elden Ring Nightreign".
  // Require that the normalised title actually overlaps before trusting it.
  const want = normalise(title);
  const hit = items.find((i) => {
    const got = normalise(i.name);
    return got === want || got.startsWith(want) || want.startsWith(got);
  });
  return hit ? hit.id : null;
}

const normalise = (s) =>
  s
    .toLowerCase()
    .replace(/[\u2018\u2019']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

/** Escape a literal string for use inside a RegExp. */
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Turn the source text of a TS string literal into the string it denotes:
 * `Baldur\u2019s Gate 3` and `Baldur\'s Gate 3` both become readable titles to
 * search Steam with. We keep the raw form too — rewriting the file matches on
 * the raw text, so no escape has to survive a round trip.
 */
const decode = (raw) =>
  raw.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) =>
    String.fromCharCode(parseInt(h, 16)),
  ).replace(/\\(['"\\])/g, '$1');

let out = await readFile(DATA, 'utf8');

// ---------------------------------------------------------------------------
// Pass 1: backdrops for entries that already have a cover.
//
// The app id is already sitting in the cover URL, so this needs no network at
// all. Without this pass, titles filled by an earlier run could never gain a
// backdrop: pass 2 skips anything that already has a coverUrl.
// ---------------------------------------------------------------------------
let backdropped = 0;
out = out.replace(
  /(coverUrl:\s*'[^']*\/apps\/(\d+)\/library_600x900\.jpg',)(?!\s*backdropUrl)/g,
  (_, whole, id) => {
    backdropped++;
    return `${whole} backdropUrl: '${BACKDROP(id)}',`;
  },
);
if (backdropped > 0) {
  console.log(`Added ${backdropped} backdrop URLs from covers already present.\n`);
}

// ---------------------------------------------------------------------------
// Pass 2: look up titles that have no cover yet.
//
// Both quote styles are matched. data.ts uses double quotes for titles with an
// apostrophe in them ("Baldur's Gate 3"), and a single-quoted title may carry a
// \u2019 escape — a run that only understood one form silently skipped the other.
// ---------------------------------------------------------------------------
const seen = new Map();
for (const m of out.matchAll(/title:\s*(['"])((?:\\.|(?!\1)[^\\])*)\1/g)) {
  const [, quote, raw] = m;
  const title = decode(raw);
  if (!seen.has(title)) seen.set(title, new Set());
  // One title can appear in several literals with different quoting; rewrite
  // every distinct raw form, or some entries keep their fallback.
  seen.get(title).add(`${quote}${raw}`);
}

console.log(`Found ${seen.size} distinct titles.\n`);

let filled = 0;

for (const [title, forms] of seen) {
  // Nothing to do if every occurrence of this title already has art.
  const missing = [...forms].filter((form) => {
    const q = form[0];
    const raw = form.slice(1);
    return new RegExp(
      `title:\\s*${q}${escapeRegex(raw)}${q},(?!\\s*coverUrl)`,
    ).test(out);
  });
  if (missing.length === 0) continue;

  process.stdout.write(`  ${title} … `);
  try {
    const id = await findAppId(title);
    if (id === null) {
      console.log('not on Steam, keeping the fallback');
    } else {
      for (const form of missing) {
        const q = form[0];
        const raw = form.slice(1);
        const pattern = new RegExp(
          `(title:\\s*${q}${escapeRegex(raw)}${q},)(?!\\s*coverUrl)`,
          'g',
        );
        out = out.replace(
          pattern,
          `$1 coverUrl: '${ART(id)}', backdropUrl: '${BACKDROP(id)}',`,
        );
      }
      console.log(id);
      filled++;
    }
  } catch (err) {
    console.log(`failed: ${err.message}`);
  }

  // Be a good citizen: Steam is doing us a favour here.
  await new Promise((r) => setTimeout(r, 250));
}

if (filled > 0 || backdropped > 0) {
  await writeFile(DATA, out);
  console.log(
    `\nWrote ${filled} cover and ${filled + backdropped} backdrop URLs into src/data.ts.`,
  );
  console.log('Reload the app — real box art everywhere.');
} else {
  console.log('\nEverything already had art. Nothing to write.');
}
