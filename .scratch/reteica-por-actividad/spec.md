# ReteICA por actividad, y el fin del bloqueo por tramo

Status: ready-for-agent

Source: una sesión `/research` (2026-07-28) contra fuentes primarias, seguida de
`/grill-with-docs`. La investigación está en
[`docs/retencion-ica.md`](../../docs/retencion-ica.md); las decisiones quedaron en
[ADR-0005](../../docs/adr/0005-per-retencion-gating.md) y en las enmiendas a
ADR-0001 y ADR-0004. Los documentos de modelo ya están en `main`; **falta todo el
código**.

## Problem Statement

Al facturar aparecen tarifas de ReteICA como **8,99** y **9,99** por mil y nadie
sabe de dónde salen. La calculadora no ayuda a averiguarlo: la tarifa es un campo
libre que se digita a mano, no se contrasta con nada, y el número entra sin que
nadie lo pueda verificar después.

Buscar esa pregunta contra las normas dejó ver que el problema de fondo es mayor:
**lo que la calculadora cree sobre ReteICA es falso en cinco puntos**, y en tres de
ellos las cifras salen mal.

1. **La tarifa se comparte entre los dos tramos.** La tarifa de ReteICA es la de la
   actividad del **retenido**, y los retenidos de los dos tramos son partes
   distintas. La Agencia facturando «demás servicios» que subcontrata a una imprenta
   o a un transportador liquida hoy el tramo 2 con la tarifa equivocada.
2. **La tarifa de retención no siempre es la del impuesto.** Medellín retiene un
   **1,8 por mil plano** para toda actividad; Bogotá y Cali retienen a la tarifa de
   la actividad. Un motor que asuma la forma de Bogotá se equivoca en Medellín por
   un factor de entre 1,1 y 6.
3. **El municipio también se comparte**, cuando el ICA de un servicio se causa
   **donde se ejecuta la prestación**, no donde está quien paga. Los dos tramos
   pueden caer en municipios distintos, con bases mínimas de forma distinta.
4. **Un único `bloqueo` por tramo apaga las tres retenciones a la vez**, y ninguna
   de sus tres condiciones gobierna las tres. En consecuencia el motor **omite
   retenciones que sí proceden**: no practica ReteIVA a un retenido del SIMPLE, ni
   ReteICA a un autorretenedor de renta.
5. **La calidad de agente de ReteICA se lee del código 07 del RUT nacional**, cuando
   la confiere el municipio por resolución. En Bogotá alcanza a todo el régimen
   común de ICA, así que un cliente sin código 07 puede ser perfectamente agente
   retenedor de ICA.

Faltan además dos exclusiones reales del lado del retenido y la base gravable
especial de las agencias de publicidad, que para la propia Agencia puede ser la
diferencia entre liquidar ReteICA sobre el contrato o sobre el margen.

## Solution

El municipio deja de ser un par de números y pasa a llevar **su propia regla de
retención**; la actividad económica pasa a ser un dato de cada parte; y cada
retención responde a su propia autoridad en vez de a un interruptor común.

Para quien usa la calculadora:

- Elige la **actividad ICA** de cada parte —de la tabla del municipio, buscable por
  CIIU— en vez de digitar un número suelto. Cada tramo usa la de su retenido.
- Si el municipio retiene a tarifa plana, la actividad no se le pregunta: la regla
  la aporta el municipio.
- Puede decir **en qué municipio se ejecuta cada tramo**, sin repetirlo cuando es el
  mismo.
- Declara por parte los hechos que el RUT no contiene —agente de ReteICA,
  autorretenedor de ICA, declarante de ICA en el municipio, base gravable
  especial— separados visiblemente de los códigos derivados del RUT.
- Si aun así digita una tarifa a mano y esa tarifa no figura en la tabla del
  municipio, **la calculadora calcula y avisa**. Es el aviso que habría cazado el
  8,99 el primer día.
- Cuando una retención no procede, lee **la razón de esa retención**, no una frase
  común repetida tres veces.

## User Stories

**La tarifa y la actividad**

1. Como usuario de la calculadora, quiero elegir la actividad ICA de cada parte en
   vez de digitar una tarifa, para que la tarifa salga de una tabla verificable y no
   de mi memoria.
2. Como usuario, quiero que cada tramo use la tarifa de su propio retenido, para que
   subcontratar a alguien de otra actividad no me dé una cifra equivocada.
3. Como usuario, quiero buscar la actividad por código CIIU o por nombre, para
   encontrarla sin recorrer la tabla entera.
4. Como usuario, quiero que la tabla de cada municipio cite el acuerdo y el artículo
   que la fija, para poder defender la cifra ante la contadora o ante la DIAN.
5. Como usuario en Medellín, quiero que se aplique el 1,8 por mil plano sin
   preguntarme la actividad, para que la calculadora refleje que allí la retención
   no depende de lo que uno haga.
6. Como usuario, quiero que «actividad no informada» aplique la tarifa máxima del
   municipio donde así lo manda la norma, para que el resultado sea el que la
   autoridad aplicaría de verdad.
7. Como usuario, quiero seguir pudiendo digitar una tarifa a mano cuando el
   municipio no está cargado, para no quedarme bloqueado en una ciudad que la
   calculadora no conoce.
8. Como usuario, quiero que una tarifa digitada que no figura en la tabla del
   municipio me lo advierta sin dejar de calcular, para enterarme de que hay algo
   que verificar sin perder el resultado.
9. Como usuario, quiero saber de qué acuerdo salió la tarifa que se aplicó, para
   rastrearla cuando algo no cuadre.

**El municipio y la territorialidad**

10. Como usuario, quiero indicar en qué municipio se ejecuta cada tramo, para
    liquidar donde de verdad se causa el ICA.
11. Como usuario cuyo trabajo ocurre todo en una ciudad, quiero que el municipio del
    tramo venga puesto por defecto, para no responder dos veces la misma pregunta.
12. Como usuario, quiero que cada tramo use las bases mínimas de su municipio, para
    que un umbral de otra ciudad no me apague una retención que sí procede.
13. Como usuario, quiero que las bases mínimas se expresen en las unidades que usa la
    norma, para no heredar una indexación que nadie escribió.

**Las compuertas por retención**

14. Como usuario, quiero que cada retención se apague por su propia razón, para
    entender qué hecho concreto la dejó fuera.
15. Como usuario, quiero leer una nota por cada retención que no aplica, para no
    tener que adivinar si la única frase en pantalla cubría las tres.
16. Como usuario con un proveedor del SIMPLE responsable de IVA, quiero que se le
    practique ReteIVA, porque la norma lo dice y hoy la calculadora se lo salta.
17. Como usuario con una contraparte autorretenedora de renta, quiero que se le
    practique ReteICA, porque el código 15 es nacional y no alcanza al impuesto
    municipal.
18. Como usuario, quiero que ReteIVA se apague cuando el retenido es a su vez agente
    de retención de IVA, que es lo que dice el art. 437-2, y no por ser gran
    contribuyente, que era sólo una aproximación.
19. Como usuario, quiero que la razón que veo sea exactamente la que el motor usó,
    para que la explicación y el número no puedan divergir.

**Los hechos municipales por parte**

20. Como usuario, quiero declarar si una parte es agente de retención de ICA, porque
    eso lo confiere el municipio por resolución y el RUT nacional no lo dice.
21. Como usuario, quiero que ese dato venga marcado por defecto para quien es
    responsable de IVA, porque en Bogotá la designación alcanza a todo el régimen
    común, y poder desmarcarlo.
22. Como usuario, quiero declarar que una parte es autorretenedora de ICA por
    resolución municipal, para que nadie le practique ReteICA.
23. Como usuario, quiero declarar que una parte es declarante de ICA en el
    municipio, para que la exclusión del gran contribuyente opere donde el municipio
    la tiene.
24. Como usuario, quiero que la calculadora no aplique esa exclusión en un municipio
    que no la tiene, para que Medellín no herede una regla de Bogotá.
25. Como usuario, quiero ver separados los hechos que declaro de los que se derivan
    del RUT, para saber de cuáles respondo yo.

**La base gravable especial**

26. Como Agencia que puede calificar como agencia de publicidad, quiero una bandera
    que lleve mi ReteICA al margen en vez de al contrato, para reflejar la base
    especial que me corresponde.
27. Como usuario, quiero que esa bandera venga apagada, porque nadie ha confirmado
    todavía que la Agencia califique.
28. Como usuario, quiero que encenderla mueva sólo el ReteICA y deje intactos el
    IVA, el neto y la retefuente, para que siga siendo una regla de ICA y no un
    cambio de cómo facturo.
29. Como lector del código, quiero que quede dicho por qué esto no contradice el
    modelo de reventa de ADR-0002, para que nadie lo «corrija» a un modelo de
    mandato.

**Confianza en el resultado**

30. Como usuario, quiero que las seis facturas de referencia sigan dando lo mismo,
    para saber que la reforma no rompió lo que ya estaba bien.
31. Como usuario, quiero saber cuáles cifras cambian con esta reforma y por qué,
    para no pensar que apareció un error.
32. Como contadora revisando el resultado, quiero que cada regla cite su norma, para
    verificarla sin volver a investigar.

## Implementation Decisions

**Las fuentes primarias mandan.** Una norma citada (ET, ley, acuerdo municipal,
oficio DIAN) basta para cambiar el dominio. La contadora queda para los hechos que
ningún documento contiene: en qué municipio se ejecuta el servicio, cuál es el CIIU
de la parte, si la Agencia es agencia de publicidad.

**El municipio lleva una regla de retención, no una tarifa.** Es la decisión
estructural de la que cuelga el resto, y llegó por investigación: la primera versión
de este spec daba por universal la forma de Bogotá y Medellín la desmintió. Dos
formas, discriminadas por tipo:

```
bogota:   { regla: { tipo: "actividad", tabla: [...], maxima: 13.8 } }
cali:     { regla: { tipo: "actividad", tabla: [...], maxima: 10   } }
medellin: { regla: { tipo: "plana",     tarifa: 1.8              } }
```

La regla es también el sitio donde vive **la exclusión del gran contribuyente
declarante**, que Bogotá y Cali tienen y Medellín no, y **la forma de la base
mínima**: par compras/servicios en Bogotá y Cali, umbral único en Medellín.

**La actividad ICA es propiedad de la parte**, no de la cadena ni del concepto. Cada
tramo lee la de su retenido. No se deriva del `concepto`, que es nacional y gobierna
retefuente; `icaClase` sobrevive pero sólo elige la base mínima donde la forma es de
par.

**El municipio es propiedad del tramo**, con el de la cadena como valor por defecto.

**Los hechos municipales entran por parte y no se derivan del RUT**: agente de
ReteICA (por defecto, el valor de responsable de IVA), autorretenedor de ICA, y
declarante de ICA en el municipio. El perfil deja de ser una función pura de la
casilla 53 y pasa a transportar también lo declarado — la enmienda de ADR-0001.

**Se retira el `bloqueo` por tramo.** Cada retención resuelve su propia razón:

| Retención | No aplica cuando |
|---|---|
| Retefuente | el retenedor no es agente 07; el retenido es autorretenedor (15) o SIMPLE (47); el subtotal no llega a la base mínima del concepto |
| ReteICA | el retenedor no es agente de ReteICA municipal; el retenido es SIMPLE (47) o autorretenedor de ICA; el subtotal no llega a la base mínima del municipio; más las exclusiones propias del municipio |
| ReteIVA | el retenedor no es agente 09/23; el retenido no es responsable de IVA; el retenido es a su vez agente de reteIVA (parágrafo art. 437-2, que reemplaza el proxy «gran contribuyente»); la factura no lleva IVA |

**El panel de notas pasa a una línea por retención que no aplica.** Se acepta la
repetición cuando las razones coinciden: tres razones distintas valen tres líneas.
Amplía ADR-0004, cuya decisión de ocultar las filas queda intacta. La nota se sigue
derivando de la razón para que no puedan divergir.

**La base gravable especial es una bandera por parte, apagada por defecto**, que
lleva el ReteICA de esa parte al margen. Es regla **sólo de ICA**: no toca la
facturación, así que ADR-0002 queda intacto. Es la primera vez que una retención
necesita una base distinta del subtotal del tramo, de modo que el motor gana una
costura de selección de base y la cadena tiene que hacerle llegar el margen.

**Una tarifa fuera de tabla calcula y avisa.** No se rechaza: existen municipios sin
tabla cargada y municipios cuya tarifa de retención no está en ninguna tabla de
impuesto.

**Datos a cargar**, cada cifra citando acuerdo y artículo:

- **Bogotá** — Acuerdo 65 de 2002 art. 3, mod. art. 6 del Acuerdo 780 de 2020 y
  art. 4 del Acuerdo 816 de 2021, con el listado CIIU 2022 rev. 4 de la SHD. No
  tomar las cifras «2003 y siguientes» del Decreto 352/2002 sin cruzarlas con el
  Acuerdo 780/2020. Bases mínimas normativas en **pesos de 2002**; 27/4 UVT es la
  indexación de uso, y hay que anotarlo.
- **Medellín** — Acuerdo 093 de 2023, que derogó el Ac. 066/2017 y con él el
  Ac. 064/2012: toda tabla que cite esos dos está muerta. Retención plana 1,8 por
  mil (art. 83), base mínima única de 15 UVT, sin exclusión de gran contribuyente
  (art. 82).
- **Cali** — Acuerdo 0321 de 2011, compilado en el D.E. 4112.010.20.0416 de 2021,
  mod. Ac. 0529/2022 y Ac. 0586/2024. Retención por actividad con tarifa máxima si
  no se informa (art. 100), bases de 3 y 15 UVT, financieras al 14.

Medellín y Cali **sí enuncian sus bases mínimas en UVT en el texto normativo**, a
diferencia de Bogotá. No hay que desindexar nada.

**Orden de ejecución.** Los hechos municipales por parte van primero, porque las
compuertas y la regla del municipio dependen de ellos; la regla de retención antes
que el municipio por tramo y que las tablas de Medellín y Cali; la base especial
después de las compuertas. El detalle está en los siete tickets de este directorio.

## Testing Decisions

**Qué es una buena prueba aquí.** Se afirma la salida observable del motor —cifras y
razones— nunca cómo llegó a ellas. Los casos guardan **códigos del RUT y hechos
declarados, no perfiles ya derivados**, para que cada caso ejercite la derivación
real; es la convención que ya sigue `fixtures/cadena.js` y hay que conservarla al
añadirle los campos nuevos. Ninguna prueba debe conocer la forma interna de la regla
de retención más allá de lo que el motor expone.

**Tres costuras**, dos existentes y una nueva:

1. **La cadena completa** — el seam más alto, alimentado por la tabla de casos de
   `fixtures/cadena.js`. Ahí van las conductas de cadena: tarifas distintas por
   tramo, municipios distintos por tramo, la base especial sobre el margen, y el
   reparto contrato/margen que ya cubre. Prior art: las pruebas actuales de cadena,
   que afirman un subconjunto distinto por caso y verifican que los siete casos
   siguen presentes.
2. **El tramo** — la matriz de compuertas por retención, que es combinatoria (tres
   retenciones × una decena de condiciones) y sería ilegible expresada como cadenas
   enteras. Prior art: las pruebas actuales de tramo, que varían perfiles y tarifa de
   IVA sobre un monto fijo, y las cuatro que fijan las razones de ReteIVA.
3. **La resolución de la tarifa** — costura **nueva**: una función pura que, dado un
   municipio y el retenido, devuelve la tarifa y de dónde salió. Se expone
   deliberadamente para poder fijar sin construir un tramo entero: la tabla de
   Bogotá, el respaldo a tarifa máxima, la tarifa plana de Medellín, y el aviso de
   tarifa fuera de tabla. Es el único seam nuevo que este spec introduce.

**Lo que hay que fijar explícitamente porque cambia de valor:** un retenido del
SIMPLE responsable de IVA recibiendo ReteIVA; un autorretenedor (15) recibiendo
ReteICA y ReteIVA pero no retefuente; ReteIVA apagándose por «el retenido es agente
de reteIVA» y no por gran contribuyente; el mismo retenido dando tarifas distintas
en Bogotá y en Medellín. **Las fixtures que fijaban lo anterior fijaban un error** y
se actualizan en el mismo cambio que las rompe, diciendo en el commit cuáles y por
qué.

**Lo que no debe moverse:** las seis facturas de referencia. Sus clientes son
agentes reales, la actividad es «demás servicios» a 9,66 en Bogotá y el resultado
tiene que reproducirse idéntico. Si se mueven, la reforma tiene un error.

`npm test` verde antes de cada commit y de cada push, y `dominio/` y `datos/` sin
importar de `vista/` ni del formateador (ADR-0003).

## Out of Scope

- **Entidad de derecho público como tipo de parte.** Hace falta para la excepción del
  art. 9 lit. d en Bogotá —el gran contribuyente declarante sí es sujeto de retención
  cuando el retenedor es entidad pública— y para los clientes estatales. Es un cambio
  al modelo de partes, no un detalle de ReteICA.
- **El hecho «sin domicilio ni presencia permanente en el país»**, que en Medellín
  hace volver a la tarifa plena de la actividad (Ac. 093/2023 art. 83). Mismo motivo.
- **Las excepciones de territorialidad** que no son «donde se ejecuta»: transporte,
  TV e internet por suscripción, telefonía fija y móvil. Se anotan, no se modelan.
- **Descargar o parsear en tiempo de ejecución el XLSX de la SHD.** La tabla entra
  como datos en el repo.
- **La autorretención de ICA como cálculo.** Se modela el hecho de que la parte lo
  sea —y por tanto que no se le retenga—, no la liquidación de su propia
  autorretención.
- **El origen de 8,99 y 9,99**, mientras no lleguen municipio, CIIU y el acuerdo
  citado en un certificado real.
- **Municipios más allá de Bogotá, Medellín y Cali.** Los demás siguen con entrada
  libre.
- **La reconciliación** de caja contra impuestos, que sigue diferida a su propia
  sesión.

## Further Notes

**La pregunta original sigue abierta, y ahora se sabe por qué costaba.** 8,99 y 9,99
no figuran en ninguna tabla de tarifas de Bogotá, Medellín ni Cali, verificado contra
el texto íntegro de los acuerdos. Lo que sí quedó verificado es el mecanismo que
explicaría el resultado vacío: un municipio puede fijar tarifas de **retención**
distintas de las del **impuesto**, y Medellín lo hace. Se estaba buscando en el sitio
equivocado. Cerrarlo necesita tres datos de un certificado real: municipio, CIIU del
retenido y el acuerdo citado.

**Esta reforma cambia plata, no sólo etiquetas.** Está dicho en las decisiones y
merece repetirse: aparecen retenciones donde antes no había ninguna. Conviene avisar
a la contadora antes de que note la diferencia por su cuenta.

**Cabo suelto de Cali**: el Acuerdo 0529 de 2022 y la Res. 0119 de 2020 sólo se
publican escaneados, sin capa de texto; de ellos se verificó únicamente lo que
reproducen otras fuentes primarias. Si algo de Cali no cuadra contra una factura
real, ese es el primer sitio donde mirar.

**Preguntas a la contadora abiertas por este trabajo**, en
`docs/preguntas-contadora.md`: si la Agencia es agencia de publicidad (la de mayor
impacto en plata), cuál es nuestro CIIU registrado para ICA, en qué municipios
ejecutamos y ejecutan los proveedores, si somos agentes de retención de ICA, y de
dónde salió el 8,99.
