# 04 — Update domain docs + ADR

Status: done
Blocked by: 01, 02

Done 2026-07-24 — CONTEXT.md rewritten (fiscal profile now RUT-derived; added
Agente de retención + Régimen simple terms); ADR-0001 created.

## What

1. **CONTEXT.md** — the "Fiscal profile" entry says *"selected manually (not
   RUT-parsed)"*. That decision is reversed. Rewrite: profile is now derived from
   RUT casilla-53 responsabilidades. Add **Agente de retención** to the language
   (codes 07 / 09-23) as distinct from **Responsable de IVA (48)** — they are not
   the same fact.
2. **docs/adr/** — new ADR recording the reversal: why (users have the RUT; the
   old IVA=retiene heuristic was wrong), what changed (agente de retención is now
   first-class), and the SIMPLE decision from ticket 03.

## Done when

- CONTEXT.md no longer claims manual-only; agente de retención defined.
- ADR committed alongside the code change.
