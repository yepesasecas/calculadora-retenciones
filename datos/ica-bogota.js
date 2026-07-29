// Tarifas de ICA de Bogotá D.C., por actividad, en por mil (x 1000).
//
// Fuente normativa: **Acuerdo 65 de 2002 art. 3**, modificado por el art. 6 del
// **Acuerdo 780 de 2020** (que subió varias de forma gradual 2022→2024) y por el
// art. 4 del **Acuerdo 816 de 2021** (financieras al 14). El Decreto 352 de 2002
// art. 53 reproduce la tabla, pero sus cifras «2003 y siguientes» están
// desactualizadas para las actividades que tocó el Acuerdo 780: **no tomarlas sin
// cruzarlas**. Las tarifas de abajo son las plenas, ya vigentes desde 2024.
//
// `ciiu` son códigos **representativos** de cada grupo, para poder buscar por
// código además de por nombre. No son el listado íntegro de la SHD (CIIU 2022
// rev. 4), que no está transcrito en el repo: si un código no aparece aquí, la
// clasificación se hace por el nombre del grupo, que es lo que la norma enuncia.
export const TARIFAS_BOGOTA = [
  { id: "industrialAlimentos", nombre: "Industrial: alimentos (no bebidas), calzado y prendas de vestir",
    ciiu: ["1011", "1020", "1030", "1051", "1061", "1071", "1081", "1410", "1521", "1522"],
    tarifaPorMil: 4.14, norma: "Ac. 65/2002 art. 3" },
  { id: "industrialMetalTransporte", nombre: "Industrial: hierro y acero primarios, material de transporte",
    ciiu: ["2410", "2431", "2910", "2920", "3011", "3020", "3091"],
    tarifaPorMil: 6.9, norma: "Ac. 65/2002 art. 3" },
  { id: "industrialEdicionLibros", nombre: "Industrial: edición de libros",
    ciiu: ["5811"], tarifaPorMil: 8, norma: "Ac. 65/2002 art. 3" },
  { id: "industrialFarmaceuticos", nombre: "Industrial: productos farmacéuticos",
    ciiu: ["2100"], tarifaPorMil: 12.14, norma: "Ac. 780/2020 art. 6 (plena desde 2024; antes 11,04)" },
  { id: "industrialDemas", nombre: "Industrial: demás actividades industriales",
    ciiu: [], tarifaPorMil: 11.04, norma: "Ac. 65/2002 art. 3" },

  { id: "comercialAlimentos", nombre: "Comercial: alimentos y agrícolas en bruto, textos escolares, drogas",
    ciiu: ["4631", "4632", "4711", "4761", "4773"],
    tarifaPorMil: 4.14, norma: "Ac. 65/2002 art. 3" },
  { id: "comercialConstruccionAutomotores", nombre: "Comercial: madera, materiales de construcción y automotores",
    ciiu: ["4511", "4530", "4663", "4752"],
    tarifaPorMil: 6.9, norma: "Ac. 65/2002 art. 3" },
  { id: "comercialCigarrillosLicores", nombre: "Comercial: cigarrillos, licores, combustibles y joyas",
    ciiu: ["4724", "4731", "4732"],
    tarifaPorMil: 13.8, norma: "Ac. 65/2002 art. 3" },
  { id: "comercialDemas", nombre: "Comercial: demás actividades comerciales",
    ciiu: [], tarifaPorMil: 11.04, norma: "Ac. 65/2002 art. 3" },

  { id: "serviciosTransporteEdicion", nombre: "Servicios: transporte, publicación de revistas y periódicos, radiodifusión y TV",
    ciiu: ["4921", "4923", "5021", "5813", "6010", "6020"],
    tarifaPorMil: 4.14, norma: "Ac. 65/2002 art. 3" },
  { id: "serviciosCine", nombre: "Servicios: producción y exhibición de cine",
    ciiu: ["5911", "5912", "5914"], tarifaPorMil: 6.9, norma: "Ac. 65/2002 art. 3" },
  { id: "serviciosEducacion", nombre: "Servicios: educación privada, de inicial a media",
    ciiu: ["8511", "8521", "8530"], tarifaPorMil: 7, norma: "Ac. 65/2002 art. 3" },
  { id: "serviciosProfesionLiberal", nombre: "Servicios: consultoría en profesión liberal (persona natural)",
    ciiu: ["6910", "6920", "7500"],
    tarifaPorMil: 7.66, norma: "Ac. 780/2020 art. 6 (plena desde 2024; antes 9,66)" },
  { id: "serviciosViasObrasCiviles", nombre: "Servicios: construcción de vías y obras civiles",
    ciiu: ["4210", "4220"],
    tarifaPorMil: 7.6, norma: "Ac. 780/2020 art. 6 (plena desde 2024; antes 6,9)" },
  { id: "serviciosConsultoriaProfesional", nombre: "Servicios: consultoría profesional y contratistas de construcción",
    ciiu: ["4111", "4112", "4290", "7020", "7110"],
    tarifaPorMil: 8.66, norma: "Ac. 780/2020 art. 6 (plena desde 2024; antes 6,9)" },
  { id: "serviciosTelecomunicaciones", nombre: "Servicios: telecomunicaciones",
    ciiu: ["6110", "6120", "6130", "6190"],
    tarifaPorMil: 10.62, norma: "Ac. 780/2020 art. 6 (plena desde 2024; antes 9,66)" },
  { id: "serviciosHotelesRestaurantes", nombre: "Servicios: restaurantes, bares y hoteles, vigilancia, casas de empeño",
    ciiu: ["5511", "5611", "5630", "6492", "8010"],
    tarifaPorMil: 13.8, norma: "Ac. 65/2002 art. 3" },
  // El grupo de la Agencia y de las seis facturas de referencia: publicidad (7310)
  // liquida ICA en Bogotá como «demás actividades de servicios», a 9,66 por mil.
  { id: "serviciosDemas", nombre: "Servicios: demás actividades de servicios (incluye publicidad)",
    ciiu: ["5820", "6201", "7310", "7320", "8299", "9002"],
    tarifaPorMil: 9.66, norma: "Ac. 65/2002 art. 3" },

  { id: "financieras", nombre: "Sector financiero",
    ciiu: ["6412", "6421", "6431"],
    tarifaPorMil: 14, norma: "Ac. 816/2021 art. 4" },
];
