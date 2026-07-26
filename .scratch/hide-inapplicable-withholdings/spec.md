# Ocultar las retenciones que no aplican

Status: ready-for-agent

Source: a `/grill-with-docs` session (2026-07-25). There was no prior spec — the
grilling *is* the spec. Eight decisions, all recorded below.

## Problem

Every withholding the engine zeroes carries the reason it did, and the UI prints
that reason in the row's place. The reason is correct. The *repetition* is not.

`bloqueo` in `dominio/tramo.js` is computed **per leg, not per retención**: if the
retenedor is not agente de retefuente, or the retenido is autorretenedor or SIMPLE,
all three `razon`s take the same value. So one identical sentence renders three
times per leg — and the repo's default proveedor is `["47", "49"]` (SIMPLE + no
responsable de IVA), which means **leg 2 is all-blocked out of the box**.

In the screenshot that started this, *"el retenedor no es agente de retención (07)"*
appears **six times** on one screen: three rows in col 3, two in col 4, and once in
the notes panel.

## The reversal

This spec **reverses a documented decision**. `CONTEXT.md`'s `No aplica (razón)`
term states: *"A zero is never shown bare: the UI prints the reason in its place, so
an inapplicable withholding is never mistaken for an oversight or a bug."*
`.scratch/module-split/spec.md` US-27 and `README.md` say the same.

The reversal is defensible only because of a fact found during the grilling: the
reasons are **already** rendered a second time. `main.js` renders a per-leg notes
panel, and `dominio/tramo.js` already pushes the three `bloqueo` sentences and both
base-mínima sentences into it. Hiding the rows loses nothing *there*.

But coverage was not uniform. Four reasons existed **only** on the row:

| reason | in `notas` before this spec? |
| --- | --- |
| retenedor no es agente (07) | yes |
| retenido autorretenedor (15) | yes |
| retenido régimen simple (47) | yes |
| base mínima del concepto | yes |
| base mínima municipal | yes |
| **no es agente de reteIVA (09/23)** | **no** |
| **retenido no responsable de IVA (49)** | **no** |
| **retenido es gran contribuyente (13)** | **no** |
| **la factura no lleva IVA** | **no** |

Those four must move into `notas` **before** the rows are hidden, or they vanish
from the app entirely — including the gran-contribuyente case, a rule `CONTEXT.md`
flags as recently corrected by ADR-0001. That ordering is the whole reason ticket
01 gates ticket 02.

## Decisions

1. **The model changes, not just the presentation.** Absence means "does not
   apply". The `No aplica (razón)` term is amended and an ADR records the reversal.
2. **Hide retenciones, not rows.** The rule is *"hide inapplicable retenciones"*,
   never *"hide inapplicable rows"*.
3. **The IVA row always renders**, with its reason, even at `$ 0`. A retención is a
   *deduction* (absent = nothing subtracted, arithmetic still legible); IVA is a
   *line of the invoice itself* (absent = Subtotal and Neto sit adjacent, identical
   and unexplained). `el retenido no es responsable de IVA (49)` is also a headline
   fact about who you are dealing with, and it is the default fixture's case.
4. **The notes panel is the single home for reasons.** One mechanism, not two. No
   per-leg summary line was added — the panel already says it once per leg, and a
   summary line would have made `vista/` *more* conditional, not less.
5. **Col 4, whole leg blocked:** the `Retenciones que le practicas:` heading and its
   table are suppressed entirely; `Le giras` is re-rendered on its own. Dropping
   `Le giras` too was rejected — it is the one number the reader came to col 4 for.
6. **Col 3, whole leg blocked:** `Neto que le facturas` and `Matiz recibe` both
   stay, equal. They answer different questions ("what do I invoice?" vs "what lands
   in the account?") and showing them equal *is* the finding. Collapsing would also
   make the table's row structure change shape with the fiscal profile, defeating
   side-by-side comparison of two configurations.
7. **`detalle[].razon` is untouched.** Only `notas` grows. Every existing
   `razones1` / `razones2` fixture assertion keeps passing unmodified.
8. **US-27 in `.scratch/module-split/spec.md` is left alone.** Rewriting closed
   specs erases history; ADR-0004 is where the change of mind lives.

## Scope

In: the four missing `notas`; hiding inapplicable retención rows in both columns;
col 4's suppressed section; ADR-0004; the `No aplica (razón)` term; the README
paragraph.

Out: extracting the pure view seam. The view is not callable from Node today —
`main.js` touches `document` at import time — so the hiding itself lands untested,
as all view behaviour is today. That extraction is already tracked as
`.scratch/module-split/issues/03-costura-de-render.md` and pulling it forward would
turn a small change into a restructure.

## Testing Decisions

- Tests assert engine output only: the four new `notas` fire in their four
  conditions. That is the part that can silently break, because after this change
  those sentences are the *only* place those reasons live.
- Verified before starting: **nothing currently asserts `notas`**
  (`grep -n "notas" test/cadena.test.js fixtures/cadena.js` is empty), so no
  existing test breaks when the four are added.
- No view test. See Scope/Out.

## Non-regression

- The 7 chain cases must reproduce their figures exactly. `detalle[].razon` does
  not change, so `razones1` / `razones2` must pass untouched.
- `grep -rn "vista/" dominio datos` stays empty (ADR-0003).

## Tickets

- `issues/01-razones-reteiva-a-notas.md` — the four ReteIVA reasons reach the notes panel. Blocked by: none.
- `issues/02-ocultar-filas-que-no-aplican.md` — inapplicable retenciones stop rendering. Blocked by: 01.
- `issues/03-adr-y-glosario.md` — ADR-0004, the glossary term, the README. Blocked by: 02.
