# 01 — Módulos de dominio y datos, con las pruebas fiscales portadas

**What to build:** `npm test` empieza a existir y a verificar aritmética fiscal de
verdad. Las tablas de reglas y el motor salen del archivo único y quedan como
módulos ES importables tanto por el navegador como por Node, y los trece casos que
hoy se pintan dentro de un `<details>` pasan a correr bajo `node --test` con
código de salida. La página sigue cargando y comportándose exactamente igual: este
ticket no cambia nada de lo que ve el usuario.

El movimiento es **verbatim**: mismo código, mismos nombres, mismas razones en
prosa. Renombrar y reestructurar viene después, guardado por la instantánea.

Se aprovecha para dejar el repositorio listo: `package.json` sin dependencias,
`.nojekyll`, la rama local obsoleta `public` borrada, la regla de correr pruebas
antes de commit y push en `CLAUDE.md`, y ADR-0003 registrando por qué no hay
build ni dependencias.

**Blocked by:** None — can start immediately

**Status:** done

- [x] Las tres tablas (conceptos, municipios, responsabilidades) son módulos independientes, uno por fuente
- [x] El perfil derivado, el motor de un tramo y el motor de cadena son módulos importables sin tocar el DOM
- [x] `index.html` carga la aplicación como módulo ES y se comporta igual que antes
- [~] `npm test` corre las seis facturas reales con afirmaciones exactas — sin tolerancia de ±1 — **retirado**: ver nota
- [~] Los tres agregados corregidos (FEC591 total, FEC595 total, FEC598 neto) llevan nota de qué imprimió la factura y qué suman sus líneas — **retirado**: ver nota
- [x] `npm test` corre los siete casos de cadena afirmando ambos tramos, el reparto del margen y las razones de cada retención en cero
- [x] Comprobación por mutación: alterar una tarifa pone el suite en rojo; revertida, en verde
- [x] `package.json` declara `type: module`, el script `test` y `engines.node >= 22`; no tiene dependencias ni lockfile
- [x] `npm install` no hace falta para correr las pruebas
- [x] `.nojekyll` en la raíz
- [x] Rama local `public` borrada
- [x] `CLAUDE.md` exige correr `npm test` antes de commit y push
- [x] ADR-0003 registra: módulos ES estáticos, sin build, sin dependencias, la regla direccional entre capas y la pérdida de `file://`

## Comments

**2026-07-25 — Las seis facturas reales salen del repositorio.**

Las seis facturas no se portaron, por decisión del usuario: el repositorio es
público y `fixtures/` se sirve igual que `docs/`, así que el fixture habría
expuesto cinco nombres de cliente con sus montos facturados. Los dos ítems
marcados `[~]` arriba quedan retirados, no pendientes.

Consecuencia de cobertura: `calcular` (motor de un tramo) pierde su única
prueba contra cifras reales, es decir contra el redondeo del emisor. Sigue
ejercitado indirectamente por los siete casos de cadena, que lo corren dos veces
por caso y afirman ambos tramos con sus razones; la comprobación por mutación
sigue mordiendo. Lo que se pierde es la confirmación de que el motor reproduce
facturas del mundo real, no la cobertura del código.

Si hiciera falta recuperarla, la vía es un fixture con los montos anonimizados
(el campo `cliente` no lo usa ninguna afirmación).
