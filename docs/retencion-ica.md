# Retención de ICA (ReteICA)

Investigación contra fuentes primarias (jul 2026). Contrasta con lo que hoy
modela `dominio/tramo.js` + `datos/municipios.js`.

## 1. Qué es el ICA y de dónde sale la tarifa

**Impuesto municipal**, no nacional. Grava actividades industriales, comerciales
y de servicios ejercidas en la jurisdicción de cada municipio [L14/83 art. 32].
No hay tabla nacional: **cada concejo municipal fija sus tarifas por acuerdo**,
dentro de los límites de ley:

- **2 a 7 por mil** — actividades industriales
- **2 a 10 por mil** — actividades comerciales y de servicios

[L14/83 art. 33, hoy L1819/16 art. 342, que reescribió el art. 196 del
Decreto-ley 1333 de 1986]. De ahí que la tarifa se exprese **por mil (x1000)**:
9,66 x 1000 = 0,966 % — exactamente el `tarifaPorMil / 1000` de `tramo.js:51`.

**Base gravable**: la totalidad de ingresos ordinarios y extraordinarios del año
gravable, excluyendo actividades exentas/excluidas/no sujetas, devoluciones,
rebajas, descuentos, exportaciones y venta de activos fijos [L1819/16 art. 342].

> **Base especial relevante para este proyecto.** «Las Agencias de Publicidad,
> Administradoras y Corredoras de Bienes Inmuebles y Corredores de Seguros
> pagarán el impuesto… sobre los ingresos brutos entendiendo como tales el valor
> de los **honorarios, comisiones y demás ingresos propios percibidos para sí**»
> [L1819/16 art. 342 par. 1]. Y la retención sigue la base especial: «en los
> casos en que los sujetos de la retención determinen su impuesto a partir de una
> base gravable especial, la retención se efectuará sobre la correspondiente base
> gravable» [D271/02 art. 9 = DUDT art. 17]. Es decir: si la Agencia califica
> como agencia de publicidad, su ReteICA se liquidaría **sobre el margen**, no
> sobre el contrato completo — lo contrario de lo que hace hoy `cadena.js`, que
> pasa `subtotal: contrato` al leg 1. Ver §5.

## 2. ReteICA: mecánica

No es un impuesto distinto: es **anticipo del ICA** del beneficiario del pago,
que él imputa en su declaración de ICA [Ac.65/02 art. 10, mod. Ac.927/24 art.
294; en Bogotá, hasta 6 períodos siguientes].

Elementos, con Bogotá como caso de referencia:

| Elemento | Regla (Bogotá) | Norma |
|---|---|---|
| Agente retenedor | Entidades de derecho público; grandes contribuyentes DIAN; los designados por resolución del Director Distrital de Impuestos; intermediarios (mandato, transporte) | Ac.65/02 art. 7; D271/02 art. 3 |
| Momento | Pago o abono en cuenta, **lo que ocurra primero** | Ac.65/02 arts. 8 y 12 |
| Base | Valor total de la operación **excluido el IVA facturado** | D271/02 art. 9 |
| Tarifa | «La que corresponda a la respectiva actividad» del **sujeto de retención** | Ac.65/02 art. 11 |
| Si no informa actividad | **Tarifa máxima vigente**, y a esa tarifa queda gravada la operación | Ac.65/02 art. 11 |
| Base mínima | Compras < $430.000 y servicios < $62.000 (valores base **año 2002**) | D271/02 art. 8 = DUDT art. 16 |
| No se practica | A no contribuyentes; pagos no sujetos o exentos; si el beneficiario es entidad de derecho público; si el beneficiario es gran contribuyente DIAN **y** declarante de ICA en Bogotá (salvo que el retenedor sea entidad pública) | Ac.65/02 art. 9 |

Todo esto está hoy compilado en el **Decreto Distrital 639 de 2025** (Decreto
Único Distrital Tributario), que reproduce los artículos de D271/02 sin cambio
de fondo (arts. 12–20).

**Ojo con las bases mínimas.** La norma sigue expresada en pesos de 2002
($430.000 compras / $62.000 servicios); el DUDT no las convirtió a UVT. La
equivalencia de uso corriente (27 UVT compras / 4 UVT servicios, o sea
$1.414.098 y $209.496 con UVT 2026 = $52.374, Res. DIAN 000238 de 2025) es la
indexación práctica, no una cifra que la norma distrital enuncie en UVT.
`datos/municipios.js` usa esas cifras: **correctas en la práctica, pero conviene
anotar que la fuente normativa está en pesos de 2002**.

## 3. Cómo se escoge la tarifa al facturar

Cuatro entradas, en este orden:

1. **Municipio** — ¿en cuál se causa? Regla de territorialidad [L1819/16 art. 343]:
   - **Industrial**: municipio de la sede fabril; comercializar lo que uno mismo
     produce es culminación de la actividad industrial y no causa ICA comercial
     aparte [L49/90 art. 77].
   - **Comercial**: donde esté el establecimiento o punto de venta; si no hay,
     donde se perfecciona la venta (donde se convienen precio y cosa); venta a
     distancia/en línea, en el municipio de **despacho**.
   - **Servicios**: **donde se ejecuta la prestación**. Excepciones: transporte
     (municipio de despacho), TV/internet por suscripción y telefonía fija
     (domicilio del suscriptor), telefonía móvil y datos (domicilio principal del
     usuario).

   Para un servicio de contenido/campaña, manda **dónde se ejecuta el servicio**,
   no el domicilio del cliente que paga. Responde parcialmente la pregunta 7 de
   `docs/preguntas-contadora.md` — y la respuesta no es «el municipio del
   retenedor».

2. **Actividad económica del retenido (CIIU)** — la tarifa es la de *su*
   actividad, no la del pagador [Ac.65/02 art. 11]. Los municipios deben
   armonizar su tabla de actividades y tarifas con la **CIIU vigente de la DIAN**
   [L1819/16 art. 344]. Si el contribuyente ejerce varias actividades, se
   segmenta la base y se aplica cada tarifa; el municipio **no puede** exigir
   tarifa de actividad predominante [D352/02 art. 54].

3. **Calidad del sujeto** — no contribuyente, exento, entidad pública, gran
   contribuyente declarante en el municipio, o SIMPLE ⇒ no hay retención (§4).

4. **Cuantía** — contra la base mínima del municipio.

**Tabla de Bogotá** (D352/02 art. 53, tarifas «2003 y siguientes», por mil):

| Grupo | Tarifa |
|---|---:|
| Industrial: alimentos (no bebidas), calzado, prendas de vestir | 4,14 |
| Industrial: hierro/acero primarios, material de transporte | 6,9 |
| Industrial: edición de libros | 8 |
| Industrial: demás | 11,04 |
| Comercial: alimentos y agrícolas en bruto, textos escolares, drogas | 4,14 |
| Comercial: madera y materiales de construcción, automotores | 6,9 |
| Comercial: cigarrillos, licores, combustibles, joyas | 13,8 |
| Comercial: demás | 11,04 |
| Servicios: transporte, publicación de revistas/libros/periódicos, radiodifusión y TV | 4,14 |
| Servicios: consultoría profesional, contratistas de construcción, cine | 6,9 |
| Servicios: restaurantes/bares/hoteles, casas de empeño, vigilancia | 13,8 |
| Servicios: educación privada inicial a media | 7 |
| **Servicios: demás** | **9,66** |
| Financieras | 11,04 (hoy 14, Ac. 816/2021) |

El **9,66 de las facturas del lote** (`docs/retencion-en-la-fuente.md` §1)
corresponde a «demás actividades de servicios» — coherente con clasificar el
contenido/influencers como servicios generales. Confirma la pregunta 6.

El Acuerdo 780 de 2020 (art. 6, que modificó el art. 3 del Ac. 65/02) subió de
forma gradual 2022→2024 algunas actividades: consultoría profesional y
contratistas de construcción 6,9 → **8,66**; consultoría en profesión liberal
9,66 → **7,66**; construcción de vías/obras civiles 6,9 → 7,12 → 7,36 → **7,6**;
telecomunicaciones 9,66 → 9,98 → 10,3 → **10,62**; farmacéuticos 11,04 → 11,4 →
11,76 → **12,14**; financieras 11,04 → 12 → 12,54 → **13,1**.

## 4. SIMPLE y autorretención

- **SIMPLE (RUT 47)**: el ICA queda **consolidado dentro del SIMPLE**, y sus
  contribuyentes «no estarán sujetos a retenciones en la fuente a título del
  impuesto sobre la renta sustituido, ni sobre el impuesto de industria y
  comercio consolidado» [ET art. 911; DIAN Oficio 901166 de 2022]. **Confirma**
  lo que hace `tramo.js:24,28`.
- **SIMPLE y ReteIVA — pregunta abierta del repo, resuelta**: el mismo art. 911
  y el oficio DIAN aclaran que la exclusión es «sin perjuicio de la retención en
  la fuente a título de IVA, regulada en el numeral 9 del art. 437-2 ET». O sea:
  **un retenido en SIMPLE responsable de IVA sí puede ser sujeto de ReteIVA.**
  El motor hoy lo excluye por el bloqueo global (`tramo.js:34`) — eso es
  incorrecto. Cierra `.scratch/rut-fiscal-profile/issues/03-simple-47.md` y la
  pregunta 5 de `preguntas-contadora.md` para el lado IVA.
- **La regla real del lado del retenido en ReteIVA no es «gran contribuyente»**,
  que es el proxy de `tramo.js:64`, sino el **parágrafo del art. 437-2 ET**: no
  hay retención de IVA en las ventas entre agentes de retención de IVA de los
  numerales 1, 2 y 5. Los grandes contribuyentes son agentes por el numeral 1, de
  modo que el proxy acierta en el caso corriente y falla en los demás. Y nada en
  el art. 437-2 menciona al autorretenedor de renta (15): esa casilla tampoco
  toca ReteIVA.
- **Autorretenedor de renta (RUT 15)**: es una figura **nacional, de renta**. No
  exime de ReteICA — el ICA es municipal y no lee el RUT nacional. `tramo.js:23`
  suprime hoy *las tres* retenciones cuando el retenido es autorretenedor; para
  ReteICA eso **no tiene respaldo normativo**. La autorretención de ICA, cuando
  existe, la crea el municipio por acuerdo/resolución propia, no la casilla 15.
- **Bogotá designó agentes retenedores por resolución** a los grandes
  contribuyentes distritales y a los contribuyentes del régimen común de ICA
  (Res. DDI-052377 de 2016, luego DDI-000305 de 2020, y la resolución anual de
  grandes contribuyentes distritales). Consecuencia: **quién es agente de
  ReteICA no se deduce del código 07 del RUT nacional**, que es el que usa
  `tramo.js:22`. Un cliente sin código 07 puede ser perfectamente agente
  retenedor de ICA en Bogotá.
- Régimen simplificado de ICA: **no practica** retención [D271/02 art. 3 par. 1].

## 5. ¿De dónde salen 8,99 y 9,99?

**No verificado.** No pude localizar una tabla oficial que asigne 8,99 o 9,99 por
mil a ninguna actividad. Lo que sí quedó verificado:

- **No son de Bogotá.** La tabla completa de Bogotá (D352/02 art. 53) es 4,14 /
  6,9 / 7 / 8 / 9,66 / 11,04 / 13,8 (+ 14 financieras). Las tarifas graduales del
  Ac. 780/2020 son 7,12 / 7,36 / 7,6 / 7,66 / 8,66 / 9,98 / 10,3 / 10,62 / 11,4 /
  11,76 / 12,14 / 12 / 12,54 / 13,1. Ninguna es 8,99 ni 9,99. Búsqueda de texto
  sobre el Acuerdo 65 de 2002, el Acuerdo 780 de 2020, el Decreto 352 de 2002 y
  el Decreto 639 de 2025 (compilación oficial SHD): **cero coincidencias**.
- **Tampoco son de Medellín ni de Cali**, ahora verificado contra el texto
  íntegro y no sólo contra las páginas de tarifas: el único decimal en las 142
  páginas del Acuerdo 093 de 2023 de Medellín es el 1,8 de la retención, y la
  tabla de Cali va en múltiplos de 1,1 (…7,7 / 8,8) y de 8,8 salta a 10, sin
  pasar por 9,9. Ver §6 y §7. Ninguna búsqueda restringida a `gov.co` los
  produjo en ningún otro municipio.
- **Son legalmente posibles** sólo como actividad **comercial o de servicios**:
  caen dentro del rango 2–10 x 1000 y quedan fuera del rango industrial 2–7
  [L1819/16 art. 342]. Un 8,99 o 9,99 **industrial sería ilegal**.

Explicaciones candidatas, en orden de plausibilidad:

1. **Un municipio con tarifa de retención propia, distinta de la del impuesto.**
   Buscamos 8,99 y 9,99 en tablas de *impuesto*, y esa puede ser la razón del
   resultado vacío: **la tarifa de ReteICA no siempre es la del ICA**. Ya no es
   hipótesis — **Medellín lo hace**: retiene un **1,8 por mil plano** para toda
   actividad [Ac.093/23 art. 83], cifra que no aparece en ninguna tabla de
   tarifas del impuesto. Bogotá y Cali, en cambio, retienen a la tarifa de la
   actividad. Existiendo el mecanismo, un 8,99 o un 9,99 de retención en algún
   municipio es perfectamente posible sin figurar en ninguna tabla de impuesto.
   Ver §6 y §7.
2. **Tabla de impuesto de un municipio pequeño o intermedio.** Hay >1.100
   municipios, cada uno con su acuerdo; muchos no publican la tabla en formato
   indexable. Un 9,99 es exactamente «el tope legal menos un milésimo», un truco
   conocido para quedarse justo bajo el límite de 10 x 1000.
3. **Campo libre del software de facturación.** Si el valor se digitó en un
   sistema (Siigo/Alegra/World Office) es un número escrito a mano; puede ser un
   error de transcripción de 9,66 (dígitos vecinos) o una tarifa promediada.
4. **Confusión por-mil vs. porcentaje.** 8,99 % sería 89,9 x 1000: imposible como
   ICA. Si el campo dice «%», el dato está mal etiquetado.

**Qué pedir para cerrarlo**: municipio + código CIIU del retenido + el acuerdo
municipal citado en el certificado de retención. Con eso la tarifa es
verificable en una sola consulta. No hay que inventar la tabla.

## 6. Medellín

**Norma rectora vigente en 2026: Acuerdo 093 de 2023** del Concejo de Medellín
(«normativa sustantiva aplicable a los tributos vigentes en el Distrito Especial
de Ciencia, Tecnología e Innovación de Medellín»). Rige desde su publicación y
**deroga expresamente el Acuerdo 066 de 2017** y los Acuerdos 092/18, 125/19,
018/20, 023/20, 036/21, 040/21, 069/22 y 070/22 [Ac.093/23 art. 427]. El Acuerdo
064 de 2012, a su vez, ya había sido derogado por el art. 329 del Ac. 066/2017.
Es decir: la cadena 64/2012 → 66/2017 → **93/2023** está cerrada, y las tablas
que circulan citando el Ac. 64/2012 están muertas.

| Elemento | Regla (Medellín) | Norma |
|---|---|---|
| Tarifas ICA | Tabla por **código CIIU** (Rev. 4 A.C.), agrupada en industriales / comerciales / servicios / financieros | Ac.093/23 art. 71 |
| Agente retenedor | Entidades públicas de todo orden con jurisdicción o presencia en Medellín; **y los contribuyentes nombrados por acto administrativo de la Subsecretaría de Ingresos**. El mandatario asume la calidad del mandante. Los Fondos Educativos **no** son agentes | Ac.093/23 art. 81; Res. 202550100042 de 2025 |
| Momento | Pago o abono en cuenta, lo que ocurra primero | Ac.093/23 arts. 72 y 75 |
| Base | Monto total del pago, **sin IVA ni otros tributos** distintos del ICA | Ac.093/23 art. 83 |
| **Tarifa de retención** | **1,8 x 1000 fija**, cualquiera sea la actividad del retenido | Ac.093/23 art. 83 |
| Excepción a la tarifa fija | Pagos a personas o entidades **sin domicilio ni presencia permanente en el país**: tarifa plena de la actividad | Ac.093/23 art. 83 |
| Base mínima | Pagos **≥ 15 UVT**, uno solo para todo concepto (no hay compras/servicios separados). Si varias operaciones del mismo bimestre con el mismo contribuyente superan el tope en conjunto, se retiene desde que se supera | Ac.093/23 art. 83 |
| No se practica | Tratamiento especial o exención reconocida; pagos a prestadoras de servicios públicos por esa facturación; actividades de prohibido gravamen o excluidas; **autorretenedores de ICA en Medellín**; **régimen simplificado de ICA**; **personas naturales que ejercen profesiones liberales de forma individual**; **inscritos y activos en el SIMPLE** | Ac.093/23 art. 82 |
| Tarjetas débito/crédito | Sistema especial, tarifa **2 x 1000**, y **no aplica la base mínima** de 15 UVT | Ac.093/23 art. 89 |
| Autorretención | Sobre la totalidad de ingresos gravados, «hasta el 100% de la tarifa que corresponda a la actividad»; el porcentaje lo fija la administración cada período. **Para 2026 la Subsecretaría lo fijó en el 100% del milaje de la actividad** | Ac.093/23 arts. 77–78; Res. 202550098566 de 2025 |

**Esta es la diferencia estructural con Bogotá.** En Bogotá la retención se hace
a la tarifa de la actividad del retenido [Ac.65/02 art. 11]; en Medellín la
retención es un **anticipo a tarifa plana de 1,8 x 1000** que no depende de la
actividad, mientras la **autorretención** sí va a la tarifa plena. Un motor que
asuma «ReteICA = tarifa ICA del municipio» calcula mal Medellín por un factor de
entre 1,1 y 6.

**Tarifas del impuesto** [Ac.093/23 art. 71], por grupo (todas **enteras**, no
hay decimales en toda la tabla):

| Grupo | Rango de tarifas x 1000 |
|---|---|
| Industriales | 2 a 7 (la mayoría en 7; alimentos y textiles 3–4) |
| Comerciales | 2 a 10 (grueso en 8; 10 el tope) |
| Servicios | 2 a 10 (**la clase «demás» y la mayoría de servicios profesionales están en 10**) |
| Financieros | 8 (2022) → 9 (2023) → 10 (2024) → **11 (2025 y siguientes)** |
| Actividades con tratamiento especial reconocido | 2 (declaran con su código, liquidan al 2 x 1000) |

Para este proyecto: **publicidad (CIIU 7310) = 10 x 1000**, igual que consultoría
de gestión (7020), administración empresarial (7010) y desarrollo de sistemas
(6201). Medellín inscribe **de oficio** como contribuyentes de ICA a quienes
ejercen profesión liberal en la ciudad [art. 71 par. 2], pero luego **los excluye
de la retención** cuando son personas naturales que la ejercen individualmente
[art. 82 num. 6].

**No hay 8,99 ni 9,99 en Medellín.** Búsqueda de texto sobre el Acuerdo 093 de
2023 completo (142 páginas, Gaceta 5281): el único valor decimal en todo el
acuerdo es el **1,8 x 1000** de la retención. Todas las tarifas del art. 71 son
enteras.

## 7. Cali

**Norma rectora vigente en 2026: Acuerdo 0321 de 2011**, compilado primero en el
**Decreto Extraordinario 411.0.20.0259 de 2015** y hoy en el **Decreto
Extraordinario 4112.010.20.0416 de 2021**, modificado por los Acuerdos **0529 de
2022** (tarifas) y **0586 de 2024** (sector financiero). En abril de 2026 la
Alcaldía radicó el **Proyecto de Acuerdo 082 de 2026** para un estatuto
tributario unificado: **es proyecto, no norma**; el ET vigente sigue siendo el
D.E. 0416/2021.

La numeración cambia entre las tres versiones. El desfase es constante: **art. N
del D.0259/2015 = art. N−2 del D.0416/2021**, verificado dos veces contra las
notas al pie de la Res. 0618 de 2022 y contra la página de tarifas de la
Alcaldía. Abajo se citan los tres.

| Elemento | Regla (Cali) | Norma |
|---|---|---|
| Tarifas ICA | Tabla por agrupación + código CIIU | Ac.0321/11 art. 94 = D.0259/15 art. 99 = **D.0416/21 art. 97** |
| Homologación CIIU | Códigos y tarifas consolidados a la CIIU vigente por resolución de Hacienda | Res. 4131.010.21.0119 de 2020 |
| Agente retenedor | **Todos los sujetos pasivos y no pasivos del ICA en Cali**, más las entidades de derecho público. Y las **personas naturales comerciantes** con patrimonio bruto o ingresos brutos del año anterior **> 30.000 UVT** | Ac.0321/11 art. 96 par. 2 = D.0259/15 art. 101 = **D.0416/21 art. 99** |
| Otros agentes | Empresas de transporte terrestre frente a afiliados; mandatarios (incl. administración delegada), que retienen **según la calidad del mandante** | Ac.0321/11 art. 97 = D.0259/15 art. 102 = D.0416/21 art. 100 |
| Momento y base | Pago o abono en cuenta, lo que ocurra primero; base = valor total **excluidos los tributos liquidados** | Ac.0321/11 art. 99 = D.0259/15 art. 104 = D.0416/21 art. 102 |
| **Tarifa de retención** | **«Las que correspondan a las actividades desarrolladas por el sujeto pasivo de la retención»** — la misma tabla del impuesto | Ac.0321/11 art. 100 = D.0259/15 art. 105 = **D.0416/21 art. 103** |
| Si no informa actividad | **Tarifa máxima vigente** del ICA. Si la actividad es públicamente conocida, el agente puede aplicar la de la actividad bajo su responsabilidad | mismo artículo, parágrafo |
| Base mínima | **< 3 UVT en servicios** y **< 15 UVT en actividades industriales y comerciales** | Ac.0321/11 art. 102 lit. g = D.0259/15 art. 107 = **D.0416/21 art. 105** |
| No se practica | A no contribuyentes; por actividades no gravadas; a exentos; si la actividad no se realiza en jurisdicción de Cali; si el comprador no es agente; si el beneficiario es **autorretenedor de ICA en Cali** | mismo artículo, lits. a–f |
| Grandes contribuyentes | Cuadro oficial agente × sujeto: **no se retiene al gran contribuyente DIAN ni al gran contribuyente distrital**, salvo que el agente sea entidad estatal | Res. 4131.040.21.1.0618 de 2022; Res. 4131.040.21.1.0304 de 2022 |
| SIMPLE | **No puede ser agente de autorretención** de ICA; pierde la calidad automáticamente al vincularse | Ac.0493/20; guía oficial DAH |
| Autorretención | Autorizada por la Subdirección de Impuestos y Rentas a grandes contribuyentes DIAN y, con los mismos requisitos, a otros (persona jurídica, > 83.643 UVT de ventas brutas, > 40 clientes retenedores, RUT, al día) | Ac.0321/11 art. 103 = D.0259/15 art. 108 = D.0416/21 art. 106 |

**Cali sí sigue el modelo Bogotá**: la tarifa de retención es la de la actividad
del retenido, no una tarifa separada. La pregunta 3 se responde distinto para
cada ciudad.

**El dato secundario que había que verificar era correcto para Cali** —
3 UVT servicios / 15 UVT compras — **y estaba mal atribuido a Medellín como si
fuera la misma estructura**: Medellín tiene un **único umbral de 15 UVT para
todo pago**, no dos. Y en Cali la norma sí habla en UVT (a diferencia de Bogotá,
que sigue en pesos de 2002): con UVT 2026 = $52.374, son **$157.122** y
**$785.610**.

**Tarifas del impuesto** [D.0416/21 art. 97], valores distintos que aparecen en
la tabla:

| Grupo | Tarifas x 1000 |
|---|---|
| Industrial | 3,3 (alimentos) y 6,6 (el resto) |
| Comercial | 3,3 / 5,2 (vehículos nuevos, motos) / 5,5 (comercio al detal para el hogar) / 7,7 |
| Servicios | 2,2 / 3,3 / 6,6 / 8,8 / **10 («otras actividades de servicios NCP», 307-99, y el grueso de servicios)** |
| Financiera | 5 originalmente → **23** [Ac.0529/22 art. 1] → **14** [Ac.0586/24, en cumplimiento de fallo del Consejo de Estado] |

La tabla de Cali está construida sobre múltiplos de 1,1 (2,2 / 3,3 / 5,5 / 6,6 /
7,7 / 8,8), lo que la deja a un escalón de 9,9. **Pero 9,9 no existe en la
tabla**: por encima de 8,8 Cali salta directamente a 10. Y **no hay 8,99 ni
9,99** en ninguno de los cuatro grupos.

Cabo suelto honesto: **el texto completo del Acuerdo 0529 de 2022 no está
verificado**. La Alcaldía sólo lo publica como PDF escaneado (imagen, sin capa de
texto). Está verificado que modificó el art. 97 del D.0416/2021 y que subió lo
financiero de 5 a 23 x 1000; **no verificado** qué otras actividades tocó ni si
introdujo algún valor nuevo. Lo mismo para la Res. 0119 de 2020, también
escaneada — aunque una resolución no puede crear tarifas, sólo homologar códigos.

## 8. Qué le falta a esta calculadora

Concreto, contra los archivos actuales:

1. **`datos/municipios.js` es demasiado plano.** Hoy: un `tarifaPorMil` por
   municipio. La tarifa depende de la **actividad del retenido**, no del
   municipio. El modelo correcto es municipio → lista de (grupo de actividad /
   CIIU, tarifa), más una `tarifaMaxima` para el caso «no informó actividad»
   (Ac.65/02 art. 11 — en Bogotá, 13,8, o 14 si aplica la financiera). Cargar al
   menos la tabla de Bogotá del §3, que es primaria y completa.
2. **La actividad ICA no es el `concepto` de retefuente.** `datos/conceptos.js`
   usa `icaClase: "servicio" | "compra"` sólo para elegir la base mínima. Eso
   está bien para la base, pero la **tarifa** necesita su propio eje: la
   actividad económica del retenido (CIIU), que es un dato del RUT del retenido
   (`docs/retencion-en-la-fuente.md` §4 ya lo anota: «el RUT permite validar la
   actividad económica»). Hoy la tarifa se digita a mano en `index.html:170`.
3. **El agente de ReteICA no es el código 07.** `tramo.js:22` gatea las tres
   retenciones con `retenedor.agenteRetefuente`. ReteICA necesita su propia
   condición, municipal: en Bogotá, «gran contribuyente DIAN, entidad pública, o
   designado por resolución / régimen común de ICA». Es un hecho que el RUT
   nacional no contiene.
4. **Autorretenedor (15) no debería suprimir ReteICA** (§4). Es un `bloqueo` de
   renta, no de ICA. Separar el bloqueo por retención en vez de uno solo por leg
   toca `tramo.js:31-38` y por tanto ADR-0004 (las notas por leg asumen que el
   bloqueo es único).
5. **SIMPLE sí puede llevar ReteIVA** (§4). Mismo sitio, mismo cambio.
6. **Falta la exclusión por gran contribuyente declarante en el municipio**
   [Ac.65/02 art. 9 lit. d]: el retenido gran contribuyente que declara ICA en
   Bogotá no es sujeto de ReteICA, salvo retenedor público. Hoy `granContribuyente`
   sólo se usa para ReteIVA (`tramo.js:64`).
7. **Base gravable especial de agencias de publicidad** (§1). Si la Agencia
   califica, su ReteICA va sobre el margen, no sobre el contrato — `cadena.js:34`
   pasa el contrato completo. Es la interacción más delicada con ADR-0002
   (modelo reventa/principal) y merece pregunta explícita a la contadora antes de
   codificarse.
8. **Territorialidad** (§3): el municipio no es un dato del cliente sino del
   lugar de ejecución del servicio. Hoy `municipio` es un input compartido por
   los dos legs (`cadena.js:32`), lo cual es defendible sólo si ambos servicios
   se ejecutan en el mismo sitio; conviene decirlo en el `CONTEXT.md`.
9. **Bases mínimas**: anotar en `datos/municipios.js` que la norma las fija en
   pesos de 2002 y que 27/4 UVT es la indexación de uso, no el texto normativo.

## Fuentes

- [Ley 14 de 1983, arts. 32–35](https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=267) — hecho generador, base gravable, límites tarifarios 2–7 y 2–10 x 1000, base especial de agencias de publicidad. Incorporada en el Decreto-ley 1333 de 1986 (arts. 195 y ss.).
- [Ley 1819 de 2016, arts. 342–344](https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=68189) — base gravable y tarifa vigentes (reescriben el art. 196 del D-L 1333/86), **territorialidad** del ICA, formulario único nacional y armonización con la CIIU de la DIAN.
- [Acuerdo 65 de 2002 (Concejo de Bogotá) — compilación oficial SHD](https://compilacionjuridica.shd.gov.co/compilacion/docs/a_conbog_0065_2002.htm) — arts. 3 (tarifas, mod. Ac. 780/2020) y 7–14 (sistema de retenciones: agentes, circunstancias, tarifa aplicable, imputación).
- [Decreto Distrital 352 de 2002, art. 53 — compilación oficial SHD](https://compilacionjuridica.shd.gov.co/compilacion/docs/d_alcabog_0352_2002.htm) — tabla completa de tarifas por actividad en Bogotá (4,14 / 6,9 / 7 / 8 / 9,66 / 11,04 / 13,8) y art. 54 (varias actividades).
- [Decreto Distrital 271 de 2002](https://www.alcaldiabogota.gov.co/sisjur/normas/Norma1.jsp?i=5139) — reglamento de ReteICA en Bogotá: agentes permanentes, mandato, base mínima (art. 8), base excluido el IVA y base gravable especial (art. 9).
- [Decreto Distrital 639 de 2025 (DUDT) — compilación oficial SHD](https://compilacionjuridica.shd.gov.co/compilacion/docs/d_alcabog_0639_2025.htm) — compila lo anterior; arts. 12–20 reproducen el D271/02.
- [Secretaría Distrital de Hacienda — ICA](https://www.haciendabogota.gov.co/es/impuestos/impuesto-de-industria-y-comercio-ica) y [conceptos y tarifas](https://www.haciendabogota.gov.co/es/sdh/conceptos-y-tarifas-asociadas-la-liquidacion-del-impuesto-de-industria-y-comercio-ica) — listado vigente de actividades/tarifas y referencia a los Acuerdos 780 de 2020 y 816 de 2021 (financieras al 14 x 1000).
- [DIAN, Oficio 901166 de 2022](https://normograma.dian.gov.co/dian/compilacion/docs/oficio_dian_901166_2022.htm) — art. 911 ET: los contribuyentes del SIMPLE no son sujetos de retención de renta ni de ICA consolidado, **pero sí de ReteIVA** (num. 9 art. 437-2 ET).
- [DIAN, Resolución 000238 de 2025 (comunicado)](https://www.dian.gov.co/Prensa/Paginas/NG-Comunicado-de-Prensa-128-2025.aspx) — UVT 2026 = $52.374.

**Medellín**

- [Acuerdo 093 de 2023 — Gaceta Oficial Nº 5281](https://www.medellin.gov.co/es/wp-content/uploads/2024/01/ACUERDO-093-2023-GACETA.pdf) — Estatuto Tributario Distrital vigente: art. 71 (códigos CIIU y tarifas), arts. 72–79 (retención y autorretención), art. 81 (agentes), art. 82 (no sujetos a retención), **art. 83 (base 15 UVT y tarifa 1,8 x 1000)**, art. 89 (tarjetas, 2 x 1000), art. 427 (vigencia y derogatorias).
- [Acuerdo 66 de 2017 (PDF oficial)](https://www.medellin.gov.co/es/wp-content/uploads/2022/09/Acuerdo-066-de-2017-Medellin.pdf) y [Acuerdo 64 de 2012 — normograma Astrea](https://www.medellin.gov.co/normograma/docs/astrea/docs/a_conmed_0064_2012.htm) — derogados; se citan sólo para cerrar la cadena normativa.
- [Alcaldía de Medellín — tarifas de liquidación del ICA](https://www.medellin.gov.co/es/centro-documental/tarifas-de-liquidacion-del-impuesto-de-industria-y-comercio-ica/) y [normatividad tributaria](https://www.medellin.gov.co/es/secretaria-de-hacienda/normatividad-tributaria/) — listado oficial de acuerdos vigentes.
- [Resolución 202550100042 de 2025](https://www.medellin.gov.co/es/wp-content/uploads/2025/12/RESOLUCION-202550100042-DE-2025-NOMBRAN-Y-COMPILAN-AGENTES-DE-RETENCION.pdf) — nombra y compila los **agentes de retención** de ICA en Medellín.
- [Resolución 202550098566 de 2025](https://www.medellin.gov.co/es/wp-content/uploads/2025/12/RESOLUCION-202550098566-DE-2025-NOMBRAN-CANCELAN-Y-COMPILAN-AGENTES-AUTORRETENEDORES.pdf) — agentes de **autorretención**; fija el porcentaje de autorretención 2026 en el **100% del milaje de la actividad**.
- [Guía de preguntas frecuentes — declaración bimestral de retenciones de ICA (Medellín)](https://www.medellin.gov.co/es/wp-content/uploads/2026/03/5.-DE-GEHA-ING-Guia-de-Preguntas-y-Respuestas-Frecuentes_Declaracion-Bimestral-de-Retenciones-de-Industria-y-Comercio.pdf).

**Cali**

- [Decreto Extraordinario 411.0.20.0259 de 2015](https://www.cali.gov.co/aplicaciones/boletin_publicaciones/imagenes_documentos_decretos/rEWHDNssue1482181565.pdf) — compila los Acuerdos 0321/11, 0338/12, 0339/13, 0346/13, 0357/13 y 0380/14: art. 99 (tarifas por CIIU), art. 101 (agentes), art. 104 (base y causación), **art. 105 (tarifa de retención = la de la actividad del retenido)**, **art. 107 lit. g (3 UVT servicios / 15 UVT industriales y comerciales)**, art. 108 (autorretención). Única versión del ET de Cali publicada con capa de texto.
- [Decreto Extraordinario 4112.010.20.0416 de 2021](https://www.cali.gov.co/loader.php?lServicio=Tools2&lTipo=descargas&lFuncion=descargar&idFile=60428) — compilación vigente (renumera: art. N del D.0259/15 = art. N−2). PDF escaneado.
- [Cali — normatividad tributaria vigente](https://www.cali.gov.co/hacienda/publicaciones/167542/normatividad-tributaria-vigente/), [tarifas de liquidación del ICA](https://www.cali.gov.co/hacienda/publicaciones/171909/tarifas-de-liquidacion-del-impuesto-de-industria-y-comercio-ica/) y [«Conoce aquí todo sobre las tarifas»](https://www.cali.gov.co/hacienda/publicaciones/184605/conoce-aqui-todo-sobre-las-tarifas-de-liquidacion-del-impuesto-de-industria-y-comercio/) — confirman que las tarifas están en el art. 97 del D.0416/2021 y que las modificaron los Acuerdos 0529 de 2022 y 0586 de 2024.
- [Resolución 4131.040.21.1.0618 de 2022](https://www.cali.gov.co/loader.php?lServicio=Tools2&lTipo=descargas&lFuncion=descargar&idFile=71693) — «cuadro ilustrativo» agente × sujeto del sistema de retención de ICA; cita la Res. 0304 de 2022 (grandes contribuyentes distritales = grandes contribuyentes DIAN + autorretenedores de ICA en Cali) y el Acuerdo 0541 de 2022.
- [Acuerdo 0586 de 2024](https://www.cali.gov.co/loader.php?lServicio=Tools2&lTipo=descargas&lFuncion=descargar&idFile=94491) y [nota del Concejo de Cali](https://www.concejodecali.gov.co/publicaciones/60857/en-cumplimiento-de-sentencia-concejo-aprobo-proyecto-que-reduce-tarifa-ica-para-sector-financiero/) — tarifa financiera de 23 a **14 x 1000**, en cumplimiento de fallo del Consejo de Estado.
- [Guía oficial «Lo que debes saber sobre el Impuesto de Industria y Comercio» (DAH Cali)](https://www.cali.gov.co/hacienda/loader.php?lServicio=Tools2&lTipo=descargas&lFuncion=descargar&idFile=51151) — Res. 4131.010.21.0119 de 2020 como tabla consolidada de códigos y tarifas; territorialidad; el SIMPLE no puede ser autorretenedor de ICA.
- [Alcaldía de Cali — «Un solo estatuto tributario…» (abr. 2026)](https://www.cali.gov.co/boletines/publicaciones/192119/un-solo-estatuto-tributario-cero-estampillas-en-61-tramites-y-vivienda-para-los-mas-necesitados-asi-recuperamos-cali/) — Proyecto de Acuerdo 082 de 2026: **proyecto**, no norma vigente.

**Sin fuente encontrada**: cualquier tabla oficial que asigne **8,99** o **9,99
por mil**. Verificado como ausente en Acuerdo 65/2002, Acuerdo 780/2020, Decreto
352/2002 y Decreto 639/2025 (Bogotá); en el **Acuerdo 093 de 2023 de Medellín**
(texto completo: el único decimal del acuerdo es el 1,8 de la retención); y en la
tabla de **Cali** (2,2 / 3,3 / 5,2 / 5,5 / 6,6 / 7,7 / 8,8 / 10, más 14
financieras). Tampoco localizado en búsquedas restringidas a `gov.co` sobre
ningún otro municipio.

**No verificado**: el texto íntegro del **Acuerdo 0529 de 2022** de Cali y de la
**Resolución 4131.010.21.0119 de 2020** — la Alcaldía sólo los publica
escaneados, sin capa de texto. Verificado de ellos sólo lo que reproducen otras
fuentes primarias: que el 0529 modificó el art. 97 del D.0416/2021 y subió lo
financiero de 5 a 23 x 1000.
