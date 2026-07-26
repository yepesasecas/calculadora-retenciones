# ADR-0001 — Fiscal profile derived from RUT responsabilidades

Status: Accepted (2026-07-24)

## Context

The calculator originally took each party's fiscal profile as four hand-picked
checkboxes (responsable de IVA, gran contribuyente, autorretenedor, declarante).
The engine then decided withholding with the heuristic:

> `cliente retiene ⇔ cliente responsable de IVA (código 48)`
> ReteIVA gate ⇔ `cliente gran contribuyente`

Users actually have the RUT in hand. A throwaway prototype (`prototype-rut/`, now
captured on a branch — see ADR footer) modeled the input as the RUT's
**responsabilidades (casilla 53)** codes and derived the profile from them. Doing
so exposed a real defect: being **responsable de IVA (48)** is not the same fact
as being an **agente de retención**. The RUT models withholding-agent status as
its own code — 07 (retefuente), 09/23 (reteIVA). A client can be responsable de
IVA without being an agente de retención; the old heuristic over-withheld by the
full retefuente + ReteICA in that case.

## Decision

1. **Input is the RUT.** Each party's profile is derived from the casilla-53
   codes the user enters (relevant codes as toggles + a dropdown of inert ones).
   This reverses the earlier "selected manually (not RUT-parsed)" note in CONTEXT.md.
2. **Agente de retención is a first-class fact.** The engine keys withholding off
   `agenteRetefuente` (código 07) and `agenteReteIVA` (código 09/23), not off
   responsable-de-IVA / gran-contribuyente.
3. **SIMPLE (código 47) is modeled.** A vendor in the régimen simple is not
   subject to retefuente nor ReteICA; both are forced to zero.

The full DIAN responsabilidades table (47 rows, codes 01–56) lives as data in
`index.html` (`RESPONSABILIDADES`), with `implies` marking which
codes contribute a derived fact.

## Consequences

- Correctness: a responsable-de-IVA client that is not an agente de retención now
  correctly withholds nothing.
- The 6 golden invoices are unchanged — their clients are all real agentes de
  retención, so the mapping reproduces the reference numbers exactly.
- New surface for error: the responsabilidad table must track DIAN changes. Codes
  are best-effort reconciled from public sources and flagged for a contadora check.
- Not modeled: code 06 (ingresos y patrimonio) declarante ambiguity, ReteIVA
  behaviour under SIMPLE, and parsing an uploaded RUT PDF — all left flagged.

## Sources

- DIAN casilla-53 list — [dian-rut.com](https://dian-rut.com/consulta/responsabilidades-rut/)
  and a [DIAN PDF](https://contadorespublicossantander.com/wp-content/uploads/2018/04/RESPONSABILIDADES-DIAN.pdf) (reconciled to fill gaps like código 42).
- Prototype + verdict: throwaway branch `prototype/rut-fiscal-profile`
  (see issue `.scratch/rut-fiscal-profile/issues/05-capture-prototype.md`).
