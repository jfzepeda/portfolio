"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  MenuItem,
  Paper,
  Slider,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import { SERVER_URL } from "@/lib/serverUrl";
import { buildRoutePackingPdf, buildStoresZip, downloadBlob } from "@/lib/pdf/buildRoutePackingPdf";
import { groupPackingByRoute } from "@/lib/groupPackingByRoute";
import { fetchActiveRun } from "@/lib/testingApi";
import GlassCard from "./ui/GlassCard";
import RouteRow from "./ui/RouteRow";
import Badge from "./ui/Badge";

const BOX_WIDTH = 220;
const BOX_HEIGHT = 152;
const BOX_PAD = 28;
const BOX_TITLE = 20;
const BOX_FILL = 14;
const BOX_SLOT = BOX_TITLE + BOX_HEIGHT + BOX_FILL;
const BOX_INNER = 7;
const LAYER_OFFSET_X = 6;
const LAYER_OFFSET_Y = 4;
const MAX_BOXES_RENDER = 300;

function roundRect(ctx, x, y, width, height, radius) {
  if (width <= 0 || height <= 0) return;
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.arcTo(x + width, y, x + width, y + r, r);
  ctx.lineTo(x + width, y + height - r);
  ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
  ctx.lineTo(x + r, y + height);
  ctx.arcTo(x, y + height, x, y + height - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function darkenHex(hex, factor) {
  const clean = hex.replace("#", "");
  const r = Math.max(
    0,
    Math.min(255, Math.round(parseInt(clean.slice(0, 2), 16) * factor))
  );
  const g = Math.max(
    0,
    Math.min(255, Math.round(parseInt(clean.slice(2, 4), 16) * factor))
  );
  const b = Math.max(
    0,
    Math.min(255, Math.round(parseInt(clean.slice(4, 6), 16) * factor))
  );
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function luminance(hex) {
  const clean = hex.replace("#", "");
  return (
    0.299 * parseInt(clean.slice(0, 2), 16) +
    0.587 * parseInt(clean.slice(2, 4), 16) +
    0.114 * parseInt(clean.slice(4, 6), 16)
  );
}

function textColorFor(hex) {
  return luminance(hex) > 140 ? "#1a1a1a" : "#f1f1f1";
}

export default function VolumeDashboard() {
  const [file, setFile] = useState(null);
  const [boxDims, setBoxDims] = useState({ l: 40, w: 40, h: 40 });
  const [maxWaste, setMaxWaste] = useState(5);
  const [result, setResult] = useState(null);
  const [selectedShipment, setSelectedShipment] = useState("");
  const [activeRun, setActiveRun] = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [speed, setSpeed] = useState(50);
  const [status, setStatus] = useState({
    type: "info",
    message: "Sube un archivo CSV o Excel y presiona Empacar.",
  });
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [renderMeta, setRenderMeta] = useState({
    totalItems: 0,
    visibleBoxes: 0,
  });

  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const regionsRef = useRef({});
  const fillRef = useRef({});
  const capacityRef = useRef({});
  const placementsRef = useRef([]);
  const boxesRef = useRef([]);
  const stepRef = useRef(0);
  const runningRef = useRef(false);

  // Cargar run activo al montar (para obtener la lista de rutas).
  useEffect(() => {
    let alive = true;
    fetchActiveRun()
      .then((r) => { if (alive) setActiveRun(r); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  // Agrupa el packing por ruta del run activo (join id_tienda → ruta_id).
  const routeGroups = useMemo(() => {
    if (!activeRun || !result) return [];
    return groupPackingByRoute(activeRun.result, result);
  }, [activeRun, result]);

  const realRouteGroups = useMemo(
    () => routeGroups.filter((g) => g.routeId !== "_sin_ruta" && g.shipments.length),
    [routeGroups],
  );

  // Lookup id_tienda → nombre legible desde el run activo (legacy_vrp_output).
  const storeNames = useMemo(() => {
    const map = new Map();
    const legacyRutas = activeRun?.result?.legacy_vrp_output?.rutas || [];
    for (const r of legacyRutas) {
      for (const t of r.tiendas || []) {
        const id = String(t.id_tienda);
        if (t.nombre) map.set(id, t.nombre);
      }
    }
    return map;
  }, [activeRun]);

  const shipments = useMemo(() => {
    if (!result) return [];
    if (selectedRouteId) {
      const group = routeGroups.find((g) => g.routeId === selectedRouteId);
      return group?.shipments || [];
    }
    if (selectedShipment) {
      return result.shipments.filter((s) => s.id_tienda === selectedShipment);
    }
    return result.shipments;
  }, [result, selectedShipment, selectedRouteId, routeGroups]);

  const drawFillLabel = useCallback((ctx, boxId, x0, y0, fillVolume) => {
    const pct =
      capacityRef.current[boxId] > 0
        ? (fillVolume / capacityRef.current[boxId]) * 100
        : 0;
    const y = y0 + BOX_TITLE + BOX_HEIGHT + 1;
    ctx.fillStyle = "#1b1c1e";
    ctx.fillRect(x0 + BOX_WIDTH - 52, y, 52, BOX_FILL);
    ctx.fillStyle = "#8a8d93";
    ctx.font = "9px Helvetica";
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText(`${pct.toFixed(1)}%`, x0 + BOX_WIDTH - 2, y + 2);
  }, []);

  const drawEmptyBox = useCallback(
    (ctx, box, x0, y0) => {
      ctx.fillStyle = "#141517";
      roundRect(ctx, x0 + 3, y0 + BOX_TITLE + 4, BOX_WIDTH + 3, BOX_HEIGHT, 12);
      ctx.fill();

      ctx.fillStyle = "#2d2f33";
      ctx.strokeStyle = "#4a4d52";
      ctx.lineWidth = 1;
      roundRect(ctx, x0, y0 + BOX_TITLE, BOX_WIDTH, BOX_HEIGHT, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#33363b";
      roundRect(
        ctx,
        x0 + 6,
        y0 + BOX_TITLE + 6,
        BOX_WIDTH - 12,
        BOX_HEIGHT - 12,
        8
      );
      ctx.fill();

      ctx.fillStyle = box.kind === "homogeneous" ? "#c9c9c9" : "#b8a98f";
      ctx.font = "bold 10px Helvetica";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(
        `Caja ${box.box_id} · ${
          box.kind === "homogeneous" ? "homogénea" : "mixta"
        }`,
        x0 + 2,
        y0 + 3
      );

      drawFillLabel(ctx, box.box_id, x0, y0, 0);
    },
    [drawFillLabel]
  );

  const drawItem = useCallback(
    (ctx, placement) => {
      const region = regionsRef.current[placement.box_id];
      if (!region) return;

      const { x0, y0, scaleX, scaleY } = region;
      const layerIndex = placement.layer_idx || 0;

      const px =
        x0 + BOX_INNER + placement.x * scaleX + layerIndex * LAYER_OFFSET_X;
      const py =
        y0 +
        BOX_TITLE +
        BOX_INNER +
        placement.y * scaleY -
        layerIndex * LAYER_OFFSET_Y;
      const pw = Math.max(5, placement.length * scaleX);
      const ph = Math.max(5, placement.width * scaleY);

      const clipX = x0 + BOX_INNER;
      const clipY = y0 + BOX_TITLE + BOX_INNER;

      ctx.save();
      ctx.beginPath();
      ctx.rect(
        clipX,
        clipY,
        BOX_WIDTH - 2 * BOX_INNER,
        BOX_HEIGHT - 2 * BOX_INNER
      );
      ctx.clip();

      ctx.fillStyle = placement.color;
      roundRect(ctx, px, py, pw, ph, 3);
      ctx.fill();

      ctx.strokeStyle = darkenHex(placement.color, 0.68);
      ctx.lineWidth = 0.8;
      ctx.stroke();

      if (pw > 32 && ph > 12) {
        ctx.fillStyle = textColorFor(placement.color);
        ctx.font = "bold 7px Helvetica";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          placement.product_name.slice(0, 9),
          px + pw / 2,
          py + ph / 2
        );
      }
      ctx.restore();

      fillRef.current[placement.box_id] =
        (fillRef.current[placement.box_id] || 0) +
        placement.length * placement.width * placement.height;
      drawFillLabel(
        ctx,
        placement.box_id,
        x0,
        y0,
        fillRef.current[placement.box_id]
      );
    },
    [drawFillLabel]
  );

  const updateProgress = useCallback(() => {
    setCurrentStep(stepRef.current);
    setRenderMeta({
      totalItems: placementsRef.current.length,
      visibleBoxes: boxesRef.current.length,
    });
  }, []);

  const stopAnimation = useCallback(() => {
    runningRef.current = false;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const initCanvas = useCallback(
    (filteredShipments) => {
      const canvas = canvasRef.current;
      if (!canvas || !result) return;

      const ctx = canvas.getContext("2d");
      regionsRef.current = {};
      fillRef.current = {};
      capacityRef.current = {};
      placementsRef.current = [];
      boxesRef.current = [];
      stepRef.current = 0;
      stopAnimation();

      for (const shipment of filteredShipments) {
        for (const box of shipment.boxes) {
          boxesRef.current.push({ ...box, id_tienda: shipment.id_tienda });
          if (boxesRef.current.length >= MAX_BOXES_RENDER) break;
        }
        if (boxesRef.current.length >= MAX_BOXES_RENDER) break;
      }

      const count = boxesRef.current.length;
      const cols = Math.max(1, Math.ceil(Math.sqrt(count || 1)));
      const rows = Math.ceil((count || 1) / cols);

      canvas.width = cols * (BOX_WIDTH + BOX_PAD) + BOX_PAD;
      canvas.height = rows * (BOX_SLOT + BOX_PAD) + BOX_PAD;

      ctx.fillStyle = "#1b1c1e";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const dims = result.meta.box_dims;

      boxesRef.current.forEach((box, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        const x0 = BOX_PAD + col * (BOX_WIDTH + BOX_PAD);
        const y0 = BOX_PAD + row * (BOX_SLOT + BOX_PAD);

        regionsRef.current[box.box_id] = {
          x0,
          y0,
          scaleX: (BOX_WIDTH - 2 * BOX_INNER) / dims[0],
          scaleY: (BOX_HEIGHT - 2 * BOX_INNER) / dims[1],
        };
        capacityRef.current[box.box_id] = dims[0] * dims[1] * dims[2];
        fillRef.current[box.box_id] = 0;
        drawEmptyBox(ctx, box, x0, y0);

        box.placements.forEach((placement) => {
          placementsRef.current.push(placement);
        });
      });

      placementsRef.current.sort(
        (a, b) => a.box_id - b.box_id || a.z - b.z || a.y - b.y || a.x - b.x
      );
      updateProgress();
    },
    [drawEmptyBox, result, stopAnimation, updateProgress]
  );

  const resetAnimation = useCallback(() => {
    initCanvas(shipments);
  }, [initCanvas, shipments]);

  const getBatchSize = useCallback(() => {
    const total = placementsRef.current.length;
    if (total > 2000) return 50;
    if (total > 1000) return 20;
    if (total > 500) return 10;
    if (total > 200) return 5;
    return 1;
  }, []);

  const stepAnimation = useCallback(() => {
    if (!runningRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const batchSize =
      speed === 0 ? placementsRef.current.length : getBatchSize();

    for (
      let i = 0;
      i < batchSize && stepRef.current < placementsRef.current.length;
      i += 1
    ) {
      drawItem(ctx, placementsRef.current[stepRef.current]);
      stepRef.current += 1;
    }

    updateProgress();

    if (stepRef.current >= placementsRef.current.length) {
      runningRef.current = false;
      animationRef.current = null;
      return;
    }

    if (speed === 0) {
      animationRef.current = requestAnimationFrame(stepAnimation);
      return;
    }

    animationRef.current = setTimeout(() => {
      requestAnimationFrame(stepAnimation);
    }, speed);
  }, [drawItem, getBatchSize, speed, updateProgress]);

  const startAnimation = useCallback(() => {
    if (!placementsRef.current.length || runningRef.current) return;
    if (stepRef.current >= placementsRef.current.length) {
      resetAnimation();
    }
    runningRef.current = true;
    requestAnimationFrame(stepAnimation);
  }, [resetAnimation, stepAnimation]);

  const skipToEnd = useCallback(() => {
    stopAnimation();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    while (stepRef.current < placementsRef.current.length) {
      drawItem(ctx, placementsRef.current[stepRef.current]);
      stepRef.current += 1;
    }
    updateProgress();
  }, [drawItem, stopAnimation, updateProgress]);

  useEffect(() => {
    if (!result) return;
    initCanvas(shipments);
    return () => {
      stopAnimation();
    };
  }, [initCanvas, result, shipments, stopAnimation]);

  const handlePack = useCallback(async () => {
    if (!file) {
      setStatus({
        type: "error",
        message:
          "Selecciona un archivo CSV o Excel antes de ejecutar el empaque.",
      });
      return;
    }

    setRunning(true);
    setStatus({
      type: "info",
      message: "Calculando empaque… esto puede tardar unos segundos.",
    });

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "box_dims_json",
        JSON.stringify([boxDims.l, boxDims.w, boxDims.h])
      );
      formData.append("max_waste_pct", String(maxWaste));

      const response = await fetch(`${SERVER_URL}/pack`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (data.error) {
        setStatus({ type: "error", message: data.error });
        return;
      }

      setResult(data.result);
      setSelectedShipment("");
      setStatus({
        type: "success",
        message: `${data.result.summary.total_shipments} cargamentos · ${data.result.summary.total_boxes} cajas · ${data.result.summary.avg_fill_pct}% de llenado`,
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: `Error de conexión: ${error.message}`,
      });
    } finally {
      setRunning(false);
    }
  }, [boxDims.h, boxDims.l, boxDims.w, file, maxWaste]);

  const downloadResult = useCallback(() => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "packing_resultado.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [result]);

  const [pdfBusy, setPdfBusy] = useState(false);

  const exportByRoute = useCallback(async () => {
    if (!result) return;
    setPdfBusy(true);
    try {
      let groups = realRouteGroups;
      if (!groups.length && activeRun?.result) {
        groups = groupPackingByRoute(activeRun.result, result).filter(
          (g) => g.routeId !== "_sin_ruta" && g.shipments.length,
        );
      }
      if (!groups.length) {
        setStatus({
          type: "error",
          message:
            "Ninguna tienda del packing coincide con rutas del run activo. Verifica que el CSV tenga `id_tienda` que existan en el run.",
        });
        return;
      }
      // Prefiere la ruta seleccionada en el sidebar; cae al primero si no hay.
      const target =
        groups.find((g) => g.routeId === selectedRouteId) || groups[0];
      const blob = await buildRoutePackingPdf({
        ruta: target.routeId,
        shipments: target.shipments,
      });
      downloadBlob(blob, `armado_ruta_${target.routeId}.pdf`);
      setStatus({
        type: "success",
        message: `PDF: ruta ${target.routeId} con ${target.shipments.length} tiendas.`,
      });
    } catch (err) {
      setStatus({ type: "error", message: `Error: ${err.message}` });
    } finally {
      setPdfBusy(false);
    }
  }, [result, activeRun, realRouteGroups, selectedRouteId]);

  const exportPdf = useCallback(async () => {
    if (!result) return;
    const target =
      selectedShipment
        ? result.shipments.find((s) => s.id_tienda === selectedShipment)
        : result.shipments[0];
    if (!target) {
      setStatus({ type: "error", message: "No hay tienda seleccionada para exportar." });
      return;
    }
    setPdfBusy(true);
    try {
      const nombre = storeNames.get(String(target.id_tienda));
      const blob = await buildRoutePackingPdf({
        ruta: target.id_tienda,
        shipments: target,
        storeName: nombre,
      });
      downloadBlob(blob, `armado_tienda_${target.id_tienda}.pdf`);
    } catch (err) {
      setStatus({ type: "error", message: `Error generando PDF: ${err.message}` });
    } finally {
      setPdfBusy(false);
    }
  }, [result, selectedShipment, storeNames]);

  const exportStoresZip = useCallback(async () => {
    if (!result) return;
    let groups = realRouteGroups;
    if (!groups.length && activeRun?.result) {
      groups = groupPackingByRoute(activeRun.result, result).filter(
        (g) => g.routeId !== "_sin_ruta" && g.shipments.length,
      );
    }
    if (!groups.length) {
      setStatus({
        type: "error",
        message:
          "Ninguna tienda del packing coincide con rutas del run activo. Verifica que el CSV tenga `id_tienda` que existan en el run.",
      });
      return;
    }
    const target =
      groups.find((g) => g.routeId === selectedRouteId) || groups[0];
    setPdfBusy(true);
    setStatus({
      type: "info",
      message: `Generando ${target.shipments.length} PDFs de la ruta ${target.routeId}…`,
    });
    try {
      const zipBlob = await buildStoresZip({
        ruta: target.routeId,
        shipments: target.shipments,
        storeNames,
        onProgress: (done, total) => {
          setStatus({
            type: "info",
            message: `Generando PDFs… ${done}/${total} (ruta ${target.routeId})`,
          });
        },
      });
      downloadBlob(zipBlob, `armado_ruta_${target.routeId}_por_tienda.zip`);
      setStatus({
        type: "success",
        message: `ZIP listo: ${target.shipments.length} PDFs de la ruta ${target.routeId}.`,
      });
    } catch (err) {
      setStatus({ type: "error", message: `Error generando ZIP: ${err.message}` });
    } finally {
      setPdfBusy(false);
    }
  }, [result, activeRun, realRouteGroups, selectedRouteId, storeNames]);

  return (
    <Box
      sx={{
        height: "100%",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "280px 1fr" },
        gridTemplateRows: { xs: "auto 1fr", md: "1fr" },
        gap: 1.2,
        minHeight: 0,
      }}
    >
      {/* Sidebar: rutas del run activo (cada una con su packing) */}
      <GlassCard
        padding={0}
        sx={{ display: "flex", flexDirection: "column", overflow: "hidden", minHeight: 0 }}
      >
        <Box sx={{ p: "12px 14px 6px", display: "flex", alignItems: "center", gap: 1 }}>
          <Typography
            sx={{ flex: 1, fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.06em", color: "var(--text-muted)" }}
          >
            Rutas del run activo
          </Typography>
          {activeRun?.meta?.algoritmo && (
            <Badge tone="accent">{activeRun.meta.algoritmo}</Badge>
          )}
        </Box>
        <Box sx={{ flex: 1, overflowY: "auto", p: "6px 14px 12px", display: "grid", gap: 0.5 }}>
          {!activeRun && (
            <Typography sx={{ fontSize: 11, color: "var(--text-subtle)", textAlign: "center", py: 2 }}>
              Sin run activo. Promueve uno desde Testing.
            </Typography>
          )}
          {activeRun && !result && (
            <Typography sx={{ fontSize: 11, color: "var(--text-subtle)", textAlign: "center", py: 2 }}>
              Sube un CSV con productos y presiona Empacar para ver el packing por ruta.
            </Typography>
          )}
          {activeRun && result && realRouteGroups.length === 0 && (
            <Typography sx={{ fontSize: 11, color: "var(--text-subtle)", textAlign: "center", py: 2 }}>
              El CSV no tiene `id_tienda` que coincidan con el run activo.
            </Typography>
          )}
          {selectedRouteId && (
            <RouteRow
              routeId="Toda la operación"
              truck="reset filtro"
              selected={!selectedRouteId}
              onClick={() => { setSelectedRouteId(""); setSelectedShipment(""); }}
            />
          )}
          {realRouteGroups.map((g) => {
            const route = activeRun.result.routes.find((r) => r.route_id === g.routeId);
            return (
              <RouteRow
                key={g.routeId}
                routeId={g.routeId}
                truck={route?.truck_id || ""}
                km={Math.round(route?.total_km || 0)}
                ocupacion={Math.round(g.avgFill || 0)}
                badges={[{ label: `${g.totalBoxes} cajas`, tone: "neutral" }]}
                selected={selectedRouteId === g.routeId}
                onClick={() => {
                  setSelectedRouteId((prev) => (prev === g.routeId ? "" : g.routeId));
                  setSelectedShipment("");
                }}
              />
            );
          })}
        </Box>
      </GlassCard>

      {/* Main: contenido original (upload + canvas + controles) */}
      <Box
        sx={{
          display: "grid",
          gridTemplateRows: "auto auto 1fr",
          gap: 1.2,
          minHeight: 0,
        }}
      >
      <Paper
        sx={{
          p: 2,
          borderRadius: 3,
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
          gap: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 16,
              fontWeight: 800,
              color: "#1c1917",
              mb: 0.4,
              letterSpacing: "-0.02em",
            }}
          >
            Visualizador de empaque
          </Typography>
          <Typography sx={{ fontSize: 12, color: "#78716c", mb: 2 }}>
            Usa el backend Python para agrupar por tienda, calcular cajas y
            renderizar el empaque por capas.
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.3fr 1fr 1fr" },
              gap: 1.2,
            }}
          >
            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadFileIcon />}
              sx={{
                justifyContent: "flex-start",
                borderColor: "rgba(0,0,0,0.12)",
                color: "#44403c",
                py: 1.2,
                px: 1.4,
                borderRadius: 2.5,
              }}
            >
              {file ? file.name : "Seleccionar CSV o Excel"}
              <input
                hidden
                type="file"
                accept=".csv,.xlsx"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
              />
            </Button>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 0.8,
              }}
            >
              {[
                ["Largo", "l"],
                ["Ancho", "w"],
                ["Alto", "h"],
              ].map(([label, key]) => (
                <TextField
                  key={key}
                  label={label}
                  type="number"
                  size="small"
                  value={boxDims[key]}
                  onChange={(event) => {
                    const value = Number(event.target.value) || 0;
                    setBoxDims((prev) => ({ ...prev, [key]: value }));
                  }}
                />
              ))}
            </Box>

            <TextField
              label="Merma máxima (%)"
              type="number"
              size="small"
              value={maxWaste}
              onChange={(event) => setMaxWaste(Number(event.target.value) || 0)}
            />
          </Box>
        </Box>

        <Box
          sx={{
            p: 1.6,
            borderRadius: 3,
            background: "#faf7f2",
            border: "1px solid rgba(217,119,6,0.14)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 1.2,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 700,
                color: "#b45309",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Ejecución
            </Typography>
            <Typography
              sx={{ fontSize: 13, color: "#44403c", mt: 0.6, lineHeight: 1.45 }}
            >
              Corre el motor de packing y actualiza el canvas sin salir de la
              app Next.
            </Typography>
          </Box>

          <Button
            variant="contained"
            disabled={running}
            onClick={handlePack}
            startIcon={<Inventory2Icon />}
            sx={{
              background: "#d97706",
              borderRadius: 2.5,
              py: 1.1,
              fontWeight: 800,
              "&:hover": { background: "#b45309" },
            }}
          >
            {running ? "Empacando…" : "Empacar"}
          </Button>
        </Box>
      </Paper>

      <Paper
        sx={{
          p: 1.6,
          borderRadius: 3,
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", xl: "auto auto 1fr auto" },
          gap: 1.2,
          alignItems: "center",
        }}
      >
        <Alert severity={status.type} sx={{ py: 0, alignItems: "center" }}>
          {status.message}
        </Alert>

        <TextField
          select
          size="small"
          label="Cargamento"
          value={selectedShipment}
          onChange={(event) => setSelectedShipment(event.target.value)}
          sx={{ minWidth: 220 }}
          disabled={!result}
        >
          <MenuItem value="">Todos los cargamentos</MenuItem>
          {(result?.shipments || []).map((shipment) => (
            <MenuItem key={shipment.id_tienda} value={shipment.id_tienda}>
              {shipment.id_tienda} ({shipment.num_boxes} cajas)
            </MenuItem>
          ))}
        </TextField>

        <Box sx={{ px: 1.5 }}>
          <Typography
            sx={{
              fontSize: 10,
              color: "#78716c",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              mb: 0.3,
            }}
          >
            Velocidad de animación
          </Typography>
          <Slider
            value={speed}
            min={0}
            max={200}
            step={10}
            onChange={(_, value) => setSpeed(value)}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => (value === 0 ? "∞" : `${value}ms`)}
            sx={{ color: "#d97706", maxWidth: 240 }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.8,
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <Button
            variant="outlined"
            startIcon={<PlayArrowIcon />}
            onClick={startAnimation}
            disabled={!result}
          >
            Animar
          </Button>
          <Button
            variant="outlined"
            startIcon={<SkipNextIcon />}
            onClick={skipToEnd}
            disabled={!result}
          >
            Completar
          </Button>
          <Button
            variant="outlined"
            startIcon={<RestartAltIcon />}
            onClick={resetAnimation}
            disabled={!result}
          >
            Reiniciar
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={downloadResult}
            disabled={!result}
            size="small"
          >
            JSON
          </Button>
          <Button
            variant="contained"
            startIcon={
              pdfBusy ? <CircularProgress size={14} color="inherit" /> : <PictureAsPdfIcon />
            }
            onClick={exportPdf}
            disabled={!result || pdfBusy}
            size="small"
          >
            {pdfBusy ? "Generando..." : "Exportar PDF"}
          </Button>
          <Button
            variant="outlined"
            startIcon={<PictureAsPdfIcon />}
            onClick={exportByRoute}
            disabled={!result || pdfBusy}
            size="small"
          >
            Por ruta (run activo)
          </Button>
          <Tooltip
            title="Genera un PDF por cada tienda de la ruta seleccionada y los descarga en un ZIP"
            arrow
          >
            <span>
              <Button
                variant="outlined"
                startIcon={
                  pdfBusy ? <CircularProgress size={14} color="inherit" /> : <PictureAsPdfIcon />
                }
                onClick={exportStoresZip}
                disabled={!result || pdfBusy}
                size="small"
              >
                ZIP por tienda
              </Button>
            </span>
          </Tooltip>
        </Box>

        {result && (
          <Box
            sx={{
              gridColumn: "1 / -1",
              display: "flex",
              gap: 0.8,
              flexWrap: "wrap",
            }}
          >
            <Chip label={`${result.summary.total_shipments} cargamentos`} />
            <Chip
              label={`${result.summary.total_boxes} cajas`}
              color="warning"
              variant="outlined"
            />
            <Chip label={`${result.summary.total_items} items`} />
            <Chip label={`${result.summary.avg_fill_pct}% llenado`} />
            <Chip
              label={`${currentStep} / ${renderMeta.totalItems} items · ${renderMeta.visibleBoxes} cajas`}
              sx={{
                background: "#eff6ff",
                color: "#1d4ed8",
                border: "1px solid #bfdbfe",
              }}
            />
          </Box>
        )}
      </Paper>

      <Paper
        sx={{
          minHeight: 0,
          overflow: "hidden",
          borderRadius: 3,
          border: "1px solid #2d2f33",
          background: "#1b1c1e",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          display: "grid",
          gridTemplateRows: "auto 1fr",
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.2,
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <Typography sx={{ fontSize: 12, color: "#fafaf9", fontWeight: 700 }}>
            Canvas de cajas
          </Typography>
          <Typography sx={{ fontSize: 11, color: "#a8a29e", mt: 0.3 }}>
            Se muestran hasta {MAX_BOXES_RENDER} cajas para mantener el render
            fluido.
          </Typography>
        </Box>

        <Box sx={{ minHeight: 0, overflow: "auto", p: 2 }}>
          {!result ? (
            <Box
              sx={{
                height: "100%",
                minHeight: 320,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: 1.2,
                color: "#a8a29e",
              }}
            >
              <Inventory2Icon sx={{ fontSize: 42, color: "#57534e" }} />
              <Typography sx={{ fontSize: 13 }}>
                No hay resultado de empaque todavía.
              </Typography>
            </Box>
          ) : (
            <canvas ref={canvasRef} />
          )}
        </Box>
      </Paper>
      </Box>
    </Box>
  );
}
