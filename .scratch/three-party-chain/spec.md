# Cadena de tres partes (Cliente final → Agencia → Proveedor)

Status: done

Delivered 2026-07-25 — all 4 tickets landed. One acceptance number was not met as
written (leg 2 ReteICA on a SIMPLE Proveedor); see the Desviación section in
`issues/02-chain-tracer-bullet.md`. The ReteIVA-under-SIMPLE question below is still
open and still unverified.

## Problem Statement

The calculator models a single invoice relationship (one Vendor, one Client). But
every real event job is a **chain of three**: a **Cliente final** contracts the
**Agencia** (you, shown as "Matiz"), who subcontracts a **Proveedor**. Today you
can only compute one leg at a time and have to reconcile the two invoices by hand —
what the Cliente withholds from you, what you must withhold from the Proveedor, and
what actually lands in your account. The tool never matched the work.

## Solution

Turn the calculator into the three-party chain. Enter the contract value sin IVA,
your margen, one concepto, one municipio, and the three parties' RUT codes. The tool
computes both invoice legs at once and shows, step by step: what the Cliente
invoices and withholds, what **Matiz recibe**, what you must withhold from the
Proveedor, what **Proveedor recibe**, and your **ganancia** — plus a ready-to-send
spec of exactly what the Proveedor should invoice you.

The chain is **reventa/principal**: you invoice the Cliente the full contract (IVA on
the full amount) and book the Proveedor's invoice as your cost. See
[ADR-0002](../../docs/adr/0002-three-party-reventa-chain.md) and the glossary in
[CONTEXT.md](../../CONTEXT.md).

## User Stories

1. As the Agencia, I want to enter the contract value sin IVA once, so that it anchors both invoice legs.
2. As the Agencia, I want to pick a single concepto, so that it drives retefuente rate/base and ICA class on both legs.
3. As the Agencia, I want to pick a single municipio, so that both ReteICA withholdings use the same tariff and bases.
4. As the Agencia, I want to enter my margen as a percentage, so that the Proveedor's subtotal is derived as contrato − margen.
5. As the Agencia, I want to enter my margen as a fixed peso amount instead, so that I can price jobs where my cut is a flat fee.
6. As the Agencia, I want to see my ganancia stated explicitly (= margen), so that I know my spread on the contract at a glance.
7. As the Agencia, I want to enter the Cliente final's RUT responsabilidades, so that leg 1's withholdings reflect whether the Cliente is an agente de retención.
8. As the Agencia, I want to enter my own (Matiz) RUT responsabilidades, so that leg 1 reflects my retenido status and leg 2 reflects my retenedor status.
9. As the Agencia, I want to enter the Proveedor's RUT responsabilidades, so that leg 2's withholdings reflect SIMPLE, no-responsable-IVA, and autorretenedor status.
10. As the Agencia, I want to see what the Cliente invoices me (subtotal + IVA on the full contract), so that I know the face value of leg 1.
11. As the Agencia, I want to see each withholding the Cliente practices on me (retefuente, reteIVA, reteICA) with its rate and amount, so that I can anticipate the deductions.
12. As the Agencia, I want to see "Matiz recibe" (leg-1 total a girar), so that I know what will actually land in my account from the Cliente.
13. As the Agencia, I want to see the Proveedor's invoice amount deducted, so that I can trace the money from what I received to what I pay out.
14. As the Agencia, I want to see the ReteICA I practice on the Proveedor as an amount I hold back, so that I know it stays with me to consign later.
15. As the Agencia, I want to see "Proveedor recibe" (leg-2 total a girar), so that I know exactly what to transfer to the Proveedor.
16. As the Agencia, I want a spec of what the Proveedor should invoice me — subtotal, IVA (aplica or no, with the driving code), total, the withholdings I will practice, and the net I will pay — so that I can tell the Proveedor precisely what to bill.
17. As the Agencia, I want the tool to tell me when a withholding does not apply and why (e.g. "Retefuente — no aplica (47)"), so that I understand the SIMPLE / no-responsable-IVA cases.
18. As the Agencia contracting a Proveedor in the régimen simple, I want retefuente and reteIVA forced to zero on leg 2, so that the numbers match the SIMPLE rule.
19. As the Agencia, I want IVA charged on the full contract on leg 1, not just on my margen, so that the reventa model is reflected correctly.
20. As the Agencia, I want a job with no Proveedor (margen = 100% / no subcontract) to still compute leg 1 correctly, so that plain single-invoice jobs keep working.
21. As the Agencia, I want the same withholding rules (bases mínimas, autorretenedor exemption, agente-de-retención gating) applied identically on both legs, so that I can trust the downstream numbers as much as the upstream ones.
22. As a maintainer, I want the 6 golden invoices to keep passing as leg-1-only cases, so that the restructuring is proven non-regressive.

## Implementation Decisions

- **New chain seam `calcularCadena()`** is the whole three-party model as one pure
  function.
  - **In:** `{ contrato, margen, concepto, municipio, icaTarifaPorMil, ivaRate, clienteFinal, agencia, proveedor }`.
    `margen` carries both its mode and value (percentage or fixed peso). Each party
    is an RUT-derived fiscal profile (same shape the profile derivation already
    produces, per [ADR-0001](../../docs/adr/0001-rut-derived-fiscal-profile.md)).
  - **Out:** `{ proveedorSubtotal, ganancia, leg1, leg2 }`, where `leg1` and `leg2`
    are each a `calcular()` result.
  - Derives `proveedorSubtotal = contrato − margen` (ganancia = margen), then calls
    `calcular()` twice: leg1 with `{ subtotal: contrato, retenedor: clienteFinal, retenido: agencia }`,
    leg2 with `{ subtotal: proveedorSubtotal, retenedor: agencia, retenido: proveedor }`.
- **`calcular()` stays the per-leg engine**, its two party params renamed from
  `cliente`/`vendedor` to **`retenedor`/`retenido`** (behavior unchanged). It keys
  withholding off the retenedor's agente-de-retención codes and the retenido's
  autorretenedor/SIMPLE/responsable-IVA status, exactly as today.
- **IVA per leg** is derived from the retenido's responsable-IVA status: full 19%
  (or the chosen rate) on leg 1 where the Agencia is responsable de IVA; forced to
  zero on leg 2 when the Proveedor is not responsable de IVA. No new IVA logic.
- **Three RUT inputs** replace the current two; each reuses the existing
  responsabilidades-code input and profile derivation.
- **Margen input** is a single control with a percentage/fixed toggle. Proveedor
  subtotal is display-derived and never entered. Guard `proveedorSubtotal ≥ 0`
  (fixed margen above the contract, or percentage > 100%, is invalid input).
- **Col-4 proveedor-invoice spec** is a pure projection of `leg2` (no third seam,
  no buttons, no send/copy actions).
- **UI** follows the mockup's four columns for the in-scope parts only: (1) contrato +
  concepto + margen, (2) RUT codes for the three parties + municipio, (3) money
  step-by-step (Cliente factura → withholdings → Matiz recibe → factura proveedor →
  reteICA held → Proveedor recibe → ganancia), (4) proveedor-invoice spec.

## Testing Decisions

- Good tests assert **external behavior of the seams** — the returned figures and the
  "no aplica" notas — never internal wiring or DOM details.
- **`calcular()` (low seam):** the existing `runGolden()` harness stays as-is; the 6
  golden invoices are the leg-1-only non-regression anchor and must reproduce their
  reference numbers exactly (the same prior art already in `index.html`).
- **`calcularCadena()` (high seam):** new cases asserting the chain end to end. The
  mockup is the primary golden case — contrato 100.000.000, margen 20%, concepto
  servicios generales, Bogotá 9,66‰, with the RUT profiles shown: it must yield
  proveedorSubtotal 80.000.000, ganancia 20.000.000, leg1 { iva 19.000.000, neto
  119.000.000, retefuente 4.000.000, reteIVA 2.850.000, reteICA 966.000, totalAGirar
  111.184.000 } and leg2 { iva 0, retefuente 0, reteIVA 0, reteICA 772.800,
  totalAGirar 79.227.200 }.
  **Corrected during implementation:** leg2's reteICA is **0** and totalAGirar
  **80.000.000** — a Proveedor in régimen simple (47) is not a subject of ReteICA.
  See the Desviación section in `issues/02-chain-tracer-bullet.md`.
- Additional `calcularCadena()` cases: margen as fixed peso; Proveedor NOT in SIMPLE
  (leg 2 accrues retefuente/reteIVA); margen 100% / no Proveedor collapses to leg 1;
  a leg where a base mínima is not met (withholding zero + nota).

## Out of Scope

- The reconciliation panels — "en caja quedan", "retenciones a favor", "IVA/ICA por
  consignar", the DIAN filing calendar. Deferred to their own grilling; the mockup's
  arithmetic there did not reconcile. Do not encode it.
- The named-scenario selector ("Evento Cliente X ▾") and any persistence.
- The "Copiar valores" and "Enviar al proveedor" actions — no buttons at all.
- Per-leg concepto and per-leg municipio (single shared value each for now).
- The mandato/comisión model — this spec is reventa/principal only.
- Parsing an uploaded RUT PDF (already out per ADR-0001).

## Further Notes

- The mockup's proveedor uses códigos 47 (SIMPLE) + 49 (no responsable de IVA).
  ~~which is why leg 2 shows only ReteICA~~ — **corrected during implementation:**
  47 zeroes ReteICA too, so leg 2 shows *no* withholding at all. See the Desviación
  section in `issues/02-chain-tracer-bullet.md`. Código 49 is already catalogued as
  "No responsable de IVA" and `deriveProfile` forces `responsableIVA = false` on it,
  so no confirmation is outstanding.
- ReteIVA remains flagged "confirm with contadora" as today; the chain does not change
  its gating, only applies it per leg.
- **Open question, unresolved — ReteIVA under SIMPLE.** The golden case below asserts
  `leg2 { reteIVA: 0 }` for a Proveedor in régimen simple. That rests on an
  *unverified* assumption in `calcular()`, not a confirmed rule — see
  [`rut-fiscal-profile/issues/03-simple-47.md`](../rut-fiscal-profile/issues/03-simple-47.md).
  Landing ticket 02 turns the assumption into a regression anchor, so resolve it with
  the contadora first if you can. If it flips, `leg2`'s reteIVA and totalAGirar both
  change and this spec's golden numbers must be restated.

## Tickets

Vertical tracer bullets (each cuts engine + UI + test), dependency-ordered:

- `issues/01-prefactor-retenedor-retenido.md` — prefactor: rename calcular() params. Blocked by: none.
- `issues/02-chain-tracer-bullet.md` — chain working end to end for the mockup case (% margen). Blocked by: 01.
- `issues/03-margen-fijo.md` — margen as fixed $ toggle. Blocked by: 02.
- `issues/04-edges-y-notas.md` — no-proveedor collapse, "no aplica" notas, guards. Blocked by: 02.
