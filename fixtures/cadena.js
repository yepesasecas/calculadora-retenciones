// Perfiles por códigos del RUT, para que los casos ejerciten la derivación real.
//
// DESVIACIÓN vs. el mockup, deliberada: el mockup esperaba ReteICA 772.800 en el
// leg 2 (y total a girar 79.227.200) para un Proveedor en régimen simple. Un
// contribuyente del SIMPLE NO es sujeto de retención de ICA — el ICA va consolidado
// dentro del SIMPLE (art. 911 ET), regla ya fijada en ADR-0001 y en
// .scratch/rut-fiscal-profile/issues/03-simple-47.md. Aplicarla dejaría el leg 2
// en ReteICA 0 y total 80.000.000, que es lo que se afirma abajo. El leg 1
// reproduce el mockup exactamente. Para ver ReteICA practicada de verdad sobre el
// proveedor, ver el caso "Proveedor NO SIMPLE".
export const CADENA_CASOS = [
  {
    nombre: "Mockup — margen 20 %",
    ent: {
      contrato: 100000000, margen: { modo: "porcentaje", valor: 20 },
      conceptoId: "serviciosGenerales", municipioId: "bogota", icaTarifaPorMil: 9.66, ivaRate: 0.19,
      clienteFinal: ["05", "48", "07", "09"], agencia: ["05", "48", "07"], proveedor: ["47", "49"],
    },
    esp: {
      proveedorSubtotal: 80000000, ganancia: 20000000,
      leg1: { iva: 19000000, neto: 119000000, retefuente: 4000000, reteiva: 2850000, reteica: 966000, totalAGirar: 111184000 },
      leg2: { iva: 0, retefuente: 0, reteiva: 0, reteica: 0, totalAGirar: 80000000 },
      razones2: {
        iva: "el retenido no es responsable de IVA (49)",
        retefuente: "el retenido está en régimen simple (47)",
        reteica: "el retenido está en régimen simple (47)",
        // CAMBIO (ticket 03): antes el SIMPLE apagaba también ReteIVA. Ya no: cae
        // por su propia compuerta, que aquí es que la Agencia no es agente 09/23.
        reteiva: "el retenedor no es agente de reteIVA (09/23)",
      },
      razones1: { iva: null, retefuente: null, reteica: null, reteiva: null },
    },
  },
  {
    // Mismo contrato, margen como monto fijo: el leg 1 no cambia (se ancla en el
    // contrato), sólo cambia el reparto y por tanto el subtotal del proveedor.
    nombre: "Margen fijo — $ 15.000.000",
    ent: {
      contrato: 100000000, margen: { modo: "fijo", valor: 15000000 },
      conceptoId: "serviciosGenerales", municipioId: "bogota", icaTarifaPorMil: 9.66, ivaRate: 0.19,
      clienteFinal: ["05", "48", "07", "09"], agencia: ["05", "48", "07"], proveedor: ["47", "49"],
    },
    esp: {
      proveedorSubtotal: 85000000, ganancia: 15000000,
      leg1: { subtotal: 100000000, iva: 19000000, neto: 119000000,
              retefuente: 4000000, reteiva: 2850000, reteica: 966000, totalAGirar: 111184000 },
      leg2: { subtotal: 85000000, iva: 0, retefuente: 0, reteica: 0, reteiva: 0, totalAGirar: 85000000 },
      razones1: { iva: null, retefuente: null, reteica: null, reteiva: null },
      razones2: {
        iva: "el retenido no es responsable de IVA (49)",
        retefuente: "el retenido está en régimen simple (47)",
        reteica: "el retenido está en régimen simple (47)",
        // CAMBIO (ticket 03): antes el SIMPLE apagaba también ReteIVA. Ya no: cae
        // por su propia compuerta, que aquí es que la Agencia no es agente 09/23.
        reteiva: "el retenedor no es agente de reteIVA (09/23)",
      },
    },
  },
  {
    // Proveedor del régimen ordinario y responsable de IVA: el leg 2 sí acumula
    // retefuente, ReteICA y ReteIVA. Es el contraste del caso del mockup, y aquí
    // sí aparece la ReteICA de 772.800 sobre 80.000.000.
    nombre: "Proveedor NO SIMPLE — el tramo 2 sí retiene",
    ent: {
      contrato: 100000000, margen: { modo: "porcentaje", valor: 20 },
      conceptoId: "serviciosGenerales", municipioId: "bogota", icaTarifaPorMil: 9.66, ivaRate: 0.19,
      clienteFinal: ["05", "48", "07", "09"], agencia: ["05", "48", "07", "09"], proveedor: ["05", "48"],
    },
    esp: {
      proveedorSubtotal: 80000000, ganancia: 20000000, sinProveedor: false,
      // CAMBIO (ticket 03): aquí la Agencia lleva el código 09, así que es a su vez
      // agente de reteIVA y el art. 437-2 par. le quita la ReteIVA del tramo 1
      // (antes 2.850.000). El tramo 2 no se mueve: el Proveedor no es agente.
      leg1: { subtotal: 100000000, iva: 19000000, neto: 119000000,
              retefuente: 4000000, reteica: 966000, reteiva: 0, totalAGirar: 114034000 },
      leg2: { subtotal: 80000000, iva: 15200000, neto: 95200000,
              retefuente: 3200000, reteica: 772800, reteiva: 2280000, totalAGirar: 88947200 },
      razones1: { iva: null, retefuente: null, reteica: null,
                  reteiva: "el retenido es a su vez agente de reteIVA (art. 437-2 par.)" },
      razones2: { iva: null, retefuente: null, reteica: null, reteiva: null },
    },
  },
  {
    // Margen del 100 %: no hay subcontrato. El leg 1 se liquida igual y el
    // leg 2 queda en ceros — la cadena colapsa a una sola factura.
    nombre: "Sin proveedor — margen 100 %",
    ent: {
      contrato: 50000000, margen: { modo: "porcentaje", valor: 100 },
      conceptoId: "serviciosGenerales", municipioId: "bogota", icaTarifaPorMil: 9.66, ivaRate: 0.19,
      clienteFinal: ["05", "48", "07", "09"], agencia: ["05", "48", "07"], proveedor: ["05", "48"],
    },
    esp: {
      proveedorSubtotal: 0, ganancia: 50000000, sinProveedor: true, error: null,
      leg1: { subtotal: 50000000, iva: 9500000, neto: 59500000, retefuente: 2000000,
              reteica: 483000, reteiva: 1425000, totalAGirar: 55592000 },
      leg2: { subtotal: 0, iva: 0, retefuente: 0, reteica: 0, reteiva: 0, totalAGirar: 0 },
      razones1: { iva: null, retefuente: null, reteica: null, reteiva: null },
      // El tramo 2 no queda en cero por el régimen del proveedor sino por el
      // subtotal: cada rubro cae por su propia razón, no por un bloqueo común.
      razones2: {
        iva: "tarifa de IVA en 0 %",
        retefuente: "base mínima del concepto: $105.000",
        reteica: "base mínima municipal: $209.496",
        reteiva: "el retenedor no es agente de reteIVA (09/23)",
      },
    },
  },
  {
    // Contrato pequeño: ambos legs caen bajo las bases mínimas de retefuente
    // ($105.000 servicios) y de ReteICA en Bogotá ($209.496). ReteIVA no tiene
    // base mínima modelada, por eso sigue aplicando.
    nombre: "Bajo base mínima — retefuente y ReteICA en cero",
    ent: {
      contrato: 100000, margen: { modo: "porcentaje", valor: 20 },
      conceptoId: "serviciosGenerales", municipioId: "bogota", icaTarifaPorMil: 9.66, ivaRate: 0.19,
      clienteFinal: ["05", "48", "07", "09"], agencia: ["05", "48", "07", "09"], proveedor: ["05", "48"],
    },
    esp: {
      proveedorSubtotal: 80000,
      // La Agencia es agente de reteIVA (09): el art. 437-2 par. le quita la ReteIVA
      // del tramo 1, que antes era 2.850. El tramo 2 la conserva.
      leg1: { subtotal: 100000, retefuente: 0, reteica: 0, reteiva: 0, totalAGirar: 119000 },
      leg2: { subtotal: 80000, retefuente: 0, reteica: 0, reteiva: 2280, totalAGirar: 92920 },
      razones1: {
        iva: null,
        retefuente: "base mínima del concepto: $105.000",
        reteica: "base mínima municipal: $209.496",
        reteiva: "el retenido es a su vez agente de reteIVA (art. 437-2 par.)",
      },
      razones2: {
        iva: null,
        retefuente: "base mínima del concepto: $105.000",
        reteica: "base mínima municipal: $209.496",
        reteiva: null,
      },
    },
  },
  {
    // La Agencia NO es responsable de IVA pero el Proveedor sí: el leg 1 va sin IVA
    // y el leg 2 CON IVA. Cada leg mira a su propio retenido — la tarifa compartida
    // no puede anularse por el estado de la Agencia.
    nombre: "Agencia sin IVA, Proveedor con IVA — cada leg decide",
    ent: {
      contrato: 10000000, margen: { modo: "porcentaje", valor: 20 },
      conceptoId: "serviciosGenerales", municipioId: "bogota", icaTarifaPorMil: 9.66, ivaRate: 0.19,
      clienteFinal: ["05", "48", "07", "09"], agencia: ["05", "49", "07", "09"], proveedor: ["05", "48"],
      // La Agencia no es responsable de IVA, así que `agenteReteICA` arrancaría
      // apagado (su valor por defecto). Aquí se declara encendido: la calidad la
      // confiere el municipio por resolución y no depende del IVA. Sin esto el
      // tramo 2 no tendría ReteICA y el caso dejaría de hablar del IVA, que es
      // lo que vino a fijar.
      declarados: { agencia: { agenteReteICA: true } },
    },
    esp: {
      leg1: { subtotal: 10000000, iva: 0, neto: 10000000,
              retefuente: 400000, reteica: 96600, reteiva: 0, totalAGirar: 9503400 },
      leg2: { subtotal: 8000000, iva: 1520000, neto: 9520000,
              retefuente: 320000, reteica: 77280, reteiva: 228000, totalAGirar: 8894720 },
      razones1: {
        iva: "el retenido no es responsable de IVA (49)",
        retefuente: null, reteica: null,
        reteiva: "el retenido no es responsable de IVA (49)",
      },
      razones2: { iva: null, retefuente: null, reteica: null, reteiva: null },
    },
  },
  {
    // Margen fijo por encima del contrato: entrada inválida, no un trabajo.
    nombre: "Margen fijo mayor que el contrato — rechazado",
    ent: {
      contrato: 10000000, margen: { modo: "fijo", valor: 12000000 },
      conceptoId: "serviciosGenerales", municipioId: "bogota", icaTarifaPorMil: 9.66, ivaRate: 0.19,
      clienteFinal: ["05", "48", "07", "09"], agencia: ["05", "48", "07"], proveedor: ["05", "48"],
    },
    esp: {
      proveedorSubtotal: 0, ganancia: 12000000, sinProveedor: true,
      error: "El margen fijo ($12.000.000) supera el valor del contrato ($10.000.000).",
      // El tramo 1 se liquida igual: el error sólo anula el subcontrato.
      leg1: { subtotal: 10000000, iva: 1900000, neto: 11900000,
              retefuente: 400000, reteica: 96600, reteiva: 285000, totalAGirar: 11118400 },
      leg2: { subtotal: 0, iva: 0, retefuente: 0, reteica: 0, reteiva: 0, totalAGirar: 0 },
      razones1: { iva: null, retefuente: null, reteica: null, reteiva: null },
      razones2: {
        iva: "tarifa de IVA en 0 %",
        retefuente: "base mínima del concepto: $105.000",
        reteica: "base mínima municipal: $209.496",
        reteiva: "el retenedor no es agente de reteIVA (09/23)",
      },
    },
  },
];
