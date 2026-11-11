import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, writeFileSync, readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';

// Cache versioning: GitHub Pages serves every file with Cache-Control max-age=600
// and that header cannot be changed. HTML pages therefore revalidate within about
// ten minutes, but only a versioned (?v=...) script/stylesheet URL guarantees the
// browser fetches code that changed since its cached HTML was written. Every local
// .js/.css reference must carry the same site version token; bump them all together
// whenever any shared code or style changes. Large stable assets (PDF, favicons,
// images) stay unversioned on purpose so they keep caching well.

const gameIds = readdirSync('games', {withFileTypes: true}).filter(e => e.isDirectory()).map(e => e.name);
const files = ['index.html', 'portal.js', 'game.js',
  ...gameIds.flatMap(id => [`games/${id}/index.html`, `games/${id}/config.js`])];

const refPattern = /(?:src|href|data-config|from|export\s[^'"]*from)\s*=?\s*['"]?\(?['"]([^'"]+\.(?:js|css))(?:\?v=([^'")]+))?['"]/g;

test('every local js/css reference carries the same ?v= site version', () => {
  const tokens = new Set();
  const missing = [];
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    for (const m of text.matchAll(refPattern)) {
      const [, path, token] = m;
      if (path.includes('://')) continue;
      if (!token) missing.push(`${file} -> ${path}`);
      else tokens.add(token);
    }
  }
  assert.deepEqual(missing, [], `unversioned code/style references:\n${missing.join('\n')}`);
  assert.equal(tokens.size, 1, `expected one shared version token, found: ${[...tokens].join(', ')}`);
});

// Stronger guard: consistency alone cannot catch code that changed while its token
// stayed the same. The fingerprint covers the normalized contents of every file that
// carries the token, so any edit to them without a bump fails here and prints the new
// fingerprint to record alongside the new token.
test('versioned files did not change without a token bump', () => {
  const h = createHash('sha256');
  for (const file of files) {
    const normalized = readFileSync(file, 'utf8').replace(/\?v=[^'")]+/g, '?v=');
    h.update(file).update('\0').update(normalized).update('\0');
  }
  const fingerprint = h.digest('hex').slice(0, 16);
  const recordedFile = 'tests/site-fingerprint.txt';
  const recorded = readFileSync(recordedFile, 'utf8').trim();
  assert.equal(fingerprint, recorded,
    `versioned code/style changed without a token bump. If the change is intended, bump every ?v= token to a new value and record the new fingerprint in ${recordedFile}: ${fingerprint}`);
});
