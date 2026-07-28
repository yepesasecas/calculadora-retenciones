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

// CAMBIO DE VALOR (ticket 03). Antes ReteIVA se apagaba porque el retenido fuera
// gran contribuyente (13), que era una aproximación. La regla es el parágrafo del
// art. 437-2: no hay retención entre agentes de retención de IVA. Los grandes
// contribuyentes son agentes por el numeral 1, así que el caso corriente no
// cambia — pero el que no lo sea sí recibe ReteIVA.
test("ReteIVA: el retenido es a su vez agente de reteIVA (art. 437-2 par.)", () => {
  const r = leg({ retenedor: ["05", "48", "07", "09"], retenido: ["05", "48", "13", "09"] });
  assert.equal(r.reteiva, 0);
  assert.equal(notasNoAplicaReteIVA(r).length, 1);
  assert.match(notasNoAplicaReteIVA(r)[0], /437-2/);
});

test("ReteIVA: un gran contribuyente que no es agente de reteIVA sí la recibe", () => {
  const r = leg({ retenedor: ["05", "48", "07", "09"], retenido: ["05", "48", "13"] });
  assert.ok(r.reteiva > 0);
  assert.equal(r.detalle.reteiva.razon, null);
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
  // Tras el ticket 03 ReteIVA ya no cae por el 07 sino por su propia compuerta.
  assert.equal(r.detalle.reteiva.razon, "el retenedor no es agente de reteIVA (09/23)");
  assert.deepEqual(notasNoAplicaReteIVA(r),
    ["ReteIVA: el retenedor no es agente de reteIVA (09/23) — no aplica."]);
});

// La nota se deriva de la razón: si divergieran, la pantalla explicaría una cosa
// y el motor habría hecho otra. Es la garantía que sostiene ADR-0004.
test("cada retención que no aplica deja su propia nota, derivada de su razón", () => {
  // Un retenedor sin ninguna calidad: no retiene nada, y cada retención cae por
  // su propia razón — 07, la designación municipal y 09/23, tres autoridades.
  const r = leg({ retenedor: ["05", "49"], retenido: ["05", "48"] });
  const noAplica = ["Retefuente", "ReteICA", "ReteIVA"]
    .map(n => [n, r.detalle[n.toLowerCase()].razon])
    .filter(([, razon]) => razon)
    .map(([n, razon]) => `${n}: ${razon} — no aplica.`);
  assert.equal(noAplica.length, 3);
  assert.deepEqual(r.notas.filter(n => n.endsWith("— no aplica.")), noAplica);
});

// ---- Ticket 03: las tres correcciones normativas ----
// Cada una mueve cifras que antes salían en cero. Ver ADR-0005 y
// `docs/retencion-ica.md` §4.

// Art. 911 ET: el SIMPLE excluye retefuente e ICA «sin perjuicio de la retención
// a título de IVA, regulada en el numeral 9 del art. 437-2» (DIAN Of. 901166/2022).
test("SIMPLE: un retenido del SIMPLE responsable de IVA sí recibe ReteIVA", () => {
  const r = leg({ retenedor: ["05", "48", "07", "09"], retenido: ["47", "48"] });
  assert.ok(r.reteiva > 0);
  assert.equal(r.detalle.reteiva.razon, null);
});

test("SIMPLE: sigue sin recibir retefuente ni ReteICA", () => {
  const r = leg({ retenedor: ["05", "48", "07", "09"], retenido: ["47", "48"] });
  assert.equal(r.retefuente, 0);
  assert.equal(r.reteica, 0);
  assert.equal(r.detalle.retefuente.razon, "el retenido está en régimen simple (47)");
  assert.equal(r.detalle.reteica.razon, "el retenido está en régimen simple (47)");
});

// El código 15 es figura nacional de renta: no alcanza al ICA, que es municipal,
// ni al IVA, cuyo art. 437-2 no lo menciona.
test("autorretenedor (15): sólo se libra de retefuente", () => {
  const r = leg({ retenedor: ["05", "48", "07", "09"], retenido: ["05", "48", "15"] });
  assert.equal(r.retefuente, 0);
  assert.equal(r.detalle.retefuente.razon, "el retenido es autorretenedor (15)");
  assert.ok(r.reteica > 0);
  assert.ok(r.reteiva > 0);
  assert.equal(r.detalle.reteica.razon, null);
  assert.equal(r.detalle.reteiva.razon, null);
});

// ---- Ticket 04: la ReteICA responde a un agente municipal ----

const legDeclarando = ({ retenedor, retenido, declRetenedor = {}, declRetenido = {} }) => calcular({
  subtotal: 10_000_000,
  concepto: SERVICIOS,
  ivaRate: 0.19,
  retenido: deriveProfile(retenido, declRetenido),
  retenedor: deriveProfile(retenedor, declRetenedor),
  municipio: BOGOTA,
});

// Bogotá designa agente retenedor de ICA a todo el régimen común por resolución
// (DDI-052377/2016): un cliente sin código 07 practica ReteICA y no retefuente.
test("agente de ReteICA: sin código 07 practica ReteICA pero no retefuente", () => {
  const r = legDeclarando({ retenedor: ["05", "48"], retenido: ["05", "48"] });
  assert.ok(r.reteica > 0);
  assert.equal(r.detalle.reteica.razon, null);
  assert.equal(r.retefuente, 0);
  assert.equal(r.detalle.retefuente.razon, "el retenedor no es agente de retención (07)");
});

test("agente de ReteICA: se puede desmarcar, y sólo cae la ReteICA", () => {
  const r = legDeclarando({
    retenedor: ["05", "48", "07", "09"], retenido: ["05", "48"],
    declRetenedor: { agenteReteICA: false },
  });
  assert.equal(r.reteica, 0);
  assert.equal(r.detalle.reteica.razon, "el retenedor no es agente de retención de ICA en el municipio");
  assert.ok(r.retefuente > 0);
  assert.ok(r.reteiva > 0);
});

test("agente de ReteICA: arranca en el valor de responsable de IVA", () => {
  assert.equal(deriveProfile(["05", "48"]).agenteReteICA, true);
  assert.equal(deriveProfile(["05", "49"]).agenteReteICA, false);
  assert.equal(deriveProfile(["05", "49"], { agenteReteICA: true }).agenteReteICA, true);
});

// La autorretención de ICA es municipal y sólo apaga la ReteICA: no es el código 15.
test("autorretenedor de ICA: no recibe ReteICA, y sí las demás", () => {
  const r = legDeclarando({
    retenedor: ["05", "48", "07", "09"], retenido: ["05", "48"],
    declRetenido: { autorretenedorICA: true },
  });
  assert.equal(r.reteica, 0);
  assert.equal(r.detalle.reteica.razon, "el retenido es autorretenedor de ICA (resolución municipal)");
  assert.ok(r.retefuente > 0);
  assert.ok(r.reteiva > 0);
});
