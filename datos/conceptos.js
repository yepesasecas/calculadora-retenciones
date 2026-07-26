// Tabla nacional retefuente 2026, vigencia 1 jul en adelante.
// base: base mínima en COP (0 = sin base mínima).
// icaClase: cómo clasifica el pago el municipio para la base mínima de ReteICA.
export const CONCEPTOS = [
  { id: "comprasGenerales",  nombre: "Compras generales",                       base: 524000,   tarifas: { declarante: 0.025, noDeclarante: 0.035 }, icaClase: "compra" },
  { id: "agropecuarios",     nombre: "Compra productos agrícolas o pecuarios",  base: 3666000,  tarifas: { declarante: 0.015, noDeclarante: 0.015 }, icaClase: "compra" },
  { id: "serviciosGenerales",nombre: "Servicios generales",                     base: 105000,   tarifas: { declarante: 0.04,  noDeclarante: 0.06  }, icaClase: "servicio",
    trap: "Los servicios de contenido / influencers se liquidan como servicios generales (4 %), no como honorarios (11 %)." },
  { id: "hotelesRestaurantes", nombre: "Servicio de hoteles y restaurantes",    base: 105000,   tarifas: { declarante: 0.035, noDeclarante: 0.035 }, icaClase: "servicio" },
  { id: "transporteCarga",   nombre: "Servicio de transporte de carga",         base: 105000,   tarifas: { declarante: 0.01,  noDeclarante: 0.01  }, icaClase: "servicio" },
  { id: "transportePasajeros", nombre: "Servicio de transporte de pasajeros",   base: 524000,   tarifas: { declarante: 0.035, noDeclarante: 0.035 }, icaClase: "servicio" },
  { id: "arrendamientoInmuebles", nombre: "Arrendamiento de bienes inmuebles",  base: 524000,   tarifas: { declarante: 0.035, noDeclarante: 0.035 }, icaClase: "servicio" },
  { id: "construccion",      nombre: "Contratos de construcción y urbanización", base: 524000,  tarifas: { declarante: 0.02,  noDeclarante: 0.02  }, icaClase: "servicio" },
  { id: "arrendamientoMuebles", nombre: "Arrendamiento de bienes muebles",      base: 0,        tarifas: { declarante: 0.04,  noDeclarante: 0.04  }, icaClase: "servicio" },
  { id: "combustibles",      nombre: "Compra de combustibles",                  base: 0,        tarifas: { declarante: 0.001, noDeclarante: 0.001 }, icaClase: "compra" },
  { id: "honorarios",        nombre: "Honorarios y comisiones",                 base: 0,        tarifas: { declarante: 0.11,  noDeclarante: 0.11  }, icaClase: "servicio",
    trap: "11 % — verifique que no se trate de servicios generales (4 %); es el error de clasificación más común." },
  { id: "software",          nombre: "Licenciamiento y uso de software",        base: 0,        tarifas: { declarante: 0.035, noDeclarante: 0.035 }, icaClase: "servicio" },
  { id: "intereses",         nombre: "Intereses y rendimientos financieros",    base: 0,        tarifas: { declarante: 0.07,  noDeclarante: 0.07  }, icaClase: "servicio" },
];
