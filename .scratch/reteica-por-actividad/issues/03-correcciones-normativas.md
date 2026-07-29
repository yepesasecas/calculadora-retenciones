# 03 — Las correcciones normativas: SIMPLE, autorretenedor y el art. 437-2

**What to build:** el motor deja de omitir retenciones que sí proceden. Tres reglas
que hoy están mal, cada una con su norma:

1. **Un retenido del SIMPLE responsable de IVA sí lleva ReteIVA.** El art. 911 ET
   excluye retefuente e ICA «sin perjuicio de la… retención a título de IVA,
   regulada en el numeral 9 del art. 437-2» (DIAN Oficio 901166 de 2022). El SIMPLE
   sigue excluyendo retefuente y ReteICA.
2. **El autorretenedor de renta (código 15) sólo se libra de retefuente.** Es figura
   nacional de renta: no alcanza al ICA, que es municipal, ni al IVA, cuyo art. 437-2
   no la menciona. Hoy le suprime las tres.
3. **ReteIVA se apaga porque el retenido es a su vez agente de reteIVA**, que es lo
   que dice el parágrafo del art. 437-2, y no porque sea gran contribuyente, que era
   una aproximación. Los grandes contribuyentes son agentes por el numeral 1, así que
   el caso corriente no cambia de resultado.

Es el primer ticket donde **las cifras se mueven**. Las fixtures que fijaban lo
anterior fijaban un error: se actualizan en este mismo cambio, y el mensaje del
commit dice cuáles y por qué. Las seis facturas de referencia **no** deben moverse.

**Blocked by:** 02

**Status:** done

Hecho 2026-07-28. Fixtures movidas: los casos 1 y 2 (razón de ReteIVA del tramo 2,
que ya no cae por el SIMPLE) y los casos 3 y 5 (ReteIVA del tramo 1 en cero, porque
la Agencia lleva el código 09 y el art. 437-2 par. la exime). Se añadió
`fixtures/facturas.js` + `test/facturas.test.js`: las seis facturas de referencia
pasan a estar fijadas por prueba, no sólo por documento.

- [x] Un retenido SIMPLE responsable de IVA recibe ReteIVA
- [x] Un retenido SIMPLE sigue sin recibir retefuente ni ReteICA
- [x] Un retenido autorretenedor (15) recibe ReteICA y ReteIVA, y no retefuente
- [x] ReteIVA se apaga cuando el retenido es agente de reteIVA, no cuando es gran contribuyente
- [x] Un retenido gran contribuyente que **no** es agente de reteIVA sí recibe ReteIVA
- [x] Las seis facturas de referencia dan lo mismo que antes
- [x] Las fixtures que cambian de valor lo hacen en este commit, con su razón anotada
- [x] `npm test` en verde
