# 04 — Edge cases & "no aplica" notas

**What to build:** The chain reads correctly in the non-happy-path cases. A job with no
Proveedor (margen 100% / whole contract kept) collapses cleanly to leg 1 only. Each
withholding that does not apply says why — "Retefuente — no aplica (47)", "IVA — no
aplica (49)", or a base-mínima-not-met note — surfaced in cols 3 and 4. Invalid margen
(above the contract) is guarded.

**Blocked by:** 02

**Status:** done

Done 2026-07-25 — detalle.razon per withholding, sinProveedor collapse, margen guard; 4 new chain cases green.

- [x] Margen 100% / no Proveedor ⇒ leg-2 amounts zero, Proveedor column reads as no-subcontract; leg 1 unchanged
- [x] Col 4 shows the "no aplica (NN)" reason for each zeroed withholding (SIMPLE 47, no responsable de IVA 49) from leg-2 notas
- [x] Base-mínima-not-met on either leg shows the existing nota and zeroes that withholding
- [x] `proveedorSubtotal ≥ 0` guarded (fixed margen > contrato, or % > 100, rejected with a clear message)
- [x] Tests: no-Proveedor collapse, a Proveedor NOT in SIMPLE (leg 2 accrues retefuente/reteIVA), a below-base-mínima leg
