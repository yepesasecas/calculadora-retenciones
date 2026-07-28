# 08 — Base gravable especial: agencias de publicidad

**What to build:** una bandera por parte —«base gravable especial (agencia de
publicidad)»— que lleva el ReteICA de esa parte a su **margen** en vez de al subtotal
facturado.

La norma: las agencias de publicidad, administradoras y corredoras de bienes
inmuebles y corredores de seguros pagan ICA «sobre los ingresos brutos entendiendo
como tales el valor de los **honorarios, comisiones y demás ingresos propios
percibidos para sí**» (Ley 1819/2016 art. 342 par. 1), y la retención sigue esa base:
«en los casos en que los sujetos de la retención determinen su impuesto a partir de
una base gravable especial, la retención se efectuará sobre la correspondiente base
gravable» (D. 271/2002 art. 9).

**Arranca apagada.** Que la Agencia califique es un hecho que ningún documento
resuelve; está preguntado (pregunta 16 de `docs/preguntas-contadora.md`). Encendida,
la diferencia es grande: en un contrato de $50M al 20 % de margen, el ReteICA del
tramo 1 se liquida sobre $10M y no sobre $50M. Es el mayor impacto en plata de todo
el spec — y el único ticket que puede resultar cancelado si la respuesta es que no
aplica.

**No reabre ADR-0002.** La regla es **sólo de ICA**: la Agencia sigue facturando el
contrato completo con IVA sobre el total, en modelo reventa/principal. Lo único que
cambia es la base de una retención. Decirlo explícitamente en el código, porque a
primera vista parece el modelo de mandato que ADR-0002 rechazó.

Es la primera vez que una retención necesita una base distinta del subtotal del
tramo, así que el motor gana una costura de selección de base que hoy no tiene, y la
cadena tiene que hacerle llegar el margen.

**Blocked by:** 03

**Status:** ready-for-agent

- [ ] Apagada, nada cambia respecto de hoy
- [ ] Encendida en la Agencia, el ReteICA del tramo 1 va sobre el margen
- [ ] IVA, neto, retefuente y ReteIVA se siguen calculando sobre el contrato completo
- [ ] El tramo 2 no se mueve al encenderla en la Agencia
- [ ] El código dice por qué esto no contradice ADR-0002
- [ ] `npm test` en verde
