# Rete — Calculadora de retenciones (Colombia)

Agency-side calculator for a **three-party chain**: a **Cliente final** contracts the **Agencia** (you), who subcontracts a **Proveedor**. Given the contract value, predict the withholdings on both invoice legs and the net each party actually receives. The Agencia's perspective is central: it is withheld-from upstream and withholds downstream. See [ADR-0002](./docs/adr/0002-three-party-reventa-chain.md).

## Language

**Agencia**:
The middle party — **you**. Contracts with the Cliente final and subcontracts a Proveedor. Displayed in the UI as "Matiz" (a concrete instance); "Agencia" is the model/glossary name. On the **reventa/principal** model, the Agencia invoices the Cliente the full contract and books the Proveedor's invoice as its cost — it does not merely bill a commission. Plays retenido on leg 1 and retenedor on leg 2.
_Avoid_: Intermediario, Matiz (in the model), Vendor, Client

**Cliente final**:
The end buyer; the party that contracts and pays the Agencia. Retenedor on leg 1: practices withholdings on the Agencia per its own RUT codes. Its fiscal profile is an input.
_Avoid_: Buyer, customer, pagador

**Proveedor**:
The subcontractor the Agencia hires. Retenido on leg 2: the Agencia practices withholdings on it. Its subtotal is **derived**, not entered — see [[Margen]].

**Leg**:
One retenedor→retenido invoice relationship. The chain has two: **leg 1** (Cliente final → Agencia) and **leg 2** (Agencia → Proveedor). The same withholding engine runs on each leg with the roles swapped. Inputs (concepto, municipio) are shared across both legs.
_Avoid_: Tramo (in code), invoice (ambiguous — a leg produces an invoice)

**Retenedor / Retenido**:
The relational pair the engine operates on, replacing the old fixed Vendor/Client. The **retenedor** is the party that practices the withholding (must be an [[Agente de retención]]); the **retenido** is withheld-from. The Agencia is retenido on leg 1 and retenedor on leg 2.

**Margen (ganancia)**:
The Agencia's cut of the contract, entered as a percentage or a fixed peso amount, always on the subtotal (sin IVA). The Proveedor's subtotal is derived: `proveedor = contrato − margen`. The margen is the Agencia's ganancia (the spread), never below zero.
_Avoid_: Comisión (that would imply the mandato model, which this is not — see [ADR-0002](./docs/adr/0002-three-party-reventa-chain.md))

**Fiscal profile**:
A party's tax attributes, **derived from the RUT's responsabilidades (casilla 53)** — the user enters the numbered codes, the profile is computed from them (see [ADR-0001](./docs/adr/0001-rut-derived-fiscal-profile.md)). Derived facts: `responsable de IVA`, `gran contribuyente`, `autorretenedor`, `declarante`, `agente de retención`, and `simple`. Uses post-2019 vocabulary.
_Avoid_: Régimen simplificado (= no responsable de IVA), régimen común (= responsable de IVA)

**Agente de retención**:
The RUT responsabilidad that makes a party legally able to *practice* withholdings — código 07 (a título de renta), 09/23 (en el IVA). **This is a distinct fact from responsable de IVA (48):** a client can be responsable de IVA without being an agente de retención, in which case it withholds nothing. The client practices retenciones only if it is an agente de retefuente.
_Avoid_: conflating "retiene" with "responsable de IVA"

**Régimen simple (SIMPLE)**:
RUT código 47. A retenido in the régimen simple is **not subject to retefuente nor ReteICA** — the retenedor practices neither; they are settled inside that party's SIMPLE return (ICA is consolidated into SIMPLE, art. 911 ET). ReteIVA under SIMPLE is **unverified** — the engine currently excludes it too, but that is an assumption, not a confirmed rule; see the open question in `.scratch/rut-fiscal-profile/issues/03-simple-47.md`.

**No aplica (razón)**:
Every withholding the engine zeroes carries the *reason* it did — the blocking responsabilidad ("el retenido está en régimen simple (47)", "no responsable de IVA (49)", "el retenedor no es agente de retención (07)") or the threshold that was not met ("base mínima del concepto: $105.000"). A zero is never shown bare: the UI prints the reason in its place, so an inapplicable withholding is never mistaken for an oversight or a bug.

**Retefuente**:
Withholding on income tax (retención en la fuente a título de renta). Rate depends on concepto and the retenido's declarante status; base is the subtotal, never the neto. Applies only above the concepto's base mínima.
_Avoid_: Retención (ambiguous — always qualify which one)

**ReteICA**:
Municipal withholding on industria y comercio, expressed per-mille (e.g., 9,66/1000). Rate and bases mínimas depend on the municipality (default: Bogotá, UVT-based); base is the subtotal. A municipality is data (tariff + bases), not code.

**Concepto**:
The withholding category a payment falls under (servicios generales, honorarios, compras, arrendamiento, …), picked manually by the user from the national table. Determines retefuente rate and base mínima. Known trap: influencer/content work is servicios generales (4%), not honorarios (11%).

**Base mínima**:
The threshold a subtotal must reach for a withholding to apply at all; below it, that withholding is zero. Retefuente bases come from the national table; ReteICA bases from the municipality.
_Avoid_: Cuantía mínima, tope

**ReteIVA**:
Withholding of 15% of the invoice's IVA (art. 437-1 ET), practiced when the **retenedor is an agente de reteIVA** (código 09/23) and the retenido is responsable de IVA without being a gran contribuyente. Gates on the agente-de-reteIVA responsabilidad, **not** on the retenedor's gran-contribuyente flag — that was the old heuristic, corrected by [ADR-0001](./docs/adr/0001-rut-derived-fiscal-profile.md). Unverified against a real invoice — results carry an "ask the contadora" flag. State entities and 100%-rate cases not modeled.

**IVA rate**:
A single per-chain input: 19% (default), 5%, or 0%. **Each leg then decides independently whether it applies**, from that leg's retenido: a retenido who is no responsable de IVA (49/53) makes that leg's IVA zero, leaving the other leg untouched. The rate is never globally forced to zero on one party's account. The exento/excluido distinction is out of scope — both mean 0% here.

**Neto**:
Subtotal + IVA. The invoice's face value before withholdings.

**Total a girar**:
What the retenedor actually transfers to the retenido on a leg: Neto minus all withholdings practiced. Surfaces once per leg — as **"Matiz recibe"** (leg 1: what the Cliente final transfers to the Agencia) and **"Proveedor recibe"** (leg 2: what the Agencia transfers to the Proveedor).
_Avoid_: Net payment, amount due

**Reconciliation (deferred)**:
The Agencia's cash-vs-tax position — "en caja quedan", "retenciones a favor", "IVA/ICA por consignar", the DIAN filing calendar. **Not modeled yet**: the mockup's arithmetic did not reconcile (three conflicting figures for "what you owe"), so it is deferred to its own grilling. Do not encode it.

## Sources

- [`docs/retencion-en-la-fuente.md`](./docs/retencion-en-la-fuente.md) — OCR extraction of real invoices, 2026 retefuente rate table, régimen matrix, contadora notes (assets in `assets/`).
- [DIAN responsabilidades RUT (casilla 53)](https://dian-rut.com/consulta/responsabilidades-rut/) — códigos 01–56; the derived-profile table. See [ADR-0001](./docs/adr/0001-rut-derived-fiscal-profile.md).
- [Leegales — Tabla de ReteICA 2026 por ciudad](https://leegales.com/reteica-retencion-en-la-fuente-en-el-ica/) — ReteICA bases mínimas per municipality (Bogotá: servicios 4 UVT, compras 27 UVT; UVT 2026 = $52.374).
- [Alegra — Retención de ICA](https://blog.alegra.com/colombia/certificado-retencion-de-ica/) — ReteICA mechanics and 2026 calendar.
- [Gerencie — Retención en la fuente en el ICA](https://www.gerencie.com/retencion-en-la-fuente-en-el-ica.html) — ReteICA general rules.
