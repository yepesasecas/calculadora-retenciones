# ADR-0002 — Three-party reventa chain

Status: Accepted (2026-07-25)

## Context

The calculator modeled a single relationship: one Vendor issues one invoice, one
Client practices withholdings (see [ADR-0001](./0001-rut-derived-fiscal-profile.md)).
Real jobs are a **chain of three**: a **Cliente final** contracts the **Agencia**
(you, "Matiz" in the UI), who subcontracts a **Proveedor**. Every event invoice is
this shape — the two-party tool never matched the actual work.

The Agencia sits in the middle, playing both roles: it is **withheld-from** by the
Cliente (upstream) and **withholds** on the Proveedor (downstream).

Two structurally different ways to model the middle party:

- **Reventa / principal** — the Agencia contracts the whole job, invoices the Cliente
  the full contract (IVA on the full amount), and books the Proveedor's invoice as its
  cost. Its ganancia is the spread. Two independent invoice legs.
- **Mandato / comisión** — the Proveedor invoices the Cliente directly; the Agencia
  only invoices its commission. Different money flow and IVA treatment.

## Decision

1. **Three parties, two legs.** The model is a chain: Cliente final → Agencia →
   Proveedor. Withholding is computed per **leg** = a (retenedor, retenido) pair.
   The fixed Vendor/Client vocabulary is retired; the same withholding engine runs
   twice with the roles swapped:
   - **Leg 1** (Cliente final → Agencia): the Agencia is retenido.
   - **Leg 2** (Agencia → Proveedor): the Agencia is retenedor.

2. **Reventa/principal, not mandato.** The Agencia invoices the Cliente the full
   contract and charges IVA on the full subtotal; the Proveedor's invoice is a
   separate leg booked as cost. This is what every figure in the mockup assumes.

3. **Contract-anchored, margin-derived.** The input is the contract value sin IVA
   plus the Agencia's **margen** (% or fixed $). The Proveedor's subtotal is
   derived: `proveedor = contrato − margen`. Ganancia = margen.

4. **Shared concepto and municipio across both legs.** One concepto drives retefuente
   rate/base and ICA class on both legs; one municipio drives both ReteICA
   withholdings. Per-leg concepto/municipio is a future extension.

5. **Reconciliation deferred.** The mockup's cash/tax panels ("en caja quedan", "Lo
   que debes consignar a la DIAN") are **not** built now: their arithmetic did not
   reconcile (three conflicting figures for what the Agencia owes), so the model is
   unsettled. Also deferred: the named-scenario selector and "Enviar al proveedor".

## Consequences

- The engine is symmetric: retefuente/reteIVA/reteICA gating, SIMPLE (47),
  autorretenedor, and base mínimas all apply to leg 2 exactly as to leg 1.
- The 6 golden invoices become **leg-1-only** cases (Agencia as retenido, no
  Proveedor); they must still reproduce their reference numbers exactly.
- The reventa choice fixes the IVA basis: IVA is charged on the full contract, not
  on the margen. A future mandato mode would be a distinct model, not a toggle.
- New input surface: three RUT code sets instead of two.
- Running the same gating on leg 2 surfaced a conflict the two-party tool could not
  reach: the mockup expected ReteICA to be withheld from a Proveedor in régimen
  simple (47). It is not — ICA is consolidated into the SIMPLE return (art. 911 ET),
  the rule already fixed in [ADR-0001](./0001-rut-derived-fiscal-profile.md). The
  symmetric engine wins; leg 2 withholds nothing from a SIMPLE Proveedor. Recorded
  in `.scratch/three-party-chain/issues/02-chain-tracer-bullet.md` under *Desviación*.
- The IVA rate stays one shared input, but **each leg decides whether it applies**
  from its own retenido. Zeroing the rate globally on one party's account (as the
  two-party UI did for the vendor) silently corrupts the other leg.
- Not modeled: the full cash-vs-tax reconciliation, per-leg concepto/municipio,
  scenario persistence — all deferred, flagged for their own grilling.
