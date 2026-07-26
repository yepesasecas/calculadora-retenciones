# ADR-0004 — Inapplicable withholdings render no row

Status: Accepted (2026-07-25)

## Context

Until now, a withholding the engine zeroed printed a row saying `no aplica` with
the reason underneath. That was a deliberate decision, recorded in `CONTEXT.md`'s
`No aplica (razón)` term and in `.scratch/module-split/spec.md` item 27: a bare zero
could be mistaken for an oversight or a bug, so the UI printed the reason in its
place.

The decision was right about the zero and wrong about the cost, for one reason
that only became visible once the three-party chain shipped: **`bloqueo` is
computed per leg, not per withholding.** If the retenedor is not agente de
retefuente, or the retenido is autorretenedor or in régimen simple, all three
withholdings take the *same* reason and print it three times. That is not an edge
case — the default proveedor is `["47", "49"]` (SIMPLE + no responsable de IVA),
so leg 2 is fully blocked out of the box. One identical sentence rendered **five
times across the two columns**, on top of the once it already appeared in the
notes panel.

What made the reversal safe is that the reason was already being said elsewhere:
`main.js` renders a per-leg notes panel, and the engine already pushed the three
`bloqueo` sentences and both base-mínima sentences into it. Hiding the rows loses
nothing *there*.

Coverage was not uniform, though. Four reasons — no agente de reteIVA (09/23),
retenido no responsable de IVA (49), retenido gran contribuyente (13), and a leg
whose invoice carries no IVA — existed **only** on the row, including the
gran-contribuyente rule that ADR-0001 had recently corrected. Those had to reach
the notes panel *before* the rows could be hidden, or they would have vanished
from the application entirely.

## Decision

1. **A withholding that does not apply renders no row.** Not the amount, not the
   words `no aplica`, not the reason. The row is absent.

2. **The notes panel is the single home for reasons.** One mechanism, not two. No
   per-leg summary line was added in the rows' place: the panel already says it
   once per leg, and a summary line would have made the view *more* conditional,
   which is the opposite of the point. The four missing reasons were pushed into
   the panel first, in a separate change that landed before this one.

3. **The IVA row is the exception: it always renders, with its reason.** A
   withholding is a *deduction* — absent, nothing was subtracted and the
   arithmetic still reads. IVA is a *line of the invoice itself* — absent,
   Subtotal and Neto sit adjacent, identical and unexplained. `el retenido no es
   responsable de IVA (49)` is also a headline fact about the counterparty, not a
   footnote.

4. **When nothing is left to paint, the proveedor-spec column drops the
   `Retenciones que le practicas:` heading and its table**, and renders `Le giras`
   on its own. Heading an empty table says nothing, and `Le giras` is the number
   that column exists for. The condition is "no withholding renders", which is
   slightly broader than "the leg is blocked" — a leg where all three fall
   individually also loses the heading, which is the correct generalisation.

5. **The flow column keeps both `Neto` and the leg total even when they are
   equal.** They answer different questions — what is invoiced, versus what lands
   in the account — and showing them equal *is* the finding. Collapsing them would
   also make the table change shape with the fiscal profile, defeating
   side-by-side comparison of two configurations.

## Consequences

- **Absence now carries meaning**, and it is weaker evidence than a printed
  reason: a missing row cannot, on its own, be told apart from a withholding the
  tool does not model. This is acceptable *only* because the notes panel names
  every reason the engine can emit **for a withholding**. (The IVA line's own two
  reasons never reach the panel; they survive because that row always paints —
  which is decision 3, and why it is not negotiable.) If a future withholding
  reason is added without a nota, the guarantee silently breaks — the engine tests
  that pin the four ReteIVA notes exist to catch exactly that.
- The reason still exists on `detalle[].razon` for every zeroed withholding. It is
  engine output and stays asserted by the chain fixtures; it is simply no longer
  rendered for withholdings.
- `.scratch/module-split/spec.md` US-27 now states the opposite of current
  behaviour. It is left untouched on purpose: it records what was asked at the
  time, and this ADR is where the change of mind lives.
