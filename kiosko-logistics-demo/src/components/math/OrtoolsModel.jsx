'use client';

import MathPanel from './MathPanel';

const fmt = (v, digits = 2) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  return Number.isInteger(n) ? n.toString() : n.toFixed(digits);
};

export function buildOrtoolsBlocks(config) {
  const Q = fmt(config.DEFAULT_CAP_CAJAS ?? 720, 0);
  const maxStops = fmt(config.MAX_TIENDAS_RUTA ?? 15, 0);
  const diesel = fmt(config.PRECIO_DIESEL_MXN ?? 30);
  const rend = fmt(config.RENDIMIENTO_SOLVER_KML ?? 7);
  const wearKm = fmt(config.COSTO_DESGASTE_KM_MXN ?? 2.5);
  const chofer = fmt(config.COSTO_CHOFER_DIA_MXN ?? 650, 0);
  const maxArc = fmt(config.MAX_ARC_KM ?? 50, 0);
  const arcPen = fmt(config.ARC_PENALTY_FACTOR ?? 5, 0);
  const centroidF = fmt(config.CENTROID_DEV_FACTOR ?? 8, 0);
  const clusterF = fmt(config.CLUSTER_CROSS_PENALTY ?? 12, 0);

  const arcOn = !!config.ARC_PENALTY_ENABLED;
  const centOn = !!config.CENTROID_DEV_ENABLED;
  const clustOn = !!config.CLUSTER_CROSS_ENABLED;
  const wearOn = !!config.INCLUDE_WEAR_COST;
  const driverOn = !!config.INCLUDE_DRIVER_COST;

  // Coeficiente base de costo por km en MXN
  const baseCoef = wearOn
    ? `\\left(\\tfrac{${diesel}}{${rend}} + ${wearKm}\\right)`
    : `\\tfrac{${diesel}}{${rend}}`;

  return [
    {
      title: 'Conjuntos y parámetros',
      latex: `\\begin{aligned}
        V &= \\{0, 1, \\dots, n\\},\\ R = \\{1,\\dots,K\\} \\\\
        d_{ij} &: \\text{distancia (km) entre } i \\text{ y } j \\\\
        q_i &: \\text{demanda de la tienda } i \\quad (i \\ge 1) \\\\
        Q &= ${Q},\\ S_{\\max} = ${maxStops} \\\\
        \\text{cluster}(i) &: \\text{cluster geográfico de la tienda } i
      \\end{aligned}`,
    },
    {
      title: 'Variables de decisión',
      latex: `x_{ijr} \\in \\{0,1\\}: \\text{arco } i \\to j \\text{ asignado al vehículo } r \\in R`,
    },
    {
      title: 'Función objetivo (OR-Tools tuneado)',
      latex: `\\min \\sum_{r \\in R} \\Bigg[\\, ${baseCoef}\\,\\sum_{(i,j)} d_{ij}\\, x_{ijr} \\;+\\; \\Phi^{\\text{geo}}_r${driverOn ? ` \\;+\\; ${chofer}\\,\\mathbb{1}[\\text{ruta } r \\text{ activa}]` : ''}\\,\\Bigg]`,
      hint: `Φ_geo agrupa las penalizaciones blandas (arco largo, dispersión, cruce de cluster). El factor por km es (diesel/rendimiento${wearOn ? ' + desgaste' : ''}) MXN/km.`,
    },
    {
      title: 'Penalización por arco largo',
      disabled: !arcOn,
      latex: `\\hat{c}_{ij} = \\begin{cases} ${arcPen}\\cdot c_{ij} & \\text{si } d_{ij} > ${maxArc}\\ \\text{km} \\\\ c_{ij} & \\text{en otro caso} \\end{cases}`,
      hint: `Arcos > ${maxArc} km cuestan ${arcPen}× su valor base.`,
    },
    {
      title: 'Penalización por dispersión del centroide',
      disabled: !centOn,
      latex: `\\phi^{\\text{cent}}_j = ${centroidF}\\cdot \\rho \\cdot \\| (\\text{lat}_j, \\text{lng}_j) - \\overline{c}_{\\,\\text{cluster}(j)} \\|`,
      hint: `Cada tienda j paga un costo extra proporcional a su distancia al centroide de su cluster (×${centroidF}).`,
    },
    {
      title: 'Penalización por cruce de cluster',
      disabled: !clustOn,
      latex: `\\tilde{c}_{ij} = \\begin{cases} ${clusterF}\\cdot \\hat{c}_{ij} & \\text{si } \\text{cluster}(i) \\neq \\text{cluster}(j) \\\\ \\hat{c}_{ij} & \\text{si están en el mismo cluster} \\end{cases}`,
      hint: `Arcos que cruzan clusters cuestan ${clusterF}× su valor.`,
    },
    {
      title: 'Restricción de capacidad',
      latex: `\\sum_{i \\ge 1} q_i \\sum_{j \\neq i} x_{ijr} \\le ${Q} \\qquad \\forall r \\in R`,
    },
    {
      title: 'Cota de tiendas por ruta',
      latex: `\\sum_{(i,j),\\ j \\ge 1} x_{ijr} \\le ${maxStops} \\qquad \\forall r \\in R`,
    },
    {
      title: 'Cobertura única de tiendas',
      latex: `\\sum_{r \\in R} \\sum_{j \\neq i} x_{ijr} = 1 \\qquad \\forall i \\in V\\setminus\\{0\\}`,
    },
  ];
}

export default function OrtoolsModel({ config }) {
  return <MathPanel blocks={buildOrtoolsBlocks(config)} />;
}
