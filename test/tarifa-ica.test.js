import test from "node:test";
import assert from "node:assert/strict";

import { resolverTarifaICA, buscarActividades } from "../dominio/tarifa-ica.js";
import { MUNICIPIOS } from "../datos/municipios.js";

const BOGOTA = MUNICIPIOS.find(m => m.id === "bogota");
const OTRO   = MUNICIPIOS.find(m => m.id === "otro");

// Costura nueva de este spec: la tarifa se resuelve sin construir un tramo. Se
// expone a propósito para poder fijar la tabla, el respaldo a la tarifa máxima y
// el aviso de tarifa fuera de tabla como comportamiento propio.

test("Bogotá: la actividad del retenido fija la tarifa, y dice de qué acuerdo salió", () => {
  const r = resolverTarifaICA({ municipio: BOGOTA, retenido: { actividadICA: "serviciosDemas" } });
  assert.equal(r.tarifaPorMil, 9.66);
  assert.match(r.fuente, /Ac\. 65\/2002/);
  assert.equal(r.aviso, null);
});

test("Bogotá: dos retenidos de actividad distinta dan tarifas distintas", () => {
  const imprenta = resolverTarifaICA({ municipio: BOGOTA, retenido: { actividadICA: "serviciosConsultoriaProfesional" } });
  const agencia  = resolverTarifaICA({ municipio: BOGOTA, retenido: { actividadICA: "serviciosDemas" } });
  assert.equal(imprenta.tarifaPorMil, 8.66);
  assert.equal(agencia.tarifaPorMil, 9.66);
});

// Ac. 65/2002 art. 11: quien no informa actividad queda gravado a la tarifa máxima.
test("Bogotá: actividad no informada aplica la tarifa máxima, y avisa", () => {
  const r = resolverTarifaICA({ municipio: BOGOTA, retenido: {} });
  assert.equal(r.tarifaPorMil, 13.8);
  assert.match(r.aviso, /no informada/i);
  assert.match(r.fuente, /art\. 11/);
});

// El aviso que habría cazado el 8,99 el primer día.
test("Bogotá: una tarifa digitada fuera de tabla calcula y avisa", () => {
  const r = resolverTarifaICA({ municipio: BOGOTA, retenido: {}, tarifaManual: 8.99 });
  assert.equal(r.tarifaPorMil, 8.99);
  assert.match(r.aviso, /8,99/);
  assert.match(r.aviso, /Bogotá/);
});

test("Bogotá: una tarifa digitada que sí figura en la tabla no avisa", () => {
  const r = resolverTarifaICA({ municipio: BOGOTA, retenido: {}, tarifaManual: 9.66 });
  assert.equal(r.tarifaPorMil, 9.66);
  assert.equal(r.aviso, null);
});

test("municipio sin regla cargada: entrada libre, sin aviso de tabla", () => {
  const r = resolverTarifaICA({ municipio: OTRO, retenido: {}, tarifaManual: 9.99 });
  assert.equal(r.tarifaPorMil, 9.99);
  assert.equal(r.aviso, null);
  assert.match(r.fuente, /sin tabla/i);
});

test("la actividad se busca por código CIIU o por nombre", () => {
  assert.equal(buscarActividades(BOGOTA, "7310")[0].id, "serviciosDemas");
  assert.equal(buscarActividades(BOGOTA, "publicidad")[0].id, "serviciosDemas");
  assert.equal(buscarActividades(BOGOTA, "TELECOMUNICACIONES")[0].tarifaPorMil, 10.62);
  assert.deepEqual(buscarActividades(BOGOTA, "no existe tal cosa"), []);
  // Sin consulta, la tabla entera: es lo que llena el desplegable.
  assert.equal(buscarActividades(BOGOTA, "").length, BOGOTA.regla.tabla.length);
  // Un municipio sin tabla no tiene nada que buscar.
  assert.deepEqual(buscarActividades(OTRO, "7310"), []);
});
