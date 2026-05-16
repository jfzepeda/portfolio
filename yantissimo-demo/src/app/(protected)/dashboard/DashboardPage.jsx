"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Alert,
  Backdrop,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { keyframes } from "@emotion/react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import api from "~/lib/api";
import { MX_TZ } from "~/utils/formaters";
import { getUserProfile, getSucursal } from "~/utils/session";
import { ROLES, SUCS } from "~/utils/global";
import Header from "~/components/header";
// import { keyframes } from "@mui/system";

dayjs.extend(utc);
dayjs.extend(timezone);

const DEFAULT_TZ = MX_TZ || "America/Mexico_City";
const HOURS = Array.from(
  { length: 24 },
  (_, i) => `${String(i).padStart(2, "0")}:00`
);

const money = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 2,
});

const integer = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});

let highchartsBundlePromise = null;
const DASHBOARD_CACHE_PREFIX = "dashboard:cache:v1";
const EMPTY_DASHBOARD = {
  kpis: {},
  series: { sales_by_day: [], quotes_by_day: [] },
  leaderboards: { sellers: [], brands: [] },
  heatmap: { ramps: ["Sin rampa"], data: [] },
};

// 1. Definimos las animaciones
const overlaySpin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Nueva animación para girar en sentido contrario
const overlaySpinReverse = keyframes`
  0% { transform: rotate(360deg); }
  100% { transform: rotate(0deg); }
`;

const overlayPulse = keyframes`
  0% { transform: scale(0.8); opacity: 0.5; }
  50% { transform: scale(1.4); opacity: 1; box-shadow: 0 0 25px rgba(255, 215, 0, 0.8); } 
  100% { transform: scale(0.8); opacity: 0.5; }
`;

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toArray(value) {
  if (Array.isArray(value)) return value;
  return [];
}

function seriesArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  if (Array.isArray(payload.points)) return payload.points;
  if (Array.isArray(payload.series)) return payload.series;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.values)) return payload.values;
  return [];
}

function normalizeTimeSeries(input, fallbackKey = "value") {
  return toArray(input)
    .map((item) => {
      const date = item?.date || item?.day || item?.period || item?.x;
      const value = toNumber(
        item?.amount ??
          item?.count ??
          item?.value ??
          item?.y ??
          item?.[fallbackKey],
        0
      );
      if (!date) return null;
      return { date: String(date), value };
    })
    .filter(Boolean);
}

function normalizeTopSellers(input) {
  return toArray(input).map((item) => ({
    seller: String(
      item?.seller || item?.seller_id || item?.name || "Sin vendedor"
    ),
    amount: toNumber(
      item?.amount ?? item?.sales_amount ?? item?.sales ?? item?.value,
      0
    ),
  }));
}

function normalizeTopBrands(input) {
  return toArray(input).map((item) => ({
    brand: String(item?.brand || item?.name || "SIN MARCA"),
    qty: toNumber(item?.qty ?? 0),
  }));
}

function normalizeHeatmap(input) {
  const rows = toArray(input);
  if (!rows.length) return { ramps: ["Sin rampa"], hours: ["Total"], data: [] };

  const rampSet = new Set();
  const points = [];
  let hasHourDimension = false;

  for (const row of rows) {
    const ramp = String(row?.ramp || row?.rampa || "Sin rampa");
    const hourRaw = row?.hour ?? row?.hora ?? row?.x ?? null;
    const value = toNumber(
      row?.minutes ?? row?.occupied_minutes ?? row?.value ?? row?.y,
      0
    );

    if (hourRaw !== null && hourRaw !== undefined) {
      const hour = Number(hourRaw);
      if (!Number.isFinite(hour) || hour < 0 || hour > 23) continue;
      hasHourDimension = true;
      rampSet.add(ramp);
      points.push({ ramp, hour, value });
      continue;
    }

    rampSet.add(ramp);
    points.push({ ramp, hour: 0, value });
  }

  const ramps = Array.from(rampSet);
  if (!ramps.length)
    return { ramps: ["Sin rampa"], hours: ["Total"], data: [] };

  if (!hasHourDimension) {
    return {
      ramps,
      hours: ["Total"],
      data: points
        .map((point) => [0, ramps.indexOf(point.ramp), point.value])
        .filter((point) => point[1] >= 0),
    };
  }

  return {
    ramps,
    hours: HOURS,
    data: points
      .map((point) => [point.hour, ramps.indexOf(point.ramp), point.value])
      .filter((point) => point[1] >= 0),
  };
}

function getDefaultsByGranularity(granularity, tz) {
  const now = dayjs().tz(tz);
  if (granularity === "day") {
    const today = now.format("YYYY-MM-DD");
    return { from: today, to: today };
  }
  if (granularity === "week") {
    const lastWeek = now.subtract(1, "week");
    return {
      from: lastWeek.startOf("week").format("YYYY-MM-DD"),
      to: lastWeek.endOf("week").format("YYYY-MM-DD"),
    };
  }
  const lastMonth = now.subtract(1, "month");
  return {
    from: lastMonth.startOf("month").format("YYYY-MM-DD"),
    to: lastMonth.endOf("month").format("YYYY-MM-DD"),
  };
}

function filterSeriesByRange(points, fromDate, toDate) {
  const from = dayjs(fromDate);
  const to = dayjs(toDate);
  if (!from.isValid() || !to.isValid()) return toArray(points);
  return toArray(points).filter((item) => {
    const date = dayjs(item?.date);
    if (!date.isValid()) return false;
    return !date.isBefore(from, "day") && !date.isAfter(to, "day");
  });
}

function daysInRange(fromDate, toDate) {
  const from = dayjs(fromDate);
  const to = dayjs(toDate);
  if (!from.isValid() || !to.isValid()) return 1;
  return Math.max(1, to.startOf("day").diff(from.startOf("day"), "day") + 1);
}

function getFirstNonEmptyArray(...candidates) {
  for (const candidate of candidates) {
    if (Array.isArray(candidate) && candidate.length > 0) return candidate;
  }
  return [];
}

function readDashboardCache(cacheKey) {
  if (!cacheKey || typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${DASHBOARD_CACHE_PREFIX}:${cacheKey}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (_error) {
    return null;
  }
}

function writeDashboardCache(cacheKey, dashboardData) {
  if (!cacheKey || typeof window === "undefined") return;
  try {
    localStorage.setItem(
      `${DASHBOARD_CACHE_PREFIX}:${cacheKey}`,
      JSON.stringify(dashboardData)
    );
  } catch (_error) {
    // Ignore storage quota or serialization errors
  }
}

function buildScriptPromise(src) {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Highcharts only works in browser"));
      return;
    }

    const current = document.querySelector(`script[data-src="${src}"]`);
    if (current?.dataset?.loaded === "1") {
      resolve();
      return;
    }

    if (current) {
      current.addEventListener("load", () => resolve(), { once: true });
      current.addEventListener(
        "error",
        () => reject(new Error(`Error loading ${src}`)),
        {
          once: true,
        }
      );
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.src = src;
    script.onload = () => {
      script.dataset.loaded = "1";
      resolve();
    };
    script.onerror = () => reject(new Error(`Error loading ${src}`));
    document.head.appendChild(script);
  });
}

async function loadHighchartsBundle() {
  if (typeof window === "undefined") {
    throw new Error("Highcharts only works in browser");
  }

  if (window.Highcharts) {
    return window.Highcharts;
  }

  if (!highchartsBundlePromise) {
    highchartsBundlePromise = (async () => {
      await buildScriptPromise("https://code.highcharts.com/highcharts.js");
      await buildScriptPromise(
        "https://code.highcharts.com/modules/heatmap.js"
      );
      await buildScriptPromise(
        "https://code.highcharts.com/modules/accessibility.js"
      );
      return window.Highcharts;
    })();
  }

  return highchartsBundlePromise;
}

function HighchartCard({ title, options, loading, height = 320 }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function mountChart() {
      if (!containerRef.current || !options || loading) return;
      const Highcharts = await loadHighchartsBundle();
      if (cancelled || !containerRef.current) return;

      if (chartRef.current) chartRef.current.destroy();
      chartRef.current = Highcharts.chart(containerRef.current, options);
    }

    mountChart().catch((error) => {
      console.error("No se pudo renderizar Highcharts:", error);
    });

    return () => {
      cancelled = true;
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [options, loading]);

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ pb: 1, overflow: "hidden" }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          {title}
        </Typography>
        {loading ? (
          <Box
            sx={{ minHeight: height, display: "grid", placeItems: "center" }}
          >
            <CircularProgress size={24} />
          </Box>
        ) : (
          <Box ref={containerRef} sx={{ minHeight: height }} />
        )}
      </CardContent>
    </Card>
  );
}

function KpiCard({ label, value }) {
  return (
    <Card>
      <CardContent sx={{ pb: 2, "&:last-child": { pb: 2 } }}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h5" sx={{ mt: 0.5 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

function PreparingOverlay({ open }) {
  const accent = "#FFD700"; // Amarillo Oro

  // Configuración del Anillo Interior (Puntos Grandes)
  const innerRadius = 150;
  const innerDotCount = 18;

  // Configuración del Anillo Exterior (Puntos Pequeños)
  const outerRadius = 190;
  const outerDotCount = 36;

  // Función auxiliar para generar los puntos
  const renderDots = (count, radius, isInnerRing) => {
    return Array.from({ length: count }).map((_, index) => {
      const angle = (360 / count) * index;

      // Lógica de tamaño basada en si es el anillo interior o exterior
      let size;
      if (isInnerRing) {
        // Puntos GRANDES para el interior (16px o 22px)
        size = index % 2 === 0 ? 20 : 24;
      } else {
        // Puntos variados más PEQUEÑOS para el exterior (5, 8, u 11px)
        size = index % 3 === 0 ? 5 : index % 3 === 1 ? 16 : 20;
      }

      // Retardo de animación para el efecto de "ola"
      const delay = isInnerRing ? index * 0.1 : index * 0.05;

      return (
        <Box
          key={index}
          sx={{
            position: "absolute",
            left: "50%",
            top: "50%",
            // Colocamos el punto en el radio correspondiente
            transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(${radius}px)`,
          }}
        >
          <Box
            sx={{
              width: size,
              height: size,
              borderRadius: "50%",
              background: accent,
              // Sombra más intensa para los puntos grandes
              boxShadow: isInnerRing
                ? `0 0 15px ${accent}`
                : `0 0 8px ${accent}`,
              animation: `${overlayPulse} 1.5s ease-in-out infinite`,
              animationDelay: `${delay}s`,
            }}
          />
        </Box>
      );
    });
  };

  return (
    <Backdrop
      open={open}
      sx={{
        zIndex: 800,
        color: "#fff",
        background: "rgba(0,0,0,0.2)", // Fondo un poco más oscuro
        backdropFilter: "blur(10px)",
      }}
    >
      {/* Contenedor principal relativo para centrar todo */}
      <Box
        sx={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          // Hacemos el contenedor más grande para acomodar el anillo exterior
          width: outerRadius * 2 + 50,
          height: outerRadius * 2 + 50,
        }}
      >
        {/* --- Texto Central (Estático, z-index más alto) --- */}
        <Typography
          variant="h6" // Un poco más grande
          sx={{
            position: "absolute",
            zIndex: 10,
            fontWeight: 900,
            letterSpacing: 1.5,
            textAlign: "center",
            textTransform: "uppercase",
            // Gradiente dorado para el texto
            background: "#fff",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 15px rgba(255,215,0,0.4))",
          }}
        >
          Preparando
          <br />
          algo increíble
        </Typography>

        {/* --- Capa del Anillo Interior (Gira horario, más rápido) --- */}
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            animation: `${overlaySpin} 8s linear infinite`,
            zIndex: 2,
          }}
        >
          {renderDots(innerDotCount, innerRadius, true)}
        </Box>

        {/* --- Capa del Anillo Exterior (Gira anti-horario, más lento) --- */}
        <Box
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            // Usa la animación inversa y más lenta
            animation: `${overlaySpinReverse} 16s linear infinite`,
            zIndex: 1,
            opacity: 0.8, // Un poco más sutil
          }}
        >
          {renderDots(outerDotCount, outerRadius, false)}
        </Box>
      </Box>
    </Backdrop>
  );
}

export default function DashboardPage() {
  const initialLoadDoneRef = useRef(false);
  const [profile, setProfile] = useState(null);
  const [viewMode, setViewMode] = useState("store");
  const [granularity, setGranularity] = useState("month");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sucursal, setSucursal] = useState("");

  const [dashboard, setDashboard] = useState(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const defaults = getDefaultsByGranularity(granularity, DEFAULT_TZ);
    setFromDate(defaults.from);
    setToDate(defaults.to);
  }, [granularity]);

  useEffect(() => {
    try {
      const currentProfile = getUserProfile();
      setProfile(currentProfile || null);
      const storedSucursal = getSucursal();
      setSucursal(
        storedSucursal || currentProfile?.sucursal || SUCS[0] || "ADMIN"
      );
    } catch (_e) {
      setProfile(null);
      setSucursal(SUCS[0] || "ADMIN");
    }
  }, []);

  const cacheKey = useMemo(() => {
    if (!profile || !fromDate || !toDate) return "";
    const selectedSucursal = sucursal || profile?.sucursal || "";
    const sellerId =
      viewMode === "personal" && profile?.id != null ? String(profile.id) : "";
    const sellerName =
      viewMode === "personal" && profile?.username
        ? String(profile.username)
        : "";
    return [
      viewMode,
      granularity,
      fromDate,
      toDate,
      selectedSucursal,
      DEFAULT_TZ,
      sellerId,
      sellerName,
    ].join("|");
  }, [fromDate, granularity, profile, sucursal, toDate, viewMode]);

  const loadData = useCallback(
    async (options = {}) => {
      if (!profile || !fromDate || !toDate) return;
      const forceRefresh = Boolean(options?.forceRefresh);
      if (!forceRefresh) {
        const cachedDashboard = readDashboardCache(cacheKey);
        if (cachedDashboard) {
          setDashboard(cachedDashboard);
          setError("");
          return;
        }
      }

      setLoading(true);
      setError("");

      try {
        const selectedSucursal = sucursal || profile?.sucursal || "";
        const params = new URLSearchParams({
          sucursal: selectedSucursal,
          granularity,
          from: fromDate,
          to: toDate,
          timezone: DEFAULT_TZ,
        });

        if (viewMode === "personal") {
          if (profile?.id != null) params.set("seller_id", String(profile.id));
          if (profile?.username) params.set("seller", String(profile.username));
        }

        const summaryPath =
          viewMode === "personal"
            ? `/api/dashboard/personal/summary?${params.toString()}`
            : `/api/dashboard/store/summary?${params.toString()}`;

        const salesSeriesPath = `/api/dashboard/series?${params.toString()}&metric=sales_amount`;
        const quotesSeriesPath = `/api/dashboard/series?${params.toString()}&metric=quotes`;

        const [summaryRes, salesSeriesRes, quotesSeriesRes] = await Promise.all(
          [api(summaryPath), api(salesSeriesPath), api(quotesSeriesPath)]
        );

        const [summaryRaw, salesSeriesRaw, quotesSeriesRaw] = await Promise.all(
          [
            summaryRes.ok ? summaryRes.json() : {},
            salesSeriesRes.ok ? salesSeriesRes.json() : {},
            quotesSeriesRes.ok ? quotesSeriesRes.json() : {},
          ]
        );

        const summary =
          summaryRaw && typeof summaryRaw === "object" ? summaryRaw : {};
        const summaryKpis = summary.kpis || {};
        const summarySeries = summary.series || {};
        const summaryBreakdowns = summary.breakdowns || {};
        const summaryLeaderboards = summary.leaderboards || {};

        const salesSeriesPoints = normalizeTimeSeries(
          filterSeriesByRange(seriesArray(salesSeriesRaw), fromDate, toDate),
          "value"
        );
        const quotesSeriesPoints = normalizeTimeSeries(
          filterSeriesByRange(seriesArray(quotesSeriesRaw), fromDate, toDate),
          "value"
        );

        const salesByDaySource = normalizeTimeSeries(
          filterSeriesByRange(summarySeries.sales_by_day, fromDate, toDate),
          "amount"
        );
        const quotesByDaySource = normalizeTimeSeries(
          filterSeriesByRange(summarySeries.quotes_by_day, fromDate, toDate),
          "count"
        );

        const salesByDay = (
          salesByDaySource.length > 0 ? salesByDaySource : salesSeriesPoints
        ).map((item) => ({
          date: item.date,
          amount: item.value,
        }));

        const quotesByDay = (
          quotesByDaySource.length > 0 ? quotesByDaySource : quotesSeriesPoints
        ).map((item) => ({
          date: item.date,
          count: item.value,
        }));

        const normalizedSellers = normalizeTopSellers(
          getFirstNonEmptyArray(
            summaryLeaderboards.sellers_top,
            summaryLeaderboards.sellers,
            summaryLeaderboards.top_sellers
          )
        );
        const normalizedBrands = normalizeTopBrands(
          getFirstNonEmptyArray(
            summaryLeaderboards.tires_brands_top,
            summaryLeaderboards.brands,
            summaryBreakdowns.tires_by_brand_top,
            summaryBreakdowns.brands_top
          )
        );

        const rampsRows = toArray(summary.ramps).map((row) => ({
          ramp: String(row?.ramp || row?.rampa || "Sin rampa"),
          occupied_minutes: toNumber(
            row?.occupied_minutes ?? row?.minutes ?? row?.value,
            0
          ),
        }));
        const heatmap = normalizeHeatmap(
          getFirstNonEmptyArray(
            summary?.ramps?.heatmap,
            summaryBreakdowns.ramp_heatmap,
            summary?.heatmap,
            rampsRows
          )
        );

        const itemVsServices = summaryBreakdowns.items_vs_services || {};
        const tiresQtyFallback = toNumber(
          itemVsServices.items_qty ?? itemVsServices.tires_qty,
          0
        );
        const servicesQtyFallback = toNumber(itemVsServices.services_qty, 0);

        const salesAmount = toNumber(summaryKpis.sales_amount_period, 0);
        const salesCount = toNumber(summaryKpis.sales_count_period, 0);
        const quotesCount = toNumber(summaryKpis.quotes_count_period, 0);
        const days = daysInRange(fromDate, toDate);
        const occupiedMinutes = rampsRows.reduce(
          (acc, row) => acc + toNumber(row.occupied_minutes, 0),
          0
        );
        const availableMinutes = Math.max(1, heatmap.ramps.length) * days * 480;

        const kpis = {
          quotes_open_count: toNumber(summaryKpis.quotes_open_count, 0),
          quotes_count_period: quotesCount,
          quotes_avg_per_day: toNumber(
            summaryKpis.quotes_avg_per_day,
            quotesCount / days
          ),
          sales_amount_period: salesAmount,
          sales_count_period: salesCount,
          avg_ticket_period: toNumber(
            summaryKpis.avg_ticket_period,
            salesCount > 0 ? salesAmount / salesCount : 0
          ),
          tires_qty_period: toNumber(
            summaryKpis.tires_qty_period,
            tiresQtyFallback
          ),
          services_qty_period: toNumber(
            summaryKpis.services_qty_period,
            servicesQtyFallback
          ),
          customers_served_period: toNumber(
            summaryKpis.customers_served_period,
            0
          ),
          ramp_utilization_pct: toNumber(
            summaryKpis.ramp_utilization_pct,
            (occupiedMinutes / availableMinutes) * 100
          ),
        };

        const nextDashboard = {
          kpis,
          series: { sales_by_day: salesByDay, quotes_by_day: quotesByDay },
          leaderboards: {
            sellers: normalizedSellers,
            brands: normalizedBrands,
          },
          heatmap,
        };

        setDashboard(nextDashboard);
        writeDashboardCache(cacheKey, nextDashboard);

        if (!summaryRes.ok || !salesSeriesRes.ok || !quotesSeriesRes.ok) {
          setError(
            "Algunas fuentes no respondieron; se muestran datos parciales."
          );
        }
      } catch (fetchError) {
        console.error("Error cargando dashboard:", fetchError);
        setError("No fue posible cargar el dashboard.");
        setDashboard(EMPTY_DASHBOARD);
      } finally {
        setLoading(false);
      }
    },
    [cacheKey, fromDate, granularity, profile, sucursal, toDate, viewMode]
  );

  useEffect(() => {
    if (initialLoadDoneRef.current) return;
    if (!profile || !fromDate || !toDate) return;
    initialLoadDoneRef.current = true;
    loadData();
  }, [fromDate, loadData, profile, toDate]);

  const salesQuotesOptions = useMemo(() => {
    const categories = dashboard.series.sales_by_day.map((item) =>
      dayjs(item.date).isValid() ? dayjs(item.date).format("DD/MM") : item.date
    );
    const salesSeries = dashboard.series.sales_by_day.map((item) =>
      toNumber(item.amount, 0)
    );
    const quoteSeries = dashboard.series.quotes_by_day.map((item) =>
      toNumber(item.count, 0)
    );

    return {
      chart: { type: "column", backgroundColor: "transparent" },
      title: { text: null },
      credits: { enabled: false },
      legend: {
        enabled: true,
        align: "center",
        verticalAlign: "bottom",
        layout: "horizontal",
        itemStyle: { fontWeight: 600 },
        margin: 10,
      },
      xAxis: {
        categories,
        crosshair: true,
      },
      yAxis: [
        {
          title: { text: "Ventas (MXN)" },
          labels: {
            formatter() {
              return `$${integer.format(this.value)}`;
            },
          },
        },
        {
          title: { text: "Cotizaciones" },
          opposite: true,
          allowDecimals: false,
        },
      ],
      tooltip: { shared: true },
      responsive: {
        rules: [
          {
            condition: { maxWidth: 640 },
            chartOptions: {
              legend: {
                layout: "horizontal",
                align: "center",
                verticalAlign: "bottom",
                itemStyle: { fontSize: "11px" },
              },
            },
          },
        ],
      },
      series: [
        {
          name: "Ventas",
          type: "column",
          yAxis: 0,
          data: salesSeries,
          color: "#ff9800",
        },
        {
          name: "Cotizaciones",
          type: "spline",
          yAxis: 1,
          data: quoteSeries,
          color: "#1976d2",
        },
      ],
    };
  }, [dashboard.series]);

  const donutOptions = useMemo(
    () => ({
      chart: { type: "pie", backgroundColor: "transparent" },
      title: { text: null },
      credits: { enabled: false },
      legend: {
        enabled: true,
        align: "center",
        verticalAlign: "bottom",
        layout: "horizontal",
      },
      tooltip: { pointFormat: "<b>{point.y}</b> unidades" },
      plotOptions: {
        pie: {
          innerSize: "58%",
          dataLabels: {
            enabled: true,
            format: "{point.name}: {point.y}",
          },
        },
      },
      series: [
        {
          name: "Unidades",
          data: [
            {
              name: "Llantas",
              y: toNumber(dashboard.kpis.tires_qty_period, 0),
              color: "#2e7d32",
            },
            {
              name: "Servicios",
              y: toNumber(dashboard.kpis.services_qty_period, 0),
              color: "#0288d1",
            },
          ],
        },
      ],
    }),
    [dashboard.kpis.services_qty_period, dashboard.kpis.tires_qty_period]
  );

  const sellersOptions = useMemo(
    () => ({
      chart: { type: "bar", backgroundColor: "transparent" },
      title: { text: null },
      credits: { enabled: false },
      legend: { enabled: false },
      xAxis: {
        categories: dashboard.leaderboards.sellers.map((item) => item.seller),
        title: { text: null },
      },
      yAxis: {
        title: { text: "MXN" },
        labels: {
          formatter() {
            return `$${integer.format(this.value)}`;
          },
        },
      },
      tooltip: {
        pointFormatter() {
          return `<b>${money.format(this.y)}</b>`;
        },
      },
      series: [
        {
          name: "Ventas",
          data: dashboard.leaderboards.sellers.map((item) =>
            toNumber(item.amount, 0)
          ),
          color: "#6a1b9a",
        },
      ],
    }),
    [dashboard.leaderboards.sellers]
  );

  const brandsOptions = useMemo(
    () => ({
      chart: { type: "column", backgroundColor: "transparent" },
      title: { text: null },
      credits: { enabled: false },
      legend: { enabled: false },
      xAxis: {
        categories: dashboard.leaderboards.brands.map((item) => item.brand),
      },
      yAxis: {
        title: { text: "Piezas" },
        allowDecimals: false,
      },
      series: [
        {
          name: "Llantas",
          data: dashboard.leaderboards.brands.map((item) =>
            toNumber(item.qty, 0)
          ),
          color: "#ef6c00",
        },
      ],
    }),
    [dashboard.leaderboards.brands]
  );

  const rampHeatmapOptions = useMemo(
    () => ({
      chart: { type: "heatmap", backgroundColor: "transparent" },
      title: { text: null },
      credits: { enabled: false },
      xAxis: {
        categories: dashboard.heatmap.hours || HOURS,
        title: { text: "Hora" },
      },
      yAxis: {
        categories: dashboard.heatmap.ramps,
        title: { text: "Rampa" },
        reversed: true,
      },
      colorAxis: {
        min: 0,
        minColor: "#f3e5f5",
        maxColor: "#4a148c",
      },
      legend: {
        align: "right",
        layout: "vertical",
        margin: 0,
        verticalAlign: "top",
        y: 25,
        symbolHeight: 180,
      },
      tooltip: {
        formatter() {
          const hour = (dashboard.heatmap.hours || HOURS)[this.point.x] || "";
          const ramp = dashboard.heatmap.ramps[this.point.y] || "";
          return `<b>${ramp}</b><br/>${hour}<br/><b>${toNumber(
            this.point.value,
            0
          ).toFixed(0)} min</b>`;
        },
      },
      series: [
        {
          name: "Minutos ocupados",
          borderWidth: 1,
          data: dashboard.heatmap.data,
          dataLabels: { enabled: false },
        },
      ],
    }),
    [dashboard.heatmap]
  );

  const canChooseSucursal = Number(profile?.role || 0) >= ROLES.MARKETING;
  const sucursales = useMemo(
    () =>
      canChooseSucursal ? [...SUCS, "Todas"] : [profile?.sucursal || sucursal],
    [canChooseSucursal, profile?.sucursal, sucursal]
  );

  return (
    <Box sx={{ pb: 3 }}>
      <PreparingOverlay open={loading} />
      <Header
        title="Dashboard Operativo"
        actions={
          <Button
            variant="contained"
            color="primary"
            onClick={() => loadData({ forceRefresh: true })}
            disabled={loading}
          >
            {loading ? "Actualizando..." : "Actualizar"}
          </Button>
        }
      />

      <Box sx={{ mb: 3, borderBottom: 1, borderColor: "contrast", pb: 2 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          flexWrap="wrap"
        >
          <ToggleButtonGroup
            exclusive
            size="small"
            value={viewMode}
            onChange={(_e, val) => {
              if (val) setViewMode(val);
            }}
          >
            <ToggleButton value="store">Tienda</ToggleButton>
            <ToggleButton value="personal">Personal</ToggleButton>
          </ToggleButtonGroup>

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Granularidad</InputLabel>
            <Select
              label="Granularidad"
              value={granularity}
              onChange={(e) => setGranularity(String(e.target.value))}
            >
              <MenuItem value="day">Día</MenuItem>
              <MenuItem value="week">Semana</MenuItem>
              <MenuItem value="month">Mes</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Desde"
            size="small"
            type="date"
            value={fromDate}
            InputLabelProps={{ shrink: true }}
            onChange={(e) => setFromDate(e.target.value)}
          />

          <TextField
            label="Hasta"
            size="small"
            type="date"
            value={toDate}
            InputLabelProps={{ shrink: true }}
            onChange={(e) => setToDate(e.target.value)}
          />

          {canChooseSucursal ? (
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Sucursal</InputLabel>
              <Select
                label="Sucursal"
                value={sucursal || ""}
                onChange={(e) => {
                  const selected = String(e.target.value);
                  setSucursal(selected);
                  if (selected && selected !== "Todas") {
                    localStorage.setItem("sucursal", selected);
                  }
                }}
              >
                {sucursales.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <TextField
              label="Sucursal"
              size="small"
              value={profile?.sucursal || sucursal || ""}
              disabled
            />
          )}
        </Stack>
      </Box>

      {error ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(3, minmax(0, 1fr))",
            lg: "repeat(6, minmax(0, 1fr))",
          },
          gap: 1.5,
          mb: 2,
        }}
      >
        <KpiCard
          label="Cotizaciones abiertas"
          value={integer.format(toNumber(dashboard.kpis.quotes_open_count, 0))}
        />
        <KpiCard
          label="Cotizaciones totales"
          value={integer.format(
            toNumber(dashboard.kpis.quotes_count_period, 0)
          )}
        />
        <KpiCard
          label="Ventas del periodo"
          value={money.format(toNumber(dashboard.kpis.sales_amount_period, 0))}
        />
        <KpiCard
          label="Ticket promedio"
          value={money.format(toNumber(dashboard.kpis.avg_ticket_period, 0))}
        />
        <KpiCard
          label="Clientes atendidos"
          value={integer.format(
            toNumber(dashboard.kpis.customers_served_period, 0)
          )}
        />
        <KpiCard
          label="Servicios del periodo"
          value={integer.format(
            toNumber(dashboard.kpis.services_qty_period, 0)
          )}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
          gap: 2,
          mb: 2,
        }}
      >
        <HighchartCard
          title="Ventas y cotizaciones por día"
          options={salesQuotesOptions}
          loading={loading}
          height={250}
        />
        <HighchartCard
          title="Llantas vs servicios (unidades)"
          options={donutOptions}
          loading={loading}
          height={250}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
          gap: 2,
          mb: 2,
        }}
      >
        <HighchartCard
          title="Top vendedores por ventas"
          options={sellersOptions}
          loading={loading}
          height={250}
        />
        <HighchartCard
          title="Top marcas (llantas)"
          options={brandsOptions}
          loading={loading}
          height={250}
        />
      </Box>

      <HighchartCard
        title="Heatmap de ocupación por rampa/hora"
        options={rampHeatmapOptions}
        loading={loading}
        height={380}
      />
    </Box>
  );
}
