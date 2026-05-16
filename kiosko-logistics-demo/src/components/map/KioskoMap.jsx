'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Box } from '@mui/material';

/**
 * Mapa Leaflet compartido entre /rutas y /testing.
 *
 * Acepta un `run` con shape canónico (`result.routes[]` + `result.legacy_vrp_output`
 * para coords). Renderiza polylines + circle markers + CEDIS, con tooltips ricos,
 * fitBounds automático y selección bidireccional con el padre.
 *
 * Tiles CARTO dark/light según `data-theme` del documento (cambia en vivo).
 *
 * Extras:
 * - Animación de fade-in de rutas al cargar un nuevo `run` (700ms, cubic ease-out).
 * - Capa heatmap de densidad de tiendas cuando `showHeatmap` es true.
 */

const PALETTE = [
  '#FF6B1A', '#38BDF8', '#10B981', '#F59E0B', '#A78BFA',
  '#EF4444', '#EC4899', '#84CC16', '#0EA5E9', '#F97316',
  '#8B5CF6', '#22C55E', '#FB923C', '#06B6D4', '#D946EF',
];

function colorForRoute(idx) {
  return PALETTE[idx % PALETTE.length];
}

const TILE_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

function currentTheme() {
  if (typeof document === 'undefined') return 'dark';
  return document.documentElement.getAttribute('data-theme') || 'dark';
}

export default function KioskoMap({
  run,
  cedis: cedisProp,
  selectedRouteId,
  onSelectRoute,
  selectedStoreId,
  onSelectStore,
  hoveredRouteId,
  height = '100%',
  showCedis = true,
  fitOnLoad = true,
  showHeatmap = false,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const tileRef = useRef(null);
  // layersRef now also holds heatmap markers and per-layer opacity metadata
  const layersRef = useRef({ markers: [], polylines: [], cedisMarkers: [], heatmap: [] });
  const LRef = useRef(null);
  const fittedRef = useRef(false);
  const [mapReady, setMapReady] = useState(false);

  // ── Animation refs ────────────────────────────────────────────────────────
  const animRafRef = useRef(null);
  const prevRunIdRef = useRef(null);

  const stores = useMemo(() => run?.result?.routes ? collectStoreCoords(run) : new Map(), [run]);
  const cedis = useMemo(() => {
    if (cedisProp) return cedisProp;
    return run?.result?.legacy_vrp_output?.meta?.cedis || [];
  }, [cedisProp, run]);
  const routes = useMemo(() => buildRouteSpec(run, stores, cedis), [run, stores, cedis]);

  // Init map
  useEffect(() => {
    let mounted = true;
    (async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');
      if (!mounted || !containerRef.current || mapRef.current) return;
      LRef.current = L;
      mapRef.current = L.map(containerRef.current, {
        center: [19.24, -103.72],
        zoom: 7,
        zoomControl: true,
        attributionControl: false,
        preferCanvas: true,
      });
      const url = currentTheme() === 'light' ? TILE_LIGHT : TILE_DARK;
      tileRef.current = L.tileLayer(url, { subdomains: 'abcd', maxZoom: 19 }).addTo(mapRef.current);
      setMapReady(true);
    })();
    return () => {
      mounted = false;
      if (animRafRef.current) cancelAnimationFrame(animRafRef.current);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // React al cambio de tema
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const L = LRef.current;
      const map = mapRef.current;
      if (!L || !map) return;
      if (tileRef.current) {
        map.removeLayer(tileRef.current);
      }
      const url = currentTheme() === 'light' ? TILE_LIGHT : TILE_DARK;
      tileRef.current = L.tileLayer(url, { subdomains: 'abcd', maxZoom: 19 }).addTo(map);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  // Render rutas
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    // Limpiar
    for (const m of layersRef.current.markers) m.remove();
    for (const p of layersRef.current.polylines) p.remove();
    for (const c of layersRef.current.cedisMarkers) c.remove();
    // Preserve heatmap — it has its own lifecycle
    layersRef.current = {
      markers: [],
      polylines: [],
      cedisMarkers: [],
      heatmap: layersRef.current.heatmap,
    };

    const allLatLngs = [];

    routes.forEach((route) => {
      const isActive = !selectedRouteId || selectedRouteId === route.id;
      const isHovered = hoveredRouteId === route.id;
      const weight = isActive ? (isHovered ? 4.5 : 3) : 1.5;
      const targetOpacity = isActive ? 0.9 : 0.18;

      if (route.coords.length >= 2) {
        const polyline = L.polyline(route.coords, {
          color: route.color,
          weight,
          opacity: targetOpacity,
          smoothFactor: 1,
          interactive: true,
        })
          .on('click', () => onSelectRoute?.(route.id))
          .bindTooltip(
            `<div style="font-family:Inter;font-size:11px"><b>${route.id}</b><br>${route.km} km · ${route.stops} paradas · $${route.cost.toLocaleString('es-MX')}</div>`,
            { sticky: true, direction: 'top', className: 'kiosko-tooltip' },
          )
          .addTo(map);
        // Attach target opacity and weight metadata for the animation effect
        polyline._animTargetOpacity = targetOpacity;
        polyline._animWeight = weight;
        layersRef.current.polylines.push(polyline);
      }

      // Markers solo de las TIENDAS (no del depósito — el depósito tiene su propio marker).
      route.tiendaCoords.forEach((latlng, i) => {
        allLatLngs.push(latlng);
        const stopInfo = route.stops_info?.[i];
        const targetFillOpacity = isActive ? 0.95 : 0.35;
        const marker = L.circleMarker(latlng, {
          radius: isActive ? (isHovered ? 5 : 4) : 2,
          fillColor: route.color,
          fillOpacity: targetFillOpacity,
          color: route.color,
          weight: 1,
        })
          .on('click', () => {
            onSelectStore?.(stopInfo);
            onSelectRoute?.(route.id);
          })
          .addTo(map);
        // Attach target fill opacity metadata for the animation effect
        marker._animTargetFillOpacity = targetFillOpacity;
        if (stopInfo?.nombre) {
          marker.bindTooltip(
            `<div style="font-family:Inter;font-size:11px;max-width:220px"><b>${stopInfo.nombre}</b><br><span style="opacity:.7">${route.id} · ${stopInfo.zona || ''}</span><br>${stopInfo.demanda || 0} cajas</div>`,
            { direction: 'top', className: 'kiosko-tooltip' },
          );
        }
        layersRef.current.markers.push(marker);
      });
      // El depósito también entra al cálculo de bounds.
      if (route.depot) {
        const dLat = route.depot.lat ?? route.depot.la;
        const dLng = route.depot.lng ?? route.depot.ln;
        if (Number.isFinite(dLat) && Number.isFinite(dLng)) {
          allLatLngs.push([dLat, dLng]);
        }
      }
    });

    if (showCedis && cedis.length) {
      for (const c of cedis) {
        const lat = c.lat ?? c.la;
        const lng = c.lng ?? c.ln;
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
        allLatLngs.push([lat, lng]);
        const m = L.circleMarker([lat, lng], {
          radius: 9,
          fillColor: '#fff',
          fillOpacity: 0.95,
          color: '#FF6B1A',
          weight: 3,
        })
          .bindTooltip(
            `<div style="font-family:Inter;font-size:11px"><b>${c.nombre || c.nm || 'CEDIS'}</b></div>`,
            { permanent: false, direction: 'top', className: 'kiosko-tooltip' },
          )
          .addTo(map);
        layersRef.current.cedisMarkers.push(m);
      }
    }

    if (fitOnLoad && allLatLngs.length > 1 && !fittedRef.current && !selectedRouteId) {
      const bounds = L.latLngBounds(allLatLngs);
      map.fitBounds(bounds, { padding: [40, 40] });
      fittedRef.current = true;
    }
  }, [mapReady, routes, cedis, selectedRouteId, hoveredRouteId, showCedis, onSelectRoute, onSelectStore, fitOnLoad]);

  // ── Route draw animation — triggered when run?.meta?.id changes ───────────
  useEffect(() => {
    const currentRunId = run?.meta?.id ?? null;
    if (currentRunId === null || currentRunId === prevRunIdRef.current) return;
    prevRunIdRef.current = currentRunId;

    // Cancel any pending animation
    if (animRafRef.current) {
      cancelAnimationFrame(animRafRef.current);
      animRafRef.current = null;
    }

    const DURATION = 700; // ms
    const startTime = performance.now();

    function frame(now) {
      const t = Math.min((now - startTime) / DURATION, 1);
      // Cubic ease-out: eased = 1 - (1 - t)^3
      const eased = 1 - Math.pow(1 - t, 3);

      for (const polyline of layersRef.current.polylines) {
        const targetOpacity = polyline._animTargetOpacity ?? 0.9;
        const weight = polyline._animWeight ?? 3;
        polyline.setStyle({ opacity: targetOpacity * eased, weight });
      }
      for (const marker of layersRef.current.markers) {
        const targetFillOpacity = marker._animTargetFillOpacity ?? 0.95;
        marker.setStyle({ fillOpacity: targetFillOpacity * eased });
      }

      if (t < 1) {
        animRafRef.current = requestAnimationFrame(frame);
      } else {
        // Final frame: restore exact target values (eased === 1)
        for (const polyline of layersRef.current.polylines) {
          const targetOpacity = polyline._animTargetOpacity ?? 0.9;
          const weight = polyline._animWeight ?? 3;
          polyline.setStyle({ opacity: targetOpacity, weight });
        }
        for (const marker of layersRef.current.markers) {
          const targetFillOpacity = marker._animTargetFillOpacity ?? 0.95;
          marker.setStyle({ fillOpacity: targetFillOpacity });
        }
        animRafRef.current = null;
      }
    }

    animRafRef.current = requestAnimationFrame(frame);

    return () => {
      if (animRafRef.current) {
        cancelAnimationFrame(animRafRef.current);
        animRafRef.current = null;
      }
    };
  }, [run?.meta?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Heatmap layer ─────────────────────────────────────────────────────────
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    // Limpiar capa anterior de heatmap
    for (const h of layersRef.current.heatmap) h.remove();
    layersRef.current.heatmap = [];

    if (!showHeatmap) return;

    // Recopilar todas las tiendas de legacy_vrp_output
    const rutas = run?.result?.legacy_vrp_output?.rutas || [];
    for (const ruta of rutas) {
      for (const tienda of ruta.tiendas || []) {
        const lat = tienda.lat;
        const lng = tienda.lng;
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
        const hm = L.circleMarker([lat, lng], {
          radius: 6,
          fillColor: '#FF6B1A',
          fillOpacity: 0.15,
          color: '#FF6B1A',
          weight: 0,
          interactive: false,
        }).addTo(map);
        layersRef.current.heatmap.push(hm);
      }
    }
  }, [showHeatmap, mapReady, run]);

  // Cuando cambia la ruta seleccionada, hacer zoom a esa ruta
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map || !selectedRouteId) return;
    const route = routes.find((r) => r.id === selectedRouteId);
    if (!route || route.coords.length < 1) return;
    const bounds = L.latLngBounds(route.coords);
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 13 });
  }, [selectedRouteId, routes]);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        height,
        background: 'var(--bg-base)',
        borderRadius: '14px',
        overflow: 'hidden',
        '& .leaflet-control-zoom': {
          border: 'none !important',
          background: 'var(--glass-bg) !important',
          backdropFilter: 'blur(20px) saturate(140%)',
        },
        '& .leaflet-control-zoom a': {
          background: 'transparent !important',
          color: 'var(--text-primary) !important',
          border: '1px solid var(--glass-border) !important',
        },
        '& .kiosko-tooltip': {
          background: 'var(--bg-overlay) !important',
          color: 'var(--text-primary) !important',
          border: '1px solid var(--glass-border) !important',
          boxShadow: 'var(--shadow-2)',
          borderRadius: '8px',
          padding: '6px 10px',
        },
        '& .leaflet-tooltip-top:before, & .leaflet-tooltip-bottom:before, & .leaflet-tooltip-left:before, & .leaflet-tooltip-right:before': {
          borderColor: 'transparent !important',
        },
      }}
    />
  );
}

// ─── helpers ────────────────────────────────────────────────────────────────

/** Construye `Map<id_tienda, {lat, lng, nombre, zona, demanda}>` desde el legacy_vrp_output. */
function collectStoreCoords(run) {
  const map = new Map();
  const legacy = run?.result?.legacy_vrp_output;
  if (!legacy?.rutas) return map;
  for (const r of legacy.rutas) {
    for (const t of r.tiendas || []) {
      const key = String(t.id_tienda);
      if (!map.has(key)) {
        map.set(key, {
          id_tienda: t.id_tienda,
          lat: t.lat,
          lng: t.lng,
          nombre: t.nombre,
          zona: t.zona,
          municipio: t.municipio,
          estado: t.estado,
          demanda: t.demanda_cajas,
          frecuencia: t.frecuencia,
          clasificacion: t.clasificacion,
        });
      }
    }
  }
  return map;
}

/** Construye spec de rutas para Leaflet.
 *
 * Las polylines empiezan y terminan en el CEDIS (depósito). Para rutas con
 * `legacy_vrp_output.rutas[].cedis` específico, lo usa; si no, cae al primer
 * CEDIS disponible. Los `stops_info` solo cubren las tiendas (no el depósito),
 * para que los markers de tiendas sigan independientes.
 */
function buildRouteSpec(run, storeCoords, cedisList = []) {
  const routes = run?.result?.routes || [];
  const legacyByRouteId = new Map();
  for (const r of run?.result?.legacy_vrp_output?.rutas || []) {
    legacyByRouteId.set(r.ruta_id, r);
  }
  const cedisByName = new Map();
  for (const c of cedisList) {
    cedisByName.set(c.nombre || c.nm, c);
  }
  const defaultCedis = cedisList[0];

  return routes.map((route, idx) => {
    const stops = route.sequence || [];
    const tiendaCoords = [];
    const stops_info = [];
    for (const stop of stops) {
      const sid = String(stop.store_id);
      const info = storeCoords.get(sid);
      if (info) {
        tiendaCoords.push([info.lat, info.lng]);
        stops_info.push(info);
      }
    }

    // Resolver el CEDIS de origen para esta ruta (legacy → meta → primer CEDIS).
    const legacy = legacyByRouteId.get(route.route_id);
    const depot = (legacy?.cedis && cedisByName.get(legacy.cedis)) || defaultCedis;
    const depotLatLng = depot
      ? [depot.lat ?? depot.la, depot.lng ?? depot.ln]
      : null;

    // Coords completas: CEDIS → tiendas → CEDIS (cierra el loop).
    const coords = depotLatLng
      ? [depotLatLng, ...tiendaCoords, depotLatLng]
      : tiendaCoords;

    return {
      id: route.route_id,
      truck: route.truck_id,
      day: route.day,
      color: colorForRoute(idx),
      coords,
      tiendaCoords,
      stops_info,
      stops: stops.length,
      km: Math.round(route.total_km || 0),
      cost: Math.round(route.total_costo || 0),
      depot,
    };
  });
}
