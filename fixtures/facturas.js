// Las seis facturas de referencia, extraídas de `assets/` por OCR y transcritas
// en `docs/retencion-en-la-fuente.md` §1. Son el ancla de la calculadora: sus
// clientes son agentes de retefuente reales, la actividad es «demás servicios» a
// 9,66 por mil en Bogotá y el concepto es servicios generales al 4 % (declarante).
// Ninguna lleva ReteIVA — ninguno de esos clientes es agente de reteIVA (09/23).
//
// `desfaseDoc` registra, con signo, dónde el documento se aparta de la aritmética
// línea a línea: `motor = documento + desfase`. Son las tres facturas de la
// pregunta 9 a la contadora (FEC591, FEC595, FEC598), donde el sistema emisor
// redondea distinto y se desvía en 1 peso. Se anota aquí en vez de esconderse en
// una tolerancia, para que un cambio real del motor no pueda confundirse con esa
// diferencia conocida.
export const FACTURAS = [
  { doc: "FV 594",  cliente: "Cliente A", subtotal: 9698000,  iva: 1842620, neto: 11540620,
    retefuente: 387920, reteica: 93683,  totalAGirar: 11059017, desfaseDoc: {} },
  { doc: "FEC587",  cliente: "Cliente B", subtotal: 7708418,  iva: 1464599, neto: 9173017,
    retefuente: 308337, reteica: 74463,  totalAGirar: 8790217,  desfaseDoc: {} },
  { doc: "FEC591",  cliente: "Cliente A", subtotal: 8703334,  iva: 1653633, neto: 10356967,
    retefuente: 348133, reteica: 84074,  totalAGirar: 9924759,  desfaseDoc: { totalAGirar: +1 } },
  { doc: "FEC595",  cliente: "Cliente C", subtotal: 2832465,  iva: 538168,  neto: 3370633,
    retefuente: 113299, reteica: 27362,  totalAGirar: 3229973,  desfaseDoc: { totalAGirar: -1 } },
  { doc: "FEC598",  cliente: "Cliente D", subtotal: 11650659, iva: 2213625, neto: 13864285,
    retefuente: 466026, reteica: 112545, totalAGirar: 13285713, desfaseDoc: { neto: -1 } },
  { doc: "FEC599",  cliente: "Cliente E", subtotal: 11190000, iva: 2126100, neto: 13316100,
    retefuente: 447600, reteica: 108095, totalAGirar: 12760405, desfaseDoc: {} },
];

// El tramo tal como ocurrió: el cliente retiene (07) pero no es agente de reteIVA;
// Matiz es responsable de IVA y declarante de renta.
export const FACTURA_CLIENTE = ["05", "48", "07"];
export const FACTURA_MATIZ   = ["05", "48", "07"];
// Matiz es agencia de publicidad (CIIU 7310), que en Bogotá liquida ICA como
// «demás actividades de servicios»: de ahí sale el 9,66 de las seis facturas.
export const FACTURA_MATIZ_ACTIVIDAD = { actividadICA: "serviciosDemas" };
