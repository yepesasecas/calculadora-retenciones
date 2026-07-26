import test from "node:test";
import assert from "node:assert/strict";

import { calcular } from "../dominio/tramo.js";
import { deriveProfile } from "../dominio/perfil.js";
import { CONCEPTOS } from "../datos/conceptos.js";
import { MUNICIPIOS } from "../datos/municipios.js";

const SERVICIOS = CONCEPTOS.find(c => c.id === "serviciosGenerales");
const BOGOTA = MUNICIPIOS.find(m => m.id === "bogota");

// Un leg cualquiera por encima de las bases mínimas: lo que varía en estas pruebas
// son los perfiles y la tarifa de IVA, nunca el monto.
const leg = ({ retenedor, retenido, ivaRate = 0.19 }) => calcular({
  subtotal: 10_000_000,
  concepto: SERVICIOS,
  ivaRate,
  retenido: deriveProfile(retenido),
  retenedor: deriveProfile(retenedor),
  municipio: BOGOTA,
  icaTarifaPorMil: BOGOTA.tarifaPorMil,
});

// Las notas que explican por qué ReteIVA no aplica (no son la razón misma: esa
// vive en `detalle.reteiva.razon`). La nota de ReteIVA *aplicada* empieza por
// "ReteIVA (" — el prefijo con dos puntos sólo lo usan las razones.
const notasNoAplicaReteIVA = r => r.notas.filter(n => n.startsWith("ReteIVA:"));

// Las cuatro razones por las que ReteIVA queda en cero son, después de este
// ticket, el único sitio donde esas reglas se enuncian: la fila deja de pintarse
// (ticket 02) y `detalle.razon` no se muestra. Si la nota desaparece, la regla
// desaparece de la aplicación.
test("ReteIVA: el retenedor no es agente de reteIVA (09/23)", () => {
  const r = leg({ retenedor: ["05", "48", "07"], retenido: ["05", "48"] });
  assert.equal(r.reteiva, 0);
  assert.equal(notasNoAplicaReteIVA(r).length, 1);
  assert.match(notasNoAplicaReteIVA(r)[0], /09\/23/);
});

test("ReteIVA: el retenido no es responsable de IVA (49)", () => {
  const r = leg({ retenedor: ["05", "48", "07", "09"], retenido: ["49"] });
  assert.equal(r.reteiva, 0);
  assert.equal(notasNoAplicaReteIVA(r).length, 1);
  assert.match(notasNoAplicaReteIVA(r)[0], /49/);
});

test("ReteIVA: el retenido es gran contribuyente (13)", () => {
  const r = leg({ retenedor: ["05", "48", "07", "09"], retenido: ["05", "48", "13"] });
  assert.equal(r.reteiva, 0);
  assert.equal(notasNoAplicaReteIVA(r).length, 1);
  assert.match(notasNoAplicaReteIVA(r)[0], /13/);
});

test("ReteIVA: la factura no lleva IVA", () => {
  const r = leg({ retenedor: ["05", "48", "07", "09"], retenido: ["05", "48"], ivaRate: 0 });
  assert.equal(r.reteiva, 0);
  assert.equal(notasNoAplicaReteIVA(r).length, 1);
  // `/IVA/` casaría con las cuatro notas: hay que fijar *esta* razón.
  assert.match(notasNoAplicaReteIVA(r)[0], /no lleva IVA/);
});

// Cuando ReteIVA sí aplica no hay razón que dar, y la nota de salvedad que ya
// existía ("confirmar con la contadora") no debe confundirse con una razón.
test("ReteIVA aplicada no produce razón", () => {
  const r = leg({ retenedor: ["05", "48", "07", "09"], retenido: ["05", "48"] });
  assert.ok(r.reteiva > 0);
  assert.deepEqual(notasNoAplicaReteIVA(r), []);
  assert.equal(r.detalle.reteiva.razon, null);
});

// El bloqueo del leg entero ya tenía nota propia; las razones de ReteIVA no deben
// duplicarla cuando el leg no retiene nada.
test("un leg bloqueado no agrega razones de ReteIVA", () => {
  const r = leg({ retenedor: ["05", "48"], retenido: ["05", "48"] });
  assert.deepEqual(notasNoAplicaReteIVA(r), []);
  assert.equal(r.detalle.reteiva.razon, "el retenedor no es agente de retención (07)");
});
