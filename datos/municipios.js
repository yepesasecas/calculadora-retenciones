import { TARIFAS_BOGOTA } from "./ica-bogota.js";
import { TARIFAS_CALI } from "./ica-cali.js";

// Municipios para ReteICA. Cada uno lleva **su propia regla de retención**, no una
// tarifa: la tarifa de la retención no siempre es la del impuesto (ver
// [[Regla de retención]] en CONTEXT.md y `docs/retencion-ica.md` §6). Dos formas:
//
//   { tipo: "actividad", tabla, maxima }  — la tarifa de la actividad del retenido,
//                                           y la máxima del municipio si no la informa
//   { tipo: "plana",     tarifa }         — una sola tarifa, sea cual sea la actividad
//
// `baseMinima` también cambia de forma entre ciudades, y por eso es un objeto con
// tipo en vez de un par de campos: Bogotá y Cali distinguen compras de servicios,
// Medellín tiene un umbral único para todo pago.
//
// La **exclusión del gran contribuyente declarante** vive también en la regla, y
// no en el motor, porque es del municipio: Bogotá y Cali la tienen, Medellín no.
//
// UVT 2026 = $52.374 (Res. DIAN 000238 de 2025). Medellín y Cali sí enuncian sus
// bases mínimas en UVT en el texto normativo; Bogotá no (ver abajo).
//
// TODO territorialidad: el municipio de un tramo es donde **se ejecuta la
// prestación** (Ley 1819/2016 art. 343). No están modeladas las excepciones —
// transporte (municipio de despacho), TV e internet por suscripción y telefonía
// fija (domicilio del suscriptor), móvil y datos (domicilio principal del usuario).
export const MUNICIPIOS = [
  {
    id: "bogota", nombre: "Bogotá D.C.",
    regla: {
      tipo: "actividad",
      tabla: TARIFAS_BOGOTA,
      // «Tarifa máxima vigente» del art. 11 cuando el retenido no informa
      // actividad. Es la de la tabla general: el 14 del sector financiero es una
      // tarifa sectorial posterior (Ac. 816/2021), no el tope del art. 11.
      maxima: 13.8,
      normaMaxima: "Ac. 65/2002 art. 11",
      // Ac. 65/2002 art. 9 lit. d. TODO: la excepción de ese literal —que al gran
      // contribuyente declarante SÍ se le retiene cuando el retenedor es entidad
      // de derecho público— no se modela, porque no existe el tipo de parte
      // «entidad pública». Ver «Out of Scope» del spec.
      excluyeGranContribuyenteDeclarante: true,
      normaExclusion: "Ac. 65/2002 art. 9 lit. d",
    },
    // La norma distrital fija estas bases en **pesos de 2002** ($430.000 compras /
    // $62.000 servicios, D. 271/2002 art. 8 = D. 639/2025 art. 16) y nunca las
    // convirtió a UVT. Las cifras de abajo son la indexación de uso corriente
    // —27 y 4 UVT, con UVT 2026 = $52.374—, no el texto normativo. Es la
    // pregunta 8 a la contadora.
    baseMinima: {
      tipo: "par", compra: 1414098, servicio: 209496,
      norma: "D. 271/2002 art. 8 = D. 639/2025 art. 16 (en pesos de 2002; aquí indexado a 27/4 UVT)",
    },
  },
  {
    id: "medellin", nombre: "Medellín",
    // La diferencia estructural con Bogotá, y la razón de que el municipio lleve
    // una regla y no una tarifa: aquí la retención **no depende de la actividad**.
    // Es un anticipo a tarifa plana que no figura en ninguna tabla de impuesto —
    // la del art. 71 existe, pero no se usa para retener, así que no se carga.
    regla: {
      tipo: "plana", tarifa: 1.8, norma: "Ac. 093/2023 art. 83",
      // El art. 82 enumera quién no es sujeto de retención y **no incluye** al
      // gran contribuyente declarante: no hereda la regla de Bogotá.
      excluyeGranContribuyenteDeclarante: false,
    },
    // Un solo umbral para cualquier pago, no el par compras/servicios.
    baseMinima: {
      tipo: "unica", valor: 785610,
      norma: "Ac. 093/2023 art. 83 (15 UVT)",
    },
    // TODO: no modelado, el hecho «sin domicilio ni presencia permanente en el
    // país», que devuelve a la tarifa plena de la actividad [Ac. 093/2023 art. 83].
  },
  {
    id: "cali", nombre: "Santiago de Cali",
    regla: {
      tipo: "actividad",
      tabla: TARIFAS_CALI,
      // «Tarifa máxima vigente» si el retenido no informa actividad. El 14 del
      // sector financiero es sectorial y posterior, no el tope del art. 103.
      maxima: 10,
      normaMaxima: "D.E. 4112.010.20.0416/2021 art. 103 par.",
      excluyeGranContribuyenteDeclarante: true,
      normaExclusion: "Res. 4131.040.21.1.0618 de 2022 (cuadro agente × sujeto)",
    },
    baseMinima: {
      tipo: "par", compra: 785610, servicio: 157122,
      norma: "D.E. 4112.010.20.0416/2021 art. 105 lit. g (15 y 3 UVT)",
    },
  },
  {
    id: "otro", nombre: "Otro (sin tabla ni bases cargadas)",
    // Sin regla cargada la tarifa se digita a mano: hay más de 1.100 municipios,
    // cada uno con su acuerdo, y muchos no publican la tabla. Quedarse sin
    // calcular sería peor que calcular avisando.
    regla: null,
    baseMinima: { tipo: "sinCargar" },
  },
];
