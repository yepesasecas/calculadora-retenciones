# 05 — El municipio es del tramo, no de la cadena

**What to build:** `cadena.js:32` pasa un `municipio` único a los dos tramos. La
territorialidad del ICA no funciona así: un servicio se grava **donde se ejecuta la
prestación** (Ley 1819/2016 art. 343), no en el domicilio de quien paga. Los dos
tramos son dos servicios distintos y pueden ejecutarse en sitios distintos —
una campaña vendida en Bogotá cuya grabación se subcontrata en Medellín son dos
municipios.

No es sólo etiqueta: cambia la base mínima, y la de Medellín tiene otra forma que la
de Bogotá (un único umbral en vez del par compras/servicios).

Cada tramo lleva su municipio, con el de la cadena como valor por defecto para que
el caso corriente —todo en una ciudad— siga siendo un solo campo.

Excepciones de territorialidad que **no** se modelan y conviene dejar anotadas:
transporte (municipio de despacho), TV/internet por suscripción y telefonía fija
(domicilio del suscriptor), móvil y datos (domicilio principal del usuario).

**Blocked by:** 04

**Status:** ready-for-agent

- [ ] Cada tramo resuelve su municipio; el de la cadena es sólo el valor por defecto
- [ ] Un tramo en Bogotá y otro en «otro» dan bases mínimas distintas
- [ ] Las excepciones no modeladas quedan anotadas donde se lean
- [ ] `npm test` en verde
