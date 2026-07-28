# 04 — La actividad ICA es de la parte, y la tarifa sale de la tabla

**What to build:** hoy la tarifa es un número digitado en un campo libre
(`index.html:170`) y **compartido por los dos tramos** (`cadena.js:32`). La norma
dice otra cosa: la tarifa es «la que corresponda a la respectiva actividad» del
**sujeto de retención** (Ac. 65/2002 art. 11), y los retenidos de los dos tramos son
partes distintas. Matiz facturando «demás servicios» (9,66) que subcontrata a una
imprenta (comercial demás, 11,04) o a un transportador (4,14) hoy calcula mal el
tramo 2.

1. **Cada parte lleva su actividad ICA**; cada tramo lee la de su retenido.
2. `datos/municipios.js` deja de tener un `tarifaPorMil` plano y pasa a llevar, por
   municipio, una **regla de retención** con dos formas posibles:

   ```
   bogota:   { regla: { tipo: "actividad", tabla: [...], maxima: 13.8 } }
   cali:     { regla: { tipo: "actividad", tabla: [...], maxima: 10   } }
   medellin: { regla: { tipo: "plana",     tarifa: 1.8              } }
   ```

   **La tarifa de retención no siempre es la del impuesto.** Medellín retiene un
   **1,8 por mil plano para toda actividad** [Ac. 093/2023 art. 83] y su tabla de
   impuesto es irrelevante para retener. Bogotá y Cali sí retienen a la tarifa de
   la actividad del retenido [Ac. 65/2002 art. 11; Ac. 0321/2011 art. 100].
   Asumir la forma de Bogotá en todas partes se equivoca en Medellín por un
   factor de 1,1 a 6.

   Tabla de Bogotá desde la fuente: Acuerdo 65 de 2002 art. 3, modificado por el
   art. 6 del Acuerdo 780 de 2020 y el art. 4 del Acuerdo 816 de 2021 (financieras
   al 14 por mil), con el listado CIIU 2022 rev. 4 que publica la SHD. **Ojo**: no
   tomar las cifras «2003 y siguientes» del Decreto 352/2002 art. 53 sin cruzarlas
   con el Acuerdo 780/2020, que subió varias de forma gradual hasta 2024
   (consultoría profesional 6,9 → 8,66; profesión liberal 9,66 → 7,66;
   telecomunicaciones 9,66 → 10,62).
3. **Actividad no informada ⇒ tarifa máxima del municipio**, y la nota lo dice.
   Regla de la forma *por actividad* solamente [Ac. 65/2002 art. 11 en Bogotá;
   art. 100 del Ac. 0321/2011 en Cali]; en Medellín no aplica.
4. **Entrada libre** para municipios sin regla cargada.
5. La excepción de Medellín para pagos a **personas o entidades sin domicilio ni
   presencia permanente en el país** —que sí se retienen a la tarifa plena de la
   actividad [Ac. 093/2023 art. 83]— **no se modela**: no existe el hecho «no
   domiciliado» en el perfil. Dejar el TODO anotado en la regla.
6. **Una tarifa fuera de tabla calcula y avisa**: «tarifa 8,99 x 1000 no figura en la
   tabla de Bogotá — verifique el acuerdo municipal o el código CIIU del retenido».
   Es el aviso que habría cazado la pregunta que originó todo este trabajo.

Anotar en `datos/municipios.js` que las bases mínimas de Bogotá están fijadas por la
norma en **pesos de 2002** ($430.000 compras / $62.000 servicios, D. 271/2002 art. 8
= D. 639/2025 art. 16), y que 27/4 UVT es la indexación de uso, no el texto
normativo.

La actividad ICA **no es** el `concepto` de retefuente y no debe derivarse de él.
`icaClase` sigue existiendo, pero sólo elige la base mínima.

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] Los dos tramos pueden tener tarifas distintas, y el tramo lee la de su retenido
- [ ] La tabla de Bogotá está en `datos/`, con su acuerdo citado por artículo
- [ ] Medellín retiene 1,8 por mil sea cual sea la actividad del retenido
- [ ] «No informada» aplica la tarifa máxima y lo dice en las notas, y no se dispara en Medellín
- [ ] Una tarifa libre fuera de tabla produce el aviso
- [ ] La procedencia en pesos de 2002 de las bases mínimas queda anotada
- [ ] `npm test` en verde
