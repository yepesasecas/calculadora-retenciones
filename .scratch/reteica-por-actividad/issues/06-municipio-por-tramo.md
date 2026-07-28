# 06 — El municipio es del tramo, no de la cadena

**What to build:** el usuario puede decir **en qué municipio se ejecuta cada tramo**,
en vez de uno solo para toda la cadena.

Un servicio se grava **donde se ejecuta la prestación** (Ley 1819/2016 art. 343), no
en el domicilio de quien paga. Los dos tramos son dos servicios distintos y pueden
ocurrir en sitios distintos: una campaña vendida en Bogotá cuya grabación se
subcontrata en Medellín son dos municipios, y hoy la calculadora sólo admite uno.

No es cosmético: cambia la base mínima, y las formas no coinciden entre ciudades
—Bogotá y Cali tienen par compras/servicios, Medellín un umbral único—, así que el
umbral equivocado puede apagar una retención que sí procede.

El municipio de la cadena queda como **valor por defecto** de ambos tramos, para que
el caso corriente —todo en una ciudad— siga siendo un solo campo.

Excepciones de territorialidad que **no** se modelan y hay que dejar anotadas donde se
lean: transporte (municipio de despacho), TV e internet por suscripción y telefonía
fija (domicilio del suscriptor), móvil y datos (domicilio principal del usuario).

**Blocked by:** 05

**Status:** ready-for-agent

- [ ] Cada tramo resuelve su municipio; el de la cadena es sólo el valor por defecto
- [ ] Dos tramos en municipios distintos aplican cada uno su base mínima y su regla
- [ ] Cambiar el municipio de un tramo no mueve el otro
- [ ] Las excepciones de territorialidad no modeladas quedan anotadas
- [ ] `npm test` en verde
