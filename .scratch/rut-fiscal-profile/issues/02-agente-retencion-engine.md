# 02 — Agente de retención as a first-class fact (the correctness fix)

Status: done
Blocked by: 01

Done 2026-07-24 — engine keys off agenteRetefuente/agenteReteIVA; golden green (2 exact, pre-existing ±1 tol on 3); client-without-07 zeroes retefuente+ReteICA.

## What

The engine currently decides withholding from the wrong fact. Fix `calcular`:

- `clienteRetiene` = cliente **agente de retefuente (código 07)**, NOT
  `cliente.responsableIVA`.
- ReteIVA gate = cliente **agente de reteIVA (código 09/23)**, NOT
  `cliente.granContribuyente`.

## Why

The RUT models withholding-agent status as its own responsabilidad, separate
from being responsable de IVA. A client that is `48` but not `07` is not a
withholding agent and practices no retefuente. The old heuristic over-withholds
by the full retefuente + ReteICA. Demonstrated in the prototype (case: cliente
`48` sin `07`).

## Non-regression

The 6 golden invoices (`GOLDEN` in the HTML) must still pass exactly. Update
`runGolden` so each client's derived profile includes `agenteRetefuente: true`
(all six real clients are agentes de retención) — numbers must be unchanged.

## Done when

- Withholding keys off `agenteRetefuente` / `agenteReteIVA`.
- Golden table all green.
- A client with `48` but no `07` shows zero retefuente + ReteICA.
