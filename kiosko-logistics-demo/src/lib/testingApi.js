'use client';

/**
 * Demo branch — every call resolves to bundled fixtures under /data/.
 * No Python server, no env vars, no real backend.
 */

const DEMO_NOTE =
  'Demo mode — the VRP solver runs in a Python sidecar in the live tool. ' +
  'This deploy bundles one pre-computed run instead.';

let _cachedRun = null;
async function loadDemoRun() {
  if (_cachedRun) return _cachedRun;
  const res = await fetch('/data/demo-run.json', { cache: 'force-cache' });
  if (!res.ok) throw new Error(`Could not load demo run: ${res.status}`);
  _cachedRun = await res.json();
  return _cachedRun;
}

function shapeRunListItem(run) {
  return {
    run_id: run.run_id,
    algorithm: run.algorithm,
    finished_at: '2026-05-15T12:00:00-06:00',
    kpis: run.result?.kpis ?? {},
    status: 'ok',
  };
}

export async function fetchAlgoritmos() {
  return {
    algoritmos: [
      { id: 'demo-sunburst', label: 'Demo Sunburst (bundled run)', kind: 'demo' },
    ],
  };
}

export async function fetchPlanMaestro() {
  return {
    id: 'demo-plan',
    name: 'Demo Master Plan',
    sheet: 'demo',
    rows: 0,
    note: DEMO_NOTE,
  };
}

export async function uploadPlanMaestro() {
  return _demo503();
}

export async function setPlanMaestroSheet() {
  return _demo503();
}

export async function fetchConfigs() {
  return { configs: [] };
}

export async function fetchConfig() {
  return _demo503();
}

export async function saveConfig() {
  return _demo503();
}

export async function updateConfig() {
  return _demo503();
}

export async function deleteConfigApi() {
  return _demo503();
}

export async function fetchRuns() {
  const run = await loadDemoRun();
  return { runs: [shapeRunListItem(run)] };
}

export async function fetchRun(_runId) {
  return loadDemoRun();
}

export async function fetchActiveRun() {
  return loadDemoRun();
}

export async function promoteRun() {
  return { ok: true, demo: true };
}

export async function deleteRun() {
  return _demo503();
}

export async function fetchDiagnostics() {
  return {
    sample_size: 100,
    strategy: 'demo',
    note: DEMO_NOTE,
    recommended_algorithm: 'demo-sunburst',
  };
}

export async function runBatch() {
  return _demo503();
}

export async function fetchJob() {
  return _demo503();
}

export function pollJob(_jobId) {
  return Promise.reject(
    Object.assign(new Error(DEMO_NOTE), { status: 503, demo: true }),
  );
}

function _demo503() {
  const err = new Error(DEMO_NOTE);
  err.status = 503;
  err.demo = true;
  throw err;
}
