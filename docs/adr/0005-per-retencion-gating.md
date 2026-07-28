# ADR-0005 — Cada retención tiene su propia compuerta; el bloqueo por tramo se retira

Status: Accepted (2026-07-28)

## Contexto

El motor calculaba un único `bloqueo` por tramo (`dominio/tramo.js:31-34`): si el
retenedor no era agente de retefuente (07), o el retenido era autorretenedor (15) o
del régimen simple (47), las **tres** retenciones se anulaban con la misma razón.
`CONTEXT.md` lo elevaba a término del glosario y ADR-0004 razonaba desde ahí.

La investigación contra fuentes primarias
([`docs/retencion-ica.md`](../retencion-ica.md)) derribó las tres condiciones, cada
una por su lado:

| Condición | Lo que realmente gobierna |
|---|---|
| retenedor no es agente 07 | Sólo retefuente. La calidad de agente de **ReteICA** la confiere el municipio por resolución, no el RUT nacional (Bogotá: Res. DDI-052377/2016, DDI-000305/2020, que alcanza a todo el régimen común de ICA). ReteIVA ya tenía su propia compuerta, 09/23. |
| retenido autorretenedor (15) | Sólo retefuente. Es figura **nacional y de renta**: no alcanza al ICA, que es municipal, ni al IVA, cuyo art. 437-2 no la menciona. |
| retenido SIMPLE (47) | Retefuente y ReteICA. **No** ReteIVA: art. 911 ET excluye la retención «sin perjuicio de la… retención a título de IVA, regulada en el numeral 9 del art. 437-2» (DIAN Oficio 901166 de 2022). |

No sobrevive ninguna condición que aplique al tramo entero. El `bloqueo` no estaba
mal parametrizado: el concepto no existe.

## Decisión

1. **Cada retención calcula su propia razón.** Retefuente responde al código 07 y a
   la calidad del retenido en renta; ReteICA a la designación municipal, a las
   exclusiones del retenido en ese municipio y a la base mínima; ReteIVA a los
   códigos 09/23 y al art. 437-2.

2. **`Bloqueo` se retira del glosario.** Un término que afirma un hecho falso hace
   más daño que la ausencia de término. `CONTEXT.md` lo conserva marcado como
   retirado, para que quien lo encuentre en la historia sepa qué pasó.

3. **Una nota por retención que no aplica**, no una por tramo. Amplía ADR-0004.

4. **ReteIVA se compuerta por el propio art. 437-2**: no se practica cuando el
   retenido es a su vez agente de reteIVA (parágrafo del art. 437-2), en lugar del
   proxy «es gran contribuyente (13)». Los grandes contribuyentes son agentes por
   el numeral 1, de modo que el caso corriente no cambia de resultado.

## Alternativas consideradas

- **Conservar el bloqueo por tramo y sólo corregir sus condiciones.** Imposible: las
  condiciones divergen *por retención*, que es exactamente lo que un valor único no
  puede expresar.
- **Colapsar en el panel las razones que coinciden**, para preservar la brevedad que
  motivó a ADR-0004. Descartado: tres razones distintas merecen tres líneas, y el
  agrupamiento habría escondido justamente la diferencia que este ADR descubre.

## Consecuencias

- El panel de notas de un tramo totalmente no-retenido pasa de una línea a tres.
  Es más largo y dice más.
- Aparecen hechos que el RUT nacional no contiene y que hay que capturar por parte:
  agente de ReteICA, autorretenedor de ICA, declarante de ICA en el municipio. Ver
  la enmienda de [ADR-0001](./0001-rut-derived-fiscal-profile.md).
- **Las cifras cambian.** Un retenido en SIMPLE responsable de IVA ahora sí lleva
  ReteIVA; un autorretenedor (15) ahora sí lleva ReteICA. Las fixtures que fijaban
  el comportamiento anterior fijaban un error.
- No se modela todavía la **entidad de derecho público** como tipo de parte, que
  hace falta para la excepción del art. 9 lit. d del Acuerdo 65/2002 (el gran
  contribuyente declarante en el municipio sí es sujeto de retención cuando el
  retenedor es entidad pública).

## Fuentes

- ET arts. 437-1, 437-2 (parágrafo: no hay retención entre agentes de retención de
  IVA) y 911; DIAN Oficio 901166 de 2022.
- Ley 1819 de 2016 arts. 342–344; Acuerdo 65 de 2002 (Bogotá) arts. 7, 9 y 11;
  Decreto Distrital 271 de 2002 arts. 3, 8 y 9.
- Detalle y URLs en [`docs/retencion-ica.md`](../retencion-ica.md).
