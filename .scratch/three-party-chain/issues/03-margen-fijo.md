# 03 — Margen as fixed peso amount

**What to build:** The Agencia can enter its margen as a **flat $ amount** instead of a
percentage, for jobs priced with a fixed cut. A toggle switches the margen control
between % and $ fijo; the derived Proveedor subtotal and ganancia update accordingly.

**Blocked by:** 02

**Status:** done

Done 2026-07-25 — % / $ fijo toggle; chain case with a 15.000.000 fijo margen green.

- [x] Margen control has a % / $ fijo toggle
- [x] `calcularCadena()` derives `proveedorSubtotal = contrato − margen` correctly in fijo mode (ganancia = the fijo amount)
- [x] Derived split display reflects the fijo margen
- [x] Chain test with a fixed-peso margen yields the correct proveedorSubtotal, ganancia, and both legs
