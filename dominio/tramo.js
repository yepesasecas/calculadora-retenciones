import { resolverTarifaICA, baseMinimaICA, sinBasesCargadas } from "./tarifa-ica.js";

export const RETEIVA_TARIFA = 0.15; // art. 437-1 ET, tarifa general

// TRANSITORIO: el motor todavía redacta sus razones en prosa `es-CO`, así que
// necesita formatear pesos aquí dentro. Es una violación consciente de la regla
// direccional de ADR-0003 (dominio no depende del formateador) que dura hasta el
// paso 5 del spec de módulos, donde las razones pasan a ser datos y esto se borra.
const fmt = n => n.toLocaleString("es-CO");

const NO_AGENTE_07   = "el retenedor no es agente de retención (07)";
const AUTORRETENEDOR = "el retenido es autorretenedor (15)";
const REGIMEN_SIMPLE = "el retenido está en régimen simple (47)";

// Cada retención tiene su propia función de compuerta: devuelve la razón por la
// que NO aplica, o `null` si procede. No hay ninguna condición de tramo entero
// —ADR-0005 retiró el término `bloqueo`—: cada una responde a su propia autoridad.

// Retefuente es la única de las tres que sigue leyendo el RUT nacional entero:
// código 07 del retenedor, y del retenido las dos figuras que la excluyen —
// autorretenedor de renta (15) y SIMPLE (47, art. 911 ET).
function razonRetefuente({ retenedor, retenido, subtotal, concepto }) {
  if (!retenedor.agenteRetefuente) return NO_AGENTE_07;
  if (retenido.autorretenedor)     return AUTORRETENEDOR;
  if (retenido.simple)             return REGIMEN_SIMPLE;
  if (concepto.base > 0 && subtotal < concepto.base)
    return `base mínima del concepto: $${fmt(concepto.base)}`;
  return null;
}

// ReteICA es municipal, y lo es en las dos puntas: la calidad de agente la
// confiere el municipio por resolución —no el código 07 del RUT nacional— y la
// autorretención de ICA también. El autorretenedor de renta (15) NO la excluye.
// El SIMPLE sí, porque el art. 911 ET consolida el ICA dentro del SIMPLE.
function razonReteica({ retenedor, retenido, subtotal, baseICA, municipio }) {
  if (!retenedor.agenteReteICA)    return "el retenedor no es agente de retención de ICA en el municipio";
  if (retenido.autorretenedorICA)  return "el retenido es autorretenedor de ICA (resolución municipal)";
  if (retenido.simple)             return REGIMEN_SIMPLE;
  // Las demás exclusiones son del municipio y viajan en su regla: Bogotá y Cali
  // eximen al gran contribuyente que declara ICA allí, Medellín no exime a nadie
  // por ese hecho [Ac. 093/2023 art. 82].
  if (municipio.regla?.excluyeGranContribuyenteDeclarante
      && retenido.granContribuyente && retenido.declaranteICAMunicipio)
    return "el retenido es gran contribuyente declarante de ICA en el municipio";
  if (baseICA > 0 && subtotal < baseICA)
    return `base mínima municipal: $${fmt(baseICA)}`;
  return null;
}

// ReteIVA responde sólo al art. 437-2 ET. Ni el SIMPLE la excluye —el art. 911
// preserva expresamente la del numeral 9 (DIAN Of. 901166/2022)— ni el
// autorretenedor de renta, a quien ese artículo no menciona.
function razonReteiva({ retenedor, retenido, iva }) {
  if (!retenedor.agenteReteIVA) return "el retenedor no es agente de reteIVA (09/23)";
  if (!retenido.responsableIVA) return "el retenido no es responsable de IVA (49)";
  // Parágrafo del art. 437-2: no hay retención entre agentes de retención de IVA.
  // Reemplaza al proxy «es gran contribuyente (13)», que acertaba sólo porque los
  // grandes contribuyentes son agentes por el numeral 1.
  if (retenido.agenteReteIVA)   return "el retenido es a su vez agente de reteIVA (art. 437-2 par.)";
  if (iva <= 0)                 return "la factura no lleva IVA";
  return null;
}

// Las tres retenciones, en el orden en que se leen en pantalla. Lo exporta el
// dominio para que la vista pinte las mismas y en el mismo orden, sin repetir la
// lista ni poder desincronizarse de ella.
export const RETENCIONES = [["retefuente", "Retefuente"], ["reteica", "ReteICA"], ["reteiva", "ReteIVA"]];

// Motor por leg. Un leg es un par (retenedor, retenido): el retenedor
// practica las retenciones, al retenido se las practican. La Agencia es retenido
// en el leg 1 y retenedor en el leg 2 — por eso los parámetros son relacionales
// y no "vendedor"/"cliente" fijos (ver ADR-0002).
// `baseReteICA` es la única base que puede apartarse del subtotal del tramo: hay
// sujetos que determinan su ICA sobre una base gravable especial, y la retención
// sigue esa base [D. 271/2002 art. 9]. Es regla **sólo de ICA** — el IVA, el neto,
// la retefuente y la ReteIVA siguen sobre el subtotal facturado, de modo que el
// modelo reventa/principal de ADR-0002 queda intacto: cambia la base de una
// retención, no cómo se factura.
export function calcular({ subtotal, concepto, ivaRate, retenido, retenedor, municipio,
                           tarifaICAManual = 0, baseReteICA = subtotal }) {
  const notas = [];
  const iva = Math.round(subtotal * ivaRate);
  const neto = subtotal + iva;

  // La tarifa es la de la actividad del **retenido** de este tramo, no una del
  // municipio ni una compartida por la cadena [Ac. 65/2002 art. 11]. `icaClase`
  // del concepto sobrevive, pero sólo para elegir la base mínima.
  const tarifaICA = resolverTarifaICA({ municipio, retenido, tarifaManual: tarifaICAManual });
  const baseICA = baseMinimaICA(municipio, concepto);

  // `razon` no nula = la retención no aplica, y dice por qué.
  const razones = {
    retefuente: razonRetefuente({ retenedor, retenido, subtotal, concepto }),
    reteica:    razonReteica({ retenedor, retenido, subtotal, baseICA, municipio }),
    reteiva:    razonReteiva({ retenedor, retenido, iva }),
  };

  const retefuente = razones.retefuente ? 0
    : Math.round(subtotal * concepto.tarifas[retenido.declarante ? "declarante" : "noDeclarante"]);
  const reteica = razones.reteica ? 0 : Math.round(baseReteICA * tarifaICA.tarifaPorMil / 1000);
  const reteiva = razones.reteiva ? 0 : Math.round(iva * RETEIVA_TARIFA);

  // Una línea por retención que no aplica, derivada de la razón para que las dos
  // no puedan divergir. Cuando las razones coinciden se leen tres líneas iguales:
  // es deliberado, y está razonado en la enmienda de ADR-0004.
  for (const [id, nombre] of RETENCIONES)
    if (razones[id]) notas.push(`${nombre}: ${razones[id]} — no aplica.`);

  if (!razones.reteica && baseReteICA !== subtotal)
    notas.push(`ReteICA: liquidada sobre la base gravable especial del retenido ($${fmt(baseReteICA)}), no sobre el subtotal facturado ($${fmt(subtotal)}) — L. 1819/2016 art. 342 par. 1 y D. 271/2002 art. 9.`);
  if (!razones.reteica && tarifaICA.aviso) notas.push(`ReteICA: ${tarifaICA.aviso}`);
  if (!razones.reteica && sinBasesCargadas(municipio))
    notas.push("ReteICA: municipio sin bases mínimas cargadas — se aplicó la tarifa sin verificar tope. Confirme las reglas locales.");
  if (!razones.reteiva)
    notas.push("ReteIVA (15 % del IVA) estimado según la matriz de regímenes — regla no verificada contra factura real: confirmar con la contadora.");

  return {
    subtotal, iva, neto, retefuente, reteica, reteiva,
    totalAGirar: neto - retefuente - reteica - reteiva, notas, tarifaICA,
    detalle: {
      iva:        { valor: iva, razon: iva > 0 ? null
                     : (retenido.responsableIVA ? "tarifa de IVA en 0 %" : "el retenido no es responsable de IVA (49)") },
      retefuente: { valor: retefuente, razon: razones.retefuente },
      reteica:    { valor: reteica,    razon: razones.reteica },
      reteiva:    { valor: reteiva,    razon: razones.reteiva },
    },
  };
}
