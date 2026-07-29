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
The subcontractor the Agencia hires. Retenido on leg 2: the Agencia practices withholdings on it. Its subtotal is **derived**, not entered — see [[Margen (ganancia)]].
_Avoid_: Proveedor ejecutor (suggests the Agencia merely intermediates — the mandato model that [ADR-0002](./docs/adr/0002-three-party-reventa-chain.md) rejected), Contratista

**Leg**:
One retenedor→retenido invoice relationship. The chain has two: **leg 1** (Cliente final → Agencia) and **leg 2** (Agencia → Proveedor). The same withholding engine runs on each leg with the roles swapped. The concepto is shared; the [[Municipio]] is per-leg (defaulted from the chain's) and the ICA tariff comes from each leg's own retenido.
_Avoid_: Tramo (in code), invoice (ambiguous — a leg produces an invoice)

**Retenedor / Retenido**:
The relational pair the engine operates on, replacing the old fixed Vendor/Client. The **retenedor** is the party that practices the withholding (must be an [[Agente de retención]]); the **retenido** is withheld-from. The Agencia is retenido on leg 1 and retenedor on leg 2.

**Margen (ganancia)**:
The Agencia's cut of the contract, entered as a percentage or a fixed peso amount, always on the subtotal (sin IVA). The Proveedor's subtotal is derived: `proveedor = contrato − margen`. The margen is the Agencia's ganancia (the spread), never below zero.
_Avoid_: Comisión (that would imply the mandato model, which this is not — see [ADR-0002](./docs/adr/0002-three-party-reventa-chain.md))

**Fiscal profile**:
A party's tax attributes: those **derived from the RUT's responsabilidades (casilla 53)** — the user enters the numbered codes, the profile is computed from them (see [ADR-0001](./docs/adr/0001-rut-derived-fiscal-profile.md)) — **plus municipal facts the national RUT cannot express**, which are entered directly (see [[Agente de ReteICA]], [[Base gravable especial]]). RUT-derived facts: `responsable de IVA`, `gran contribuyente`, `autorretenedor`, `declarante`, `agente de retención`, and `simple`. Uses post-2019 vocabulary. The UI states these in plain Spanish — **retiene renta** (agente de retefuente), **retiene IVA** (agente de reteIVA), **factura con IVA** (responsable de IVA) — as a uniform list of facts per party, never as who-withholds-whom (that is the legs' job to say). `declarante` and `autorretenedor` keep their technical names: no honest short paraphrase exists.
_Avoid_: Régimen simplificado (= no responsable de IVA), régimen común (= responsable de IVA)

**Agente de retención**:
The RUT responsabilidad that makes a party legally able to *practice* withholdings — código 07 (a título de renta), 09/23 (en el IVA). **This is a distinct fact from responsable de IVA (48):** a client can be responsable de IVA without being an agente de retención, in which case it withholds nothing. Covers retefuente and ReteIVA only — ICA agency is municipal, see [[Agente de ReteICA]].
_Avoid_: conflating "retiene" with "responsable de IVA"; reading código 07 as authority to withhold ICA

**Agente de ReteICA**:
The capacity to practice [[ReteICA]], **conferred by the municipality, not by the RUT** — Bogotá designates entidades públicas, grandes contribuyentes DIAN, and all régimen-común ICA taxpayers by resolution (Res. DDI-052377/2016, DDI-000305/2020). Entered per party as its own fact (defaulted from responsable de IVA), because no national code implies it.
_Avoid_: deriving it from código 07

**Régimen simple (SIMPLE)**:
RUT código 47. A retenido in the régimen simple is **not subject to retefuente nor ReteICA** — both are settled inside that party's SIMPLE return (ICA is consolidated into SIMPLE, art. 911 ET). It **is** subject to [[ReteIVA]]: the same article excludes retention "sin perjuicio de la retención… a título de IVA, regulada en el numeral 9 del art. 437-2" (DIAN Oficio 901166 de 2022). This closes what was an open question.

**Autorretenedor**:
RUT código 15 — a party that withholds income tax from itself, so **no retefuente is practiced on it**. A **national, renta-only** figure: it reaches neither [[ReteICA]] (municipal — self-withholding there is a separate municipal qualification, see [[Autorretenedor de ICA]]) nor [[ReteIVA]] (governed by art. 437-2, which does not mention it).
_Avoid_: reading 15 as blanket immunity from all withholding

**Autorretenedor de ICA**:
A party authorised **by municipal resolution** to withhold its own ICA; no retenedor practices [[ReteICA]] on it. Entered per party, and entirely distinct from RUT código 15.

**No aplica (razón)**:
Every withholding the engine zeroes carries the *reason* it did — the gate it failed, or the threshold it did not meet ("base mínima del concepto: $105.000"). The reason is engine output: it sits on the withholding's `detalle`, is asserted by the chain fixtures, and is **surfaced in the leg's notes panel, one line per non-applying withholding, never per row**. A withholding that does not apply renders no row at all. The **IVA line is the exception** — it always renders, with its reason, because it is a line of the invoice rather than a deduction, and hiding it would leave subtotal and [[Neto]] identical and unexplained. See [ADR-0004](./docs/adr/0004-inapplicable-withholdings-are-hidden.md).
_Avoid_: printing the reason in the row's place (the pre-ADR-0004 behaviour), "cero mudo"

**Bloqueo** (retired):
Formerly "the single fact that stops a whole leg from withholding anything". **No such fact exists**: each of the three withholdings answers to a different authority — retefuente to código 07, [[ReteICA]] to a municipal designation, [[ReteIVA]] to códigos 09/23 — so every condition that looked leg-wide gates only some of them. Replaced by per-retención gating; see [ADR-0005](./docs/adr/0005-per-retencion-gating.md).
_Avoid_: the word itself; say which withholding is gated and by what

**Retefuente**:
Withholding on income tax (retención en la fuente a título de renta). Rate depends on concepto and the retenido's declarante status; base is the subtotal, never the neto. Applies only above the concepto's base mínima.
_Avoid_: Retención (ambiguous — always qualify which one)

**ReteICA**:
Municipal withholding on industria y comercio, expressed per-mille (e.g., 9,66/1000). An advance on the retenido's own ICA, which it credits in its ICA return. The rate comes from the leg [[Municipio]]'s [[Regla de retención]] — **not necessarily from its ICA tariff table**. The base is the subtotal excluding IVA, or the [[Base gravable especial]] where one applies. Practised only by an [[Agente de ReteICA]]; never on a party in [[Régimen simple (SIMPLE)]] or an [[Autorretenedor de ICA]]. Other exclusions are the municipality's own — Bogotá and Cali exempt grandes contribuyentes that declare ICA there, Medellín exempts none.

**Regla de retención**:
How a municipality sets its ReteICA rate. Two shapes exist: **por actividad** — the tariff of the retenido's [[Actividad ICA]], falling back to the municipal maximum if it is not informed (Bogotá, Cali) — and **plana**, a single rate for every activity, unrelated to the ICA tariff table (Medellín: 1,8 x 1000, Ac. 093/2023 art. 83). The rule belongs to the municipality; assuming the first shape everywhere is wrong by up to 6× in Medellín.
_Avoid_: "la tarifa del municipio" (it is the tarifa of the *retención*, which may differ from the tarifa of the *impuesto*)

**Actividad ICA**:
The economic activity that sets a party's ICA tariff, keyed to its CIIU code. A **property of the party**, so each leg reads its retenido's: the Agencia's on leg 1, the Proveedor's on leg 2. Distinct from [[Concepto]], which is national and sets retefuente. Consulted only where the [[Regla de retención]] is *por actividad*; a flat-rate municipality ignores it.
_Avoid_: conflating it with the concepto, or with `icaClase` (which only picks the base mínima)

**Municipio**:
Where a leg's activity is taxed — for services, **where the service is executed** (Ley 1819/2016 art. 343), not the payer's domicile. A **property of the leg**, not of a party: the two legs of a chain can fall in different municipalities. Carries the tariff table and the bases mínimas.

**Base gravable especial**:
A statutory ICA base narrower than gross income. Agencias de publicidad, corredores and administradoras de bienes inmuebles pay ICA only on "los honorarios, comisiones y demás ingresos propios percibidos para sí" (Ley 1819/2016 art. 342 par. 1), and the withholding follows that base (D. 271/2002 art. 9). For the Agencia this is the [[Margen (ganancia)]], not the contrato. **ICA-only** — it does not touch invoicing, so it leaves the reventa/principal model of [ADR-0002](./docs/adr/0002-three-party-reventa-chain.md) intact. Entered per party, off by default: whether the Agencia qualifies is unconfirmed.

**Concepto**:
The withholding category a payment falls under (servicios generales, honorarios, compras, arrendamiento, …), picked manually by the user from the national table. Determines retefuente rate and base mínima. Known trap: influencer/content work is servicios generales (4%), not honorarios (11%).

**Base mínima**:
The threshold a subtotal must reach for a withholding to apply at all; below it, that withholding is zero. Retefuente bases come from the national table; ReteICA bases from the municipality.
_Avoid_: Cuantía mínima, tope

**ReteIVA**:
Withholding of 15% of the invoice's IVA (art. 437-1 ET), practiced when the **retenedor is an agente de reteIVA** (código 09/23) and the retenido is responsable de IVA **without itself being an agente de reteIVA** — art. 437-2 parágrafo exempts sales between withholding agents. Gates on the agente-de-reteIVA responsabilidad, **not** on a gran-contribuyente flag: that was the old heuristic, corrected by [ADR-0001](./docs/adr/0001-rut-derived-fiscal-profile.md) and then sharpened to the norm's own test. Unaffected by [[Autorretenedor]] (15), and applies under [[Régimen simple (SIMPLE)]]. Unverified against a real invoice — results carry an "ask the contadora" flag. State entities and 100%-rate cases not modeled.

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
- [`docs/retencion-ica.md`](./docs/retencion-ica.md) — ReteICA against primary sources: Ley 14/1983, Ley 1819/2016 arts. 342–344, Bogotá's Acuerdo 65/2002 and Decreto 352/2002, and the open question of where a tariff of 8,99 or 9,99 comes from.
- [Leegales — Tabla de ReteICA 2026 por ciudad](https://leegales.com/reteica-retencion-en-la-fuente-en-el-ica/) — ReteICA bases mínimas per municipality (Bogotá: servicios 4 UVT, compras 27 UVT; UVT 2026 = $52.374). Secondary — the normative figures are in 2002 pesos; see `docs/retencion-ica.md`.
- [Alegra — Retención de ICA](https://blog.alegra.com/colombia/certificado-retencion-de-ica/) — ReteICA mechanics and 2026 calendar.
- [Gerencie — Retención en la fuente en el ICA](https://www.gerencie.com/retencion-en-la-fuente-en-el-ica.html) — ReteICA general rules.
