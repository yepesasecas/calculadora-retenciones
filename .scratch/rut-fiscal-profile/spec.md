# Perfil fiscal derivado del RUT

Status: done

Delivered 2026-07-24 — all 5 tickets landed. One question remains open and is
**not** blocking: ReteIVA under SIMPLE, see `issues/03-simple-47.md`.

## Problem

The calculator takes each party's fiscal profile as four hand-picked checkboxes.
CONTEXT.md pins this: *"selected manually (not RUT-parsed)"*. Users actually
have the RUT in hand — they should enter the RUT's **responsabilidades**
(casilla 53) and have the profile derived.

Prototype (`prototype-rut/`, throwaway) validated the approach and found a real
engine bug in passing. Verdict in `prototype-rut/README.md`.

## Decisions (validated by prototype)

1. **Input shape**: per party, the ~12 retención-relevant codes as toggles +
   a dropdown of the other ~35 (recognized but inert). Full DIAN table (47 rows)
   already reconciled in `prototype-rut/rut-profile.mjs`.
2. **`agente de retención` becomes first-class.** Today the engine assumes
   `cliente retiene ⇔ responsable de IVA (48)`. The RUT models it as codes
   **07** (retefuente) / **09/23** (reteIVA). A client that is `48` but not `07`
   must NOT withhold. This is a correctness fix, not just a UI change.
3. **SIMPLE (47)** zeroes retefuente + ReteICA for a vendor in that regime —
   model it, don't just flag it. (Pending final confirmation.)

## Scope

In: RUT-code input for both parties, derivation, the agente-de-retención fix,
SIMPLE handling, docs/ADR update, prototype capture.
Out: parsing an uploaded RUT PDF; modeling code 06 (ingresos y patrimonio)
ambiguity — leave flagged.

## Non-regression

The 6 golden invoices must still pass. Their clients are all real
agentes de retención, so mapping to `agente 07` must reproduce today's numbers.

## Tickets

- `issues/01-rut-input-ui.md` — replace checkboxes with codes + dropdown
- `issues/02-agente-retencion-engine.md` — first-class agente de retención (the fix)
- `issues/03-simple-47.md` — model SIMPLE
- `issues/04-docs-adr.md` — update CONTEXT.md + ADR
- `issues/05-capture-prototype.md` — capture prototype to throwaway branch
