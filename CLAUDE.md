Be extremely concise. Sacrifice grammar for the sake of concision.

## Verificación

Correr `npm test` antes de cada commit y antes de cada push. Sin dependencias, sin
`npm install`: requiere Node >= 22. Un suite rojo no se commitea.

`dominio/` y `datos/` no importan de `vista/` ni del formateador (ADR-0003).
Verificable con `grep -rn "vista/" dominio datos`.

Desarrollo local: `python3 -m http.server` y abrir `http://localhost:8000/`.
Abrir `index.html` con doble clic ya no funciona (módulos ES sobre `file://`).

## Agent skills

### Issue tracker

Issues live as local markdown under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` + `docs/adr/` at repo root. See `docs/agents/domain.md`.
