# 01 — Glosario y ADRs: retirar el bloqueo, nombrar lo municipal

**What to build:** los documentos dejan de afirmar hechos que la investigación
derribó. `CONTEXT.md` define `Bloqueo` como «el hecho único que impide a un tramo
entero retener»; ninguna de sus tres condiciones gobierna las tres retenciones.
`Régimen simple` dice que ReteIVA bajo SIMPLE está sin verificar; está resuelto y en
contra. `Agente de retención` mezcla la autoridad nacional con la municipal.

Un ADR nuevo registra el cambio de forma (compuerta por retención) y por qué el
término se retira en vez de reparametrizarse. ADR-0001 y ADR-0004 reciben enmienda,
no reescritura: sus decisiones siguen en pie, sus premisas no.

**Status:** done

Done 2026-07-28 — pendiente de commit. ADR-0005 nuevo; enmiendas en ADR-0001 y
ADR-0004; `CONTEXT.md` con `Bloqueo` marcado retirado y los términos nuevos
`Agente de ReteICA`, `Autorretenedor`, `Autorretenedor de ICA`, `Actividad ICA`,
`Municipio`, `Base gravable especial`; `preguntas-contadora.md` con lo resuelto
tachado y cinco preguntas nuevas.

- [x] ADR-0005 explica por qué no sobrevive ninguna condición de tramo entero
- [x] ADR-0001 enmendado: el perfil es RUT + hechos municipales; SIMPLE sí lleva ReteIVA
- [x] ADR-0004 enmendado: la decisión (ocultar filas) queda; la premisa y el «una vez por tramo» no
- [x] `Bloqueo` conserva el nombre marcado como retirado, para que sea rastreable
- [x] `preguntas-contadora.md` distingue lo resuelto por norma de lo que sólo la contadora puede responder
- [x] `npm test` en verde — 181/181, sin cambios de código
