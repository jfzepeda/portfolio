'use client';

/**
 * Demo branch — lab endpoints return canned data so the dashboard renders
 * without spinning up the Python lab pipeline.
 */

const DEMO_NOTE =
  'Demo mode — the lab pipeline (clustering, sweeps, Pareto) runs in a Python ' +
  'sidecar in the live tool. Here we ship one bundled experiment.';

function _demo503() {
  const err = new Error(DEMO_NOTE);
  err.status = 503;
  err.demo = true;
  throw err;
}

export async function runElbow({ kMin = 2, kMax = 15 } = {}) {
  const ks = [];
  for (let k = kMin; k <= kMax; k++) ks.push(k);
  const inertias = ks.map((k) => Math.round(50000 / k + 6500));
  return { ks, inertias, demo: true, note: DEMO_NOTE };
}

export async function runCluster({ k = 6, seed = 42 } = {}) {
  return {
    k,
    seed,
    clusters: Array.from({ length: k }, (_, i) => ({
      id: i,
      size: 40 + ((i * 7) % 18),
      centroid_lat: 19.30 + i * 0.02,
      centroid_lng: -103.65 + i * 0.015,
    })),
    silhouette: 0.42,
    demo: true,
    note: DEMO_NOTE,
  };
}

export async function runSweep() {
  return _demo503();
}

export async function fetchPareto() {
  return {
    points: Array.from({ length: 12 }, (_, i) => ({
      run_id: `demo-${i + 1}`,
      total_km: 2200 + i * 80,
      total_costo: 28000 + i * 1200,
      n_rutas: 6 + (i % 4),
    })),
    demo: true,
    note: DEMO_NOTE,
  };
}

export async function listExperiments() {
  return {
    experiments: [
      {
        id: 'demo-exp-001',
        nombre: 'Bundled demo experiment',
        kind: 'demo',
        created_at: '2026-05-15T12:00:00-06:00',
        n_runs: 1,
      },
    ],
    demo: true,
  };
}

export async function getExperiment(expId) {
  return {
    id: expId,
    nombre: 'Bundled demo experiment',
    kind: 'demo',
    runs: ['demo-run-0001'],
    notes: DEMO_NOTE,
  };
}

export async function createExperiment() {
  return _demo503();
}

export async function patchExperiment() {
  return _demo503();
}

export async function deleteExperiment() {
  return _demo503();
}
