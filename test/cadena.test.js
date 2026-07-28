import test from "node:test";
import assert from "node:assert/strict";

import { calcularCadena } from "../dominio/cadena.js";
import { deriveProfile } from "../dominio/perfil.js";
import { CONCEPTOS } from "../datos/conceptos.js";
import { MUNICIPIOS } from "../datos/municipios.js";
import { CADENA_CASOS } from "../fixtures/cadena.js";

// Los casos guardan códigos del RUT y hechos declarados, no perfiles ya
// derivados: así ejercitan la derivación real, incluidos los valores por defecto
// de los hechos municipales.
const liquidar = ent => calcularCadena({
  ...ent,
  concepto: CONCEPTOS.find(c => c.id === ent.conceptoId),
  municipio: MUNICIPIOS.find(m => m.id === ent.municipioId),
  clienteFinal: deriveProfile(ent.clienteFinal, ent.declarados?.clienteFinal),
  agencia: deriveProfile(ent.agencia, ent.declarados?.agencia),
  proveedor: deriveProfile(ent.proveedor, ent.declarados?.proveedor),
});

// Cada caso afirma un subconjunto distinto: el reparto del contrato, las cifras de
// uno o de los dos tramos, y las razones de "no aplica" de cada retención. Las
// razones son comportamiento observable del motor, no adorno.
const RAIZ = ["proveedorSubtotal", "ganancia", "sinProveedor", "error"];
const CLAVES = new Set([...RAIZ, "leg1", "leg2", "razones1", "razones2"]);

for (const caso of CADENA_CASOS) {
  test(caso.nombre, async t => {
    const r = liquidar(caso.ent);

    // Una clave mal escrita en el fixture no afirmaría nada y pasaría en verde.
    await t.test("el caso no trae claves esperadas que nadie afirme", () => {
      const huerfanas = Object.keys(caso.esp).filter(k => !CLAVES.has(k));
      assert.deepEqual(huerfanas, []);
    });

    for (const clave of RAIZ) {
      if (!(clave in caso.esp)) continue;
      await t.test(clave, () => assert.deepEqual(r[clave], caso.esp[clave]));
    }

    for (const [n, leg] of [["leg1", r.leg1], ["leg2", r.leg2]]) {
      const esperado = caso.esp[n];
      if (!esperado) continue;
      for (const [campo, valor] of Object.entries(esperado)) {
        await t.test(`${n}.${campo}`, () => assert.equal(leg[campo], valor));
      }
    }

    for (const [n, leg] of [["razones1", r.leg1], ["razones2", r.leg2]]) {
      const esperado = caso.esp[n];
      if (!esperado) continue;
      for (const [rubro, razon] of Object.entries(esperado)) {
        await t.test(`${n}.${rubro}`, () => assert.equal(leg.detalle[rubro].razon, razon));
      }
    }
  });
}

test("los siete casos de cadena siguen presentes", () => {
  assert.equal(CADENA_CASOS.length, 7);
});
