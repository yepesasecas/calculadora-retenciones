import { COD } from "../datos/responsabilidades.js";

// Deriva el perfil fiscal a partir de los códigos del RUT de una parte.
// `simple` (código 47) es relevante pero no es un flag de perfil: lo tratamos
// aparte en `calcular`. Devuelve flags + alerts (contradicciones / salvedades).
export function deriveProfile(codes) {
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
  return { ...profile, alerts };
}
