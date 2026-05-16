'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Button,
  IconButton,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { QRCodeSVG } from 'qrcode.react';

const fmtMXN = (n) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(n ?? 0);

/**
 * Construye la URL de Google Maps para la ruta dada.
 * @param {object} legacyRuta - entrada de rutas del VRP output
 * @param {Array}  cedis       - array de CEDIS con {lat, lng}
 */
function buildGoogleMapsUrl(legacyRuta, cedis) {
  if (!legacyRuta) return 'https://maps.google.com';

  const tiendas = legacyRuta.tiendas ?? [];
  if (tiendas.length === 0) return 'https://maps.google.com';

  const cedisPrincipal = cedis?.[0];
  const origin = cedisPrincipal
    ? `${cedisPrincipal.lat},${cedisPrincipal.lng}`
    : `${tiendas[0].lat},${tiendas[0].lng}`;

  const last = tiendas[tiendas.length - 1];
  const destination = `${last.lat},${last.lng}`;

  const middle = tiendas.slice(0, tiendas.length - 1);
  const waypoints = middle.map((t) => `${t.lat},${t.lng}`).join('|');

  const url = new URL('https://www.google.com/maps/dir/');
  url.searchParams.set('api', '1');
  url.searchParams.set('origin', origin);
  url.searchParams.set('destination', destination);
  if (waypoints) url.searchParams.set('waypoints', waypoints);
  url.searchParams.set('travelmode', 'driving');

  return url.toString();
}

export default function ShareRouteModal({ open, onClose, route, run }) {
  const [copied, setCopied] = useState(false);

  const legacyVrp = run?.result?.legacy_vrp_output ?? {};
  const rutas = legacyVrp.rutas ?? [];
  const cedis = legacyVrp.meta?.cedis ?? [];

  const legacyRuta = useMemo(
    () => rutas.find((r) => r.ruta_id === route?.route_id) ?? null,
    [rutas, route?.route_id],
  );

  const mapsUrl = useMemo(
    () => buildGoogleMapsUrl(legacyRuta, cedis),
    [legacyRuta, cedis],
  );

  const tiendas = legacyRuta?.tiendas ?? [];
  const stopsCount = route?.sequence?.length ?? tiendas.length;

  const waMsg = useMemo(() => {
    const lines = [
      `*Ruta ${route?.route_id ?? ''}* — Unidad: ${route?.truck_id ?? ''}`,
      `Paradas: ${stopsCount} | Distancia: ${route?.total_km ?? 0} km | Costo: ${fmtMXN(route?.total_costo)}`,
      '',
      'Abrir en Google Maps:',
      mapsUrl,
    ];
    return lines.join('\n');
  }, [route, stopsCount, mapsUrl]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(mapsUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback silencioso
    }
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(waMsg)}`, '_blank');
  };

  if (!route) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(24px) saturate(150%)',
          WebkitBackdropFilter: 'blur(24px) saturate(150%)',
          border: '1px solid var(--glass-border)',
          borderRadius: '18px',
          color: 'var(--text-primary)',
          boxShadow: 'var(--shadow-glow)',
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          pb: 1,
          pr: 6,
          display: 'flex',
          flexDirection: 'column',
          gap: 0.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography
            component="span"
            sx={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}
          >
            Compartir Ruta {route.route_id}
          </Typography>

          {/* Truck badge */}
          <Box
            sx={{
              px: 1,
              py: '2px',
              borderRadius: '999px',
              background: 'var(--accent-soft)',
              border: '1px solid var(--accent)',
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--accent)',
            }}
          >
            {route.truck_id}
          </Box>
        </Box>

        {/* KPI strip */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            mt: 0.5,
          }}
        >
          {[
            { label: 'Distancia', value: `${route.total_km ?? 0} km` },
            { label: 'Paradas',   value: stopsCount },
            { label: 'Costo',     value: fmtMXN(route.total_costo) },
          ].map(({ label, value }) => (
            <Box key={label} sx={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <Typography sx={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--text-muted)' }}>
                {label}
              </Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                {value}
              </Typography>
            </Box>
          ))}
        </Box>

        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            color: 'var(--text-muted)',
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        {/* Share options: 3-column grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 1.5,
            mt: 1,
          }}
        >
          {/* --- QR Code --- */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1,
              p: 1.5,
              borderRadius: '12px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                mb: 0.5,
              }}
            >
              <QrCode2Icon sx={{ fontSize: 14, color: 'var(--text-muted)' }} />
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>
                QR Code
              </Typography>
            </Box>

            <Box
              sx={{
                p: '8px',
                borderRadius: '10px',
                background: '#fff',
                lineHeight: 0,
              }}
            >
              <QRCodeSVG value={mapsUrl} size={140} />
            </Box>

            <Typography
              sx={{
                fontSize: 10,
                color: 'var(--text-muted)',
                textAlign: 'center',
                lineHeight: 1.4,
              }}
            >
              Escanear para abrir en Google Maps
            </Typography>
          </Box>

          {/* --- WhatsApp --- */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
              p: 1.5,
              borderRadius: '12px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              <WhatsAppIcon sx={{ fontSize: 14, color: 'var(--text-muted)' }} />
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>
                WhatsApp
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<WhatsAppIcon sx={{ fontSize: 18 }} />}
              onClick={handleWhatsApp}
              sx={{
                background: '#25D366',
                color: '#fff',
                borderRadius: '999px',
                fontWeight: 700,
                fontSize: 12,
                px: 2,
                boxShadow: '0 0 12px rgba(37,211,102,0.35)',
                '&:hover': { background: '#1DAA55' },
              }}
            >
              Enviar
            </Button>

            <Typography
              sx={{
                fontSize: 10,
                color: 'var(--text-muted)',
                textAlign: 'center',
                lineHeight: 1.4,
              }}
            >
              Comparte la ruta con el conductor por WhatsApp
            </Typography>
          </Box>

          {/* --- Copiar enlace --- */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
              p: 1.5,
              borderRadius: '12px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ContentCopyIcon sx={{ fontSize: 14, color: 'var(--text-muted)' }} />
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>
                Copiar enlace
              </Typography>
            </Box>

            <Button
              variant="outlined"
              startIcon={
                copied
                  ? <CheckIcon sx={{ fontSize: 16 }} />
                  : <ContentCopyIcon sx={{ fontSize: 16 }} />
              }
              onClick={handleCopy}
              sx={{
                borderRadius: '999px',
                fontSize: 12,
                fontWeight: 700,
                borderColor: copied ? 'var(--success)' : 'var(--glass-border)',
                color: copied ? 'var(--success)' : 'var(--text-secondary)',
                '&:hover': {
                  borderColor: copied ? 'var(--success)' : 'var(--accent)',
                  color: copied ? 'var(--success)' : 'var(--accent)',
                },
                transition: 'border-color .2s, color .2s',
              }}
            >
              {copied ? 'Copiado' : 'Copiar'}
            </Button>

            <Button
              variant="text"
              endIcon={<OpenInNewIcon sx={{ fontSize: 13 }} />}
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              component="a"
              sx={{
                fontSize: 10,
                color: 'var(--text-muted)',
                p: 0,
                '&:hover': { color: 'var(--accent)' },
              }}
            >
              Abrir Maps
            </Button>
          </Box>
        </Box>

        {/* Stops list */}
        {tiendas.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: 'var(--text-muted)',
                mb: 1,
              }}
            >
              Paradas
            </Typography>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                maxHeight: 220,
                overflowY: 'auto',
                pr: '4px',
                '&::-webkit-scrollbar': { width: 4 },
                '&::-webkit-scrollbar-track': { background: 'transparent' },
                '&::-webkit-scrollbar-thumb': {
                  background: 'var(--glass-border)',
                  borderRadius: 4,
                },
              }}
            >
              {tiendas.slice(0, 10).map((tienda, idx) => (
                <Box
                  key={tienda.store_id ?? idx}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: '6px 10px',
                    borderRadius: '8px',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--glass-border)',
                  }}
                >
                  {/* Number badge */}
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      background: 'var(--accent-soft)',
                      border: '1px solid var(--accent)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      fontWeight: 700,
                      color: 'var(--accent)',
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}
                  </Box>

                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {tienda.nombre ?? tienda.store_id ?? `Tienda ${idx + 1}`}
                    </Typography>
                  </Box>

                  {tienda.demanda_cajas != null && (
                    <Typography
                      sx={{
                        fontSize: 10,
                        fontWeight: 600,
                        color: 'var(--text-muted)',
                        flexShrink: 0,
                      }}
                    >
                      {tienda.demanda_cajas} cajas
                    </Typography>
                  )}
                </Box>
              ))}

              {tiendas.length > 10 && (
                <Typography
                  sx={{
                    fontSize: 10,
                    color: 'var(--text-subtle)',
                    textAlign: 'center',
                    py: 0.5,
                  }}
                >
                  +{tiendas.length - 10} paradas más
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
