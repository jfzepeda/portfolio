'use client';

import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

/**
 * Mapa Leaflet pequeño que muestra tiendas pintadas por cluster.
 * `stores`: [{store_id, lat, lng, cluster}].
 * `centroids`: [{lat, lng}].
 * `cedis`: {lat, lng, nombre}.
 */
const PALETTE = [
  '#FF6B1A', '#38BDF8', '#10B981', '#F59E0B', '#A78BFA',
  '#EF4444', '#EC4899', '#84CC16', '#0EA5E9', '#F97316',
  '#8B5CF6', '#22C55E', '#FB923C', '#06B6D4', '#D946EF',
];

const TILE_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_LIGHT = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

export default function ClusterMap({ stores = [], centroids = [], cedis, height = 360 }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!containerRef.current || mapRef.current) return;
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');
      if (cancelled) return;
      const theme = document.documentElement.getAttribute('data-theme') || 'dark';
      const map = L.map(containerRef.current, { zoomControl: true, attributionControl: false });
      L.tileLayer(theme === 'dark' ? TILE_DARK : TILE_LIGHT, { subdomains: 'abcd', maxZoom: 19 }).addTo(map);
      mapRef.current = map;
      layerRef.current = L.layerGroup().addTo(map);
      // posición inicial
      if (cedis?.lat && cedis?.lng) {
        map.setView([cedis.lat, cedis.lng], 9);
      } else {
        map.setView([19.23, -103.72], 9);
      }
    })();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled || !mapRef.current || !layerRef.current) return;
      layerRef.current.clearLayers();

      // Tiendas
      const bounds = [];
      for (const s of stores) {
        if (!Number.isFinite(s.lat) || !Number.isFinite(s.lng)) continue;
        const color = s.cluster >= 0 ? PALETTE[s.cluster % PALETTE.length] : '#999';
        L.circleMarker([s.lat, s.lng], {
          radius: 4,
          fillColor: color,
          color: color,
          fillOpacity: 0.9,
          weight: 1,
        })
          .bindTooltip(`${s.store_id} · cluster ${s.cluster}`, { direction: 'top', opacity: 0.9 })
          .addTo(layerRef.current);
        bounds.push([s.lat, s.lng]);
      }
      // Centroides
      for (let i = 0; i < centroids.length; i += 1) {
        const c = centroids[i];
        if (!Number.isFinite(c?.lat) || !Number.isFinite(c?.lng)) continue;
        L.circleMarker([c.lat, c.lng], {
          radius: 8,
          fillColor: PALETTE[i % PALETTE.length],
          color: '#fff',
          fillOpacity: 0.5,
          weight: 2,
          dashArray: '3 3',
        }).addTo(layerRef.current);
      }
      // CEDIS
      if (cedis?.lat && cedis?.lng) {
        L.circleMarker([cedis.lat, cedis.lng], {
          radius: 9,
          fillColor: '#fff',
          color: '#FF6B1A',
          weight: 3,
          fillOpacity: 1,
        })
          .bindTooltip(cedis.nombre || 'CEDIS', { permanent: false })
          .addTo(layerRef.current);
        bounds.push([cedis.lat, cedis.lng]);
      }
      if (bounds.length > 1) {
        mapRef.current.fitBounds(bounds, { padding: [20, 20] });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [stores, centroids, cedis]);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        height,
        borderRadius: '12px',
        overflow: 'hidden',
        border: '1px solid var(--glass-border)',
      }}
    />
  );
}
