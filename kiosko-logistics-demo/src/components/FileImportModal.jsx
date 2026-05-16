'use client';

import { useState, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  CircularProgress,
  IconButton,
  MenuItem,
  Select,
  Slider,
  Tooltip,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

// ─── Constants ────────────────────────────────────────────────────────────────

const FIELDS = [
  { key: 'LAT',       label: 'Latitud',          keywords: ['lat', 'latitud', 'latitude'] },
  { key: 'LNG',       label: 'Longitud',          keywords: ['lng', 'lon', 'longitud', 'longitude'] },
  { key: 'ID_TIENDA', label: 'ID Tienda',         keywords: ['id', 'codigo', 'clave', 'tienda', 'store'] },
  { key: 'NOMBRE',    label: 'Nombre',            keywords: ['nombre', 'name', 'razon'] },
  { key: 'FRECUENCIA',label: 'Frecuencia',        keywords: ['frecuencia', 'freq', 'visita', 'clasificacion', 'class'] },
  { key: 'ZONA',      label: 'Zona',              keywords: ['zona', 'zone', 'area', 'region'] },
  { key: 'ESTADO',    label: 'Estado',            keywords: ['estado', 'state', 'entidad', 'municipio'] },
  { key: 'DEMANDA',   label: 'Demanda (cajas)',   keywords: ['demanda', 'cajas', 'qty', 'cantidad'] },
];

const LS_KEY = 'kiosko_col_mapping_v1';
const MAX_PREVIEW_COLS = 10;
const MAX_PREVIEW_ROWS = 7;
const MAX_HEADER_SCAN = 5;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalize(str) {
  return String(str ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function autoDetect(rows) {
  // Try rows 0–4, pick the one with most matches
  let bestRow = 0;
  let bestScore = -1;

  const scanLimit = Math.min(rows.length, MAX_HEADER_SCAN);
  for (let r = 0; r < scanLimit; r++) {
    let score = 0;
    const cells = rows[r] ?? [];
    for (const field of FIELDS) {
      for (const cell of cells) {
        const n = normalize(cell);
        for (const kw of field.keywords) {
          if (n === kw) { score += 3; break; }
          if (n.includes(kw)) { score += 2; break; }
        }
      }
    }
    if (score > bestScore) { bestScore = score; bestRow = r; }
  }

  const headers = rows[bestRow] ?? [];
  const mapping = {};
  const autoKeys = new Set();

  for (const field of FIELDS) {
    let bestColScore = 0;
    let bestCol = -1;
    headers.forEach((cell, colIdx) => {
      const n = normalize(cell);
      let s = 0;
      for (const kw of field.keywords) {
        if (n === kw) { s = 3; break; }
        if (n.includes(kw)) { s = Math.max(s, 2); }
      }
      if (s > bestColScore) { bestColScore = s; bestCol = colIdx; }
    });
    if (bestCol >= 0) {
      mapping[field.key] = bestCol;
      autoKeys.add(field.key);
    }
  }

  return { headerRow: bestRow, mapping, autoKeys };
}

function loadSavedMapping(fileName) {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const all = JSON.parse(raw);
    return all[fileName] ?? null;
  } catch {
    return null;
  }
}

function saveMapping(fileName, mapping, headerRow) {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const all = raw ? JSON.parse(raw) : {};
    all[fileName] = { mapping, headerRow };
    localStorage.setItem(LS_KEY, JSON.stringify(all));
  } catch { /* ignore */ }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldChip({ field, isMapped, mappedColIndex, isDragging, onDragStart }) {
  return (
    <Box
      draggable
      onDragStart={onDragStart}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1,
        py: 0.75,
        mb: 0.75,
        borderRadius: 1.5,
        border: isMapped
          ? '1px solid var(--accent)'
          : '1px solid var(--glass-border)',
        background: isMapped ? 'var(--accent-soft)' : 'var(--glass-bg)',
        cursor: 'grab',
        userSelect: 'none',
        opacity: isDragging ? 0.5 : 1,
        transition: 'all 0.15s',
        '&:hover': {
          background: isMapped ? 'rgba(255,107,26,0.2)' : 'var(--glass-strong)',
          borderColor: isMapped ? 'var(--accent-2)' : 'var(--text-subtle)',
        },
      }}
    >
      <DragIndicatorIcon sx={{ fontSize: 14, color: 'var(--text-subtle)', flexShrink: 0 }} />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" sx={{ color: 'var(--text-primary)', fontWeight: 600, display: 'block', lineHeight: 1.2, fontSize: '0.72rem' }}>
          {field.label}
        </Typography>
        {isMapped && (
          <Typography variant="caption" sx={{ color: 'var(--accent)', fontSize: '0.65rem', lineHeight: 1 }}>
            Col. {mappedColIndex + 1}
          </Typography>
        )}
      </Box>
      {isMapped && (
        <CheckCircleOutlineIcon sx={{ fontSize: 14, color: 'var(--accent)', flexShrink: 0 }} />
      )}
    </Box>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FileImportModal({
  open,
  onClose,
  onConfirm,
  title = 'Importar archivo',
}) {
  // File & parsing state
  const [file, setFile] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [workbook, setWorkbook] = useState(null);   // { sheetNames, sheets: { [name]: rows[][] } }
  const [activeSheet, setActiveSheet] = useState('');
  const [allRows, setAllRows] = useState([]);        // parsed rows for active sheet

  // Mapping state
  const [headerRow, setHeaderRow] = useState(0);
  const [mapping, setMapping] = useState({});        // { fieldKey: colIndex }
  const [autoDetected, setAutoDetected] = useState(false);
  const [autoKeys, setAutoKeys] = useState(new Set());

  // UI state
  const [dragOver, setDragOver] = useState(false);   // drop-zone level
  const [draggingField, setDraggingField] = useState(null);
  const [hoverCol, setHoverCol] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

  const fileInputRef = useRef(null);
  const changeFileInputRef = useRef(null);

  // reverseMapping: colIndex → fieldKey
  const reverseMapping = Object.entries(mapping).reduce((acc, [fk, ci]) => {
    acc[ci] = fk;
    return acc;
  }, {});

  const mappedCount = Object.keys(mapping).length;
  const latLngReady = mapping['LAT'] !== undefined && mapping['LNG'] !== undefined;

  // ── Parse file ──────────────────────────────────────────────────────────────

  const parseFile = useCallback(async (f) => {
    setParsing(true);
    setMapping({});
    setAutoDetected(false);
    setAutoKeys(new Set());
    setPreviewMode(false);

    try {
      const XLSX = await import('xlsx');
      const buf = await f.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });

      const sheetNames = wb.SheetNames;
      const sheets = {};
      sheetNames.forEach((name) => {
        const ws = wb.Sheets[name];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', raw: false });
        sheets[name] = rows.slice(0, 60);
      });

      const firstSheet = sheetNames[0];
      const rows = sheets[firstSheet] ?? [];

      setWorkbook({ sheetNames, sheets });
      setActiveSheet(firstSheet);
      setAllRows(rows);

      // Check localStorage first
      const saved = loadSavedMapping(f.name);
      if (saved) {
        setHeaderRow(saved.headerRow ?? 0);
        setMapping(saved.mapping ?? {});
      } else {
        const { headerRow: hr, mapping: m, autoKeys: ak } = autoDetect(rows);
        setHeaderRow(hr);
        setMapping(m);
        setAutoKeys(ak);
        setAutoDetected(true);
      }
    } catch (err) {
      console.error('Error al parsear archivo:', err);
    } finally {
      setParsing(false);
    }
  }, []);

  // ── Handle file selection ────────────────────────────────────────────────────

  const handleFiles = useCallback((files) => {
    const f = files[0];
    if (!f) return;
    setFile(f);
    parseFile(f);
  }, [parseFile]);

  // ── Drop zone handlers ───────────────────────────────────────────────────────

  const onDropZoneDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const onDropZoneDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const onDropZoneDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  // ── Sheet change ─────────────────────────────────────────────────────────────

  const handleSheetChange = (e) => {
    const name = e.target.value;
    setActiveSheet(name);
    const rows = workbook.sheets[name] ?? [];
    setAllRows(rows);
    setMapping({});
    setHeaderRow(0);
    setAutoDetected(false);
    setAutoKeys(new Set());
    const saved = loadSavedMapping(file?.name + '::' + name);
    if (saved) {
      setHeaderRow(saved.headerRow ?? 0);
      setMapping(saved.mapping ?? {});
    } else {
      const { headerRow: hr, mapping: m, autoKeys: ak } = autoDetect(rows);
      setHeaderRow(hr);
      setMapping(m);
      setAutoKeys(ak);
      setAutoDetected(true);
    }
  };

  // ── Column DnD ───────────────────────────────────────────────────────────────

  const onColDragOver = (e, colIdx) => {
    e.preventDefault();
    setHoverCol(colIdx);
  };

  const onColDragLeave = () => setHoverCol(null);

  const onColDrop = (e, colIdx) => {
    e.preventDefault();
    setHoverCol(null);
    if (!draggingField) return;
    setMapping((prev) => {
      const next = { ...prev };
      // Remove field from any previous column
      Object.keys(next).forEach((k) => { if (next[k] === colIdx && k !== draggingField) delete next[k]; });
      next[draggingField] = colIdx;
      return next;
    });
    setDraggingField(null);
  };

  const removeColMapping = (fieldKey) => {
    setMapping((prev) => {
      const next = { ...prev };
      delete next[fieldKey];
      return next;
    });
  };

  // ── Confirm ──────────────────────────────────────────────────────────────────

  const handleConfirm = () => {
    saveMapping(file?.name, mapping, headerRow);
    const columnMapping = Object.entries(mapping).reduce((acc, [k, v]) => {
      acc[k] = v;
      return acc;
    }, {});
    onConfirm({ file, sheetName: activeSheet, headerRow, columnMapping });
    handleReset();
  };

  // ── Reset ────────────────────────────────────────────────────────────────────

  const handleReset = () => {
    setFile(null);
    setWorkbook(null);
    setActiveSheet('');
    setAllRows([]);
    setMapping({});
    setHeaderRow(0);
    setAutoDetected(false);
    setAutoKeys(new Set());
    setPreviewMode(false);
    setDraggingField(null);
    setHoverCol(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  // ── Derived table data ────────────────────────────────────────────────────────

  const headers = allRows[headerRow] ?? [];
  const dataRows = allRows.slice(headerRow + 1, headerRow + 1 + MAX_PREVIEW_ROWS);
  const visibleCols = Math.min(headers.length, MAX_PREVIEW_COLS);
  const maxHeaderSlider = Math.max(0, Math.min((allRows.length || 2) - 2, 10));

  // ─── Render: Drop Zone ───────────────────────────────────────────────────────

  const renderDropZone = () => (
    <Box
      onDragOver={onDropZoneDragOver}
      onDragLeave={onDropZoneDragLeave}
      onDrop={onDropZoneDrop}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        py: 8,
        px: 4,
        border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--glass-border)'}`,
        borderRadius: 3,
        background: dragOver ? 'var(--accent-soft)' : 'var(--glass-bg)',
        transition: 'all 0.15s',
        cursor: 'pointer',
        minHeight: 280,
      }}
      onClick={() => fileInputRef.current?.click()}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: dragOver ? 'var(--accent-soft)' : 'var(--glass-strong)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: `1px solid ${dragOver ? 'var(--accent)' : 'var(--glass-border)'}`,
          transition: 'all 0.15s',
        }}
      >
        <UploadFileIcon sx={{ fontSize: 36, color: dragOver ? 'var(--accent)' : 'var(--text-muted)' }} />
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: 'var(--text-primary)', fontWeight: 600, mb: 0.5 }}>
          Arrastra tu archivo aquí
        </Typography>
        <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
          Formatos aceptados: .xlsx, .xls, .csv
        </Typography>
      </Box>
      <Button
        variant="outlined"
        size="small"
        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
        sx={{
          mt: 1,
          borderColor: 'var(--glass-border)',
          color: 'var(--text-secondary)',
          '&:hover': { borderColor: 'var(--accent)', color: 'var(--accent)', background: 'var(--accent-soft)' },
          transition: 'all 0.15s',
        }}
      >
        O elige un archivo
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        style={{ display: 'none' }}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </Box>
  );

  // ─── Render: Spinner ─────────────────────────────────────────────────────────

  const renderParsing = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, py: 10 }}>
      <CircularProgress size={48} sx={{ color: 'var(--accent)' }} />
      <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>Analizando archivo…</Typography>
    </Box>
  );

  // ─── Render: Mapping UI ──────────────────────────────────────────────────────

  const renderMappingUI = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0, height: '100%' }}>

      {/* TOP TOOLBAR */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          flexWrap: 'wrap',
          px: 2,
          py: 1.25,
          borderBottom: '1px solid var(--glass-border)',
          background: 'var(--glass-bg)',
          flexShrink: 0,
        }}
      >
        {/* Sheet selector */}
        {workbook?.sheetNames.length > 1 && (
          <Select
            value={activeSheet}
            onChange={handleSheetChange}
            size="small"
            sx={{
              fontSize: '0.8rem',
              color: 'var(--text-primary)',
              background: 'var(--bg-elevated)',
              '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--glass-border)' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--accent)' },
              '& .MuiSvgIcon-root': { color: 'var(--text-muted)' },
              minWidth: 120,
            }}
          >
            {workbook.sheetNames.map((s) => (
              <MenuItem key={s} value={s} sx={{ fontSize: '0.8rem' }}>{s}</MenuItem>
            ))}
          </Select>
        )}

        {/* Header row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 180 }}>
          <Typography variant="caption" sx={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            Encabezado: fila {headerRow + 1}
          </Typography>
          <Slider
            value={headerRow}
            min={0}
            max={maxHeaderSlider}
            step={1}
            onChange={(_, v) => { setHeaderRow(v); setMapping({}); setAutoDetected(false); }}
            size="small"
            sx={{
              width: 90,
              color: 'var(--accent)',
              '& .MuiSlider-thumb': { width: 12, height: 12 },
            }}
          />
        </Box>

        {/* Mapped count */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1.25,
            py: 0.4,
            borderRadius: 1,
            background: mappedCount > 0 ? 'var(--accent-soft)' : 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
          }}
        >
          {autoDetected && (
            <Tooltip title="Auto-detección aplicada">
              <AutoAwesomeIcon sx={{ fontSize: 14, color: 'var(--accent)', mr: 0.25 }} />
            </Tooltip>
          )}
          <Typography variant="caption" sx={{ color: mappedCount > 0 ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 600 }}>
            {mappedCount}/8 campos
          </Typography>
        </Box>

        <Box sx={{ ml: 'auto', display: 'flex', gap: 1, alignItems: 'center' }}>
          {/* Vista previa toggle */}
          <Button
            size="small"
            variant={previewMode ? 'contained' : 'outlined'}
            onClick={() => setPreviewMode((v) => !v)}
            sx={{
              fontSize: '0.72rem',
              px: 1.5,
              py: 0.4,
              minWidth: 0,
              ...(previewMode
                ? { background: 'var(--accent)', color: '#fff', '&:hover': { background: 'var(--accent-2)' } }
                : { borderColor: 'var(--glass-border)', color: 'var(--text-muted)', '&:hover': { borderColor: 'var(--accent)', color: 'var(--accent)' } }),
              transition: 'all 0.15s',
            }}
          >
            Vista mapeada
          </Button>

          {/* Cambiar archivo */}
          <Button
            size="small"
            variant="text"
            component="label"
            sx={{ fontSize: '0.72rem', px: 1.5, py: 0.4, color: 'var(--text-muted)', '&:hover': { color: 'var(--accent)' }, transition: 'all 0.15s', minWidth: 0 }}
          >
            Cambiar archivo
            <input
              ref={changeFileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              style={{ display: 'none' }}
              onChange={(e) => { handleReset(); handleFiles(e.target.files); }}
            />
          </Button>
        </Box>
      </Box>

      {/* MAIN AREA: LEFT PANEL + RIGHT TABLE */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

        {/* LEFT PANEL — field chips */}
        <Box
          sx={{
            width: 180,
            flexShrink: 0,
            borderRight: '1px solid var(--glass-border)',
            p: 1.5,
            overflowY: 'auto',
            background: 'var(--glass-bg)',
          }}
        >
          <Typography variant="caption" sx={{ color: 'var(--text-subtle)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', mb: 1 }}>
            Campos
          </Typography>
          {FIELDS.map((field) => {
            const isMapped = mapping[field.key] !== undefined;
            return (
              <FieldChip
                key={field.key}
                field={field}
                isMapped={isMapped}
                mappedColIndex={mapping[field.key]}
                isDragging={draggingField === field.key}
                onDragStart={() => setDraggingField(field.key)}
              />
            );
          })}
          <Typography variant="caption" sx={{ color: 'var(--text-subtle)', mt: 1.5, display: 'block', lineHeight: 1.4 }}>
            Arrastra un campo sobre la columna correspondiente en la tabla.
          </Typography>
        </Box>

        {/* RIGHT PANEL — table */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 0 }}>
          {previewMode ? renderMappedPreview() : renderFullTable()}
        </Box>
      </Box>
    </Box>
  );

  // ── Full table with drop zones ────────────────────────────────────────────────

  const renderFullTable = () => {
    if (headers.length === 0) {
      return (
        <Box sx={{ p: 3, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          No hay datos en esta hoja o fila de encabezado fuera de rango.
        </Box>
      );
    }

    return (
      <Box sx={{ overflowX: 'auto', width: '100%' }}>
        <table
          style={{
            borderCollapse: 'collapse',
            width: '100%',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
          }}
        >
          <thead>
            <tr>
              {Array.from({ length: visibleCols }, (_, ci) => {
                const fieldKey = reverseMapping[ci];
                const fieldDef = fieldKey ? FIELDS.find((f) => f.key === fieldKey) : null;
                const isHover = hoverCol === ci;
                const isMapped = !!fieldKey;

                return (
                  <th
                    key={ci}
                    onDragOver={(e) => onColDragOver(e, ci)}
                    onDragLeave={onColDragLeave}
                    onDrop={(e) => onColDrop(e, ci)}
                    style={{
                      padding: '0 8px 8px',
                      verticalAlign: 'bottom',
                      background: isMapped
                        ? 'rgba(255, 107, 26, 0.10)'
                        : isHover
                        ? 'rgba(255, 107, 26, 0.06)'
                        : 'transparent',
                      borderBottom: isHover
                        ? '2px solid var(--accent)'
                        : '1px solid var(--glass-border)',
                      borderLeft: '1px solid var(--glass-border)',
                      transition: 'all 0.15s',
                      minWidth: 90,
                      cursor: 'copy',
                      position: 'relative',
                    }}
                  >
                    {/* Field badge */}
                    {fieldDef && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          mb: 0.5,
                          px: 0.75,
                          py: 0.25,
                          borderRadius: 0.75,
                          background: 'var(--accent)',
                          width: 'fit-content',
                        }}
                      >
                        {autoKeys.has(fieldKey) && (
                          <AutoAwesomeIcon sx={{ fontSize: 10, color: '#fff' }} />
                        )}
                        <Typography sx={{ fontSize: '0.65rem', color: '#fff', fontWeight: 700, lineHeight: 1 }}>
                          {fieldDef.label}
                        </Typography>
                        <Box
                          component="span"
                          onClick={(e) => { e.stopPropagation(); removeColMapping(fieldKey); }}
                          sx={{
                            ml: 0.25,
                            cursor: 'pointer',
                            color: 'rgba(255,255,255,0.7)',
                            fontSize: '0.65rem',
                            lineHeight: 1,
                            fontWeight: 700,
                            '&:hover': { color: '#fff' },
                          }}
                        >
                          ×
                        </Box>
                      </Box>
                    )}
                    <Typography
                      sx={{
                        fontSize: '0.72rem',
                        color: isMapped ? 'var(--accent-2)' : isHover ? 'var(--accent)' : 'var(--text-secondary)',
                        fontWeight: 600,
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: 110,
                        transition: 'all 0.15s',
                      }}
                    >
                      {String(headers[ci] ?? `Col ${ci + 1}`)}
                    </Typography>
                    <Typography sx={{ fontSize: '0.6rem', color: 'var(--text-subtle)', display: 'block' }}>
                      #{ci + 1}
                    </Typography>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, ri) => (
              <tr
                key={ri}
                style={{
                  background: ri % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)',
                }}
              >
                {Array.from({ length: visibleCols }, (_, ci) => {
                  const isMapped = reverseMapping[ci] !== undefined;
                  return (
                    <td
                      key={ci}
                      style={{
                        padding: '5px 8px',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        borderLeft: '1px solid var(--glass-border)',
                        background: isMapped ? 'rgba(255, 107, 26, 0.04)' : undefined,
                        whiteSpace: 'nowrap',
                        maxWidth: 130,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        color: 'var(--text-muted)',
                        fontSize: '0.72rem',
                        transition: 'background 0.15s',
                      }}
                    >
                      {String(row[ci] ?? '')}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        {headers.length > MAX_PREVIEW_COLS && (
          <Typography variant="caption" sx={{ color: 'var(--text-subtle)', p: 1, display: 'block' }}>
            +{headers.length - MAX_PREVIEW_COLS} columnas ocultas
          </Typography>
        )}
      </Box>
    );
  };

  // ── Mapped preview table ─────────────────────────────────────────────────────

  const renderMappedPreview = () => {
    const mappedEntries = Object.entries(mapping); // [fieldKey, colIndex]
    if (mappedEntries.length === 0) {
      return (
        <Box sx={{ p: 3, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
          Aún no hay campos mapeados.
        </Box>
      );
    }

    return (
      <Box sx={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.75rem' }}>
          <thead>
            <tr>
              {mappedEntries.map(([fk]) => {
                const def = FIELDS.find((f) => f.key === fk);
                return (
                  <th
                    key={fk}
                    style={{
                      padding: '8px 12px',
                      background: 'rgba(255,107,26,0.14)',
                      borderBottom: '2px solid var(--accent)',
                      borderLeft: '1px solid var(--glass-border)',
                      color: 'var(--accent)',
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      whiteSpace: 'nowrap',
                      textAlign: 'left',
                    }}
                  >
                    {def?.label ?? fk}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, ri) => (
              <tr key={ri} style={{ background: ri % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                {mappedEntries.map(([fk, ci]) => (
                  <td
                    key={fk}
                    style={{
                      padding: '5px 12px',
                      borderBottom: '1px solid rgba(255,255,255,0.04)',
                      borderLeft: '1px solid var(--glass-border)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.72rem',
                    }}
                  >
                    {String(row[ci] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    );
  };

  // ─── Status line ─────────────────────────────────────────────────────────────

  const renderStatus = () => {
    if (!file) return null;
    if (latLngReady) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 16, color: 'var(--success)' }} />
          <Typography variant="caption" sx={{ color: 'var(--success)', fontWeight: 600 }}>
            LAT y LNG mapeados — listo para importar
          </Typography>
        </Box>
      );
    }
    return (
      <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>
        Mapea al menos LAT y LNG para continuar
      </Typography>
    );
  };

  // ─── Dialog ───────────────────────────────────────────────────────────────────

  const hasData = !parsing && workbook !== null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={hasData ? 'lg' : 'sm'}
      fullWidth
      PaperProps={{
        sx: {
          background: 'var(--bg-overlay)',
          border: '1px solid var(--glass-border)',
          backdropFilter: 'blur(20px) saturate(140%)',
          borderRadius: 3,
          maxHeight: '90vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-2)',
        },
      }}
    >
      {/* Title */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 2,
          borderBottom: '1px solid var(--glass-border)',
          background: 'var(--glass-bg)',
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <UploadFileIcon sx={{ color: 'var(--accent)', fontSize: 22 }} />
          <Typography variant="h6" sx={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem' }}>
            {title}
          </Typography>
          {file && (
            <Typography
              variant="caption"
              sx={{
                color: 'var(--text-muted)',
                background: 'var(--glass-strong)',
                border: '1px solid var(--glass-border)',
                borderRadius: 1,
                px: 1,
                py: 0.25,
                ml: 0.5,
                maxWidth: 200,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {file.name}
            </Typography>
          )}
        </Box>
        <IconButton
          onClick={handleClose}
          size="small"
          sx={{
            color: 'var(--text-muted)',
            '&:hover': { color: 'var(--text-primary)', background: 'var(--glass-strong)' },
            transition: 'all 0.15s',
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent
        sx={{
          p: hasData ? 0 : 3,
          flex: 1,
          overflow: hasData ? 'hidden' : 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {parsing
          ? renderParsing()
          : hasData
          ? renderMappingUI()
          : renderDropZone()}
      </DialogContent>

      {/* Actions */}
      <DialogActions
        sx={{
          px: 3,
          py: 1.75,
          borderTop: '1px solid var(--glass-border)',
          background: 'var(--glass-bg)',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          gap: 1,
        }}
      >
        <Box sx={{ flex: 1 }}>{renderStatus()}</Box>
        <Button
          onClick={handleClose}
          sx={{
            color: 'var(--text-muted)',
            '&:hover': { color: 'var(--text-primary)', background: 'var(--glass-strong)' },
            transition: 'all 0.15s',
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={!latLngReady}
          variant="contained"
          sx={{
            background: latLngReady ? 'var(--accent)' : 'var(--glass-strong)',
            color: latLngReady ? '#fff' : 'var(--text-subtle)',
            fontWeight: 700,
            px: 2.5,
            '&:hover': { background: latLngReady ? 'var(--accent-2)' : undefined },
            '&.Mui-disabled': { background: 'var(--glass-strong)', color: 'var(--text-subtle)' },
            transition: 'all 0.15s',
          }}
        >
          Confirmar importación
        </Button>
      </DialogActions>
    </Dialog>
  );
}
