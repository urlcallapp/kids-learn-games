# Technical guide | kids-learn-games

[Back to the games catalog](README.md)

Static, Hebrew-first learning-games portal. This document covers implementation, scoring, storage, tests, adding games and deployment.

## Play and share

- The site root is the games portal.
- Each game has a real folder and its own `index.html`, so a direct game URL works on GitHub Pages, on refresh, and without client-side routing.
- The first game lives at `games/number-quest/`; the test-prep game (same workbook, printed pages up to 14 only) lives at `games/test-prep/`; the multiplication-table game (standalone dataset, no workbook) lives at `games/times-table/`. All use the shared `game.js` engine, which loads the dataset and page texts from the `data-config` module named on its script tag (resolved against the game page URL).
- The portal has a button to copy the absolute URL of a specific game. If clipboard access is blocked, it shows a selectable link instead.

## First game

71 exercises in 12 stations: sequences, building numbers, intervals, place value, rounding, addition/subtraction, multiplication, division, primes, operation order, word problems and a final mixed challenge.

Choose a topic or a six-question mixed round from six different topics. There is no timer and no penalty that ends a game. Each question has a hint, a worked explanation and optional freehand or typed scratch space. The canvas supports touch, mouse and pen with undo/clear, keeps strokes when resized, and prevents page scrolling only inside the drawing surface. No handwriting recognition is performed. Numeric answer fields request the device numeric keyboard with `inputmode="numeric"` and a numeric pattern; the browser and OS ultimately choose the keyboard. Text scratch space retains the normal keyboard. Skipped questions and answers that needed help can be practiced again at the end.

Stars: 3 on a first correct attempt, 2 with a hint, 1 after a wrong attempt or a revealed solution. The best star score for each question is saved locally. Repeated answers cannot inflate the maximum score of 213 stars.

Open-answer questions accept **all valid values**, not only one sample. The game supports ordered pairs, intervals, prime-number answers and multiselect. The workbook's two descending sequences are displayed consistently from left to right; their numeric content is preserved. Written-answer and explanation exercises are adapted to interactive choices. Final answers are checked, not handwriting or calculation layout.

The original workbook PDF is included unchanged at `assets/workbooks/grade-4-whole-numbers.pdf`, as explicitly requested, and linked from the portal and game. Its name/class/date fields are blank; no child-identifying entries were found. Source-page links open the relevant workbook page. No personal child details are required to play.

## Privacy

No sign-in, ads, analytics, paid services or application backend. Best scores stay in `localStorage` on the current browser and are not synchronized or sent anywhere. Scratch text and drawings last only for the current question. Multiple children using the same browser share that browser's progress. If browser storage is unavailable, the game still works and shows a warning. GitHub Pages itself serves the public files under GitHub's normal hosting policies.

## Run locally

No build or runtime dependencies are required:

```sh
python3 -m http.server 4173
```

Open the address printed by the server. JavaScript modules need HTTP(S), not `file://`.

## Tests

```sh
npm ci
npm test
npx playwright install chromium
npm run test:e2e
```

For an existing Chromium installation, set `CHROME_BIN=/path/to/chrome` when running the browser tests. Set `SCREENSHOT_DIR` to change where visual-check images are written.

The unit suite checks all reference answers, accepted intervals, boundaries, numeric formatting, primes and pair/multiselect validation. The browser suite completes all 71 questions through the real UI at phone size and tests errors, hints, skip/review, persistence, keyboard submission, direct entry, refresh and layouts at 320, 390 and 1280 pixels.

## Multiplication-table game

`games/times-table/config.js` is a standalone dataset (not a workbook subset): its own topics, questions and `checkAnswer`, importing only the `numberValue` helper from `questions.js`. Its questions have no `page`, so the engine shows no per-exercise workbook link for them, and its `meta.source` is `null`, so the map screen shows no workbook link and no workbook paragraph. Existing games keep those links because their `meta.source` is undefined and every question carries a `page`.

Memory questions (`topic: flash`) set `flash: <seconds>`. The expression is covered after that delay and must be answered from memory; a peek button reveals it and counts as a hint (2 stars maximum), matching the existing star rules. Scoring, skip/review and progress storage behave exactly as in the other games.

## Add another game

1. Create `games/<game-id>/config.js` exporting `questions`, `topics`, `checkAnswer` and `meta` (page `title`, `eyebrow`, `intro` and a separate versioned local-storage `key`). A subset of an existing workbook comes from filtering `questions.js`, as `games/test-prep/config.js` does.
2. Create `games/<game-id>/index.html`, with relative asset paths that work under the repository base path, loading `game.js` with `data-config="./config.js"`. Keep the shared `?v=` version token on the `style.css`, `game.js` and `config.js` references (see "Publish").
3. Add an entry to `games.js` (`id`, `title`, `added`, `tags`, `category`, `description`, `cta`, `href`, optional `source`). For a game without a source workbook set `source: null` in its `meta`.
4. Add answer and browser tests; verify phone sizes and direct links before publishing.

## Publish

GitHub Pages serves the `main` branch from the repository root. `.nojekyll` keeps the site as plain static files. No GitHub Actions workflow, package build, external font download or API key is needed.

Pages sends `Cache-Control: max-age=600` for every file and the header cannot be customized. To keep updates reliable, every local `.js`/`.css` reference carries a shared site version token (`?v=...`) that is bumped in all files together on any code, style or dataset change. `tests/versioning.test.js` enforces this twice: all tokens must match, and a content fingerprint of the versioned files (`tests/site-fingerprint.txt`) must be refreshed on every intended change, so a forgotten bump fails the tests. Large stable assets (PDF, favicons, images) are left unversioned so they keep caching. After a push, a visitor may still see the previous HTML for up to about ten minutes (its cache lifetime); from then on, a normal reload always loads the current version of every file.

## Link previews

- Both portal and game have absolute canonical and Open Graph URLs.
- `assets/previews/portal.png` is a 1200×630 PNG kept below 300 KB.
- Recreate it with `CHROME_BIN=/path/to/chrome node scripts/create-preview.mjs` after installing test dependencies.
- Preview caches belong to messaging apps. Metadata/image verification does not prove a specific WhatsApp client refreshed its cache.

## Portal search

Each game defines `tags` in `games.js`. The tag filter is derived only from these entries. Free text matches all query words against title, category, description and tags; one selected tag further narrows results. Hebrew vowel marks are ignored. No-results state includes a reset, and changes announce result counts.
