"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  Box,
  Button,
  CircularProgress,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";

import GlassCard from "../ui/GlassCard";
import FilterChip from "../ui/FilterChip";
import KpiBento from "../ui/KpiBento";
import KpiCard from "../ui/KpiCard";
import Badge from "../ui/Badge";
import ElbowChart from "./ElbowChart";

import { runElbow, runCluster } from "@/lib/labApi";
import { runBatch, pollJob, fetchRun } from "@/lib/testingApi";

const ClusterMap = dynamic(() => import("./ClusterMap"), { ssr: false });

const FMT_MXN = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export default function ClusterStudio() {
  const [kRange, setKRange] = useState([2, 14]);
  const [elbow, setElbow] = useState(null);
  const [loadingElbow, setLoadingElbow] = useState(false);
  const [k, setK] = useState(8);
  const [cluster, setCluster] = useState(null);
  const [loadingCluster, setLoadingCluster] = useState(false);
  const [perSolver, setPerSolver] = useState("nn_2opt");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [resultRun, setResultRun] = useState(null);
  const [error, setError] = useState(null);

  async function onRunElbow() {
    setLoadingElbow(true);
    setError(null);
    try {
      const res = await runElbow({ kMin: kRange[0], kMax: kRange[1] });
      setElbow(res);
      if (res.knee_k) setK(res.knee_k);
    } catch (err) {
      setError(`Codo: ${err.message}`);
    } finally {
      setLoadingElbow(false);
    }
  }

  async function onRunCluster() {
    setLoadingCluster(true);
    setError(null);
    try {
      const res = await runCluster({ k });
      setCluster(res);
    } catch (err) {
      setError(`Cluster: ${err.message}`);
    } finally {
      setLoadingCluster(false);
    }
  }

  async function onRunSolver() {
    setRunning(true);
    setProgress(0);
    setError(null);
    setResultRun(null);
    try {
      const overrides = {
        cluster_then_solve: { k, per_cluster_solver: perSolver },
      };
      // Tras el run-batch existente con un sólo algoritmo
      const batch = await runBatch({
        algoritmos: ["cluster_then_solve"],
        configOverrides: overrides,
      });
      const jobId = batch.job_ids[0];
      const job = await pollJob(jobId, {
        intervalMs: 1500,
        onProgress: (p) => setProgress(p),
      });
      if (job.status !== "ok") throw new Error(job.error || "Job falló");
      const run = await fetchRun(job.run_id);
      setResultRun(run);
    } catch (err) {
      setError(`Solver: ${err.message}`);
    } finally {
      setRunning(false);
    }
  }

  const kpis = resultRun?.meta?.kpis;

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "stretch" }}>
        {/* 1) Estudio de codo */}
        <Box sx={{ flex: 1, minWidth: 0, display: "flex" }}>
          <GlassCard padding={14} sx={{ flex: 1, width: "100%" }}>
            <Stack spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 1,
                    color: "var(--text-secondary)",
                  }}
                >
                  1 · ESTUDIO DE CODO
                </Typography>
                <Badge tone="info">
                  k = {kRange[0]}…{kRange[1]}
                </Badge>
              </Stack>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ flexWrap: "wrap" }}
              >
                <Box sx={{ minWidth: 220, flex: 1 }}>
                  <Slider
                    value={kRange}
                    min={2}
                    max={20}
                    step={1}
                    onChange={(_, v) => setKRange(v)}
                    valueLabelDisplay="auto"
                    size="small"
                    sx={{ color: "var(--accent)" }}
                  />
                </Box>
                <Button
                  size="small"
                  variant="contained"
                  disabled={loadingElbow}
                  onClick={onRunElbow}
                  startIcon={
                    loadingElbow ? (
                      <CircularProgress size={14} />
                    ) : (
                      <PlayArrowIcon />
                    )
                  }
                  sx={{
                    background: "var(--accent)",
                    "&:hover": { background: "var(--accent-strong)" },
                  }}
                >
                  Estudiar
                </Button>
              </Stack>
              <ElbowChart
                data={elbow}
                selectedK={k}
                onSelectK={(newK) => setK(newK)}
              />
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography
                  sx={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 1,
                    color: "var(--text-secondary)",
                  }}
                >
                  2 · K-MEANS PREVIEW
                </Typography>
                <Badge tone="info">k = {k}</Badge>
                {cluster && (
                  <Badge tone="success">
                    {cluster.stores?.length || 0} tiendas
                  </Badge>
                )}
              </Stack>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ flexWrap: "wrap" }}
              >
                <TextField
                  size="small"
                  type="number"
                  label="k"
                  value={k}
                  onChange={(e) =>
                    setK(Math.max(2, Number(e.target.value) || 2))
                  }
                  sx={{ width: 90 }}
                  slotProps={{ htmlInput: { min: 2, max: 30 } }}
                />
                <Button
                  size="small"
                  variant="outlined"
                  disabled={loadingCluster}
                  onClick={onRunCluster}
                  startIcon={
                    loadingCluster ? (
                      <CircularProgress size={14} />
                    ) : (
                      <PlayArrowIcon />
                    )
                  }
                  sx={{
                    borderColor: "var(--glass-border)",
                    color: "var(--text-primary)",
                  }}
                >
                  Calcular clusters
                </Button>
              </Stack>
            </Stack>
          </GlassCard>
        </Box>

        {/* 2) Cluster preview */}
        <Box sx={{ flex: 2, minWidth: 0, display: "flex" }}>
          <GlassCard padding={14} sx={{ flex: 1, width: "100%" }}>
            <Stack spacing={1}>
              <ClusterMap
                stores={cluster?.stores || []}
                centroids={cluster?.centroids || []}
                cedis={cluster?.cedis}
                height={420}
              />
            </Stack>
          </GlassCard>
        </Box>
      </Stack>
      {/* 3) Resolver TSP por cluster */}
      <GlassCard padding={14}>
        <Stack spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1,
                color: "var(--text-secondary)",
              }}
            >
              3 · CLUSTER-FIRST · ROUTE-SECOND
            </Typography>
            <Badge tone="accent">Cluster-then-solve</Badge>
          </Stack>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ flexWrap: "wrap" }}
          >
            <Typography sx={{ fontSize: 11, color: "var(--text-muted)" }}>
              TSP por cluster:
            </Typography>
            <FilterChip
              label="NN + 2-opt"
              active={perSolver === "nn_2opt"}
              onClick={() => setPerSolver("nn_2opt")}
            />
            <FilterChip
              label="Gurobi MTZ"
              active={perSolver === "gurobi_tsp"}
              onClick={() => setPerSolver("gurobi_tsp")}
            />
            <Box sx={{ flex: 1 }} />
            <Button
              size="small"
              variant="contained"
              disabled={running}
              onClick={onRunSolver}
              startIcon={
                running ? <CircularProgress size={14} /> : <RocketLaunchIcon />
              }
              sx={{
                background: "var(--accent)",
                "&:hover": { background: "var(--accent-strong)" },
              }}
            >
              {running
                ? `Resolviendo… ${Math.round(progress * 100)}%`
                : "Ejecutar solver"}
            </Button>
          </Stack>

          {kpis && (
            <KpiBento>
              <KpiCard label="Rutas" value={kpis.n_rutas} />
              <KpiCard
                label="km"
                value={kpis.total_km}
                format={(v) => Math.round(v).toLocaleString("es-MX")}
              />
              <KpiCard
                label="Costo"
                value={kpis.total_costo}
                format={(v) => FMT_MXN.format(v)}
              />
              <KpiCard
                label="Ocup."
                value={(kpis.ocupacion_promedio || 0) * 100}
                format={(v) => `${v.toFixed(0)}%`}
              />
              <KpiCard label="Excede 8h" value={kpis.n_excede_8h} />
              <KpiCard
                label="Tiempo"
                value={kpis.runtime_sec}
                format={(v) => `${v.toFixed(1)}s`}
              />
            </KpiBento>
          )}
        </Stack>
      </GlassCard>

      {error && (
        <GlassCard padding={10} sx={{ borderColor: "var(--error)" }}>
          <Typography sx={{ fontSize: 11, color: "var(--error)" }}>
            ⚠ {error}
          </Typography>
        </GlassCard>
      )}
    </Stack>
  );
}
