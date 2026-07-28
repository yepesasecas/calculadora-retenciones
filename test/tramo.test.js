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

// CAMBIO DE CONDUCTA (ticket 02): esta prueba afirmaba que un leg "bloqueado" no
// agregaba nota de ReteIVA, porque la razón del bloqueo ya se enunciaba una vez
// por tramo. Retirado el bloqueo (ADR-0005), cada retención enuncia la suya: hay
// nota de ReteIVA siempre que ReteIVA no aplique, cualquiera sea el motivo.
test("un retenedor que no retiene nada produce una nota por retención", () => {
  const r = leg({ retenedor: ["05", "48"], retenido: ["05", "48"] });
  assert.equal(r.detalle.reteiva.razon, "el retenedor no es agente de retención (07)");
  assert.deepEqual(notasNoAplicaReteIVA(r),
    ["ReteIVA: el retenedor no es agente de retención (07) — no aplica."]);
});

// La nota se deriva de la razón: si divergieran, la pantalla explicaría una cosa
// y el motor habría hecho otra. Es la garantía que sostiene ADR-0004.
test("cada retención que no aplica deja su propia nota, derivada de su razón", () => {
  const r = leg({ retenedor: ["05", "48"], retenido: ["05", "48"] });
  const noAplica = ["Retefuente", "ReteICA", "ReteIVA"]
    .map(n => [n, r.detalle[n.toLowerCase()].razon])
    .filter(([, razon]) => razon)
    .map(([n, razon]) => `${n}: ${razon} — no aplica.`);
  assert.equal(noAplica.length, 3);
  assert.deepEqual(r.notas.filter(n => n.endsWith("— no aplica.")), noAplica);
});
