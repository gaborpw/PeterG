// Fill in cover art URLs from Steam's public store search.
//
//   node scripts/fetch-covers.mjs
//
// Steam serves a 600x900 portrait for every app at a predictable URL and needs
// no API key, which makes it the fastest route to real box art before the IGDB
// catalogue exists. Games that are not on Steam keep their typographic cover —
// that fallback is a normal state, not an error (see CLAUDE.md).
//
// This writes coverUrl values straight into src/data.ts. Re-run it any time you
// add titles; it only touches entries that have no coverUrl yet.

import { readFile, writeFile } from 'node:fs/promises';

const DATA = new URL('../src/data.ts', import.meta.url);
const ART = (id) =>
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${id}/library_600x900.jpg`;

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

const source = await readFile(DATA, 'utf8');

// Every `title: '...'` that does not already have a coverUrl beside it.
const titles = [...source.matchAll(/title:\s*'((?:[^'\\]|\\.)*)'/g)]
  .map((m) => m[1].replace(/\\'/g, "'").replace(/\\u2019/g, '\u2019'))
  .filter((t, i, all) => all.indexOf(t) === i);

console.log(`Found ${titles.length} distinct titles.\n`);

let out = source;
let filled = 0;

for (const title of titles) {
  process.stdout.write(`  ${title} … `);
  try {
    const id = await findAppId(title);
    if (id === null) {
      console.log('not on Steam, keeping the fallback');
      continue;
    }

    // Insert coverUrl right after this title, unless one is already there.
    const escaped = title.replace(/'/g, "\\'").replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = new RegExp(`(title:\\s*'${escaped}',)(?!\\s*coverUrl)`, 'g');
    const before = out;
    out = out.replace(pattern, `$1 coverUrl: '${ART(id)}',`);

    if (out === before) console.log(`${id} (already had one)`);
    else {
      console.log(id);
      filled++;
    }
  } catch (err) {
    console.log(`failed: ${err.message}`);
  }

  // Be a good citizen: Steam is doing us a favour here.
  await new Promise((r) => setTimeout(r, 250));
}

if (filled > 0) {
  await writeFile(DATA, out);
  console.log(`\nWrote ${filled} cover URLs into src/data.ts.`);
  console.log('Reload the app — real box art everywhere.');
} else {
  console.log('\nNothing to add; every title already had a cover or is not on Steam.');
}
