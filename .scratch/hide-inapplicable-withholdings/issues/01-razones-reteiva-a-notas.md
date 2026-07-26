# 01 — Las razones de ReteIVA pasan a las notas del tramo

**What to build:** las cuatro razones por las que ReteIVA queda en cero dejan de
existir únicamente en la fila de la tabla y empiezan a aparecer en el panel de
notas del tramo, junto a las que ya están ahí. Son: el retenedor no es agente de
reteIVA (09/23), el retenido no es responsable de IVA (49), el retenido es gran
contribuyente (13), y la factura no lleva IVA.

Hoy el panel de notas ya recibe los tres bloqueos del leg y las dos bases mínimas;
estas cuatro son las únicas que no llegan. Es un hueco de cobertura, no un rediseño:
al terminar, **toda** razón que el motor pueda emitir tiene una nota que la enuncia.

Es la precondición del ticket 02. Si las filas se ocultan antes de que estas cuatro
razones tengan dónde vivir, desaparecen de la aplicación por completo — incluido el
caso de gran contribuyente, regla que `CONTEXT.md` marca como corregida hace poco
por ADR-0001.

Verificable en la app corriendo: dejar ReteIVA bloqueada por cada una de las cuatro
vías y ver la nota bajo `Tramo 1:` / `Tramo 2:`.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Las cuatro razones de ReteIVA producen una nota en el leg correspondiente
- [ ] La redacción de cada nota nombra el código del RUT que la causa, como las notas existentes
- [ ] `detalle[].razon` no cambia: las afirmaciones `razones1` / `razones2` de los 7 casos pasan sin tocarse
- [ ] Hay pruebas que fijan las cuatro notas, una por condición
- [ ] `npm test` en verde
- [ ] `grep -rn "vista/" dominio datos` sigue vacío (ADR-0003)
