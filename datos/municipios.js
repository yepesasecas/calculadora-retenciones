import { TARIFAS_BOGOTA } from "./ica-bogota.js";

// Municipios para ReteICA. Cada uno lleva **su propia regla de retención**, no una
// tarifa: la tarifa de la retención no siempre es la del impuesto (ver
// [[Regla de retención]] en CONTEXT.md y `docs/retencion-ica.md` §6). Dos formas:
//
//   { tipo: "actividad", tabla, maxima }  — la tarifa de la actividad del retenido,
//                                           y la máxima del municipio si no la informa
//   { tipo: "plana",     tarifa }         — una sola tarifa, sea cual sea la actividad
//
// `baseMinima` también cambia de forma entre ciudades, y por eso es un objeto con
// tipo en vez de un par de campos: hay municipios con umbral único.
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
    id: "otro", nombre: "Otro (sin tabla ni bases cargadas)",
    // Sin regla cargada la tarifa se digita a mano: hay más de 1.100 municipios,
    // cada uno con su acuerdo, y muchos no publican la tabla. Quedarse sin
    // calcular sería peor que calcular avisando.
    regla: null,
    baseMinima: { tipo: "sinCargar" },
  },
];
