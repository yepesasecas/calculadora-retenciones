# 03 — ADR y glosario: la razón vive en el panel de notas

**What to build:** los documentos dejan de describir un comportamiento que la
aplicación ya no tiene. Hoy tres archivos prometen que la razón se pinta en el lugar
del cero, en la fila: el término `No aplica (razón)` de `CONTEXT.md`, el párrafo del
README, y US-27 del spec cerrado de `module-split`.

Un ADR nuevo registra la reversión: por qué la decisión anterior era correcta cuando
se tomó, qué se descubrió después (el panel de notas ya enunciaba la razón una vez
por tramo, y el bloqueo es por tramo, así que la fila repetía tres veces una sola
frase), y por qué la ausencia es aceptable **dado** ese panel. Nombra la excepción
del IVA y su razón.

El término `No aplica (razón)` conserva su nombre — está referenciado desde otros
términos — y cambia de cuerpo: la razón es salida del motor, se enuncia en el panel
de notas del tramo, no por fila; el IVA es la excepción.

US-27 en `.scratch/module-split/spec.md` **no se toca**. Reescribir specs cerrados
borra la historia; el ADR es donde vive el cambio de opinión.

**Blocked by:** 02

**Status:** done

Done 2026-07-25 — 1088db6. ADR-0004, el término `No aplica (razón)` reescrito, `Bloqueo` añadido y el README corregido.

- [x] Existe un ADR nuevo, numerado a continuación del último, con el formato de los existentes
- [x] El ADR explica la reversión, la excepción del IVA, y por qué la ausencia es aceptable dado el panel de notas
- [x] El término `No aplica (razón)` de `CONTEXT.md` conserva el nombre y describe el comportamiento nuevo
- [x] El párrafo del README que promete el porqué por fila queda corregido
- [x] US-27 de `.scratch/module-split/spec.md` queda intacto
- [x] `npm test` en verde
