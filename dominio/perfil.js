import { COD } from "../datos/responsabilidades.js";

// Los hechos que **no** están en el RUT y que el usuario declara. Son municipales:
// el RUT es nacional y no puede contenerlos (enmienda de ADR-0001).
//
// `lado` dice sobre qué punta de un tramo obra el hecho: hay hechos que sólo
// importan cuando la parte **practica** la retención y otros sólo cuando se la
// practican a ella. La vista lo usa para no pedirle a una parte un hecho que en
// esta cadena no puede cambiar ninguna cifra.
//
// `porDefecto` recibe el perfil ya derivado del RUT y devuelve el valor inicial,
// que el usuario puede cambiar. Ser responsable de IVA es el proxy del régimen
// común de ICA, al que Bogotá designó agente retenedor en bloque por resolución
// (DDI-052377/2016, DDI-000305/2020).
export const HECHOS_MUNICIPALES = [
  { id: "agenteReteICA", nombre: "Agente de retención de ICA", lado: "retenedor",
    ayuda: "Lo confiere el municipio por resolución. En Bogotá alcanza a todo el régimen común de ICA.",
    porDefecto: p => p.responsableIVA },
  { id: "declaranteICAMunicipio", nombre: "Declarante de ICA en el municipio", lado: "retenido",
    ayuda: "Junto con gran contribuyente, excluye de ReteICA en los municipios que tienen esa exclusión — Bogotá y Cali sí, Medellín no.",
    porDefecto: () => false },
  { id: "autorretenedorICA", nombre: "Autorretenedor de ICA", lado: "retenido",
    ayuda: "Habilitado por resolución municipal a retenerse a sí mismo: nadie le practica ReteICA. Distinto del código 15, que es de renta.",
    porDefecto: () => false },
  // Arranca apagada a propósito: que la Agencia califique como agencia de
  // publicidad es un hecho que ningún documento resuelve y que está preguntado
  // (pregunta 16 de `docs/preguntas-contadora.md`).
  { id: "baseGravableEspecial", nombre: "Base gravable especial (agencia de publicidad)", lado: "retenido",
    ayuda: "Su ICA se liquida sobre honorarios y comisiones percibidos para sí, no sobre el ingreso bruto (L. 1819/2016 art. 342 par. 1). La retención sigue esa base (D. 271/2002 art. 9). No cambia cómo se factura.",
    porDefecto: () => false },
];

// Deriva el perfil fiscal de una parte: los códigos del RUT (casilla 53) más los
// hechos municipales que el usuario declara y que ningún código nacional implica.
// `simple` (código 47) es relevante pero no es un flag de perfil: lo tratamos
// aparte en `calcular`. Devuelve flags + alerts (contradicciones / salvedades).
export function deriveProfile(codes, declarados = {}) {
  const implied = new Set(codes.flatMap(c => (COD[c] ? COD[c].implies : [])));
  const profile = {
    responsableIVA:   implied.has("responsableIVA"),
    granContribuyente:implied.has("granContribuyente"),
    autorretenedor:   implied.has("autorretenedor"),
    declarante:       implied.has("declarante"),
    agenteRetefuente: implied.has("agenteRetefuente"),
    agenteReteIVA:    implied.has("agenteReteIVA"),
    simple:           implied.has("simple"),
  };
  const alerts = [];
  for (const c of codes) if (COD[c] && COD[c].note) alerts.push(`${c}: ${COD[c].note}`);
  const desconocidas = codes.filter(c => !COD[c]);
  if (desconocidas.length) alerts.push(`Códigos no catalogados: ${desconocidas.join(", ")} — verifíquelos con DIAN.`);
  if (implied.has("responsableIVA") && implied.has("noResponsableIVA"))
    alerts.push("Responsable (48/11) y no responsable (49/53/12) de IVA a la vez — RUT contradictorio.");
  if (implied.has("noResponsableIVA")) profile.responsableIVA = false;

  // Los hechos declarados van después, para que sus valores por defecto lean el
  // perfil del RUT ya corregido.
  for (const h of HECHOS_MUNICIPALES)
    profile[h.id] = declarados[h.id] ?? h.porDefecto(profile);

  // La actividad ICA es propiedad de la parte, no de la cadena ni del concepto:
  // cada tramo lee la de su retenido. `null` = no informada, que en un municipio
  // que retiene por actividad significa tarifa máxima (Ac. 65/2002 art. 11).
  profile.actividadICA = declarados.actividadICA ?? null;

  return { ...profile, alerts };
}
