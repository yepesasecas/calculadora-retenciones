# 03 — Costura de render purificada

**What to build:** la pantalla completa pasa a ser calculable desde Node a partir
de un objeto plano. Hoy el render lee el formulario, calcula y escribe `innerHTML`
en una sola pasada, así que nada de la presentación es afirmable sin navegador.
Se parte en tres piezas con contrato explícito: **leer entradas** (DOM → objeto
plano), **vista** (objeto plano → cadenas de HTML, función pura) y **pintar**
(escribe esas cadenas donde van).

La lectura de montos deja de recibir el identificador de un campo y pasa a recibir
la cadena cruda, con lo que el parseo se vuelve probable sin DOM.

Al terminar, el único módulo que toca `document` es el de cableado, y ese módulo
no contiene aritmética. Es la precondición de la instantánea del ticket 04.

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] La vista es una función pura: objeto plano de entradas → las cadenas de HTML de las cuatro zonas de la pantalla
- [ ] La vista es invocable desde Node sin ningún sustituto del DOM
- [ ] La lectura de montos recibe una cadena cruda y devuelve el valor o nulo
- [ ] La lectura del margen produce el modo y el valor sin consultar el DOM
- [ ] El perfil derivado se renderiza con una función pura que produce HTML, separada de la escritura
- [ ] El módulo de cableado no contiene ningún cálculo fiscal
- [ ] Ningún módulo de dominio importa nada de presentación (verificable con `grep`)
- [ ] La calculadora se comporta igual que antes: mismas cifras, mismos rótulos, mismas razones
- [ ] `npm test` sigue verde
