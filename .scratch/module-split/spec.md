# Modularización — de archivo único a módulos ES con pruebas

Status: ready-for-agent

## Problem Statement

Toda la calculadora vive en un solo `index.html` de 939 líneas: reglas fiscales,
motor de tramos, motor de cadena, plantillas HTML, cableado del DOM, hoja de
estilos y trece casos de verificación, intercalados. De ahí salen tres problemas
concretos:

1. **Nada falla.** Los trece casos (seis facturas reales + siete casos de cadena)
   corren en el navegador y pintan una fila roja dentro de un `<details>`. Si no
   abro la página, no me entero. No hay código de salida, no hay nada que impida
   un commit con el motor roto.
2. **La cobertura tiene techo.** Sólo se puede afirmar la salida completa de la
   cadena. `deriveProfile` con un RUT contradictorio, la lectura de
   `"1.000.000"` como monto, la razón que se pinta cuando una retención no
   aplica — nada de eso es alcanzable por separado, porque nada de eso es
   importable por separado.
3. **Editarlo cuesta.** Para cambiar una tarifa hay que navegar entre CSS,
   plantillas y listeners. El motor —la parte que de verdad importa— no tiene
   frontera propia.

Además, el motor produce hoy prosa en español (`"base mínima del concepto:
$105.000"`) dentro de la capa de dominio, así que las pruebas afirman *copy*
cuando querían afirmar aritmética: un ajuste de redacción rompe una prueba de
números.

## Solution

Partir el archivo en módulos ES nativos servidos tal cual —sin bundler, sin
dependencias, sin paso de build— de modo que el navegador y `node --test`
importen exactamente los mismos archivos. `npm test` pasa a ser el único
verificador, con código de salida.

La partición sigue una regla: **el DOM vive en los bordes**. `dominio/` y
`datos/` quedan libres de DOM y de presentación; `vista/` produce cadenas de HTML
como funciones puras; sólo `main.js` toca `document`. Con eso, casi toda la
aplicación es afirmable sin navegador y sin jsdom.

En el camino se corrigen dos cosas que el archivo único escondía:

- La **tolerancia de ±1 peso** desaparece. Medido: el motor reproduce *exacto*
  las seis facturas en toda línea derivada de una tarifa (IVA, retefuente,
  ReteICA). Las tres discrepancias eran renglones agregados que el emisor imprimió
  inconsistentes con sus propios componentes. La tolerancia no cubría redondeo del
  motor: debilitaba las treinta afirmaciones para tapar tres números de origen.
- Las **razones** dejan de ser prosa y pasan a ser datos (`{ tipo, … }`), que la
  vista traduce a español. El dominio deja de saber de `es-CO`.

El sitio sigue siendo estático sobre `main` en GitHub Pages; desplegar sigue
siendo `git push`.

## User Stories

1. Como desarrollador, quiero ejecutar `npm test` y obtener un código de salida distinto de cero cuando el motor está roto, para que una regresión no dependa de que yo abra la página.
2. Como desarrollador, quiero que las pruebas importen los mismos archivos que carga el navegador, para que no exista divergencia entre lo probado y lo servido.
3. Como desarrollador, quiero que `dominio/` no dependa de nada de presentación, para poder afirmar aritmética sin montar un DOM.
4. Como desarrollador, quiero importar `calcularTramo` por separado, para probar una tarifa sin construir una cadena completa.
5. Como desarrollador, quiero importar `derivarPerfil` por separado, para afirmar qué pasa con un RUT que declara 48 y 49 a la vez.
6. Como desarrollador, quiero afirmar que un código de responsabilidad no catalogado genera una alerta, sin pasar por la interfaz.
7. Como desarrollador, quiero probar la lectura de montos (`"1.000.000"` → `1000000`, vacío → `null`, basura → `null`) como función pura sobre una cadena, para no depender de un `input`.
8. Como desarrollador, quiero probar la lectura del margen en modo `%` y en modo `$ fijo` sin tocar el DOM.
9. Como desarrollador, quiero que las razones de "no aplica" sean datos y no prosa, para que una prueba falle cuando la *razón* es incorrecta y no cuando la *redacción* cambió.
10. Como desarrollador, quiero un único catálogo de tipos de razón compartido entre motor y vista, para que una razón nueva sin traducción se detecte y no se imprima en blanco.
11. Como desarrollador, quiero una instantánea del HTML renderizado sobre una matriz de entradas, para poder reestructurar el motor sabiendo que la página no cambió ni un carácter.
12. Como desarrollador, quiero regenerar esa instantánea con una bandera explícita, para que actualizarla sea siempre un acto deliberado y revisable en el diff.
13. Como desarrollador, quiero que las seis facturas reales se afirmen exactas, sin tolerancia, para que el suite no tenga holgura escondida.
14. Como desarrollador, quiero que los tres agregados corregidos lleven una nota diciendo qué imprimió la factura y qué suman sus propias líneas, para que nadie los "arregle" de vuelta al valor impreso.
15. Como desarrollador, quiero que los siete casos de cadena sigan afirmando ambos tramos y sus razones, para no perder cobertura en la migración.
16. Como desarrollador, quiero que cada tabla de datos (conceptos, municipios, responsabilidades) sea su propio módulo, porque cada una viene de una fuente distinta y cambia en su propio calendario.
17. Como desarrollador, quiero editar la tarifa de un concepto sin abrir código de presentación.
18. Como desarrollador, quiero agregar un municipio sin tocar el motor.
19. Como desarrollador, quiero que los identificadores estén en español y coincidan con el glosario, para que leer el código y leer `CONTEXT.md` sea la misma operación.
20. Como desarrollador, quiero que la migración avance en pasos con red de seguridad, para que un paso arriesgado nunca sea el primero.
21. Como desarrollador, quiero que los pasos de reestructuración y de renombrado estén guardados por una instantánea idéntica byte a byte, para separar "moví código" de "cambié comportamiento".
22. Como desarrollador, quiero una regla en `CLAUDE.md` que exija correr las pruebas antes de hacer commit y push, para que el agente no suba trabajo sin verificar.
23. Como desarrollador, quiero un ADR que registre por qué no hay build ni dependencias, para que nadie agregue un bundler creyendo que fue un olvido.
24. Como desarrollador, quiero un ADR que registre que `tramo` reemplaza a `leg` en el código, para que la contradicción con ADR-0002 quede explicada y no parezca un descuido.
25. Como desarrollador, quiero que `CONTEXT.md` refleje el vocabulario vigente el mismo día en que el código cambia, para que el glosario no mienta.
26. Como usuario de la calculadora, quiero que la página siga funcionando igual tras la migración, para que la refactorización no me cueste nada.
27. Como usuario de la calculadora, quiero seguir viendo la razón por la que una retención quedó en cero, para no confundir "no aplica" con "error".
28. Como usuario de la calculadora, quiero que las razones se lean exactamente igual que antes, para no tener que reaprender la pantalla.
29. Como usuario de la calculadora, quiero que la página cargue completa o falle de forma visible, no a medias.
30. Como mantenedor, quiero que el sitio se siga publicando con `git push` a `main`, para no adoptar un flujo de despliegue nuevo.
31. Como mantenedor, quiero que `npm install` nunca sea necesario, para que clonar y correr sea inmediato.
32. Como mantenedor, quiero saber que abrir `index.html` con doble clic ya no funciona y que hace falta un servidor local, para no perseguir un fallo de CORS.
33. Como mantenedor, quiero borrar la rama local `public` obsoleta, para que no haya una segunda copia del sitio que sincronizar a mano.
34. Como mantenedor, quiero `.nojekyll` en la raíz, para que Pages publique el árbol tal cual y compile más rápido.
35. Como mantenedor, quiero que el panel de verificación desaparezca de la página, porque su trabajo lo hace ahora `npm test`.
36. Como mantenedor, quiero que las reglas CSS del panel desaparezcan con él, para no dejar estilos muertos.
37. Como mantenedor, quiero que la hoja de estilos sea un archivo aparte, para que `index.html` sea marcado y nada más.
38. Como mantenedor, quiero que el trabajo quede como spec más seis tickets encadenados, para poder retomarlo en otra sesión sin reconstruir el contexto.

## Implementation Decisions

### Formato de módulos y despliegue

- **Módulos ES nativos, sin bundler y sin paso de build.** `index.html` carga
  `<script type="module">`; Pages sirve el árbol verbatim desde `main`.
- **Consecuencia aceptada:** `file://` deja de funcionar. El desarrollo local
  exige un servidor estático (`python3 -m http.server`). Queda registrado en el
  ADR y en el README del spec, no como sorpresa.
- **Cero dependencias.** `package.json` existe únicamente para declarar
  `"type": "module"` y el script `test`; no lleva bloque `dependencies` ni
  lockfile. Se fija `engines.node >= 22` por el uso de instantáneas nativas.
- Se conserva la extensión `.js` (no `.mjs`) para no depender del tipo MIME que
  Pages asigne a `.mjs`.

### Capas

Tres capas y una regla direccional: `datos/ ← dominio/ ← vista/ ← main.js`.

- **`datos/`** — las tres tablas, un módulo cada una: conceptos (tabla nacional
  de retefuente), municipios (ReteICA), responsabilidades (casilla 53 del RUT,
  más el índice por código y el predicado de relevancia). Se separan porque
  tienen tres fuentes distintas y cambian en calendarios distintos.
- **`dominio/`** — perfil fiscal derivado, motor de tramo, motor de cadena y el
  catálogo de razones. **Prohibido importar desde `vista/` o desde el formateador.**
  Es una regla verificable por `grep`, no por disciplina.
- **`vista/`** — formateo, traducción de razones a español, plantillas HTML como
  funciones puras, el widget de códigos del RUT y la lectura de entradas.
- **`main.js`** — único módulo que toca `document`: cablea listeners, lee el
  formulario, llama al dominio, escribe `innerHTML`. Es el único archivo sin
  pruebas y no debe contener aritmética.

### El DOM a los bordes

`render()` se parte en tres piezas con contrato explícito:

- **leer entradas**: DOM → objeto plano (contrato, margen, concepto, municipio,
  tarifas, códigos de las tres partes).
- **vista**: objeto plano → `{ flujoHtml, notasHtml, specHtml, splitHtml }`.
  Función pura, sin `document`.
- **pintar**: escribe esas cadenas en sus contenedores.

`leerMonto` pasa a recibir la cadena cruda en vez del `id` del campo. El
renderizado del perfil derivado se parte en una función pura que produce HTML y
una escritura.

Queda deliberadamente sin cubrir el manejador que reformatea los montos mientras
se escribe (separador de miles y reposición del cursor): cubrirlo exige jsdom o
un navegador, y se decidió no adquirir esa dependencia.

### Razones como datos

El motor deja de construir prosa. Emite descriptores:

```
{ tipo: "retenidoSimple" }
{ tipo: "baseMinimaConcepto", base: 105000 }
{ tipo: "baseMinimaMunicipal", base: 209496 }
{ tipo: "retenedorNoAgenteRetefuente" }
{ tipo: "retenidoNoResponsableIVA" }
```

El catálogo de tipos vive en `dominio/razones.js` y lo comparten motor y
traductor; así, un tipo nuevo sin traducción es detectable. Las notas del motor
reciben el mismo tratamiento. **El texto que ve el usuario no cambia**: la
traducción reproduce la redacción actual carácter por carácter, y eso lo garantiza
la instantánea.

### Vocabulario

- Identificadores en español, coincidiendo con el glosario.
- **`tramo` reemplaza a `leg` en el código.** Esto revoca conscientemente la
  regla `_Avoid_: Tramo (in code)` de `CONTEXT.md` y el vocabulario de ADR-0002.
  Consecuencia asumida: el término del modelo y el rótulo de la interfaz ("Tramo
  1 · Cliente final → Matiz") vuelven a ser la misma palabra, de modo que
  renombrar el rótulo dejaría de ser una edición de texto.
- `CONTEXT.md` se actualiza en el mismo cambio: el lema **Leg** pasa a **Tramo**
  sin la línea `_Avoid_`, y **Fiscal profile** pasa a **Perfil fiscal**.
- Los slugs de documentación y de tickets siguen en inglés, según la convención
  ya establecida en `.scratch/`.

### Datos de referencia corregidos

Tres agregados de las facturas reales se registran con su valor aritméticamente
consistente, no con el impreso, cada uno con una nota de una línea:

- FEC591 — total impreso 9.924.759; sus propias líneas suman 9.924.760.
- FEC595 — total impreso 3.229.973; sus propias líneas suman 3.229.972.
- FEC598 — neto impreso 13.864.285; subtotal + IVA da 13.864.284.

Ninguna línea derivada de tarifa se toca: las seis facturas ya coincidían exactas.

### Registro de decisiones

- **ADR-0003** — módulos ES estáticos, sin build, sin dependencias; incluye la
  regla direccional entre capas y la pérdida de `file://`.
- **ADR-0004** — `tramo` sustituye a `leg`; deja constancia de que ADR-0002 queda
  superado en vocabulario.

### Higiene del repositorio

- Se agrega `.nojekyll`.
- Se borra la rama local obsoleta `public` (nunca publicada, superada por `main`).
- `test/` y `fixtures/` quedan servidos públicamente, igual que `docs/` y
  `.scratch/` hoy. Es aceptable.
- Regla nueva en `CLAUDE.md`: correr `npm test` antes de commit y push. No hay
  CI; la regla vincula a los agentes, no al `git commit` manual — limitación
  conocida y aceptada.

### Secuencia

Siete pasos encadenados, cada uno un ticket bloqueado por el anterior:

1. Mover dominio y datos verbatim; portar los trece casos como pruebas de Node.
   Incluye el andamiaje del repositorio, la regla en `CLAUDE.md` y ADR-0003.
2. Extraer `styles.css`; eliminar el panel de verificación y su CSS.
3. Purificar la costura de render: vista pura, lecturas y pintado.
4. Congelar la instantánea de HTML renderizado sobre una matriz de entradas.
5. Reestructurar razones a datos — la instantánea debe salir idéntica.
6. Renombrar a español y actualizar `CONTEXT.md` y ADR-0004 — instantánea idéntica.
7. Pruebas de lecturas y de perfil derivado.

Cada ADR aterriza con el ticket que toma la decisión que registra, no al final.
Los pasos 5 y 6 son los arriesgados y ambos quedan guardados por la instantánea
del paso 4. Ése es el orden: la red se cuelga antes del salto.

## Testing Decisions

**Qué es una buena prueba aquí.** Afirma comportamiento observable —cifras,
razones, HTML producido— y nunca la forma interna. Una prueba que conozca el
nombre de una variable intermedia, o que necesite reescribirse porque un módulo
se partió en dos, está mal puesta. Las pruebas se escriben contra las mismas
funciones que consume `main.js`.

**Costuras.** Se prefieren costuras existentes y lo más altas posible. Quedan
tres, y las tres ya existen como funciones en el archivo actual:

1. **Motor de cadena** — entrada plana (contrato, margen, concepto, municipio,
   tarifas, tres perfiles) → dos tramos con sus cifras y razones. Es la costura
   más alta del dominio y la que ya usan los siete casos de cadena.
2. **Vista** — objeto plano → cadenas de HTML. Costura más alta de la
   presentación; permite instantáneas sin navegador.
3. **Lecturas** — cadena cruda → valor (montos, margen). Costura mínima, nueva,
   creada al empujar el DOM hacia afuera.

Debajo de la primera hay dos costuras internas que se prueban por comodidad, no
por necesidad: motor de un tramo y derivación de perfil. Se prueban directamente
porque son donde vive la regla fiscal y donde una prueba dice más que una de
cadena completa.

**Módulos probados.** Motor de tramo, motor de cadena, perfil derivado, vista,
lecturas. Sin pruebas: `main.js` (cableado) y el reformateador de montos mientras
se escribe.

**Arte previo.** Los trece casos actuales del `<details>` son el punto de partida
y se portan sin pérdida de cobertura: seis facturas reales y siete casos de
cadena que ya afirman ambos tramos, el reparto del margen, los estados de borde
(sin proveedor, margen mayor que el contrato, bajo base mínima, IVA asimétrico) y
las razones de cada retención en cero. Se portan con afirmaciones exactas.

**Instantáneas.** `t.assert.snapshot()` nativo de Node, sin banderas ni
dependencias; el archivo `.snapshot` queda junto a la prueba y se regenera sólo
con `--test-update-snapshots`. La matriz cubre las combinaciones que ya ejercitan
los casos de cadena: concepto, modo de margen y los perfiles de las tres partes.

**Verificación de que las pruebas muerden.** Al portar los casos se hace una
comprobación por mutación en cada archivo: alterar una tarifa, confirmar que el
suite se pone rojo, revertir. Sin eso, "las pruebas existen" no es lo mismo que
"las pruebas sirven".

**TDD.** Sólo para comportamiento nuevo: razones estructuradas (paso 4) y pruebas
de entradas y perfil (paso 6) se escriben en rojo primero. Los pasos de mover,
extraer, instantanear y renombrar son mover-y-verificar; escribir una prueba en
rojo para un archivo que sólo falta sería ceremonia.

## Out of Scope

- **CI.** Se decidió no agregar workflow de GitHub Actions. La verificación queda
  en `npm test` local más la regla en `CLAUDE.md`.
- **Hooks de git.** No se instalan; se menciona en el ADR como opción futura.
- **jsdom, happy-dom, Playwright** y cualquier otra dependencia de pruebas.
- **Bundler, minificación, TypeScript, JSX.**
- **Despliegue por workflow a Pages.** Sigue siendo "servir la rama".
- **El reformateador de montos** mientras se escribe: sin cobertura, por decisión.
- **Cambios de comportamiento visibles.** Ninguna cifra, rótulo ni razón cambia
  para el usuario; la instantánea existe justamente para probarlo.
- **Reglas fiscales nuevas.** Nada de ReteIVA bajo SIMPLE, concepto o municipio
  por tramo, ni la reconciliación diferida — siguen fuera, como dice `CONTEXT.md`.
- **README del proyecto.** No se toca en este trabajo.

## Further Notes

- La rama local `public` resultó obsoleta: Pages sirve `main`. Se borra en el
  paso de higiene.
- La tolerancia de ±1 peso llevaba tiempo debilitando treinta afirmaciones para
  tapar tres números mal impresos por el emisor. La medición está en el spec y en
  las notas de los datos corregidos; si alguna vez reaparece una diferencia de un
  peso, será señal de un fallo real y no de ruido tolerado.
- La regla direccional entre capas (`dominio/` no importa presentación) es lo
  único que evita que la prosa vuelva a filtrarse al motor. Conviene verificarla
  con un `grep` antes de cada commit; no hay nada mecánico que la imponga.
