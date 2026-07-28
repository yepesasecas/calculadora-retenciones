# 07 — Medellín y Cali, y las exclusiones que son del municipio

**What to build:** dos ciudades más, y con ellas la prueba de que la regla de
retención del ticket 05 tiene la forma correcta. Si la abstracción está mal, aquí se
rompe.

La investigación contra fuentes primarias **ya está hecha** (§6 y §7 de
`docs/retencion-ica.md`). Lo que hay que codificar:

| | Medellín | Cali |
|---|---|---|
| Norma rectora | **Acuerdo 093 de 2023**, que derogó el Ac. 066/2017 y con él el Ac. 064/2012 — toda tabla que cite esos dos está muerta | Acuerdo 0321 de 2011, compilado en el D.E. 4112.010.20.0416 de 2021, mod. Ac. 0529/2022 y Ac. 0586/2024 |
| Regla de retención | **Plana: 1,8 x 1000** para toda actividad [art. 83] | **Por actividad** del retenido; si no informa, tarifa máxima [art. 100] |
| Tarifas del impuesto | Enteras, CIIU rev. 4 [art. 71]; financieras 11 desde 2025; publicidad (7310) = 10 | Múltiplos de 1,1: 2,2 / 3,3 / 5,2 / 5,5 / 6,6 / 7,7 / 8,8 / 10; financiera 14 |
| Base mínima | **Un solo umbral: 15 UVT para cualquier pago** | 3 UVT servicios / 15 UVT compras [art. 107 lit. g] |
| Exclusión gran contribuyente | **No existe** [art. 82] | Sí [Res. 4131.040.21.1.0618 de 2022] |

En Medellín la tabla de tarifas del **impuesto** existe pero **no se usa para
retener**. Cargarla o no es indiferente para el cálculo; lo que manda es el 1,8.

**Y la exclusión del gran contribuyente declarante llega aquí**, porque sólo aquí se
puede demostrar que es del municipio y no del motor: un tercer hecho por parte
—declarante de ICA en el municipio— que, junto con gran contribuyente, excluye de
ReteICA en Bogotá y en Cali, **y no en Medellín**. Va en la regla del municipio.

La excepción de Bogotá —que sí se le retiene cuando el retenedor es entidad de
derecho público [Ac. 65/2002 art. 9 lit. d]— **no se modela**: no existe el tipo de
parte «entidad pública». Dejar el TODO anotado donde se lea.

Las dos ciudades **enuncian sus bases mínimas en UVT en el texto normativo**, a
diferencia de Bogotá (pesos de 2002). No hay que desindexar nada.

**Cabo suelto**: el Acuerdo 0529 de 2022 de Cali y la Res. 0119 de 2020 sólo se
publican escaneados, sin capa de texto; de ellos se verificó únicamente lo que
reproducen otras fuentes primarias. Si algo de Cali no cuadra contra una factura
real, ese es el primer sitio donde mirar.

**Blocked by:** 06

**Status:** ready-for-agent

- [ ] Medellín retiene 1,8 por mil sea cual sea la actividad del retenido
- [ ] En Medellín no se pregunta la actividad ni se dispara el aviso de «no informada»
- [ ] Cali retiene a la tarifa de la actividad, y a la máxima si no se informa
- [ ] La base mínima única de Medellín no se modela como el par compras/servicios
- [ ] Un gran contribuyente declarante queda excluido en Bogotá y Cali, y no en Medellín
- [ ] Cada tarifa y cada base cita el acuerdo y el artículo que la fija
- [ ] Ninguna cifra proviene de un blog de proveedor
- [ ] `npm test` en verde
