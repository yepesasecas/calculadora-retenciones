# 01 — RUT-code input replaces manual flags

Status: done

Done 2026-07-24 — implemented in calculadora-retenciones.html, verified in browser.

## What

In `calculadora-retenciones.html`, per party (vendedor + cliente), replace the
flag checkboxes with RUT casilla-53 input:

- The retención-relevant codes as checkboxes/toggles (those whose `implies` is
  non-empty).
- A `<select>` (dropdown) listing the remaining codes — selecting one adds it to
  the party's set, shown as "reconocido, no afecta retención".

## How

- Port the `RESPONSABILIDADES` table + `deriveProfile` from
  `prototype-rut/rut-profile.mjs` into the page's `<script>` (data-as-rules,
  same style as `CONCEPTOS`).
- Derive `{ responsableIVA, granContribuyente, autorretenedor, declarante,
  agenteRetefuente, agenteReteIVA }` from each party's codes; feed into `calcular`.
- Surface `deriveProfile` alerts (obsolete/caveat/unknown codes) next to the party,
  same visual as the existing `.note`.
- IVA rate still forced to 0 when vendor not `responsableIVA`.

## Done when

- Both parties driven entirely by codes; no orphan flag checkboxes remain.
- Selecting an inert code visibly does nothing to the liquidación.
- Golden tests still green (they set the derived profile directly — see 02).
