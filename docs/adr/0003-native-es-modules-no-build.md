# ADR-0003 — Native ES modules, no build, no dependencies

Status: Accepted (2026-07-25)

## Context

The calculator lived as a single 939-line `index.html`: fiscal rule tables, the
withholding engine, the chain engine, HTML templates, DOM wiring, the stylesheet
and thirteen verification cases, interleaved. Three consequences:

- **Nothing failed.** The thirteen cases ran in the browser and painted a red row
  inside a `<details>`. No exit code, nothing stopping a commit with a broken
  engine.
- **Coverage had a ceiling.** Only the full chain output was assertable. Profile
  derivation, amount parsing, the reason shown when a withholding does not apply —
  none of it reachable separately, because none of it was importable separately.
- **Editing was expensive.** Changing a rate meant navigating CSS, templates and
  listeners. The engine had no boundary of its own.

The site is a static page published from `main` on GitHub Pages. Deploying is
`git push`. Any answer that required a build step would also require a deploy
pipeline, a lockfile, and a dependency surface to keep current — for a page whose
entire runtime is one form and some arithmetic.

## Decision

1. **Native ES modules, served verbatim.** `index.html` loads
   `<script type="module" src="./main.js">`; Pages serves the tree as-is from
   `main`. The browser and `node --test` import the exact same files, so there is
   no divergence between what is tested and what is served.

2. **No build step, no bundler, no minification, no TypeScript.**

3. **Zero dependencies.** `package.json` exists only to declare `"type": "module"`
   and the `test` script. No `dependencies` block, no lockfile. `npm install` is
   never required. `engines.node >= 22` is pinned because the test runner and
   native snapshots are used.

4. **Directional layering.** `datos/ ← dominio/ ← vista/ ← main.js`.
   - `datos/` — one module per rule table (conceptos, municipios,
     responsabilidades); three different sources, three different calendars.
   - `dominio/` — derived fiscal profile, tramo engine, chain engine. **May not
     import from `vista/` or from the formatter.**
   - `vista/` — formatting, HTML templates as pure functions, input parsing.
   - `main.js` — the only module that touches `document`. No arithmetic.

   The rule is what keeps Spanish prose out of the engine. It is checkable with
   `grep`, not enforced mechanically.

5. **`.js`, not `.mjs`**, to avoid depending on the MIME type Pages assigns to
   `.mjs`.

6. **Verification is `npm test`.** The thirteen cases run under `node --test`
   with an exit code. The in-page verification panel is now redundant and is
   removed in step 2 of the migration; until then it renders from the same
   fixture modules the tests import, so the two cannot drift.

## Consequences

- **`file://` stops working.** Opening `index.html` by double-click fails on
  module CORS. Local development requires a static server
  (`python3 -m http.server`). Recorded here and in `CLAUDE.md` so it is not
  chased as a bug.
- **No CI.** Verification is local `npm test` plus a rule in `CLAUDE.md`. The
  rule binds agents, not a manual `git commit` — a known and accepted gap. Git
  hooks were considered and deliberately not installed; they remain a future
  option.
- **`test/` and `fixtures/` are served publicly**, like `docs/` and `.scratch/`
  already are. Acceptable.
- **`.nojekyll`** is added at the root so Pages publishes the tree verbatim.
- Adding a dependency later means adding a build step, a lockfile and a deploy
  pipeline at the same time. That is the trade being made, not an oversight.
