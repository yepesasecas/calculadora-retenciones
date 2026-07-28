import { CONCEPTOS } from "./datos/conceptos.js";
import { MUNICIPIOS } from "./datos/municipios.js";
import { buscarActividades } from "./dominio/tarifa-ica.js";
import { COD, esRelevante } from "./datos/responsabilidades.js";
import { deriveProfile, HECHOS_MUNICIPALES } from "./dominio/perfil.js";
import { RETEIVA_TARIFA } from "./dominio/tramo.js";
import { calcularCadena } from "./dominio/cadena.js";
import { CADENA_CASOS } from "./fixtures/cadena.js";

const fmt = n => n.toLocaleString("es-CO");

// ---------- Casos de cadena ----------

function runCadena() {
  return CADENA_CASOS.map(c => {
    const r = calcularCadena({
      ...c.ent,
      concepto: CONCEPTOS.find(x => x.id === c.ent.conceptoId),
      municipio: MUNICIPIOS.find(x => x.id === c.ent.municipioId),
      clienteFinal: deriveProfile(c.ent.clienteFinal, c.ent.declarados?.clienteFinal),
      agencia: deriveProfile(c.ent.agencia, c.ent.declarados?.agencia),
      proveedor: deriveProfile(c.ent.proveedor, c.ent.declarados?.proveedor),
    });
    const propios = ["leg1", "leg2", "razones1", "razones2"];
    const lineas = [
      ...Object.entries(c.esp).filter(([k]) => !propios.includes(k))
        .map(([k, v]) => [k, r[k], v]),
      ...Object.entries(c.esp.leg1 || {}).map(([k, v]) => [`T1 ${k}`, r.leg1[k], v]),
      ...Object.entries(c.esp.leg2 || {}).map(([k, v]) => [`T2 ${k}`, r.leg2[k], v]),
      // Las razones de "no aplica" son parte del comportamiento observable del
      // motor, no adorno: se afirman igual que las cifras.
      ...Object.entries(c.esp.razones1 || {}).map(([k, v]) => [`T1 razón ${k}`, r.leg1.detalle[k].razon, v]),
      ...Object.entries(c.esp.razones2 || {}).map(([k, v]) => [`T2 razón ${k}`, r.leg2.detalle[k].razon, v]),
    ].map(([n, got, exp]) => ({
      n, got, exp,
      // Diferencia numérica cuando ambos son números; si no, sólo igual/distinto.
      d: typeof got === "number" && typeof exp === "number" ? got - exp : (got === exp ? 0 : 1),
    }));
    return { ...c, lineas, estado: lineas.every(l => l.d === 0) ? "pass" : "fail" };
  });
}

// ---------- UI ----------

const $ = id => document.getElementById(id);

CONCEPTOS.forEach(c => $("concepto").add(new Option(c.nombre, c.id)));
$("concepto").value = "serviciosGenerales";
MUNICIPIOS.forEach(m => $("muni").add(new Option(m.nombre, m.id)));
// Los dos tramos arrancan en el municipio de la cadena y sólo se separan si el
// usuario lo dice: el caso corriente —todo en una ciudad— sigue siendo un campo.
for (const id of ["muniT1", "muniT2"]) {
  $(id).add(new Option("Igual al de la cadena", ""));
  MUNICIPIOS.forEach(m => $(id).add(new Option(m.nombre, m.id)));
}

const municipioPorId = id => MUNICIPIOS.find(m => m.id === id);
const municipioCadena = () => municipioPorId($("muni").value);
const municipioLeg = n => municipioPorId($(`muniT${n}`).value) ?? municipioCadena();

// A qué municipio mira la actividad de cada parte: a la del tramo donde esa parte
// es retenida. El Cliente final nunca es retenido en esta cadena, así que se le
// muestra la tabla de la cadena.
const municipioDeParte = { cf: municipioCadena, ag: () => municipioLeg(1), pr: () => municipioLeg(2) };

// La actividad se busca por código CIIU o por nombre. El desplegable nativo filtra
// por subcadena sobre el valor de la opción, así que el valor lleva las dos cosas
// —nombre, tarifa y códigos— y una sola casilla sirve para las dos búsquedas.
const textoActividad = a =>
  `${a.nombre} — ${a.tarifaPorMil.toLocaleString("es-CO")} ‰` +
  (a.ciiu.length ? ` · CIIU ${a.ciiu.join(" ")}` : "");

// Un desplegable por parte: cada uno lista la tabla del municipio de SU tramo,
// que después del ticket 06 pueden ser dos ciudades distintas.
function llenarActividades() {
  for (const party of ["cf", "ag", "pr"])
    $(`${party}Actividades`).innerHTML = buscarActividades(municipioDeParte[party](), "")
      .map(a => `<option value="${textoActividad(a)}"></option>`).join("");
}

// ---- Entradas de responsabilidades del RUT ----
// Los ocho códigos marcables. Del conjunto "relevante" quedan fuera los
// obsoletos (11, 12), los que duplican a otro (23 ≡ 09, 53 ≡ 49) y el 04
// (régimen especial), que aporta el mismo hecho `declarante` que el 05.
// El motor los sigue entendiendo si llegan por otra vía; sólo no se marcan.
const CHIPS = ["05", "07", "09", "13", "15", "47", "48", "49"]
  .map(c => COD[c]).filter(r => r && esRelevante(r.code));

function chip(party, r, checked) {
  const id = `${party}_${r.code}`;
  const span = document.createElement("span");
  span.innerHTML =
    `<input type="checkbox" id="${id}" data-code="${r.code}"${checked ? " checked" : ""}>` +
    `<label for="${id}" title="${r.code} — ${r.nombre}" aria-label="${r.code} — ${r.nombre}">${r.code}</label>`;
  return span;
}

function initParty(party, defaults) {
  const rel = $(`${party}Relevant`);
  CHIPS.forEach(r => rel.appendChild(chip(party, r, defaults.includes(r.code))));
}

// Los hechos municipales que el usuario ha tocado. Vacío = tomar el valor por
// defecto que calcula el perfil, que puede moverse al cambiar los códigos del RUT.
const declarados = { cf: {}, ag: {}, pr: {} };

// Los tres se pintan iguales, como los chips del RUT: la tarjeta describe a la
// parte, no el papel que le toca en esta cadena.
function initDeclarados(party) {
  $(`${party}Declarados`).innerHTML =
    `<div class="rotulo">Lo declaras tú · no sale del RUT</div>` +
    HECHOS_MUNICIPALES.map(h =>
      `<label title="${h.ayuda}">` +
      `<input type="checkbox" data-hecho="${h.id}" data-party="${party}">` +
      `<span>${h.nombre}</span></label>`).join("") +
    `<span class="campo">Actividad ICA (CIIU o nombre)` +
    `<input type="text" list="${party}Actividades" data-actividad="${party}"` +
    ` placeholder="No informada — tarifa máxima del municipio">` +
    `<datalist id="${party}Actividades"></datalist></span>`;
}

// La casilla guarda el texto de la opción; el id vive aparte. Sin coincidencia,
// la actividad queda no informada, que es un estado con consecuencia normativa
// propia (tarifa máxima) y no un error de digitación.
function leerActividad(party) {
  const texto = $(`${party}Declarados`).querySelector("[data-actividad]").value;
  const a = buscarActividades(municipioDeParte[party](), "").find(x => textoActividad(x) === texto);
  return a ? a.id : null;
}

// La casilla muestra siempre el valor vigente —el declarado, o el que trae por
// defecto—, para que no pueda decir una cosa mientras el motor usa otra.
function syncDeclarados(party, prof) {
  for (const h of HECHOS_MUNICIPALES)
    $(`${party}Declarados`).querySelector(`[data-hecho="${h.id}"]`).checked = prof[h.id];
}

function readCodes(party) {
  return [...document.querySelectorAll(`#${party}Relevant [data-code]:checked`)]
    .map(el => el.dataset.code);
}

// El perfil derivado en lenguaje llano: una lista uniforme de hechos, igual
// para las tres partes (no dice a quién se le retiene — eso lo dicen los tramos).
const FLAG_LABELS = [
  ["agenteRetefuente", "retiene renta"], ["agenteReteIVA", "retiene IVA"],
  ["responsableIVA", "factura con IVA"], ["granContribuyente", "gran contribuyente"],
  ["declarante", "declarante"], ["autorretenedor", "autorretenedor"],
  ["simple", "régimen simple"],
];

function renderDerived(party, prof) {
  const on = FLAG_LABELS.filter(([k]) => prof[k]).map(([, n]) => `<span class="on">${n}</span>`);
  $(`${party}Derived`).innerHTML =
    `Perfil derivado: ${on.length ? on.join(" · ") : "—"}` +
    prof.alerts.map(a => `<div class="alert">⚠ ${a}</div>`).join("");
}

// Cliente final: declarante, responsable de IVA, agente de retefuente y de reteIVA.
// Agencia: declarante, responsable de IVA, agente de retefuente (para retenerle al proveedor).
// Proveedor: régimen simple y no responsable de IVA (el caso del mockup).
initParty("cf", ["05", "48", "07", "09"]);
initParty("ag", ["05", "48", "07"]);
initParty("pr", ["47", "49"]);
["cf", "ag", "pr"].forEach(initDeclarados);
llenarActividades();
// Matiz es agencia de publicidad (CIIU 7310): en Bogotá liquida como «demás
// actividades de servicios», que es el 9,66 de las seis facturas de referencia.
// Es un valor por defecto, no un hecho fijo: se puede cambiar como cualquier otro.
{
  const demas = buscarActividades(municipioDeParte.ag(), "7310")[0];
  if (demas) $("agDeclarados").querySelector("[data-actividad]").value = textoActividad(demas);
}

function leerMonto(id) {
  const raw = $(id).value.replace(/[.\s]/g, "").replace(",", ".");
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : null;
}

function leerMargen() {
  if ($("margenModo").value === "fijo") {
    return { modo: "fijo", valor: leerMonto("margenFijo") ?? 0 };
  }
  const v = Number($("margenPct").value);
  return { modo: "porcentaje", valor: Number.isFinite(v) && v >= 0 ? v : 0 };
}

// Una línea de la tabla de flujo. `cls` colorea deducciones / totales.
const fila = (etiqueta, valor, cls = "", signo = "") =>
  `<tr class="${cls}"><td>${etiqueta}</td><td>${signo}$ ${fmt(Math.abs(valor))}</td></tr>`;

// Línea de un rubro que puede no aplicar: el monto con su tarifa, o "no aplica"
// con el porqué que trae el motor. `deduce` la pinta como descuento.
const filaDetalle = (etiqueta, det, tarifa, deduce) =>
  det.razon
    ? `<tr class="na"><td>${etiqueta}</td><td>no aplica<span class="porque">${det.razon}</span></td></tr>`
    : `<tr class="${deduce ? "ded" : ""}"><td>${etiqueta}` +
      (tarifa ? ` <span class="porque" style="display:inline">(${tarifa})</span>` : "") +
      `</td><td>${deduce ? "− " : ""}$ ${fmt(det.valor)}</td></tr>`;

const pct = x => `${(x * 100).toLocaleString("es-CO")} %`;

// Las tarifas vigentes del leg, para mostrarlas junto a cada retención (US-11).
// La de ReteICA la resolvió el motor a partir del retenido de ESE tramo, así que
// se lee de su resultado y no de un campo de la pantalla.
function tarifasDe(leg, concepto, retenido) {
  return {
    retefuente: pct(concepto.tarifas[retenido.declarante ? "declarante" : "noDeclarante"]),
    reteica: `${leg.tarifaICA.tarifaPorMil.toLocaleString("es-CO")} ‰`,
    reteiva: `${pct(RETEIVA_TARIFA)} del IVA`,
  };
}

const RETENCIONES = [["retefuente", "Retefuente"], ["reteica", "ReteICA"], ["reteiva", "ReteIVA"]];

// Una retención con razón no pinta fila (ADR-0004): la razón se enuncia en el
// panel de notas, una línea por retención que no aplica (ADR-0005). Las tres
// pueden desaparecer juntas, pero cada una por su propio motivo.
const retencionesQueAplican = leg => RETENCIONES.filter(([id]) => !leg.detalle[id].razon);

// Las líneas de retención de un leg, con su tarifa. Mismo orden siempre.
const filasRetenciones = (leg, tarifas, etiquetas = {}) =>
  retencionesQueAplican(leg)
    .map(([id, nombre]) => filaDetalle(etiquetas[id] || nombre, leg.detalle[id], tarifas[id], true))
    .join("");

// Proyección del leg 1: lo que el Cliente final factura, retiene y gira a Matiz.
function legCliente(leg, ivaRate, tarifas) {
  return `<div class="leg">
    <h3>Tramo 1 <span>· Cliente final → Matiz</span></h3>
    <table class="breakdown">
      ${fila("Subtotal del contrato", leg.subtotal)}
      ${filaDetalle("IVA", leg.detalle.iva, pct(ivaRate), false)}
      ${fila("Neto que le facturas", leg.neto)}
      ${filasRetenciones(leg, tarifas)}
      ${fila("<b>Matiz recibe</b>", leg.totalAGirar, "total")}
    </table>
  </div>`;
}

// Proyección del leg 2: lo que el Proveedor factura y lo que Matiz le gira.
// La factura del proveedor se pinta como deducción para poder seguir la plata
// desde "Matiz recibe" hasta lo que sale de la cuenta.
function legProveedor(leg, ivaRate, tarifas, sinProveedor) {
  const cuerpo = sinProveedor
    ? `<p class="hint">Sin subcontrato: te quedas el contrato completo, no hay tramo 2.</p>`
    : `<table class="breakdown">
      ${fila("Neto que te factura el proveedor", leg.neto, "ded", "− ")}
      ${fila("Subtotal", leg.subtotal)}
      ${filaDetalle("IVA", leg.detalle.iva, pct(ivaRate), false)}
      ${filasRetenciones(leg, tarifas, {
        retefuente: "Retefuente que le practicas",
        reteica: "ReteICA que le practicas (la consignas tú)",
        reteiva: "ReteIVA que le practicas",
      })}
      ${fila("<b>Proveedor recibe</b>", leg.totalAGirar, "total")}
    </table>`;
  return `<div class="leg">
    <h3>Tramo 2 <span>· Matiz → Proveedor</span></h3>
    ${cuerpo}
  </div>`;
}

// Col 4: proyección pura del leg 2 como instrucción para el proveedor.
function specProveedor(leg, ivaRate, tarifas, sinProveedor) {
  if (sinProveedor) return `<p class="hint">No hay proveedor que facture: el margen se lleva el contrato completo.</p>`;
  // Sin retenciones que pintar no hay nada que encabezar: se van el encabezado y
  // la tabla, y queda el giro solo — que es la cifra por la que se mira esta
  // columna, y nunca se oculta.
  const giro = fila("<b>Le giras</b>", leg.totalAGirar, "total");
  const separa = ` style="margin-top:14px"`;
  const retenciones = retencionesQueAplican(leg).length
    ? `<p class="hint"${separa}>Retenciones que le practicas:</p>
    <table class="breakdown">${filasRetenciones(leg, tarifas)}${giro}</table>`
    : `<table class="breakdown"${separa}>${giro}</table>`;
  return `<p class="hint">Pídele al proveedor que facture exactamente esto.</p>
    <table class="breakdown">
      ${fila("Subtotal", leg.subtotal)}
      ${filaDetalle("IVA", leg.detalle.iva, pct(ivaRate), false)}
      ${fila("<b>Total de su factura</b>", leg.neto, "total")}
    </table>
    ${retenciones}`;
}

function render() {
  const concepto = CONCEPTOS.find(c => c.id === $("concepto").value);
  $("trapNote").hidden = !concepto.trap;
  if (concepto.trap) $("trapNote").textContent = "⚠ " + concepto.trap;

  for (const party of ["cf", "ag", "pr"]) declarados[party].actividadICA = leerActividad(party);
  const clienteFinal = deriveProfile(readCodes("cf"), declarados.cf);
  const agencia      = deriveProfile(readCodes("ag"), declarados.ag);
  const proveedor    = deriveProfile(readCodes("pr"), declarados.pr);
  for (const [party, prof] of [["cf", clienteFinal], ["ag", agencia], ["pr", proveedor]]) {
    syncDeclarados(party, prof);
    renderDerived(party, prof);
  }


  const contrato = leerMonto("contrato");
  const flujo = $("flujo"), notesEl = $("notes"), spec = $("specProveedor");
  if (contrato === null) {
    flujo.innerHTML = `<p class="hint">Ingrese el valor del contrato para liquidar la cadena.</p>`;
    notesEl.innerHTML = "";
    spec.innerHTML = `<p class="hint">—</p>`;
    $("split").innerHTML = "";
    return;
  }

  const municipio = municipioCadena();
  // Tarifa compartida: cada leg decide si la aplica según SU retenido
  // (ver calcularCadena). No se fuerza a 0 según la Agencia — eso le anularía el
  // IVA al leg 2 aunque el Proveedor sí sea responsable.
  const ivaRate = Number($("ivaRate").value);
  const r = calcularCadena({
    contrato, margen: leerMargen(), concepto, municipio,
    municipioLeg1: municipioLeg(1), municipioLeg2: municipioLeg(2),
    tarifaICAManual: Number($("icaTarifa").value) || 0, ivaRate,
    clienteFinal, agencia, proveedor,
  });

  $("split").className = "split" + (r.error ? " bad" : "");
  $("split").innerHTML = r.error
    ? `⚠ ${r.error}`
    : `<b>$ ${fmt(r.ganancia)}</b> para ti · <b>$ ${fmt(r.proveedorSubtotal)}</b> al proveedor`;

  const tarifas1 = tarifasDe(r.leg1, concepto, agencia);
  const tarifas2 = tarifasDe(r.leg2, concepto, proveedor);

  flujo.innerHTML =
    (r.error ? `<div class="note">⚠ ${r.error} Corrija el margen: sólo se liquida el tramo 1.</div>` : "") +
    legCliente(r.leg1, ivaRate, tarifas1) +
    legProveedor(r.leg2, ivaRate, tarifas2, r.sinProveedor) +
    `<div class="ganancia"><span>Tu ganancia</span><span>$ ${fmt(r.ganancia)}</span></div>`;

  // Las notas de los dos legs, etiquetadas para no confundirlas.
  // Sin subcontrato el leg 2 no tiene nada que explicar.
  const notas = [
    // De qué acuerdo salió la tarifa aplicada, para poder rastrearla después.
    ["Tramo 1", `Tarifa de ReteICA: ${r.leg1.tarifaICA.fuente}.`],
    ...r.leg1.notas.map(n => ["Tramo 1", n]),
    ...(r.sinProveedor ? [] : [["Tramo 2", `Tarifa de ReteICA: ${r.leg2.tarifaICA.fuente}.`]]),
    ...(r.sinProveedor ? [] : r.leg2.notas.map(n => ["Tramo 2", n])),
  ];
  notesEl.innerHTML = notas.map(([t, n]) => `<div class="note"><b>${t}:</b> ${n}</div>`).join("");

  spec.innerHTML = specProveedor(r.leg2, ivaRate, tarifas2, r.sinProveedor);
}

// Cambiar de municipio cambia la tabla de actividades: se repueblan los desplegables.
["muni", "muniT1", "muniT2"].forEach(id =>
  $(id).addEventListener("change", () => { llenarActividades(); render(); }));
// Escribir la actividad reliquida, igual que un chip del RUT.
$("form").addEventListener("input", e => { if (e.target.matches("[data-actividad]")) render(); });

// Delegación: cualquier chip de código que cambie reliquida la cadena.
$("form").addEventListener("change", e => { if (e.target.matches("[data-code]")) render(); });
// Un hecho municipal tocado deja de tomar su valor por defecto: pasa a ser declarado.
$("form").addEventListener("change", e => {
  if (!e.target.matches("[data-hecho]")) return;
  declarados[e.target.dataset.party][e.target.dataset.hecho] = e.target.checked;
  render();
});
// El toggle % / $ fijo intercambia cuál de los dos controles de margen se ve.
$("margenModo").addEventListener("change", () => {
  const fijo = $("margenModo").value === "fijo";
  $("margenPct").hidden = fijo;
  $("margenFijo").hidden = !fijo;
  render();
});

// Montos en pesos: formatean con separador de miles (es-CO) mientras se escriben.
["contrato", "margenFijo"].forEach(id => $(id).addEventListener("input", e => {
  const el = e.target;
  const alFinal = el.selectionStart === el.value.length;
  const digitos = el.value.replace(/\D/g, "");
  el.value = digitos ? Number(digitos).toLocaleString("es-CO") : "";
  if (alFinal) el.selectionStart = el.selectionEnd = el.value.length; // cursor al final tras reformatear
  render();
}));

// Otros inputs simples (tarifas, margen en %, selects).
["concepto", "ivaRate", "icaTarifa", "margenPct"].forEach(id =>
  $(id).addEventListener($(id).tagName === "SELECT" ? "change" : "input", render));

render();

// El panel de verificación queda en pie hasta el paso 2 del spec: su trabajo ya
// lo hace `npm test`, con código de salida.
(function () {
  // Casos de cadena: una fila por línea afirmada, porque cada caso afirma
  // un conjunto distinto de cifras (los dos tramos más el reparto).
  const cad = runCadena();
  // Los casos afirman números, banderas y mensajes: sólo los números se formatean.
  const muestra = v =>
    typeof v === "number" ? fmt(v) : v === null ? "—" : String(v);
  let html = `<h3 style="font-size:.85rem;margin:0">Cadena de tres partes</h3>`;
  for (const c of cad) {
    html += `<table class="golden"><tr><th>${c.nombre}</th><th>Obtenido</th><th>Esperado</th><th>Estado</th></tr>`;
    for (const l of c.lineas) {
      const delta = typeof l.got === "number" && typeof l.exp === "number"
        ? `${l.d > 0 ? "+" : ""}${l.d}` : "distinto";
      html += `<tr><td>${l.n}</td><td>${muestra(l.got)}</td><td>${muestra(l.exp)}</td>` +
        `<td class="${l.d ? "fail" : "pass"}">${l.d ? `✗ ${delta}` : "✓"}</td></tr>`;
    }
    html += `</table>`;
  }

  $("tests").innerHTML = html;
  const fallas = cad.filter(c => c.estado === "fail");
  if (fallas.length) {
    $("tests").insertAdjacentHTML("afterbegin",
      `<div class="note">⚠ ${fallas.length} caso(s) fuera de tolerancia — las reglas fueron modificadas y ya no reproducen las cifras de referencia.</div>`);
    document.querySelector("details").open = true;
  }
})();
