# 02 — Chain working end to end (mockup case)

**What to build:** The three-party chain, live, for the happy path. The Agencia enters
the contract value sin IVA, one concepto, one municipio, a margen as a **percentage**,
and the RUT codes of the three parties (Cliente final, Matiz, Proveedor). The tool
computes both legs and shows the money step by step (Cliente factura → withholdings →
Matiz recibe → factura del proveedor → reteICA held → Proveedor recibe → tu ganancia)
plus the col-4 proveedor-invoice spec. Reventa/principal: IVA on the full contract on
leg 1. This is the demoable spine — enter the mockup, see every output.

**Blocked by:** 01

**Status:** done

Done 2026-07-25 — calcularCadena() + four-column UI; chain case green in the browser. See ## Desviación below.

- [x] `calcularCadena({ contrato, margen, concepto, municipio, icaTarifaPorMil, ivaRate, clienteFinal, agencia, proveedor })` returns `{ proveedorSubtotal, ganancia, leg1, leg2 }`; derives `proveedorSubtotal = contrato − margen`, calls `calcular()` twice with roles swapped
- [x] Three RUT code inputs (Cliente final, Matiz, Proveedor), reusing the existing code-input + profile derivation; single shared concepto and municipio
- [x] Contrato input + margen input (percentage); derived split shown ("$X para ti · $Y al proveedor")
- [x] Col 3 renders the money step-by-step with Matiz recibe, Proveedor recibe, and tu ganancia
- [x] Col 4 renders the proveedor-invoice spec (subtotal, IVA aplica/no, total, withholdings Matiz practices, "le giras"); no buttons
- [x] Chain golden test: contrato 100.000.000, margen 20%, servicios generales, Bogotá 9,66‰, mockup RUT profiles ⇒ proveedorSubtotal 80.000.000, ganancia 20.000.000, leg1 { iva 19.000.000, neto 119.000.000, retefuente 4.000.000, reteIVA 2.850.000, reteICA 966.000, totalAGirar 111.184.000 }, leg2 { iva 0, retefuente 0, reteIVA 0, ~~reteICA 772.800, totalAGirar 79.227.200~~ → **reteICA 0, totalAGirar 80.000.000** }
- [x] The 6 golden invoices still pass (leg-1-only non-regression)

## Desviación — ReteICA sobre un Proveedor en SIMPLE

The one acceptance number not met as written, and why.

**As specified:** leg 2 withholds ReteICA 772.800 on the mockup's Proveedor, giving
totalAGirar 79.227.200. The spec's Further Notes say the same: *"which is why leg 2
shows only ReteICA"*.

**As built:** leg 2 withholds nothing at all — ReteICA 0, totalAGirar 80.000.000.

**Why:** the mockup's Proveedor carries código 47 (régimen simple). A SIMPLE
contributor is not a subject of ICA withholding — ICA is consolidated into the SIMPLE
return (art. 911 ET). That rule was already decided, documented and implemented before
this ticket: ADR-0001, `rut-fiscal-profile/issues/03-simple-47.md`, and the
`!retenidoSimple` guard in `calcular()`. Producing 772.800 would have required
regressing it. The mockup's own arithmetic is already known to be unreliable — the spec
discards its reconciliation panel for the same reason.

**Leg 1 reproduces the mockup exactly**, all six figures.

**To see the 772.800:** the chain case *"Proveedor NO SIMPLE — el tramo 2 sí retiene"*
uses the same 80.000.000 subtotal with an ordinary-régimen Proveedor and yields exactly
that ReteICA, plus retefuente 3.200.000 and ReteIVA 2.280.000.

**If the contadora says the mockup was right after all**, drop `retenidoSimple` from
the ReteICA branch in `calcular()` and restate both this case and the SIMPLE rule in
ADR-0001 — they are one decision, not two.
