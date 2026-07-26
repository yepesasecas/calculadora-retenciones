# 05 — Capture the prototype as a primary source

Status: done
Blocked by: 01, 02

Done 2026-07-24 — prototype-rut/ committed to branch `prototype/rut-fiscal-profile`
(commit 934fa98) and removed from main's working tree. Pointer recorded in ADR-0001.
The branch is local-only; push it if you want it preserved off-machine.

## What

Per the prototype skill's step 7: main keeps only the validated decision, not the
TUI scaffolding.

- Commit `prototype-rut/` to a throwaway branch (e.g. `prototype/rut-fiscal-profile`),
  out of main.
- Remove `prototype-rut/` from main once the logic is absorbed into the calculator.
- Leave a context pointer to the branch here and in the ADR (gist + branch name).

## Done when

- `prototype-rut/` no longer on main.
- Throwaway branch pushed/recorded; pointer left on this ticket.
