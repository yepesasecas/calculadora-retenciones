// TRANSITORIO: igual que en `tramo.js`, las razones y avisos se redactan aquí en
// prosa `es-CO`. Ver la nota de ADR-0003 allí.
const fmt = n => n.toLocaleString("es-CO");

// Busca actividades de la tabla de un municipio por código CIIU o por nombre.
// Sin consulta devuelve la tabla entera; un municipio sin tabla no tiene ninguna.
export function buscarActividades(municipio, consulta = "") {
  const tabla = municipio?.regla?.tipo === "actividad" ? municipio.regla.tabla : [];
  const q = consulta.trim().toLowerCase();
  if (!q) return tabla;
  return tabla.filter(a =>
    a.nombre.toLowerCase().includes(q) || a.ciiu.some(c => c.startsWith(q) || q.startsWith(c)));
}

export const actividadPorId = (municipio, id) =>
  (municipio?.regla?.tipo === "actividad" ? municipio.regla.tabla : []).find(a => a.id === id) ?? null;

// De dónde sale la tarifa de ReteICA de un tramo: **del municipio y del retenido**,
// nunca del concepto nacional ni del retenedor. Función pura y expuesta a
// propósito, para poder fijar la tabla, el respaldo y el aviso sin construir un
// tramo entero.
//
// Devuelve la tarifa por mil, la fuente de la que salió —para poder rastrearla
// ante la contadora— y un aviso cuando hay algo que verificar. Un aviso nunca
// impide calcular: existen municipios sin tabla cargada y municipios cuya tarifa
// de retención no figura en ninguna tabla de impuesto.
export function resolverTarifaICA({ municipio, retenido = {}, tarifaManual = 0 }) {
  const regla = municipio?.regla;

  // Sin regla cargada: entrada libre. El municipio no puede contradecir un número
  // que no conoce, así que no hay aviso de tabla que dar.
  if (!regla) return {
    tarifaPorMil: tarifaManual,
    fuente: `tarifa digitada a mano — ${municipio?.nombre ?? "el municipio"} sin tabla cargada`,
    aviso: null,
  };

  // Tarifa plana: la actividad del retenido no interviene, así que tampoco se le
  // reprocha no haberla informado.
  if (regla.tipo === "plana") return {
    tarifaPorMil: regla.tarifa,
    fuente: `${municipio.nombre}: tarifa plana de retención — ${regla.norma}`,
    aviso: null,
  };

  const actividad = actividadPorId(municipio, retenido.actividadICA);
  if (actividad) return {
    tarifaPorMil: actividad.tarifaPorMil,
    fuente: `${municipio.nombre} · ${actividad.nombre} — ${actividad.norma}`,
    aviso: null,
  };

  // Actividad no informada, pero con tarifa digitada: se calcula con ella y se
  // avisa si no figura en la tabla del municipio. Es el aviso que habría cazado
  // el 8,99 el primer día.
  if (tarifaManual > 0) {
    const enTabla = regla.tabla.some(a => a.tarifaPorMil === tarifaManual);
    return {
      tarifaPorMil: tarifaManual,
      fuente: `tarifa digitada a mano${enTabla ? ` — figura en la tabla de ${municipio.nombre}` : ""}`,
      aviso: enTabla ? null
        : `tarifa ${fmt(tarifaManual)} x 1000 no figura en la tabla de ${municipio.nombre} — verifique el acuerdo municipal o el código CIIU del retenido.`,
    };
  }

  // Ac. 65/2002 art. 11: quien no informa su actividad queda gravado a la tarifa
  // máxima vigente. No es un respaldo del motor: es lo que aplicaría la autoridad.
  return {
    tarifaPorMil: regla.maxima,
    fuente: `${municipio.nombre}: tarifa máxima por actividad no informada — ${regla.normaMaxima}`,
    aviso: `actividad ICA del retenido no informada — se aplicó la tarifa máxima de ${municipio.nombre} (${fmt(regla.maxima)} x 1000).`,
  };
}

// La base mínima del municipio para el tramo. La forma cambia entre ciudades:
// Bogotá y Cali distinguen compras de servicios, Medellín tiene un umbral único.
// 0 = el municipio no tiene bases cargadas y no hay tope que verificar.
export function baseMinimaICA(municipio, concepto) {
  const base = municipio?.baseMinima;
  if (!base) return 0;
  if (base.tipo === "unica") return base.valor;
  if (base.tipo === "par") return concepto.icaClase === "servicio" ? base.servicio : base.compra;
  return 0;
}
