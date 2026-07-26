# 07 — Pruebas de lecturas y de perfil derivado

**What to build:** cerrar los dos huecos de cobertura que el archivo único hacía
inalcanzables, ahora que los nombres ya no van a cambiar.

**Lecturas.** Lo que el usuario escribe pasa por un parseo que nunca se ha
probado: montos con separador de miles (`"1.000.000"`), campo vacío, texto
basura, ceros y negativos, y el margen en sus dos modos. Cada uno de esos casos
decide si la cadena se liquida o si la pantalla se queda esperando, y hoy nadie
lo afirma.

**Perfil derivado.** El RUT puede declarar cosas contradictorias y el motor ya
sabe qué hacer con ellas —un RUT que se declara responsable y no responsable de
IVA a la vez, códigos obsoletos que arrastran salvedad, códigos que no están en
el catálogo— pero ese comportamiento sólo se ejercita hoy de refilón, a través de
casos de cadena completos que afirman otra cosa.

Se escribe en rojo primero.

**Blocked by:** 06

**Status:** ready-for-agent

- [ ] Montos: separador de miles, vacío, basura, cero y negativo tienen su afirmación
- [ ] Margen: modo porcentaje y modo fijo, incluidos valores ausentes o inválidos
- [ ] Perfil: un RUT responsable y no responsable de IVA a la vez produce alerta y el resultado documentado
- [ ] Perfil: un código no catalogado produce alerta nombrándolo
- [ ] Perfil: los códigos con salvedad u obsoletos arrastran su nota
- [ ] Perfil: los códigos que no aportan hechos fiscales no alteran el perfil
- [ ] Las pruebas se escribieron en rojo antes de la implementación
- [ ] `npm test` verde
