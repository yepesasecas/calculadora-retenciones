Be extremely concise. Sacrifice grammar for the sake of concision.

## Verification

Run `npm test` before every commit and every push. No dependencies, no
`npm install`: requires Node >= 22. A red suite is never committed.

`dominio/` and `datos/` must not import from `vista/` or the formatter (ADR-0003).
Check with `grep -rn "vista/" dominio datos`.

Local dev: `python3 -m http.server`, open `http://localhost:8000/`.
Opening `index.html` by double-click no longer works (ES modules over `file://`).

## Agent skills

### Issue tracker

Issues live as local markdown under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` + `docs/adr/` at repo root. See `docs/agents/domain.md`.
