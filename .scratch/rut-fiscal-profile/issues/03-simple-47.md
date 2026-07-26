# 03 — Model SIMPLE (código 47)

Status: done
Blocked by: 02

Done 2026-07-24 — vendor with código 47 zeroes retefuente+ReteICA with a note; verified in browser.

**This ticket is closed but leaves an open question — see `## Open question` below.
Do not treat SIMPLE's ReteIVA behaviour as settled.**

## Decision

Confirmed 2026-07-24: **model it** (force retefuente + ReteICA to zero for a
vendor with código 47).

## Rule

A vendor enrolled in **Régimen Simple de Tributación (código 47)** is NOT subject
to retención en la fuente a título de renta, NOR to ReteICA — those are paid
inside the SIMPLE return (ICA is consolidated into SIMPLE).

## What (if modeling)

In `calcular`: if `vendedor` carries código 47, force `retefuente = 0` and
`reteica = 0` with a note ("Vendedor en régimen simple (SIMPLE): no sujeto a
retefuente ni ReteICA"). Applies regardless of concepto/bases. ReteIVA behaviour
under SIMPLE — verify with contadora before assuming; flag rather than guess.

## Done when

- Vendor with `47` → retefuente and reteica both zero, with the note.
- The prototype's `47` alert is replaced by real handling.

## Open question — ReteIVA under SIMPLE (unresolved)

**Question:** does a vendor in régimen simple (código 47) get ReteIVA practiced on
them, or is ReteIVA also excluded the way retefuente and ReteICA are?

**Status:** unverified. Ask the contadora. This ticket said "flag rather than
guess" — the guess got made anyway.

**What the code actually does:** `index.html` gates ReteIVA on `!vendedorSimple`,
i.e. it assumes SIMPLE **excludes** ReteIVA too. That is an assumption, not a
confirmed rule, and it is not visibly flagged in the UI the way the ReteIVA tarifa
itself is ("confirmar con la contadora").

**Why it now matters more than when this ticket was written:** the three-party
chain spec bakes the assumption into its primary golden case — the mockup's
Proveedor is `47` + `49`, and the expected `leg2` asserts `reteIVA 0`. Once
`.scratch/three-party-chain/issues/02` lands, an unverified rule becomes a
regression anchor that future work is not allowed to break.

**If the answer comes back the other way:** drop `!vendedorSimple` from the ReteIVA
gate in `calcular()`, and the chain golden's `leg2` reteIVA and `totalAGirar`
both change. Cheaper to resolve before 02 than after.
