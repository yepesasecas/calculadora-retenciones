# 05 — La tarifa sale de una regla, no de un campo libre

**What to build:** la tarifa de ReteICA deja de ser un número que alguien digita y
que los dos tramos comparten. Es la pieza central del spec.

**El municipio lleva una regla de retención**, no una tarifa. Dos formas:

```
bogota:   { regla: { tipo: "actividad", tabla: [...], maxima: 13.8 } }
medellin: { regla: { tipo: "plana",     tarifa: 1.8              } }
```

Este ticket implementa la forma *por actividad* y carga Bogotá; la forma *plana*
entra con Medellín en el ticket 07, pero **la discriminación se construye aquí** —
está verificada y no es especulativa: Medellín retiene 1,8 por mil planos
[Ac. 093/2023 art. 83], cifra que no figura en ninguna tabla de impuesto.

**La actividad ICA es propiedad de la parte**, buscable por CIIU o por nombre, y cada
tramo lee la de **su retenido** — la tarifa es la de la actividad del sujeto de
retención [Ac. 65/2002 art. 11]. Hoy, la Agencia que factura «demás servicios» y
subcontrata a una imprenta liquida el tramo 2 con la tarifa equivocada. La actividad
ICA **no** se deriva del `concepto`, que es nacional y gobierna retefuente;
`icaClase` sobrevive pero sólo elige la base mínima.

Tabla de Bogotá desde la fuente: Acuerdo 65 de 2002 art. 3, modificado por el art. 6
del Acuerdo 780 de 2020 y el art. 4 del Acuerdo 816 de 2021 (financieras al 14 por
mil), con el listado CIIU 2022 rev. 4 de la SHD. **Ojo**: no tomar las cifras «2003 y
siguientes» del Decreto 352/2002 art. 53 sin cruzarlas con el Acuerdo 780/2020, que
subió varias de forma gradual hasta 2024 (consultoría profesional 6,9 → 8,66;
profesión liberal 9,66 → 7,66; telecomunicaciones 9,66 → 10,62).

Tres conductas más:

- **Actividad no informada ⇒ tarifa máxima del municipio**, y la nota lo dice
  [Ac. 65/2002 art. 11].
- **Entrada libre** para municipios sin regla cargada.
- **Una tarifa digitada fuera de tabla calcula y avisa**: «tarifa 8,99 x 1000 no
  figura en la tabla de Bogotá — verifique el acuerdo municipal o el código CIIU del
  retenido». Es el aviso que habría cazado la pregunta que originó todo este trabajo.

Anotar que las bases mínimas de Bogotá están fijadas por la norma en **pesos de 2002**
($430.000 compras / $62.000 servicios, D. 271/2002 art. 8 = D. 639/2025 art. 16) y
que 27/4 UVT es la indexación de uso, no el texto normativo.

**Costura de prueba nueva** — la única del spec: la resolución de la tarifa se expone
como función pura (municipio + retenido ⇒ tarifa y de dónde salió), para fijar la
tabla, el respaldo a tarifa máxima y el aviso sin construir un tramo entero.

**Blocked by:** 04

**Status:** ready-for-agent

- [ ] Los dos tramos pueden tener tarifas distintas, y cada uno usa la de su retenido
- [ ] La tabla de Bogotá está en los datos, con acuerdo y artículo citados por fila
- [ ] La actividad se busca por CIIU o por nombre
- [ ] «No informada» aplica la tarifa máxima y lo dice en las notas
- [ ] Una tarifa libre fuera de tabla calcula y produce el aviso
- [ ] El resultado dice de qué acuerdo salió la tarifa aplicada
- [ ] La procedencia en pesos de 2002 de las bases mínimas queda anotada
- [ ] La resolución de la tarifa se prueba directamente, sin construir un tramo
- [ ] Las seis facturas de referencia dan lo mismo (9,66, «demás servicios», Bogotá)
- [ ] `npm test` en verde
