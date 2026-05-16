'use client';

import MathPanel from './MathPanel';

const fmt = (v, digits = 2) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  return Number.isInteger(n) ? n.toString() : n.toFixed(digits);
};

export function buildGurobiBlocks(config) {
  const Q = fmt(config.DEFAULT_CAP_CAJAS ?? 720, 0);
  const diesel = fmt(config.PRECIO_DIESEL_MXN ?? 30);
  const rend = fmt(config.RENDIMIENTO_SOLVER_KML ?? 7);
  const wearKm = fmt(config.COSTO_DESGASTE_KM_MXN ?? 2.5);
  const chofer = fmt(config.COSTO_CHOFER_DIA_MXN ?? 650, 0);

  const includeWear = !!config.INCLUDE_WEAR_COST;
  const includeDriver = !!config.INCLUDE_DRIVER_COST;

  const objTerms = [`\\underbrace{\\tfrac{${diesel}}{${rend}}}_{\\text{combustible MXN/km}}`];
  if (includeWear) objTerms.push(`\\underbrace{${wearKm}}_{\\text{desgaste}}`);
  const coef = `\\left(${objTerms.join(' + ')}\\right) \\cdot d_{ij}`;
  const driverTerm = includeDriver
    ? ` \\;+\\; ${chofer}\\sum_{j \\in V\\setminus\\{0\\}} x_{0j}`
    : '';

  return [
    {
      title: 'Conjuntos y parámetros',
      latex: `\\begin{aligned}
        V &= \\{0, 1, \\dots, n\\} \\quad (0 = \\text{CEDIS}) \\\\
        d_{ij} &\\in \\mathbb{R}_{\\ge 0}: \\text{ distancia en km de } i \\to j \\\\
        q_i &\\in \\mathbb{Z}_{\\ge 0}: \\text{ demanda de la tienda } i \\\\
        Q &= ${Q} \\;\\text{(capacidad por vehículo, cajas)}
      \\end{aligned}`,
    },
    {
      title: 'Variables de decisión',
      latex: `\\begin{aligned}
        x_{ij} &\\in \\{0,1\\}: \\text{arco } i \\to j \\text{ utilizado} \\\\
        u_i &\\in [q_i,\\, Q]: \\text{carga acumulada al llegar a } i
      \\end{aligned}`,
    },
    {
      title: 'Función objetivo',
      latex: `\\min \\sum_{i \\in V} \\sum_{\\substack{j \\in V \\\\ j \\neq i}} ${coef}\\, x_{ij}${driverTerm}`,
      hint: 'El objetivo de Gurobi minimiza el costo total de los arcos usados; el costo del chofer es un cargo fijo por ruta abierta.',
    },
    {
      title: 'Grado de cada cliente (entrada y salida únicas)',
      latex: `\\sum_{j \\neq i} x_{ij} = 1, \\quad \\sum_{j \\neq i} x_{ji} = 1 \\qquad \\forall i \\in V\\setminus\\{0\\}`,
    },
    {
      title: 'Balance del depósito',
      latex: `\\sum_{j=1}^{n} x_{0j} = \\sum_{j=1}^{n} x_{j0} \\le K_{\\max}`,
      hint: 'K_max es la cota de rutas (≈ ⌈Σq/Q⌉ + 1).',
    },
    {
      title: 'Restricción de capacidad (MTZ-CVRP)',
      latex: `u_j \\ge u_i + q_j - Q\\,(1 - x_{ij}) \\qquad \\forall\\, i \\in V,\\, j \\in V\\setminus\\{0\\},\\, i \\neq j`,
      hint: 'Acopla orden de visita y carga acumulada: elimina subtours y enforza Q simultáneamente.',
    },
    {
      title: 'Cotas de la variable de carga',
      latex: `q_i \\le u_i \\le ${Q} \\qquad \\forall i \\in V\\setminus\\{0\\}`,
    },
  ];
}

export default function GurobiCvrpModel({ config }) {
  return <MathPanel blocks={buildGurobiBlocks(config)} />;
}
