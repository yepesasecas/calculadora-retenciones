# ReteICA por actividad, y el fin del bloqueo por tramo

Status: in progress

Source: una sesión `/research` seguida de `/grill-with-docs` (2026-07-28). La
investigación está en [`docs/retencion-ica.md`](../../docs/retencion-ica.md); el
grilling produjo las once decisiones de abajo. No hay spec previo — el grilling *es*
el spec.

## Problema

La pregunta de origen era pequeña: **¿de dónde salen las tarifas 8,99 y 9,99 al
facturar?** Al buscarla contra fuentes primarias resultó que el modelo de ReteICA de
la calculadora está mal en cinco puntos distintos, y que uno de sus términos de
glosario — el `bloqueo` — nombra un hecho que no existe.

Lo que el motor hace hoy (`dominio/tramo.js`, `datos/municipios.js`):

- Una sola `tarifaPorMil` por municipio, digitada a mano en un campo libre y
  **compartida por los dos tramos** (`cadena.js:32`). La tarifa es la de la
  actividad del **retenido**, y los retenidos de los dos tramos son partes
  distintas.
- `municipio` también compartido, cuando la territorialidad manda el **lugar de
  ejecución del servicio** (Ley 1819/2016 art. 343).
- Un `bloqueo` único por tramo que apaga las tres retenciones a la vez. Ninguna de
  sus tres condiciones gobierna las tres retenciones (ver ADR-0005).
- La calidad de agente de ReteICA se lee del código 07 del RUT nacional. Es
  municipal: Bogotá la confiere por resolución a todo el régimen común de ICA.
- Faltan dos exclusiones reales del lado del retenido y la base gravable especial de
  las agencias de publicidad.

Y la 8,99 sigue sin fuente: verificada como **ausente** en Bogotá (Ac. 65/2002,
Ac. 780/2020, D. 352/2002, D. 639/2025), en Medellín y en Cali, estas dos contra el
texto íntegro. Lo que sí quedó verificado es el **mecanismo** que explicaría el
resultado vacío: un municipio puede fijar tarifas de *retención* distintas de las
del *impuesto*, y **Medellín lo hace** — retiene 1,8 por mil planos, cifra que no
figura en ninguna tabla de tarifas. Buscábamos en el sitio equivocado.

## Decisiones

1. **Las fuentes primarias mandan.** Una norma citada (ET, ley, acuerdo, oficio
   DIAN) basta para cambiar `dominio/`. La contadora queda para los hechos que
   ningún documento contiene: en qué municipio se ejecuta, cuál es el CIIU, si
   Matiz es agencia de publicidad.
2. **Compuerta por retención.** Se retira el `bloqueo` por tramo. Cada retención
   calcula su razón. → ADR-0005.
3. **Una nota por retención que no aplica**, no una por tramo. Se acepta la
   repetición que ADR-0004 evitaba: tres razones distintas valen tres líneas.
4. **Agente de ReteICA es un dato por parte**, no derivado del RUT; por defecto
   encendido si la parte es responsable de IVA (proxy del régimen común de ICA).
5. **La actividad ICA es propiedad de la parte**; cada tramo lee la de su retenido.
   Se acaba la tarifa compartida.
6. **El municipio lleva una regla de retención, no sólo una tabla.** Dos formas:
   *por actividad* (Bogotá, Cali) — la tarifa de la actividad del retenido, con
   «no informada» ⇒ **tarifa máxima** — y *plana* (Medellín) — **1,8 por mil para
   toda actividad** [Ac. 093/2023 art. 83], sin relación con su tabla de
   impuesto. Más entrada libre como salida de emergencia. **Corregida el
   2026-07-28**: la decisión original decía «actividad → tarifa por tabla
   municipal» y daba por universal la forma de Bogotá; la investigación de
   Medellín y Cali la desmintió. Un motor que asuma la primera forma se equivoca
   en Medellín por un factor de 1,1 a 6.
7. **El municipio pasa a ser del tramo**, con el del contrato como valor por
   defecto.
8. **Base gravable especial de agencias de publicidad**: bandera por parte,
   **apagada por defecto**, que lleva el ReteICA de esa parte al margen. Es regla
   **sólo de ICA**: no toca la facturación, así que ADR-0002 queda intacto.
9. **Exclusiones nuevas del lado del retenido**: gran contribuyente declarante de
   ICA en el municipio y autorretenedor de ICA municipal. La segunda es común a
   las tres ciudades; **la primera es del municipio** — Bogotá la tiene
   (Ac. 65/2002 art. 9 lit. d) y Cali también (Res. 4131.040.21.1.0618 de 2022),
   **Medellín no** (Ac. 093/2023 art. 82 no la contempla). Va con la regla del
   municipio, no en el motor.
10. **Una tarifa fuera de tabla calcula, pero avisa** en el panel de notas.
11. **Los datos de las tres ciudades entran juntos.** La pasada contra los
    estatutos de Medellín y Cali **ya está hecha** (2026-07-28, §6 y §7 de
    `docs/retencion-ica.md`), y es la que produjo la corrección de la decisión 6.

## Fuera de alcance

- **Entidad de derecho público** como tipo de parte. Hace falta para la excepción
  del art. 9 lit. d y para el caso de clientes estatales (pregunta 13 de
  `preguntas-contadora.md`). No se modela aquí.
- Descargar y parsear el XLSX de la SHD en tiempo de ejecución: la tabla entra como
  datos en el repo.
- El origen de 8,99 / 9,99 mientras no lleguen municipio + CIIU + acuerdo.

## Efecto sobre las cifras

Esto **cambia resultados**, no sólo etiquetas:

- un retenido en SIMPLE responsable de IVA ahora lleva ReteIVA;
- un autorretenedor (15) ahora lleva ReteICA;
- el tramo 2 usa la tarifa del proveedor, no la de Matiz.

Las fixtures que fijaban lo anterior fijaban un error, y hay que actualizarlas junto
con el cambio que las rompe. Las 6 facturas de oro no deberían moverse: sus clientes
son agentes reales y la actividad es «demás servicios» a 9,66.
