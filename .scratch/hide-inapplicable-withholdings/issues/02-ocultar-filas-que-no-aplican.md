# 02 — Las retenciones que no aplican dejan de pintarse

**What to build:** una retención que no aplica no pinta fila. Ni el monto, ni el
"no aplica", ni la razón: la fila no está. La razón sigue disponible una sola vez
por tramo, en el panel de notas, que es desde el ticket 01 el único lugar donde
vive una razón.

El IVA es la excepción deliberada: su fila se pinta **siempre**, con su razón,
aunque quede en cero. Una retención es un descuento — si falta, no se restó nada y
la aritmética se sigue leyendo. El IVA es una línea de la factura misma: si falta,
Subtotal y Neto quedan pegados, idénticos y sin explicación.

Cuando el tramo entero está bloqueado:

- **Col 4** deja de pintar el encabezado `Retenciones que le practicas:` y su tabla;
  `Le giras` se vuelve a pintar por su cuenta. `Le giras` no se elimina nunca — es
  la única cifra por la que alguien mira esa columna.
- **Col 3** conserva `Neto que le facturas` y `Matiz recibe` aunque sean iguales.
  Responden preguntas distintas ("¿qué facturo?" y "¿qué me llega?") y verlas
  iguales *es* el hallazgo. Colapsarlas además haría que la tabla cambiara de forma
  según el perfil fiscal, y comparar dos configuraciones lado a lado dejaría de
  funcionar.

Cuando el bloqueo es parcial (por ejemplo sólo ReteIVA), la tabla se pinta con las
retenciones que sí aplican y el encabezado se queda.

Efecto neto en la configuración por defecto: la frase repetida pasa de seis copias
en pantalla a una.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Una retención con razón no pinta fila, en col 3 y en col 4
- [ ] La fila de IVA se pinta siempre, con su razón cuando no aplica
- [ ] Con el tramo entero bloqueado, col 4 no pinta el encabezado de retenciones ni su tabla
- [ ] `Le giras` sigue visible con el tramo entero bloqueado
- [ ] Con el tramo entero bloqueado, col 3 conserva el neto y el total aunque coincidan
- [ ] Con bloqueo parcial, se pintan las retenciones que sí aplican y el encabezado permanece
- [ ] Las cifras de los 7 casos de cadena no cambian
- [ ] `npm test` en verde

## Comments

**Repetición residual, detectada en la revisión del ticket 01.** Con un retenido no
responsable de IVA, la fila de IVA — que por la decisión 3 se pinta siempre —
muestra `el retenido no es responsable de IVA (49)`, y la nota nueva del ticket 01
dice casi lo mismo. Al ocultar las filas de retención esas dos quedan juntas en
pantalla, que es justo la repetición contra la que abre el spec. Revisar la
redacción de una de las dos al implementar este ticket.

**Revisado — se deja como está.** Las dos frases enuncian el mismo hecho del RUT
pero para rubros distintos: una dice por qué la factura no lleva IVA, la otra por
qué no hay ReteIVA. No es la repetición que motivó el spec (tres filas idénticas
del mismo rubro): es una causa con dos consecuencias, y ocultar cualquiera de las
dos dejaría un rubro sin explicar. Las alternativas cuestan más de lo que arreglan:
suprimir la nota cuando coincide con la fila de IVA acoplaría `dominio/` a lo que
la vista pinta, y redactar la nota por rama rompería la derivación desde la razón
que evita que nota y razón diverjan.

**Encabezado de la col 4: la condición es "no queda ninguna retención por pintar",
no "el leg está bloqueado".** Es más amplio que la decisión 5 del spec, que hablaba
del bloqueo del leg. Un leg no bloqueado en el que las tres caigan por su cuenta
(las dos bases mínimas más ReteIVA inaplicable) también pierde el encabezado —
correcto: encabezar una tabla vacía no tiene sentido. Queda bendecido aquí en vez
de quedar como accidente.
