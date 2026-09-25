// Check that every art URL in src/data.ts actually resolves.
//
//   node scripts/check-art.mjs
//
// Steam serves library_600x900.jpg for essentially every app, but library_hero
// is not guaranteed — plenty of older or smaller titles have none. The app
// falls back cleanly when one 404s, so a miss here is information, not a fault.
// Run this from a machine with open internet; the cloud container's network
// policy blocks Steam.

import { readFile } from 'node:fs/promises';

const DATA = new URL('../src/data.ts', import.meta.url);
const source = await readFile(DATA, 'utf8');

// Collect each distinct URL once, remembering which field it came from.
const urls = new Map();
for (const m of source.matchAll(/(coverUrl|backdropUrl):\s*'([^']+)'/g)) {
  if (!urls.has(m[2])) urls.set(m[2], m[1]);
}

console.log(`Checking ${urls.size} art URLs.\n`);

const missing = [];
let ok = 0;

for (const [url, field] of urls) {
  const name = url.match(/apps\/(\d+)\//)?.[1] ?? url;
  const kind = field === 'coverUrl' ? 'cover ' : 'hero  ';
  try {
    const res = await fetch(url, { method: 'HEAD' });
    if (res.ok) {
      ok++;
      console.log(`  ok    ${kind} ${name}`);
    } else {
      missing.push({ url, field, status: res.status });
      console.log(`  ${res.status}   ${kind} ${name}`);
    }
  } catch (err) {
    missing.push({ url, field, status: err.message });
    console.log(`  fail  ${kind} ${name}  ${err.message}`);
  }
  await new Promise((r) => setTimeout(r, 100));
}

console.log(`\n${ok} resolved, ${missing.length} did not.`);

if (missing.length > 0) {
  const heroes = missing.filter((m) => m.field === 'backdropUrl').length;
  const covers = missing.length - heroes;
  console.log(
    `  ${heroes} missing backdrops — expected for some apps, the header falls back.`,
  );
  if (covers > 0) {
    console.log(`  ${covers} missing COVERS — that is worth fixing, the app id is probably wrong.`);
  }
  console.log('\nURLs that failed:');
  for (const m of missing) console.log(`  ${m.status}  ${m.url}`);
}
