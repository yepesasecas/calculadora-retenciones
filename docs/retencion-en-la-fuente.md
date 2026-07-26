# Retención en la fuente — extracción de assets

Fuente: `assets/`. Todo extraído de imágenes (OCR manual, 2026-07-17).

## 1. Facturas — cálculo de retenciones

Fecha común: **15-jul-2026**. Todas menos FV594 corresponden al mismo talento.

| Doc | Cliente | Concepto | Subtotal | IVA (19%) | Neto | Retefuente 4% | ReteICA 9,66/1000 | Total a girar |
|---|---|---|---:|---:|---:|---:|---:|---:|
| FV 594 | Cliente A | Campaña de producto | 9.698.000 | 1.842.620 | 11.540.620 | 387.920 | 93.683 | 11.059.017 |
| FEC587 | Cliente B | Campaña de marca | 7.708.418 | 1.464.599 | 9.173.017 | 308.337 | 74.463 | 8.790.217 |
| FEC591 | Cliente A | Reel | 8.703.334 | 1.653.633 | 10.356.967 | 348.133 | 84.074 | 9.924.759 |
| FEC595 | Cliente C | Contenido mayo 2026 | 2.832.465 | 538.168 | 3.370.633 | 113.299 | 27.362 | 3.229.973 |
| FEC598 | Cliente D | Campaña – 50% SF | 11.650.659 | 2.213.625 | 13.864.285 | 466.026 | 112.545 | 13.285.713 |
| FEC599 | Cliente E | Contenido influencers | 11.190.000 | 2.126.100 | 13.316.100 | 447.600 | 108.095 | 12.760.405 |

**Fórmula verificada** (probada contra las 6 facturas):

```
IVA           = subtotal * 0.19
Neto          = subtotal + IVA
Retefuente    = subtotal * 0.04          # base: subtotal, NO el neto
ReteICA       = subtotal * 0.00966       # base: subtotal
Total a girar = Neto - Retefuente - ReteICA
```

Totales del lote: subtotal 51.782.876 · neto 61.621.622 · total a girar 59.050.084.

## 2. Tarifas retención en la fuente 2026

Bases en pesos; dos ventanas de vigencia en el año.

| Concepto | Base 8 may – 30 jun | Base 1 jul en adelante | % |
|---|---:|---:|---:|
| Compras generales (declarantes) | 1.414.000 | 524.000 | 2,5% |
| Compras generales (no declarantes) | 1.414.000 | 524.000 | 3,5% |
| Compra productos agrícolas o pecuarios | 4.818.000 | 3.666.000 | 1,5% |
| Servicios generales (declarantes) | 209.000 | 105.000 | 4,0% |
| Servicios generales (no declarantes) | 209.000 | 105.000 | 6,0% |
| Servicio de hoteles y restaurantes | 209.000 | 105.000 | 3,5% |
| Servicio de transporte de carga | 209.000 | 105.000 | 1,0% |
| Servicio de transporte de pasajeros | 1.414.000 | 524.000 | 3,5% |
| Arrendamiento de bienes inmuebles | 1.414.000 | 524.000 | 3,5% |
| Contratos de construcción y urbanización | 1.414.000 | 524.000 | 2,0% |

### Conceptos sin base mínima

| Concepto | % |
|---|---:|
| Arrendamiento de bienes muebles | 4,0% |
| Compra de combustibles | 0,1% |
| Honorarios y comisiones | 11,0% |
| Licenciamiento y uso de software | 3,5% |
| Intereses y demás rendimientos financieros | 7,0% |

> Las facturas de arriba usan 4% → corresponde a **servicios generales (declarantes)**, no a honorarios (11%).

## 3. Matriz: quién retiene a quién

Filas = comprador (encargado de retener). Columnas = vendedor.

| Comprador \ Vendedor | Rég. simplificado | Rég. común | Gran contribuyente | Gran contrib. autorretenedor |
|---|---|---|---|---|
| **Régimen simplificado** | No | No | No | No |
| **Régimen común** | Retefuente renta | Retefuente renta | Retefuente renta | No |
| **Gran contribuyente** | Retefuente renta | Retefuente renta + ReteIVA | Retefuente renta | No |
| **Gran contrib. autorretenedor** | Retefuente renta | Retefuente renta + ReteIVA | Retefuente renta | No |

Reglas que se desprenden:
- Régimen simplificado nunca retiene.
- A un **gran contribuyente autorretenedor nunca se le practica retención** (él se autorretiene).
- ReteIVA sólo aparece cuando un gran contribuyente (autorretenedor o no) compra a régimen común.

## 4. Notas de la contadora (Geraldyne Lopez)

- Ejemplo compartido: empresa gran contribuyente–autorretenedor → **no se le practican retenciones**.
- RUT de clientes: emitir una circular de actualización de datos y armar carpeta propia.
- Si el dinero entra a la empresa: pedir el RUT, emitir la factura, y según el concepto **ellos** practican la retención y la descuentan del pago.
- El RUT permite validar la **actividad económica** → de ahí se deduce de qué servicio se trata.
- Pregunta abierta: qué código/casilla del RUT leer para identificar el régimen. Pistas visibles en el RUT compartido (casillas de responsabilidades): `07 - Retención en la fuente a título de renta`, `09 - Retención en la fuente en el impuesto…`, `13 - Gran contribuyente`, `15 - Autorretenedor`, `48 - Impuesto sobre las ventas – IVA`, `52 - Facturador electrónico`.

## Assets

| Archivo | Contenido |
|---|---|
| `assets/factura-fv594.jpeg` | FV 594 |
| `assets/factura-fec587.jpeg` | FEC587 |
| `assets/factura-fec591.jpeg` | FEC591 |
| `assets/factura-fec595.jpeg` | FEC595 |
| `assets/factura-fec598.jpeg` | FEC598 |
| `assets/factura-fec599.jpeg` | FEC599 |
| `assets/tabla-tarifas-retefuente-2026.jpeg` | Tabla de tarifas y bases 2026 |
| `assets/matriz-retencion-por-regimen.jpeg` | Matriz comprador/vendedor |
| `assets/chat-contadora-reglas-rut.jpeg` | Chat con la contadora |
| `assets/rut-141040995796.pdf` | RUT (sin extraer) |
| `assets/rut-hsfb-group-sas.pdf` | RUT HSFB GROUP SAS (sin extraer) |
