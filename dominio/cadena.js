import { calcular } from "./tramo.js";

// TRANSITORIO: ver la nota de `fmt` en tramo.js. Desaparece en el paso 5.
const fmt = n => n.toLocaleString("es-CO");

// La cadena de tres partes como una sola función pura: Cliente final → Agencia →
// Proveedor (ver ADR-0002). Modelo reventa/principal: la Agencia factura al Cliente
// el contrato completo (IVA sobre el total) y el subtotal del Proveedor se deriva
// restando el margen — nunca se digita. Corre `calcular` dos veces con los roles
// invertidos: la Agencia es retenido en el leg 1 y retenedor en el leg 2.
//
// El IVA de cada leg sale del retenido: si el retenido no es responsable de IVA
// (código 49/53), ese leg se factura sin IVA.
//
// El municipio es del **leg**, no de la cadena: un servicio se grava donde se
// ejecuta la prestación (Ley 1819/2016 art. 343), y los dos legs son dos
// servicios distintos que pueden ocurrir en sitios distintos — una campaña
// vendida en Bogotá cuya grabación se subcontrata en Medellín son dos
// municipios, con reglas y bases mínimas de forma distinta. `municipio` queda
// como valor por defecto de ambos, para que el caso corriente —todo en una
// ciudad— siga siendo un solo campo.
export function calcularCadena({ contrato, margen, concepto, municipio, tarifaICAManual, ivaRate,
                                 municipioLeg1 = municipio, municipioLeg2 = municipio,
                                 clienteFinal, agencia, proveedor }) {
  const ganancia = margen.modo === "fijo"
    ? Math.round(margen.valor)
    : Math.round(contrato * margen.valor / 100);
  const subtotalCrudo = contrato - ganancia;

  // El margen no puede superar el contrato: dejaría al proveedor con subtotal
  // negativo, que no es un trabajo sino un error de digitación.
  const error = subtotalCrudo < 0
    ? (margen.modo === "fijo"
        ? `El margen fijo ($${fmt(ganancia)}) supera el valor del contrato ($${fmt(contrato)}).`
        : `El margen (${margen.valor} %) supera el 100 % del contrato.`)
    : null;
  const proveedorSubtotal = Math.max(0, subtotalCrudo);
  // Margen del 100 %: te quedas el contrato completo, no hay subcontrato.
  const sinProveedor = proveedorSubtotal === 0;

  const comun = { concepto, tarifaICAManual };
  const leg1 = calcular({
    ...comun, subtotal: contrato, municipio: municipioLeg1,
    ivaRate: agencia.responsableIVA ? ivaRate : 0,
    retenedor: clienteFinal, retenido: agencia,
  });
  const leg2 = calcular({
    ...comun, subtotal: proveedorSubtotal, municipio: municipioLeg2,
    ivaRate: proveedor.responsableIVA ? ivaRate : 0,
    retenedor: agencia, retenido: proveedor,
  });

  return { proveedorSubtotal, ganancia, sinProveedor, error, leg1, leg2 };
}
