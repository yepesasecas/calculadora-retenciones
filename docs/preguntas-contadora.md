# Preguntas para la contadora (Geraldyne Lopez)

Abiertas tras construir la calculadora de retenciones (jul 2026). Fuente: `docs/retencion-en-la-fuente.md`, `CONTEXT.md`.

## RUT y clasificación de clientes

1. **Mapeo casillas RUT → perfil fiscal** (tu pregunta pendiente): ¿qué combinación de casillas de responsabilidades identifica cada caso? Vemos `07`, `09`, `13 - Gran contribuyente`, `15 - Autorretenedor`, `48 - IVA`, `52 - Facturador electrónico`. Concretamente:
   - ¿`48` presente = responsable de IVA, ausente = no responsable?
   - ¿`13` + `15` juntas = gran contribuyente autorretenedor?
   - ¿Alguna casilla indica si es declarante de renta?
2. **Concepto por actividad económica**: ¿criterio escrito para deducir el concepto de retención desde el código de actividad del RUT? Confirmar: contenido de influencers = **servicios generales 4 %**, nunca honorarios 11 %. ¿Dónde está la línea (p. ej., si factura una persona natural por gestión/representación)?

## ReteIVA

3. Ninguna de las 6 facturas de jul muestra ReteIVA. ¿Es porque los cinco clientes **no son grandes contribuyentes**, o hay otra razón?
4. Confirmar la regla implementada **(actualizada)**: el retenedor es **agente de reteIVA (código 09/23)** + el retenido es responsable de IVA y no gran contribuyente → **ReteIVA = 15 % del IVA**. Antes lo teníamos amarrado a que el cliente fuera gran contribuyente; lo corregimos a la responsabilidad del RUT (ver ADR-0001). ¿Correcto? ¿Aparece en la factura o solo en el pago?

## Autorretenedor

5. ~~Si el vendedor es autorretenedor, ¿eso cubre también ReteICA o solo renta?~~ **Resuelto contra la norma** (`docs/retencion-ica.md` §4): el código 15 es figura nacional de renta y sólo suprime retefuente. La autorretención de ICA existe, pero la confiere el municipio por resolución propia. Queda por confirmar de hecho: **¿alguno de nuestros clientes o proveedores tiene resolución municipal de autorretención de ICA?**

## ReteICA

6. ~~Confirmar tarifa 9,66/1000.~~ **Confirmado**: es «demás actividades de servicios» en la tabla de Bogotá (D. 352/2002 art. 53). **No** aplica igual a todos: la tarifa es la de la actividad del *retenido*, no la nuestra ni la del pagador. Nueva pregunta: **¿cuál es nuestro código CIIU registrado para ICA en Bogotá**, y confirmamos que caemos en «demás servicios» y no en consultoría (8,66) o profesión liberal (7,66) tras el Acuerdo 780 de 2020?
7. ~~¿Qué municipio manda?~~ **Resuelto**: donde se **ejecuta el servicio** (Ley 1819/2016 art. 343), no el domicilio del cliente. Nueva pregunta de hecho: **¿en qué municipios ejecutamos servicios y en cuáles ejecutan nuestros proveedores?** De ahí sale qué tablas cargar.
8. Bases mínimas ReteICA Bogotá 2026: usamos servicios ≥ 4 UVT ($209.496) y compras ≥ 27 UVT ($1.414.098). La norma distrital las fija en **pesos de 2002** ($62.000 servicios / $430.000 compras, D. 271/2002 art. 8, recompilado en el D. 639/2025 art. 16) y no las convirtió a UVT. ¿La indexación 4/27 UVT es la que aplica en la práctica?

## ReteICA — preguntas nuevas (jul 2026)

15. **Tarifa 8,99 / 9,99 por mil.** Aparecen al facturar y **no figuran en ninguna tabla oficial que hayamos podido consultar** (Acuerdo 65/2002, Acuerdo 780/2020, Decreto 352/2002, Decreto 639/2025: cero coincidencias; tampoco en Cali ni Medellín). Para cerrarlo necesitamos tres datos del certificado de retención: **municipio + código CIIU del retenido + el acuerdo municipal citado**. Hipótesis principal, ahora **verificada como mecanismo real**: hay municipios que fijan **tarifas de retención distintas de las tarifas plenas del impuesto** — Medellín retiene un **1,8 por mil plano** para toda actividad (Ac. 093/2023 art. 83), cifra que no aparece en ninguna tabla de tarifas del impuesto. Estábamos buscando 8,99 en el sitio equivocado. ¿En qué municipio se practicó esa retención, y el certificado cita algún acuerdo? ¿O el valor se digita a mano en el sistema?
16. **¿Matiz es «agencia de publicidad»** para efectos del art. 342 par. 1 de la Ley 1819/2016? Si lo es, nuestro ICA — y por tanto el ReteICA que nos practican — se liquida sólo sobre **honorarios, comisiones y demás ingresos propios percibidos para sí**, es decir sobre el margen, no sobre el contrato completo que facturamos. Es la pregunta de mayor impacto en plata de toda esta lista. Nota: no cambia cómo facturamos (seguimos facturando el contrato completo con IVA sobre el total); cambia sólo la base del ICA.
17. **¿Somos agentes de retención de ICA en Bogotá?** No se deduce del RUT: Bogotá designa por resolución (DDI-052377/2016, DDI-000305/2020) a entidades públicas, grandes contribuyentes y **todo el régimen común de ICA**. ¿Nos aplica? ¿Y a nuestros clientes?
18. **Gran contribuyente declarante de ICA en el municipio**: el Acuerdo 65/2002 art. 9 lit. d dice que a ese sujeto no se le practica ReteICA, salvo que el retenedor sea entidad pública. ¿Alguno de nuestros proveedores está en ese caso?

## ReteIVA — resuelto contra la norma

19. La calculadora excluía de ReteIVA a los retenidos del **régimen simple (47)**. Es incorrecto: el art. 911 ET excluye retefuente e ICA «sin perjuicio de la retención… a título de IVA» (numeral 9 del art. 437-2; DIAN Oficio 901166 de 2022). Lo corregimos. ¿Lo confirmas en la práctica? Y en su lugar aplicamos la regla del **parágrafo del art. 437-2**: no hay ReteIVA cuando el retenido es a su vez agente de retención de IVA. ¿Correcto?

## Redondeo

9. Tres facturas del lote (FEC591, FEC595, FEC598) tienen diferencias de **1 peso** entre sus propias líneas y el total (p. ej., FEC598: subtotal + IVA ≠ neto declarado). ¿Qué regla de redondeo usa el sistema emisor (por línea, truncado, al final)? La calculadora redondea cada línea al peso más cercano.

## Vigencias y tarifas

10. La tabla 2026 tiene dos ventanas de bases (8 may–30 jun vs 1 jul en adelante). ¿Cuál es el decreto/norma fuente, para actualizar cuando cambie (2027)?
11. Confirmar que la empresa es **declarante de renta** (por eso 4 % y no 6 % en servicios).
12. ¿Todos nuestros servicios llevan IVA 19 %? ¿Algún caso exento/excluido que debamos contemplar?

## Casos no modelados

13. **Entidades estatales** como clientes: ¿retienen distinto a un gran contribuyente? Hoy no las modelamos.
14. ¿Clientes persona natural (no responsables de IVA) practican alguna retención? La calculadora asume que no retienen nada.
