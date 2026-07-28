export const RETEIVA_TARIFA = 0.15; // art. 437-1 ET, tarifa general

// TRANSITORIO: el motor todavía redacta sus razones en prosa `es-CO`, así que
// necesita formatear pesos aquí dentro. Es una violación consciente de la regla
// direccional de ADR-0003 (dominio no depende del formateador) que dura hasta el
// paso 5 del spec de módulos, donde las razones pasan a ser datos y esto se borra.
const fmt = n => n.toLocaleString("es-CO");

// Las tres razones de sujeto que antes formaban el `bloqueo` único por tramo.
// Siguen siendo las mismas frases: este paso sólo las reparte entre las tres
// compuertas, sin cambiar a cuál retención afecta cada una (ver ADR-0005; el
// reparto normativo de verdad llega en el ticket 03).
const NO_AGENTE_07   = "el retenedor no es agente de retención (07)";
const AUTORRETENEDOR = "el retenido es autorretenedor (15)";
const REGIMEN_SIMPLE = "el retenido está en régimen simple (47)";

// Cada retención tiene su propia función de compuerta: devuelve la razón por la
// que NO aplica, o `null` si procede. No hay ninguna condición de tramo entero
// —ADR-0005 retiró el término `bloqueo`—, así que cada una repite lo que le toca.
function razonRetefuente({ retenedor, retenido, subtotal, concepto }) {
  if (!retenedor.agenteRetefuente) return NO_AGENTE_07;
  if (retenido.autorretenedor)     return AUTORRETENEDOR;
  if (retenido.simple)             return REGIMEN_SIMPLE;
  if (concepto.base > 0 && subtotal < concepto.base)
    return `base mínima del concepto: $${fmt(concepto.base)}`;
  return null;
}

function razonReteica({ retenedor, retenido, subtotal, baseICA }) {
  if (!retenedor.agenteRetefuente) return NO_AGENTE_07;
  if (retenido.autorretenedor)     return AUTORRETENEDOR;
  if (retenido.simple)             return REGIMEN_SIMPLE;
  if (baseICA > 0 && subtotal < baseICA)
    return `base mínima municipal: $${fmt(baseICA)}`;
  return null;
}

function razonReteiva({ retenedor, retenido, iva }) {
  if (!retenedor.agenteRetefuente) return NO_AGENTE_07;
  if (retenido.autorretenedor)     return AUTORRETENEDOR;
  if (retenido.simple)             return REGIMEN_SIMPLE;
  // ReteIVA se rige por el agente de reteIVA (código 09/23), no por gran contribuyente.
  if (!retenedor.agenteReteIVA)    return "el retenedor no es agente de reteIVA (09/23)";
  if (!retenido.responsableIVA)    return "el retenido no es responsable de IVA (49)";
  if (retenido.granContribuyente)  return "el retenido es gran contribuyente (13)";
  if (iva <= 0)                    return "la factura no lleva IVA";
  return null;
}

// Las tres retenciones, en el orden en que se leen en pantalla.
const RETENCIONES = [["retefuente", "Retefuente"], ["reteica", "ReteICA"], ["reteiva", "ReteIVA"]];

// Motor por leg. Un leg es un par (retenedor, retenido): el retenedor
// practica las retenciones, al retenido se las practican. La Agencia es retenido
// en el leg 1 y retenedor en el leg 2 — por eso los parámetros son relacionales
// y no "vendedor"/"cliente" fijos (ver ADR-0002).
export function calcular({ subtotal, concepto, ivaRate, retenido, retenedor, municipio, icaTarifaPorMil }) {
  const notas = [];
  const iva = Math.round(subtotal * ivaRate);
  const neto = subtotal + iva;

  const baseICA = concepto.icaClase === "servicio" ? municipio.baseServicio : municipio.baseCompra;

  // `razon` no nula = la retención no aplica, y dice por qué.
  const razones = {
    retefuente: razonRetefuente({ retenedor, retenido, subtotal, concepto }),
    reteica:    razonReteica({ retenedor, retenido, subtotal, baseICA }),
    reteiva:    razonReteiva({ retenedor, retenido, iva }),
  };

  const retefuente = razones.retefuente ? 0
    : Math.round(subtotal * concepto.tarifas[retenido.declarante ? "declarante" : "noDeclarante"]);
  const reteica = razones.reteica ? 0 : Math.round(subtotal * icaTarifaPorMil / 1000);
  const reteiva = razones.reteiva ? 0 : Math.round(iva * RETEIVA_TARIFA);

  // Una línea por retención que no aplica, derivada de la razón para que las dos
  // no puedan divergir. Cuando las razones coinciden se leen tres líneas iguales:
  // es deliberado, y está razonado en la enmienda de ADR-0004.
  for (const [id, nombre] of RETENCIONES)
    if (razones[id]) notas.push(`${nombre}: ${razones[id]} — no aplica.`);

  if (!razones.reteica && municipio.baseServicio === 0 && municipio.baseCompra === 0 && municipio.id === "otro")
    notas.push("ReteICA: municipio sin bases mínimas cargadas — se aplicó la tarifa sin verificar tope. Confirme las reglas locales.");
  if (!razones.reteiva)
    notas.push("ReteIVA (15 % del IVA) estimado según la matriz de regímenes — regla no verificada contra factura real: confirmar con la contadora.");

  return {
    subtotal, iva, neto, retefuente, reteica, reteiva,
    totalAGirar: neto - retefuente - reteica - reteiva, notas,
    detalle: {
      iva:        { valor: iva, razon: iva > 0 ? null
                     : (retenido.responsableIVA ? "tarifa de IVA en 0 %" : "el retenido no es responsable de IVA (49)") },
      retefuente: { valor: retefuente, razon: razones.retefuente },
      reteica:    { valor: reteica,    razon: razones.reteica },
      reteiva:    { valor: reteiva,    razon: razones.reteiva },
    },
  };
}
