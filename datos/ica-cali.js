// Tarifas de ICA de Cali, por actividad, en por mil (x 1000).
//
// Fuente: **Acuerdo 0321 de 2011 art. 94**, compilado en el **Decreto
// Extraordinario 4112.010.20.0416 de 2021 art. 97**, modificado por el
// **Acuerdo 0529 de 2022** (tarifas) y el **Acuerdo 0586 de 2024** (financiero,
// de 23 a 14 en cumplimiento de fallo del Consejo de Estado). Cali retiene a la
// tarifa de la actividad del retenido, como Bogotá y a diferencia de Medellín
// [D.E. 0416/2021 art. 103].
//
// **Sólo va aquí lo verificado contra fuente primaria.** La tabla de Cali está
// construida sobre múltiplos de 1,1 y tiene además tramos de servicios en 2,2 /
// 3,3 / 6,6 / 8,8 cuya asignación por actividad sólo se publica en la
// Res. 4131.010.21.0119 de 2020, que la Alcaldía publica **escaneada, sin capa de
// texto**. Esas filas no se transcriben: una actividad que caiga en ellas se
// digita a mano y la calculadora avisa, que es preferible a inventarle el grupo.
// Es el cabo suelto de `docs/retencion-ica.md` §7: si algo de Cali no cuadra
// contra una factura real, ese es el primer sitio donde mirar.
export const TARIFAS_CALI = [
  { id: "caliIndustrialAlimentos", nombre: "Industrial: alimentos",
    ciiu: ["1011", "1020", "1030", "1051", "1061", "1071", "1081"],
    tarifaPorMil: 3.3, norma: "D.E. 4112.010.20.0416/2021 art. 97" },
  { id: "caliIndustrialDemas", nombre: "Industrial: demás actividades industriales",
    ciiu: [], tarifaPorMil: 6.6, norma: "D.E. 4112.010.20.0416/2021 art. 97" },

  { id: "caliComercialAlimentos", nombre: "Comercial: alimentos",
    ciiu: ["4631", "4711"], tarifaPorMil: 3.3, norma: "D.E. 4112.010.20.0416/2021 art. 97" },
  { id: "caliComercialVehiculos", nombre: "Comercial: vehículos nuevos y motocicletas",
    ciiu: ["4511", "4541"], tarifaPorMil: 5.2, norma: "D.E. 4112.010.20.0416/2021 art. 97" },
  { id: "caliComercialDetalHogar", nombre: "Comercial: comercio al detal para el hogar",
    ciiu: ["4752", "4759"], tarifaPorMil: 5.5, norma: "D.E. 4112.010.20.0416/2021 art. 97" },
  { id: "caliComercialDemas", nombre: "Comercial: demás actividades comerciales",
    ciiu: [], tarifaPorMil: 7.7, norma: "D.E. 4112.010.20.0416/2021 art. 97" },

  { id: "caliServiciosDemas", nombre: "Servicios: otras actividades de servicios NCP y el grueso de servicios",
    ciiu: ["6201", "7020", "7310", "8299", "9609"],
    tarifaPorMil: 10, norma: "D.E. 4112.010.20.0416/2021 art. 97 (agrupación 307-99)" },

  { id: "caliFinancieras", nombre: "Sector financiero",
    ciiu: ["6412", "6421", "6431"],
    tarifaPorMil: 14, norma: "Ac. 0586/2024 (antes 23, Ac. 0529/2022; originalmente 5)" },
];
