# Calculadora de retenciones — Colombia 2026

Calculadora estática (HTML + JS, sin dependencias) de retención en la fuente,
ReteICA y ReteIVA para la **cadena de tres partes** típica de un trabajo por
encargo: un **Cliente final** contrata a la **Agencia**, que subcontrata a un
**Proveedor**.

- **Módulos ES nativos**, servidos tal cual: sin bundler y sin paso de build. El
  navegador y las pruebas importan exactamente los mismos archivos. Ver
  [ADR-0003](./docs/adr/0003-native-es-modules-no-build.md).
- **Sin backend, sin datos**: todo el cálculo ocurre en el navegador.
- **Sin dependencias**: no hay paquetes, ni lockfile, ni red. `npm install` nunca
  hace falta.

## Cómo correrlo

Hace falta un servidor estático: abrir `index.html` con doble clic **no**
funciona, porque los módulos ES no cargan sobre `file://`.

```sh
python3 -m http.server   # y abrir http://localhost:8000/
```

Desplegar es `git push` a `main`: GitHub Pages sirve el árbol verbatim.

## Qué calcula

Ingresas el valor del contrato (sin IVA), un concepto, un municipio, tu margen
(% o monto fijo) y las **responsabilidades del RUT (casilla 53)** de las tres
partes. La herramienta liquida los dos tramos a la vez:

1. **Tramo 1** — Cliente final → Agencia: lo que facturas y lo que te retienen.
2. **Tramo 2** — Agencia → Proveedor: lo que le retienes y lo que le giras.

Y muestra, paso a paso, cuánto recibes, cuánto giras, tu ganancia, y una
especificación de exactamente qué debe facturarte el Proveedor.

El modelo es **reventa/principal**: facturas el contrato completo (IVA sobre el
total) y la factura del Proveedor es tu costo. Ver
[ADR-0002](./docs/adr/0002-three-party-reventa-chain.md).

## Reglas modeladas

- Retefuente por concepto, con tarifa declarante / no declarante y base mínima.
- ReteICA por municipio (tarifa por mil editable) con base mínima según la clase
  del pago.
- ReteIVA (15 % del IVA), sujeta al agente de reteIVA.
- **Perfil fiscal derivado del RUT**, no marcado a mano: agente de retención
  (07, 09/23) es un hecho distinto de responsable de IVA (48). Ver
  [ADR-0001](./docs/adr/0001-rut-derived-fiscal-profile.md).
- **Régimen simple (47)**: no sujeto a retefuente ni a ReteICA.
- **No responsable de IVA (49)**: ese tramo se factura sin IVA.

Cuando una retención no aplica, la herramienta dice **por qué** ("no aplica —
el retenido está en régimen simple (47)"), en lugar de mostrar un cero mudo.

## Verificación

`npm test` (Node >= 22, sin instalar nada) corre, con código de salida:

- **7 casos de cadena** que fijan los dos tramos completos: margen en % y fijo,
  proveedor en régimen simple y ordinario, colapso sin proveedor, montos bajo la
  base mínima, IVA por tramo, y margen inválido. Se afirman las cifras y la razón
  de cada retención que queda en cero.

Si una regla se modifica y deja de reproducir las cifras, el suite se pone rojo.
Correrlo antes de cada commit y push.

La página conserva por ahora un panel que pinta los mismos casos al cargar,
desde el mismo fixture; desaparece en el siguiente paso de la migración.

## Documentación

- [`CONTEXT.md`](./CONTEXT.md) — el modelo de dominio y el vocabulario.
- [`docs/adr/`](./docs/adr/) — decisiones de arquitectura.
- [`.scratch/`](./.scratch/) — las especificaciones y tickets de cada tanda de trabajo.

> Herramienta de apoyo. No sustituye la asesoría de un contador. Verifica siempre
> las tarifas y bases vigentes. La regla de ReteIVA y su comportamiento bajo el
> régimen simple siguen pendientes de confirmación profesional.
