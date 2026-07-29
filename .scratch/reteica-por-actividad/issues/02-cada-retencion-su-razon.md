# 02 — Cada retención calcula su propia razón

**What to build:** el motor deja de tener un interruptor común que apaga las tres
retenciones a la vez. Cada retención resuelve la suya.

Hoy existe un `bloqueo` único por tramo: si el retenedor no es agente de retefuente,
o el retenido es autorretenedor o del régimen simple, las tres retenciones se anulan
con la misma frase. Ninguna de esas tres condiciones gobierna las tres retenciones
(ver ADR-0005), pero **este ticket todavía no corrige eso**: reparte las mismas
condiciones en tres compuertas separadas y deja la conducta idéntica.

Es el prefactor. Su valor está en que **las 181 pruebas actuales siguen pasando sin
tocarlas**: si algo se mueve, es un error del reparto y no una decisión normativa. El
ticket 03 es el que cambia las cifras, y llega a un motor donde ya hay dónde ponerlas.

Lo único que cambia de cara al usuario: el panel de notas pasa a **una línea por
retención que no aplica**, en vez de una por tramo. Cuando las tres razones coinciden
—que hoy es el caso corriente— se leen tres líneas iguales. Es deliberado y está
razonado en la enmienda de ADR-0004: tres razones distintas valen tres líneas, y en
el ticket 03 dejan de coincidir. La nota se sigue derivando de la razón, para que las
dos no puedan divergir.

**Blocked by:** None — can start immediately.

**Status:** done

Hecho 2026-07-28. Una desviación: la prueba `un leg bloqueado no agrega razones de
ReteIVA` **sí** se modificó — afirmaba justo la premisa que este ticket retira (que
la razón se enuncia una vez por tramo). Las otras 180 pasaron sin tocarse.

- [x] No queda ninguna variable `bloqueo` en el dominio
- [~] Las 181 pruebas existentes pasan sin modificarse — salvo la que fijaba la premisa retirada (ver arriba)
- [x] Las fixtures de cadena no cambian de valor esperado
- [x] El panel de notas enuncia una línea por retención que no aplica
- [x] Cada nota se deriva de la razón de su retención, no de una frase compartida
- [x] `npm test` en verde
