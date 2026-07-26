# 04 — Instantánea del HTML congelada

**What to build:** una red de seguridad a nivel de byte sobre lo que ve el
usuario. Se congela el HTML que produce la vista para una matriz de entradas, de
modo que cualquier cambio posterior en el motor o en los nombres tenga que
demostrar que la pantalla salió idéntica —no parecida, idéntica.

Este ticket no cambia nada visible ni agrega comportamiento. Es la cuerda que se
cuelga antes del salto: los dos tickets siguientes (razones como datos y
renombrado a español) reescriben decenas de sitios y sólo son seguros con esto
puesto.

La matriz cubre las combinaciones que ya ejercitan los casos de cadena: concepto,
modo de margen (porcentaje y fijo) y los perfiles de las tres partes, incluidos
los bordes —sin proveedor, margen mayor que el contrato, subtotales bajo base
mínima, IVA asimétrico entre tramos.

Se usa el mecanismo de instantáneas nativo del ejecutor de pruebas de Node, sin
banderas ni dependencias. El archivo de instantánea se versiona y sólo se
regenera con la bandera explícita de actualización, para que actualizarlo sea
siempre deliberado y visible en el diff.

**Blocked by:** 03

**Status:** ready-for-agent

- [ ] La instantánea cubre las cuatro zonas de la pantalla para cada caso de la matriz
- [ ] La matriz incluye los bordes ya cubiertos por los casos de cadena, no sólo el caso feliz
- [ ] El archivo de instantánea está versionado
- [ ] Regenerar la instantánea requiere la bandera explícita; una corrida normal jamás la reescribe
- [ ] Un cambio deliberado de un rótulo pone el suite en rojo, y revertirlo lo pone en verde
- [ ] `npm test` sigue verde
