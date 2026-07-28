# 03 — Una compuerta por retención

**What to build:** `dominio/tramo.js` deja de calcular un `bloqueo` único
(líneas 31-38) y cada retención resuelve su propia razón:

| Retención | No aplica cuando |
|---|---|
| Retefuente | el retenedor no es agente 07; el retenido es autorretenedor (15) o SIMPLE (47); el subtotal no llega a la base mínima del concepto |
| ReteICA | el retenedor no es agente de ReteICA **municipal**; el retenido es SIMPLE (47) o autorretenedor de ICA; el subtotal no llega a la base mínima municipal; **más las exclusiones propias del municipio** (ver abajo) |
| ReteIVA | el retenedor no es agente 09/23; el retenido no es responsable de IVA; **el retenido es a su vez agente de reteIVA** (parágrafo art. 437-2, que reemplaza el proxy «gran contribuyente»); la factura no lleva IVA |

**La exclusión del gran contribuyente declarante no es universal**: la tienen
Bogotá [Ac. 65/2002 art. 9 lit. d] y Cali [Res. 4131.040.21.1.0618 de 2022], y
**Medellín no** [Ac. 093/2023 art. 82]. Va en la regla del municipio, no cableada en
el motor. En cambio SIMPLE y autorretenedor de ICA excluyen en las tres.

Dos cambios de resultado, deliberados: el código **15 deja de tocar ReteICA y
ReteIVA** (es figura nacional de renta) y **SIMPLE deja de bloquear ReteIVA**
(art. 911 ET remite al numeral 9 del art. 437-2; DIAN Oficio 901166 de 2022).

El panel de notas pasa a **una línea por retención que no aplica**. Se acepta la
repetición cuando las razones coinciden: la enmienda de ADR-0004 lo explica. La nota
se sigue derivando de la razón, para que no puedan divergir.

Las fixtures que fijaban el comportamiento anterior fijaban un error: actualizarlas
en este mismo cambio, y decir en el mensaje del commit cuáles y por qué. Las 6
facturas de oro no deberían moverse.

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] No queda ninguna variable `bloqueo` en `dominio/`
- [ ] Un retenido SIMPLE responsable de IVA recibe ReteIVA
- [ ] Un retenido autorretenedor (15) recibe ReteICA y ReteIVA, y no retefuente
- [ ] ReteIVA se apaga cuando el retenido es agente de reteIVA, no cuando es gran contribuyente
- [ ] El panel de notas enuncia cada razón exactamente una vez
- [ ] Las 6 facturas de oro siguen dando lo mismo
- [ ] `npm test` en verde
