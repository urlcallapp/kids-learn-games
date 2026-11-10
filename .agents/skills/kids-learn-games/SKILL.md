---
name: kids-learn-games
description: Work on the kids-learn-games repo, a static Hebrew (RTL) portal of learning games for children, hosted on GitHub Pages. Use when adding a game, changing the portal, editing exercises, art, tags or link previews, or running the tests.
---

# kids-learn-games: guide for coding agents

Static site, no build step, no runtime dependencies, no backend, no analytics, no paid services. Plain ES modules served from the repo root by GitHub Pages (`main` branch, `.nojekyll`). Content is Hebrew and right-to-left (`<html lang="he" dir="rtl">`). Public site: https://urlcallapp.github.io/kids-learn-games/

Read `README.md` (catalog) and `TECHNICAL.md` (scoring, privacy, tests, publishing) too. Keep them accurate when you change something they describe.

## Map

| Path | Role |
| --- | --- |
| `index.html`, `portal.js` | Portal: hero, free-text search, tag filter, game cards, copy-link button. Cards are rendered from `games.js`. |
| `games.js` | **Game registry.** Exports `games`, the only list the portal reads. |
| `game.js` | Shared game engine used by every game page (map of stations, rounds, hints, stars, scratch pad, return-to-portal button, PDF source links). |
| `questions.js` | The workbook dataset: `topics`, `questions`, `checkAnswer`, `isPrime`, `numberValue`. |
| `drawing.js` | Touch/mouse/pen scratch canvas used by `game.js`. |
| `style.css` | Shared styles for portal and games. |
| `games/<game-id>/index.html` | One real folder per game, so direct URLs work on Pages and on refresh. No client-side router. |
| `games/<game-id>/config.js` | Per-game data module: `questions`, `topics`, `checkAnswer`, `meta`. |
| `assets/workbooks/` | Source PDF (`grade-4-whole-numbers.pdf`). Keep it unchanged. |
| `assets/previews/portal.png` | 1200x630 link-preview image, kept under 300 KB. |
| `assets/github-mark.png` | GitHub logo for the footer link. |
| `scripts/create-preview.mjs` | Regenerates the preview PNG with Playwright. |
| `tests/*.test.js`, `tests/e2e/game.spec.js` | Unit tests (node) and browser tests (Playwright). |

## How it fits together

- **Routes.** Portal is `/`. Each game is `/games/<game-id>/` with its own `index.html`. Current games: `number-quest` (71 exercises, 12 stations) and `test-prep` (36 exercises, 6 stations, printed pages up to 14 only). All paths in HTML are relative (`../../game.js`, `../../style.css`) so they work under the repository base path `/kids-learn-games/`. Never use root-absolute paths such as `/style.css`. Canonical and Open Graph URLs are the only absolute URLs.
- **Engine and config.** A game page loads `<script type="module" src="../../game.js" data-config="./config.js">`. `game.js` imports that module (resolved against the page URL) and reads `questions`, `topics`, `checkAnswer`, `meta`. `meta` has `key`, `title`, `eyebrow`, `intro`.
- **Dataset.** `questions.js` builds exercises with `q(topic,page,prompt,display,answer,hint,explanation,extra)`; ids are `<topic>-<n>` in order of creation (e.g. `place-6`). `page` is the printed page number in the source PDF, which equals the PDF file page. `kind` can be `range`, `pair`, `pairRange`, `prime`, `multi`, or omitted (single number or choices). Appending exercises at the end of a topic keeps ids stable. Inserting in the middle renumbers ids and breaks saved progress and tests.
- **Subsets of a workbook.** `games/test-prep/config.js` filters the shared dataset (`questions.filter(q=>q.page<=14)`, topics filtered to those still used) and reuses `checkAnswer`. Do the same for a new subset game. Do not copy exercises.
- **Progress isolation.** Best stars per exercise are saved in `localStorage` under `meta.key`, one key per game: `kids-learn-games.number-quest.v1`, `kids-learn-games.test-prep.v1`. A new game needs its own new key. Never reuse or rename an existing key (it would wipe or leak progress). Changing stored format needs a new version suffix. No sign-in, nothing is sent anywhere, no child identifiers are stored. Scratch text and drawings live only for the current question.
- **Portal cards.** Every `games.js` entry is: `id`, `title`, `added` (`YYYY-MM-DD`, shown as a `<time>` "added to the collection"), `tags`, `category`, `description`, `cta`, `art`, `href` (relative, `./games/<id>/`), optional `source` (relative PDF path). `art` is `{color,bg,strong,small,svg}`: text color, card background, a short bold caption, a small caption, and inline SVG (decorative, `aria-hidden`). Give each game its own illustration and color, not a copy of another card.
- **Tags.** The tag filter is built only from the `tags` of registry entries, nothing is hardcoded in the portal. Search matches all query words against title, category, description and tags, ignoring Hebrew vowel marks. Reuse existing tags when they apply (`חשבון`, `כיתה ד׳`, `מספרים שלמים`, `הכנה למבחן`) so filters stay meaningful.
- **Source PDF links.** Exercises link to `assets/workbooks/grade-4-whole-numbers.pdf#page=<q.page>`. A new workbook goes under `assets/workbooks/`, and its pages must be checked against its printed page numbers before filtering by page.
- **Previews.** Portal and game pages have canonical URL and Open Graph/Twitter tags pointing to `assets/previews/portal.png`. Regenerate with `CHROME_BIN=/path/to/chrome node scripts/create-preview.mjs` only if the portal look changes, and keep it 1200x630 and under 300 KB.

## Add a game safely

1. Pick a `<game-id>` (lowercase, hyphens). Create `games/<game-id>/config.js` exporting `questions`, `topics`, `checkAnswer`, `meta` (with a **new** `key` like `kids-learn-games.<game-id>.v1`). Easiest: copy `games/test-prep/config.js` and change the filter. New exercises go in `questions.js` (check answers independently, add hint and explanation, accept all valid answers for open questions).
2. Create `games/<game-id>/index.html` by copying `games/test-prep/index.html`: update title, description, canonical and Open Graph URLs and texts; keep relative asset paths and the `data-config="./config.js"` script tag.
3. Append an entry to `games.js` with all fields above, today's date in `added`, its own `art`, and honest tags.
4. Add the game to the `README.md` catalog table, and to `TECHNICAL.md` if it behaves differently.
5. Add tests (below). Do not change another game's exercises, ids, storage key, URL or `added` date.
6. Run the full checks, look at the portal and the new game at 320, 390 and 1280 px width, then open the direct game URL and reload it.

## Tests and commands

```sh
npm ci
npm test                     # node --test tests/*.test.js (unit: answers, test-prep subset)
npx playwright install chromium   # or set CHROME_BIN=/path/to/chrome
npm run test:e2e             # Playwright; starts python3 -m http.server 4173 itself
npm start                    # serve locally at http://127.0.0.1:4173 (needs HTTP, not file://)
```

- `tests/answers.test.js` checks the full dataset (71 exercises, 12 topics, unique ids, every reference answer accepted, open answers, pairs, primes, sequences). If you change `questions.js`, expect and update the counts deliberately.
- `tests/test-prep.test.js` pins the test-prep subset (36 exercises, all `page<=14`, 6 topics, storage key differs). Copy its pattern for a new subset game.
- `tests/e2e/game.spec.js` runs through the real UI: all 71 questions at phone size, hints/skip/review/scoring, storage failure, widths 320/390/1280, PDF link, link-preview metadata, portal search and tags, addition dates, return-to-portal button, per-game card art, one-shot success celebration, and the test-prep entry. Add a test for each new game's portal card, direct URL and scope. `SCREENSHOT_DIR` sets where visual-check images go.
- Before pushing, both `npm test` and `npm run test:e2e` must pass. Do not weaken or delete existing tests to make a change pass.

## Rules

- Do not change gameplay, scoring (3/2/1 stars, best score kept) or existing exercises unless asked.
- Keep the quiet exercise screen: no decoration behind text, no constant motion or flashing. The success celebration is a single short pop and respects `prefers-reduced-motion`.
- No external fonts, scripts, trackers, paid assets or API keys. No personal details of children in code, commits, assets or docs.
- Keep all user-facing text in Hebrew and layout RTL-safe.
- Publishing is a push to `main`; Pages deploys from the repo root. After pushing, check the live portal and game URLs.
