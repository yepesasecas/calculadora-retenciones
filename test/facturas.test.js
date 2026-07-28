import test from "node:test";
import assert from "node:assert/strict";

import { calcular } from "../dominio/tramo.js";
import { deriveProfile } from "../dominio/perfil.js";
import { CONCEPTOS } from "../datos/conceptos.js";
import { MUNICIPIOS } from "../datos/municipios.js";
import { FACTURAS, FACTURA_CLIENTE, FACTURA_MATIZ } from "../fixtures/facturas.js";

const SERVICIOS = CONCEPTOS.find(c => c.id === "serviciosGenerales");
const BOGOTA = MUNICIPIOS.find(m => m.id === "bogota");

// Las seis facturas reales son el ancla que ninguna reforma puede mover. No son
// una cadena: cada una es un tramo suelto (Cliente final → Matiz), que es el
// único de los dos que existió de verdad.
for (const f of FACTURAS) {
  test(`factura ${f.doc} — ${f.cliente}`, () => {
    const r = calcular({
      subtotal: f.subtotal,
      concepto: SERVICIOS,
      ivaRate: 0.19,
      retenedor: deriveProfile(FACTURA_CLIENTE),
      retenido: deriveProfile(FACTURA_MATIZ),
      municipio: BOGOTA,
      icaTarifaPorMil: 9.66,
    });
    for (const campo of ["iva", "neto", "retefuente", "reteica", "totalAGirar"])
      assert.equal(r[campo], f[campo] + (f.desfaseDoc[campo] ?? 0), campo);
    // Ninguno de los cinco clientes es agente de reteIVA: por eso el lote no la trae.
    assert.equal(r.reteiva, 0);
    assert.equal(r.detalle.reteiva.razon, "el retenedor no es agente de reteIVA (09/23)");
  });
}

test("las seis facturas de referencia siguen presentes", () => {
  assert.equal(FACTURAS.length, 6);
});
