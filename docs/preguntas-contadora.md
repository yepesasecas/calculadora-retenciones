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

5. Si el vendedor es autorretenedor, la matriz dice que no se le practica **ninguna** retención. ¿Eso cubre también ReteICA (¿autorretención de ICA en Bogotá?) o solo renta? La calculadora hoy suprime todo.

## ReteICA

6. Confirmar tarifa **9,66/1000** para nuestra actividad en Bogotá. ¿Aplica la misma para todos los clientes o depende de la actividad facturada?
7. Clientes fuera de Bogotá: ¿qué municipio manda — el del cliente (agente retenedor) o el nuestro? ¿Tarifas/bases de qué municipios necesitamos cargar?
8. Bases mínimas ReteICA Bogotá 2026: usamos servicios ≥ 4 UVT ($209.496) y compras ≥ 27 UVT ($1.414.098). ¿Correcto?

## Redondeo

9. Tres facturas del lote (FEC591, FEC595, FEC598) tienen diferencias de **1 peso** entre sus propias líneas y el total (p. ej., FEC598: subtotal + IVA ≠ neto declarado). ¿Qué regla de redondeo usa el sistema emisor (por línea, truncado, al final)? La calculadora redondea cada línea al peso más cercano.

## Vigencias y tarifas

10. La tabla 2026 tiene dos ventanas de bases (8 may–30 jun vs 1 jul en adelante). ¿Cuál es el decreto/norma fuente, para actualizar cuando cambie (2027)?
11. Confirmar que la empresa es **declarante de renta** (por eso 4 % y no 6 % en servicios).
12. ¿Todos nuestros servicios llevan IVA 19 %? ¿Algún caso exento/excluido que debamos contemplar?

## Casos no modelados

13. **Entidades estatales** como clientes: ¿retienen distinto a un gran contribuyente? Hoy no las modelamos.
14. ¿Clientes persona natural (no responsables de IVA) practican alguna retención? La calculadora asume que no retienen nada.
