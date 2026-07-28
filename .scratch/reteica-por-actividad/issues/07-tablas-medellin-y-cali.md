# 07 — Tablas de Medellín y Cali

**What to build:** cargar en `datos/municipios.js` la regla de retención, las
tarifas y las bases mínimas de Medellín y Cali, con el formato del ticket 04 y cada
cifra citando su acuerdo.

La investigación contra fuentes primarias **ya está hecha** (2026-07-28): §6 y §7 de
`docs/retencion-ica.md`. Resumen de lo que hay que codificar:

| | Medellín | Cali |
|---|---|---|
| Norma rectora | **Acuerdo 093 de 2023** (deroga el Ac. 066/2017, que ya había derogado el Ac. 064/2012 — toda tabla que cite esos dos está muerta) | Acuerdo 0321 de 2011, compilado hoy en el D.E. 4112.010.20.0416 de 2021, mod. Ac. 0529/2022 y Ac. 0586/2024 |
| Regla de retención | **Plana: 1,8 x 1000** para toda actividad [art. 83] | **Por actividad** del retenido; si no informa, tarifa máxima [art. 100 = art. 103 del D.0416/21] |
| Tarifas del impuesto | Enteras, CIIU rev. 4 [art. 71]; financieras 11 desde 2025; publicidad (7310) = 10 | Múltiplos de 1,1: 2,2 / 3,3 / 5,2 / 5,5 / 6,6 / 7,7 / 8,8 / 10; financiera 14 (Ac. 0586/2024) |
| Base mínima | **Un solo umbral: 15 UVT para cualquier pago** | 3 UVT servicios / 15 UVT compras [art. 107 lit. g] |
| Exclusión gran contribuyente | **No existe** [art. 82] | Sí, vía Res. 4131.040.21.1.0618 de 2022 |
| Agentes | Entidades públicas + designados por resolución de la Subsecretaría de Ingresos (Res. 202550100042 de 2025) | **Todos los sujetos pasivos y no pasivos del ICA en Cali** + entidades públicas + naturales comerciantes con patrimonio o ingresos > 30.000 UVT |

Las dos ciudades **sí enuncian sus bases mínimas en UVT en el texto normativo**, a
diferencia de Bogotá (pesos de 2002). No hace falta desindexar nada.

**Veredicto sobre 8,99 / 9,99: ausentes en ambas**, verificado contra el texto
íntegro. El único decimal del Acuerdo 093 de 2023 en sus 142 páginas es el 1,8 de la
retención; Cali va 7,7 → 8,8 → 10, sin pasar por 9,9.

**Cabo suelto**: el Acuerdo 0529 de 2022 de Cali y la Res. 0119 de 2020 sólo se
publican escaneados, sin capa de texto; de ellos se verificó únicamente lo que
reproducen otras fuentes primarias. Si algo de Cali no cuadra contra una factura
real, ese es el primer sitio donde mirar.

**Blocked by:** 04

**Status:** ready-for-agent

- [ ] Cada tarifa y cada base mínima cita el acuerdo y el artículo que la fija
- [ ] Ninguna cifra proviene de un blog de proveedor
- [ ] Medellín usa la regla plana y no consulta la actividad del retenido
- [ ] Medellín no excluye al gran contribuyente declarante; Bogotá y Cali sí
- [ ] La base mínima única de Medellín no se modela como el par compras/servicios
- [ ] `npm test` en verde
