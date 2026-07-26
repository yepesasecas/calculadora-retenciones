export const RETEIVA_TARIFA = 0.15; // art. 437-1 ET, tarifa general

// TRANSITORIO: el motor todavía redacta sus razones en prosa `es-CO`, así que
// necesita formatear pesos aquí dentro. Es una violación consciente de la regla
// direccional de ADR-0003 (dominio no depende del formateador) que dura hasta el
// paso 5 del spec, donde las razones pasan a ser datos y esto se borra.
const fmt = n => n.toLocaleString("es-CO");

// Motor por leg. Un leg es un par (retenedor, retenido): el retenedor
// practica las retenciones, al retenido se las practican. La Agencia es retenido
// en el leg 1 y retenedor en el leg 2 — por eso los parámetros son relacionales
// y no "vendedor"/"cliente" fijos (ver ADR-0002).
export function calcular({ subtotal, concepto, ivaRate, retenido, retenedor, municipio, icaTarifaPorMil }) {
  const notas = [];
  const iva = Math.round(subtotal * ivaRate);
  const neto = subtotal + iva;

  // El retenedor sólo practica retenciones si es agente de retefuente (RUT código 07).
  // Ser responsable de IVA (48) NO implica ser agente de retención: son hechos
  // distintos en el RUT. A un retenido autorretenedor no se le practican retenciones,
  // y a un retenido del régimen simple (código 47) tampoco (retefuente ni ReteICA).
  const retenedorRetiene = retenedor.agenteRetefuente;
  const retenidoExento = retenido.autorretenedor;
  const retenidoSimple = retenido.simple;

  if (!retenedorRetiene) notas.push("El retenedor no es agente de retefuente (código 07): no practica ninguna retención.");
  if (retenidoExento) notas.push("El retenido es autorretenedor: no se le practican retenciones (se autorretiene y declara por su cuenta).");
  if (retenidoSimple) notas.push("El retenido pertenece al régimen simple (SIMPLE, código 47): no es sujeto de retefuente ni de ReteICA; los declara dentro del SIMPLE.");

  // Razón única por la que el leg entero no genera retenciones. `null` = sí retiene.
  const bloqueo =
    !retenedorRetiene ? "el retenedor no es agente de retención (07)" :
    retenidoExento    ? "el retenido es autorretenedor (15)" :
    retenidoSimple    ? "el retenido está en régimen simple (47)" : null;

  let retefuente = 0, reteica = 0, reteiva = 0;
  // `razon` no nula = la retención no aplica, y dice por qué. Es lo que la col 4 muestra.
  let razonRetefuente = bloqueo, razonReteica = bloqueo, razonReteiva = bloqueo;

  if (!bloqueo) {
    if (subtotal >= concepto.base || concepto.base === 0) {
      retefuente = Math.round(subtotal * concepto.tarifas[retenido.declarante ? "declarante" : "noDeclarante"]);
      razonRetefuente = null;
    } else {
      razonRetefuente = `base mínima del concepto: $${fmt(concepto.base)}`;
      notas.push(`Retefuente: subtotal por debajo de la base mínima del concepto ($${fmt(concepto.base)}) — no aplica.`);
    }

    const baseICA = concepto.icaClase === "servicio" ? municipio.baseServicio : municipio.baseCompra;
    if (subtotal >= baseICA || baseICA === 0) {
      reteica = Math.round(subtotal * icaTarifaPorMil / 1000);
      razonReteica = null;
    } else {
      razonReteica = `base mínima municipal: $${fmt(baseICA)}`;
      notas.push(`ReteICA: subtotal por debajo de la base mínima municipal ($${fmt(baseICA)}) — no aplica.`);
    }
    if (municipio.baseServicio === 0 && municipio.baseCompra === 0 && municipio.id === "otro") {
      notas.push("ReteICA: municipio sin bases mínimas cargadas — se aplicó la tarifa sin verificar tope. Confirme las reglas locales.");
    }

    // ReteIVA se rige por el agente de reteIVA (código 09/23), no por gran contribuyente.
    if (!retenedor.agenteReteIVA)         razonReteiva = "el retenedor no es agente de reteIVA (09/23)";
    else if (!retenido.responsableIVA)    razonReteiva = "el retenido no es responsable de IVA (49)";
    else if (retenido.granContribuyente)  razonReteiva = "el retenido es gran contribuyente (13)";
    else if (iva <= 0)                    razonReteiva = "la factura no lleva IVA";
    else {
      reteiva = Math.round(iva * RETEIVA_TARIFA);
      razonReteiva = null;
      notas.push("ReteIVA (15 % del IVA) estimado según la matriz de regímenes — regla no verificada contra factura real: confirmar con la contadora.");
    }
    // Estas cuatro razones sólo vivían en la fila de la tabla; al ocultarse las
    // retenciones que no aplican, la nota es el único sitio donde se enuncian.
    // Se deriva de la razón para que las dos no puedan divergir.
    if (razonReteiva) notas.push(`ReteIVA: ${razonReteiva} — no aplica.`);
  }

  return {
    subtotal, iva, neto, retefuente, reteica, reteiva,
    totalAGirar: neto - retefuente - reteica - reteiva, notas,
    detalle: {
      iva:        { valor: iva, razon: iva > 0 ? null
                     : (retenido.responsableIVA ? "tarifa de IVA en 0 %" : "el retenido no es responsable de IVA (49)") },
      retefuente: { valor: retefuente, razon: razonRetefuente },
      reteica:    { valor: reteica,    razon: razonReteica },
      reteiva:    { valor: reteiva,    razon: razonReteiva },
    },
  };
}
