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

// ---- Ticket 07: la regla de retención puesta a prueba con dos ciudades más ----

const MEDELLIN = MUNICIPIOS.find(m => m.id === "medellin");
const CALI     = MUNICIPIOS.find(m => m.id === "cali");

// Es la prueba de que la abstracción del ticket 05 tiene la forma correcta: en
// Medellín la retención NO depende de la actividad [Ac. 093/2023 art. 83].
test("Medellín: 1,8 por mil sea cual sea la actividad del retenido", () => {
  const conActividad = resolverTarifaICA({ municipio: MEDELLIN, retenido: { actividadICA: "serviciosDemas" } });
  const sinActividad = resolverTarifaICA({ municipio: MEDELLIN, retenido: {} });
  assert.equal(conActividad.tarifaPorMil, 1.8);
  assert.equal(sinActividad.tarifaPorMil, 1.8);
  assert.match(sinActividad.fuente, /Ac\. 093\/2023 art\. 83/);
});

// Donde la actividad no interviene, no se le puede reprochar al retenido no haberla
// informado: el aviso de «tarifa máxima» sería ruido y una afirmación falsa.
test("Medellín: no se dispara el aviso de actividad no informada", () => {
  assert.equal(resolverTarifaICA({ municipio: MEDELLIN, retenido: {} }).aviso, null);
  assert.deepEqual(buscarActividades(MEDELLIN, "7310"), []);
});

test("Cali: retiene a la tarifa de la actividad, y a la máxima si no se informa", () => {
  const conActividad = resolverTarifaICA({ municipio: CALI, retenido: { actividadICA: "caliServiciosDemas" } });
  assert.equal(conActividad.tarifaPorMil, 10);
  assert.match(conActividad.fuente, /0416\/2021 art\. 97/);
  const sinActividad = resolverTarifaICA({ municipio: CALI, retenido: {} });
  assert.equal(sinActividad.tarifaPorMil, CALI.regla.maxima);
  assert.match(sinActividad.aviso, /no informada/i);
});

// El mismo retenido da tarifas distintas según dónde se ejecute el tramo.
test("el mismo retenido da tarifas distintas en Bogotá y en Medellín", () => {
  const retenido = { actividadICA: "serviciosDemas" };
  assert.equal(resolverTarifaICA({ municipio: BOGOTA, retenido }).tarifaPorMil, 9.66);
  assert.equal(resolverTarifaICA({ municipio: MEDELLIN, retenido }).tarifaPorMil, 1.8);
});

// Traer una actividad de otra ciudad no es lo mismo que no informarla, y el aviso
// tiene que poder distinguirse para saber qué corregir.
test("una actividad de otro municipio avisa que no figura en esta tabla", () => {
  const r = resolverTarifaICA({ municipio: CALI, retenido: { actividadICA: "serviciosDemas" } });
  assert.equal(r.tarifaPorMil, 10);
  assert.match(r.aviso, /no figura en la tabla de Santiago de Cali/);
});
