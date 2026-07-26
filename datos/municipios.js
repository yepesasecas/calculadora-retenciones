// Municipios ReteICA. tarifaPorMil por defecto (depende de la actividad, editable).
// UVT 2026 = 52.374. Bogotá: servicios >= 4 UVT, compras >= 27 UVT.
export const MUNICIPIOS = [
  { id: "bogota", nombre: "Bogotá D.C.", tarifaPorMil: 9.66, baseServicio: 209496, baseCompra: 1414098 },
  { id: "otro",   nombre: "Otro (sin base mínima cargada)", tarifaPorMil: 9.66, baseServicio: 0, baseCompra: 0 },
];
