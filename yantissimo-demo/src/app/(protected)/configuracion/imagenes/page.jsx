"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import UnoptimizedImage from "~/resources/UnoptimizedImage.jsx";
import { modelos } from "./modelos.js";
import {
  createImage,
  getImages,
  getMissingImages,
  getProveedores,
  removeImage,
  refreshImages,
  updateImage,
} from "./imagesApi";
import {
  Alert,
  Autocomplete,
  Box,
  ButtonGroup,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  AddCircleOutline as AddCircleOutlineIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  FilterList as FilterListIcon,
  Link as LinkIcon,
  Visibility as VisibilityIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import Header from "~/components/header";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";

const DEFAULT_PROVEEDOR = "yantissimo";

const filterModelos = (options, { inputValue }) => {
  if (!inputValue) return options.slice(0, 50);
  const lowered = inputValue.toLowerCase();
  return options
    .filter((option) => option.toLowerCase().includes(lowered))
    .slice(0, 50);
};

const ImagenesPage = () => {
  const numberFormatter = useMemo(() => new Intl.NumberFormat("es-MX"), []);
  const [activeView, setActiveView] = useState("catalogo");
  const [images, setImages] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingInline, setSavingInline] = useState(false);
  const [savingModal, setSavingModal] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [refreshDialogOpen, setRefreshDialogOpen] = useState(false);
  const [refreshMarca, setRefreshMarca] = useState("");
  const [refreshClearAll, setRefreshClearAll] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [provFilter, setProvFilter] = useState("");
  const [limit, setLimit] = useState(18);
  const [offset, setOffset] = useState(0);
  const [lastCount, setLastCount] = useState(0);
  const [missingRows, setMissingRows] = useState([]);
  const [missingLoading, setMissingLoading] = useState(false);
  const [missingSearchTerm, setMissingSearchTerm] = useState("");
  const [missingMarcaFilter, setMissingMarcaFilter] = useState("");
  const [missingLimit, setMissingLimit] = useState(50);
  const [missingOffset, setMissingOffset] = useState(0);
  const [missingLastCount, setMissingLastCount] = useState(0);
  const [totalCatalogModels, setTotalCatalogModels] = useState(0);
  const [totalMissingModels, setTotalMissingModels] = useState(0);
  const [marcaOptions, setMarcaOptions] = useState([]);
  const [marcaMenuAnchorEl, setMarcaMenuAnchorEl] = useState(null);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState("create");
  const [editorTarget, setEditorTarget] = useState(null);
  const [editorIsCopy, setEditorIsCopy] = useState(false);
  const [formValues, setFormValues] = useState({
    model: "",
    url: "",
    proveedor: DEFAULT_PROVEEDOR,
  });

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTarget, setPreviewTarget] = useState(null);
  const [groupEditOpen, setGroupEditOpen] = useState(false);
  const [groupEditItems, setGroupEditItems] = useState([]);
  const [bulkUrlEditOpen, setBulkUrlEditOpen] = useState(false);
  const [bulkUrlEditItems, setBulkUrlEditItems] = useState([]);
  const [bulkUrlValue, setBulkUrlValue] = useState("");
  const [bulkUrlSaving, setBulkUrlSaving] = useState(false);

  const [editingRowId, setEditingRowId] = useState(null);
  const [rowDraft, setRowDraft] = useState({
    model: "",
    url: "",
    proveedor: DEFAULT_PROVEEDOR,
    description: "",
  });

  const fetchImages = useCallback(
    async (signal, query) => {
      setLoading(true);
      setError("");
      try {
        const data = await getImages({
          signal,
          query,
          proveedor: provFilter,
          limit,
          offset,
        });
        const items = Array.isArray(data) ? data : data?.items || [];
        setImages(items);
        setLastCount(items.length);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "No se pudieron cargar las imagenes.");
        }
      } finally {
        setLoading(false);
      }
    },
    [limit, offset, provFilter]
  );

  const fetchMissingModels = useCallback(
    async (signal, { mode = "table" } = {}) => {
      const shouldLoadRows = mode === "table";
      if (shouldLoadRows) setMissingLoading(true);
      setError("");
      try {
        const data = await getMissingImages({
          signal,
          limit: shouldLoadRows ? missingLimit : 1,
          offset: shouldLoadRows ? missingOffset : 0,
          search: shouldLoadRows ? missingSearchTerm : "",
          marca: shouldLoadRows ? missingMarcaFilter : "",
          includeSummary: true,
          includeMarcas: true,
        });

        const items = Array.isArray(data)
          ? data
          : data?.items || data?.rows || [];
        const meta = data?.meta || {};
        const rawMarcas = data?.marcas || data?.brands || meta?.marcas || [];
        const normalizedMarcas = rawMarcas
          .map((marca) => {
            if (typeof marca === "string") {
              return { value: marca, count: 0 };
            }
            return {
              value: marca?.marca || marca?.name || "",
              count: Number(marca?.count ?? marca?.total ?? 0) || 0,
            };
          })
          .filter((marca) => marca.value);

        const nextMissingTotal =
          Number(
            meta?.total_missing ??
              data?.total_missing ??
              data?.missing_total ??
              items.length
          ) || 0;
        const nextCatalogTotal =
          Number(
            meta?.total_catalog_models ??
              data?.total_catalog_models ??
              data?.catalog_total ??
              data?.total_models ??
              0
          ) || 0;

        setTotalMissingModels(nextMissingTotal);
        setTotalCatalogModels(nextCatalogTotal);
        setMarcaOptions(normalizedMarcas);

        if (shouldLoadRows) {
          setMissingRows(items);
          setMissingLastCount(items.length);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(
            err.message || "No se pudieron cargar los modelos sin imagen."
          );
        }
      } finally {
        if (shouldLoadRows) setMissingLoading(false);
      }
    },
    [missingLimit, missingMarcaFilter, missingOffset, missingSearchTerm]
  );

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetchImages(controller.signal, searchTerm);
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [fetchImages, searchTerm]);

  useEffect(() => {
    setOffset(0);
  }, [searchTerm, provFilter]);

  useEffect(() => {
    setMissingOffset(0);
  }, [missingSearchTerm, missingMarcaFilter]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      if (activeView === "faltantes") {
        fetchMissingModels(controller.signal, { mode: "table" });
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [
    activeView,
    fetchMissingModels,
    missingSearchTerm,
    missingMarcaFilter,
    missingLimit,
    missingOffset,
  ]);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const data = await getMissingImages({
          signal: controller.signal,
          limit: 1,
          offset: 0,
          includeSummary: true,
          includeMarcas: true,
        });

        const meta = data?.meta || {};
        const rawMarcas = data?.marcas || data?.brands || meta?.marcas || [];
        const normalizedMarcas = rawMarcas
          .map((marca) => {
            if (typeof marca === "string") {
              return { value: marca, count: 0 };
            }
            return {
              value: marca?.marca || marca?.name || "",
              count: Number(marca?.count ?? marca?.total ?? 0) || 0,
            };
          })
          .filter((marca) => marca.value);

        const nextMissingTotal =
          Number(
            meta?.total_missing ??
              data?.total_missing ??
              data?.missing_total ??
              0
          ) || 0;
        const nextCatalogTotal =
          Number(
            meta?.total_catalog_models ??
              data?.total_catalog_models ??
              data?.catalog_total ??
              data?.total_models ??
              0
          ) || 0;

        setTotalMissingModels(nextMissingTotal);
        setTotalCatalogModels(nextCatalogTotal);
        setMarcaOptions(normalizedMarcas);
      } catch (_err) {
        // No bloquear la carga de catálogo si la lectura de resumen falla.
      }
    })();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    (async () => {
      setError("");
      try {
        const data = await getProveedores();
        const prov = Array.isArray(data) ? data : data?.items || [];
        setProveedores(prov);
        console.log("Proveedores cargados:", prov);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "No se pudieron cargar los proveedores.");
        }
      }
    })();
  }, []);

  const resetForm = useCallback(() => {
    setFormValues({
      model: "",
      url: "",
      proveedor: DEFAULT_PROVEEDOR,
      description: "",
    });
  }, []);

  const validatePayload = useCallback((payload) => {
    if (!payload.model?.trim() || !payload.url?.trim()) {
      setError("Modelo y URL son obligatorios.");
      return false;
    }
    return true;
  }, []);

  const handleOpenRefreshDialog = () => {
    setRefreshMarca("");
    setRefreshClearAll(false);
    setRefreshDialogOpen(true);
  };

  const handleConfirmRefresh = async () => {
    setRefreshDialogOpen(false);
    setTransferring(true);
    setError("");
    try {
      await refreshImages({
        marca: refreshMarca || null,
        clearAll: refreshClearAll,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setTransferring(false);
    }
  };

  const handleOpenCreate = () => {
    setError("");
    setEditorMode("create");
    setEditorTarget(null);
    setEditorIsCopy(false);
    resetForm();
    setEditorOpen(true);
  };

  const handleOpenCreateVariant = (image) => {
    setError("");
    setEditorMode("create");
    setEditorTarget(null);
    setEditorIsCopy(true);
    setFormValues({
      model: "",
      url: image?.url || "",
      proveedor: image?.proveedor || DEFAULT_PROVEEDOR,
      description: image?.description || "",
    });
    setEditorOpen(true);
  };

  const handleOpenEdit = (image) => {
    setError("");
    setEditorMode("edit");
    setEditorTarget(image);
    setEditorIsCopy(false);
    setFormValues({
      model: image?.model || "",
      url: image?.url || "",
      proveedor: image?.proveedor || DEFAULT_PROVEEDOR,
      description: image?.description || "",
    });
    setEditorOpen(true);
  };

  const handleEditorStepNavigation = useCallback(
    (step) => {
      if (editorMode !== "edit" || !editorTarget?.id) return;
      const currentIndex = images.findIndex(
        (item) => item?.id === editorTarget.id
      );
      if (currentIndex < 0) return;

      const nextIndex = currentIndex + step;
      if (nextIndex < 0 || nextIndex >= images.length) return;

      const nextImage = images[nextIndex];
      if (!nextImage) return;

      setError("");
      setEditorTarget(nextImage);
      setFormValues({
        model: nextImage?.model || "",
        url: nextImage?.url || "",
        proveedor: nextImage?.proveedor || DEFAULT_PROVEEDOR,
        description: nextImage?.description || "",
      });
    },
    [editorMode, editorTarget, images]
  );

  const handleEditorKeyDown = useCallback(
    (event) => {
      if (editorMode !== "edit") return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;

      if (event.key === "ArrowUp") {
        event.preventDefault();
        handleEditorStepNavigation(-1);
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        handleEditorStepNavigation(1);
      }
    },
    [editorMode, handleEditorStepNavigation]
  );

  const handleOpenGroupEdit = (items) => {
    setGroupEditItems(Array.isArray(items) ? items : []);
    setGroupEditOpen(true);
  };

  const handleCloseGroupEdit = () => {
    setGroupEditOpen(false);
    setGroupEditItems([]);
  };

  const handleSelectGroupEditItem = (image) => {
    handleCloseGroupEdit();
    handleOpenEdit(image);
  };

  const handleOpenBulkUrlEdit = (items, currentUrl) => {
    setError("");
    setBulkUrlEditItems(Array.isArray(items) ? items : []);
    setBulkUrlValue(currentUrl || "");
    setBulkUrlEditOpen(true);
  };

  const handleCloseBulkUrlEdit = () => {
    if (bulkUrlSaving) return;
    setBulkUrlEditOpen(false);
    setBulkUrlEditItems([]);
    setBulkUrlValue("");
  };

  const handleBulkUrlSave = async () => {
    const nextUrl = bulkUrlValue?.trim();
    if (!nextUrl) {
      setError("La URL es obligatoria.");
      return;
    }

    const targets = bulkUrlEditItems.filter((item) => item?.id);
    if (targets.length === 0) {
      setError("No hay registros válidos para actualizar.");
      return;
    }

    setBulkUrlSaving(true);
    setError("");

    try {
      const results = await Promise.allSettled(
        targets.map(async (item) => {
          const payload = {
            model: item?.model?.trim() || "",
            url: nextUrl,
            proveedor: item?.proveedor || DEFAULT_PROVEEDOR,
            description: item?.description || "",
          };

          const data = await updateImage(item.id, payload);

          return { id: item.id, data };
        })
      );

      const updatedById = new Map();
      let failedCount = 0;
      results.forEach((result) => {
        if (result.status === "fulfilled") {
          updatedById.set(result.value.id, result.value.data);
        } else {
          failedCount += 1;
        }
      });

      const successCount = updatedById.size;
      if (successCount > 0) {
        setImages((prev) =>
          prev.map((row) => {
            if (!updatedById.has(row.id)) return row;
            const updated = updatedById.get(row.id);
            return updated || { ...row, url: nextUrl };
          })
        );
        setBulkUrlEditOpen(false);
        setBulkUrlEditItems([]);
        setBulkUrlValue("");
      }

      if (failedCount > 0) {
        setError(
          `Se actualizaron ${successCount} de ${targets.length} registros del conjunto.`
        );
      } else if (successCount === 0) {
        setError("No se pudo actualizar la URL del conjunto.");
      }
    } catch (err) {
      setError(err.message || "No se pudo actualizar la URL del conjunto.");
    } finally {
      setBulkUrlSaving(false);
    }
  };

  const handleCloseEditor = () => {
    setEditorOpen(false);
    setEditorTarget(null);
    setEditorIsCopy(false);
    resetForm();
  };

  const handleEditorSave = async () => {
    const payload = {
      model: formValues.model?.trim(),
      url: formValues.url?.trim(),
      proveedor: formValues.proveedor || DEFAULT_PROVEEDOR,
      description: formValues.description || "",
      ...(editorMode === "create" && editorIsCopy ? { is_copy: true } : {}),
    };
    if (!validatePayload(payload)) return;
    setSavingModal(true);
    setError("");
    try {
      const data =
        editorMode === "edit" && editorTarget?.id
          ? await updateImage(editorTarget.id, payload)
          : await createImage(payload);
      if (editorMode === "edit" && editorTarget?.id) {
        setImages((prev) =>
          prev.map((row) =>
            row.id === editorTarget.id ? data || { ...row, ...payload } : row
          )
        );
      } else if (data) {
        setImages((prev) => [data, ...prev]);
      } else {
        fetchImages(undefined, searchTerm);
      }
      setEditorOpen(false);
      setEditorTarget(null);
      resetForm();
    } catch (err) {
      setError(err.message || "No se pudo guardar la imagen.");
    } finally {
      setSavingModal(false);
    }
  };

  const handleOpenPreview = (image) => {
    setPreviewTarget(image);
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewTarget(null);
  };

  const handleStartInlineEdit = (image) => {
    if (!image?.id) return;
    setError("");
    setEditingRowId(image.id);
    setRowDraft({
      model: image.model || "",
      url: image.url || "",
      proveedor: image.proveedor || DEFAULT_PROVEEDOR,
      description: image.description || "",
    });
  };

  const handleInlineCancel = () => {
    setEditingRowId(null);
    setRowDraft({
      model: "",
      url: "",
      proveedor: DEFAULT_PROVEEDOR,
      description: "",
    });
  };

  const handleInlineSave = async () => {
    if (!editingRowId) return;
    const payload = {
      model: rowDraft.model?.trim(),
      url: rowDraft.url?.trim(),
      proveedor: rowDraft.proveedor || DEFAULT_PROVEEDOR,
      description: rowDraft.description || "",
    };
    if (!validatePayload(payload)) return;
    setSavingInline(true);
    setError("");
    try {
      const data = await updateImage(editingRowId, payload);
      setImages((prev) =>
        prev.map((row) =>
          row.id === editingRowId ? data || { ...row, ...payload } : row
        )
      );
      setEditingRowId(null);
    } catch (err) {
      setError(err.message || "No se pudo actualizar la imagen.");
    } finally {
      setSavingInline(false);
    }
  };

  const handleDelete = async (image) => {
    if (!image?.id) return;
    const ok = confirm("¿Deseas eliminar esta imagen?");
    if (!ok) return;
    setError("");
    try {
      await removeImage(image.id);
      setImages((prev) => prev.filter((row) => row.id !== image.id));
    } catch (err) {
      setError(err.message || "No se pudo eliminar la imagen.");
    }
  };

  const handleInlineKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleInlineSave();
    }
    if (event.key === "Escape") {
      event.preventDefault();
      handleInlineCancel();
    }
  };

  const handlePrevPage = () => {
    setOffset((prev) => Math.max(prev - limit, 0));
  };

  const handleNextPage = () => {
    if (lastCount < limit) return;
    setOffset((prev) => prev + limit);
  };

  const handleLimitChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value) || value <= 0) {
      setLimit(1);
    } else {
      setLimit(value);
    }
  };

  const handleMissingPrevPage = () => {
    setMissingOffset((prev) => Math.max(prev - missingLimit, 0));
  };

  const handleMissingNextPage = () => {
    if (missingLastCount < missingLimit) return;
    setMissingOffset((prev) => prev + missingLimit);
  };

  const handleMissingLimitChange = (event) => {
    const value = parseInt(event.target.value, 10);
    if (isNaN(value) || value <= 0) {
      setMissingLimit(1);
      return;
    }
    setMissingLimit(value);
  };

  const handleOpenMarcaMenu = (event) => {
    setMarcaMenuAnchorEl(event.currentTarget);
  };

  const handleCloseMarcaMenu = () => {
    setMarcaMenuAnchorEl(null);
  };

  const handleMarcaSelect = (marca) => {
    setMissingMarcaFilter(marca || "");
    setMarcaMenuAnchorEl(null);
  };

  const totalMappedModels =
    totalCatalogModels > 0
      ? Math.max(totalCatalogModels - totalMissingModels, 0)
      : 0;

  const groupedImages = useMemo(() => {
    const grouped = new Map();

    images.forEach((image, idx) => {
      const normalizedUrl = (image?.url || "").trim();
      const key = normalizedUrl || `__empty_url__${image?.id ?? idx}`;
      const current = grouped.get(key);

      if (current) {
        current.items.push(image);
        return;
      }

      grouped.set(key, {
        key,
        url: normalizedUrl,
        description: image?.description || "",
        items: [image],
      });
    });

    return Array.from(grouped.values());
  }, [images]);

  return (
    <Box>
      <IconButton
        href="/configuracion/imagenes/tinder"
        color="contrast"
        sx={{
          position: "fixed",
          top: 40,
          right: 40,
          zIndex: 1300,
        }}
      >
        <LocalFireDepartmentIcon />
      </IconButton>
      <Header
        title="Catálogo Imágenes"
        subtitle={
          <>
            Total de modelos mapeados {numberFormatter.format(totalMappedModels)}{" "}
            de {numberFormatter.format(totalCatalogModels)}
          </>
        }
        subtitleSx={{ typography: "body2" }}
      />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <ButtonGroup variant="outlined" size="small">
          <Button
            color={activeView === "catalogo" ? "inventario" : "inherit"}
            variant={activeView === "catalogo" ? "contained" : "outlined"}
            onClick={() => setActiveView("catalogo")}
          >
            Catálogo
          </Button>
          <Button
            color={activeView === "faltantes" ? "inventario" : "inherit"}
            variant={activeView === "faltantes" ? "contained" : "outlined"}
            onClick={() => setActiveView("faltantes")}
          >
            Modelos sin imagen
          </Button>
        </ButtonGroup>

        {activeView === "catalogo" ? (
          <>
            <Box sx={{ flexGrow: 1 }}>
              <FormControl sx={{ width: 200 }} variant="standard">
                <InputLabel>Proveedor</InputLabel>
                <Select
                  label="Proveedor"
                  value={provFilter || ""}
                  onChange={(e) => setProvFilter(e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {proveedores.map((prov) => (
                    <MenuItem key={prov} value={prov}>
                      {prov}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box
              sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}
            >
              <TextField
                label="Buscar"
                variant="standard"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por modelo, proveedor o URL"
                size="small"
                sx={{ width: 300 }}
              />
            </Box>
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 1.5,
              }}
            >
              <Button
                variant="outlined"
                color="inventario"
                onClick={handleOpenRefreshDialog}
                disabled={transferring}
                startIcon={transferring ? <CircularProgress size={16} /> : null}
                sx={{ my: 2 }}
              >
                {transferring ? "Transfiriendo..." : "Transferir imágenes"}
              </Button>
              <Button
                variant="contained"
                color="inventario"
                onClick={handleOpenCreate}
                sx={{ my: 2 }}
              >
                Añadir modelo
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Box
              sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}
            >
              <TextField
                label="Buscar"
                variant="standard"
                value={missingSearchTerm}
                onChange={(e) => setMissingSearchTerm(e.target.value)}
                placeholder="Buscar por artículo, proveedor o imagenes_id"
                size="small"
                sx={{ width: 380 }}
              />
            </Box>
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 0.75,
              }}
            >
              <Tooltip
                title={
                  missingMarcaFilter
                    ? `Marca: ${missingMarcaFilter}`
                    : "Filtrar por marca"
                }
              >
                <IconButton onClick={handleOpenMarcaMenu}>
                  <FilterListIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </>
        )}

        <Menu
          anchorEl={marcaMenuAnchorEl}
          open={Boolean(marcaMenuAnchorEl)}
          onClose={handleCloseMarcaMenu}
        >
          <MenuItem
            selected={!missingMarcaFilter}
            onClick={() => handleMarcaSelect("")}
          >
            Todas las marcas
          </MenuItem>
          {marcaOptions.map((marca) => (
            <MenuItem
              key={marca.value}
              selected={missingMarcaFilter === marca.value}
              onClick={() => handleMarcaSelect(marca.value)}
            >
              {marca.value} ({numberFormatter.format(marca.count)})
            </MenuItem>
          ))}
        </Menu>
      </Box>
      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      {activeView === "catalogo" ? (
        <>
          {/* Contenedor scrolleable con overflow vertical que desparece */}
          <TableContainer
            component={Paper}
            sx={{ overflowX: "auto", maxHeight: "70vh" }}
          >
            <Table sx={{ minWidth: 900 }} stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {[
                    { label: "ID", align: "left" },
                    { label: "Modelo", align: "left" },
                    { label: "URL", align: "left" },
                    { label: "Proveedor", align: "left" },
                    { label: "Descripción", align: "left" },
                    { label: "Acciones", align: "center" },
                  ].map(({ label, align }) => (
                    <TableCell
                      key={label}
                      align={align}
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.7rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "text.secondary",
                        backgroundColor: "background.paper",
                        borderBottom: 2,
                        borderColor: "divider",
                        py: 1.5,
                      }}
                    >
                      {label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow sx={{ maxHeight: 43 }}>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={28} />
                    </TableCell>
                  </TableRow>
                ) : groupedImages.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      No hay resultados.
                    </TableCell>
                  </TableRow>
                ) : (
                  groupedImages.map((group, idx) => {
                    const image = group.items[0];
                    const rowId = image?.id ?? `row-${idx}`;
                    const isGroup = group.items.length > 1;
                    const isEditing = !isGroup && editingRowId === rowId;
                    const inlineProviderOptions = proveedores;
                    const idsText = group.items
                      .map((item) => item?.id)
                      .filter(Boolean)
                      .join(", ");
                    const modelsText = Array.from(
                      new Set(
                        group.items
                          .map((item) => item?.model?.trim())
                          .filter(Boolean)
                      )
                    ).join(", ");
                    const proveedoresText = Array.from(
                      new Set(
                        group.items
                          .map((item) => item?.proveedor?.trim())
                          .filter(Boolean)
                      )
                    ).join(", ");
                    const previewPayload = isGroup
                      ? {
                          ...image,
                          model: `${group.items.length} modelos`,
                          url: group.url,
                          description: group.description,
                        }
                      : image;

                    return (
                      <TableRow
                        key={rowId}
                        hover
                        onDoubleClick={() => {
                          if (!isGroup) handleStartInlineEdit(image);
                        }}
                        sx={{
                          cursor: isGroup ? "default" : "pointer",
                          backgroundColor: isEditing
                            ? "action.hover"
                            : "inherit",
                          "& .MuiTableCell-root": {
                            py: isEditing ? "32px" : "2px",
                          },
                        }}
                      >
                        <TableCell title={idsText} sx={{ whiteSpace: "nowrap" }}>
                          <Typography variant="body2" sx={{ lineHeight: 1.3 }}>
                            {image?.id ?? "--"}
                          </Typography>
                          {isGroup && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ lineHeight: 1 }}
                            >
                              +{group.items.length - 1} más
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <TextField
                              variant="standard"
                              value={rowDraft.model}
                              onChange={(e) =>
                                setRowDraft((prev) => ({
                                  ...prev,
                                  model: e.target.value,
                                }))
                              }
                              onKeyDown={handleInlineKeyDown}
                              fullWidth
                            />
                          ) : modelsText ? (
                            modelsText
                          ) : (
                            <Typography variant="body2" color="text.disabled">—</Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ maxWidth: 220 }}>
                          {isEditing ? (
                            <TextField
                              variant="standard"
                              value={rowDraft.url}
                              onChange={(e) =>
                                setRowDraft((prev) => ({
                                  ...prev,
                                  url: e.target.value,
                                }))
                              }
                              onKeyDown={handleInlineKeyDown}
                              fullWidth
                            />
                          ) : group.url ? (
                            <Typography
                              variant="body2"
                              noWrap
                              title={group.url}
                              sx={{ color: "text.secondary", fontFamily: "monospace", fontSize: "0.75rem" }}
                            >
                              {group.url}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.disabled">—</Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <FormControl
                              variant="standard"
                              sx={{ minWidth: 140 }}
                            >
                              <Select
                                value={rowDraft.proveedor || DEFAULT_PROVEEDOR}
                                onChange={(e) =>
                                  setRowDraft((prev) => ({
                                    ...prev,
                                    proveedor: e.target.value,
                                  }))
                                }
                                onKeyDown={handleInlineKeyDown}
                              >
                                {inlineProviderOptions.map((prov) => (
                                  <MenuItem key={prov} value={prov}>
                                    {prov}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          ) : proveedoresText ? (
                            proveedoresText
                          ) : (
                            <Typography variant="body2" color="text.disabled">—</Typography>
                          )}
                        </TableCell>
                        <TableCell sx={{ maxWidth: 160 }}>
                          {isEditing ? (
                            <TextField
                              variant="standard"
                              value={rowDraft.description}
                              onChange={(e) =>
                                setRowDraft((prev) => ({
                                  ...prev,
                                  description: e.target.value,
                                }))
                              }
                              onKeyDown={handleInlineKeyDown}
                              fullWidth
                            />
                          ) : group.description ? (
                            <Typography
                              variant="body2"
                              noWrap
                              title={group.description}
                              color="text.secondary"
                            >
                              {group.description}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.disabled">—</Typography>
                          )}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ whiteSpace: "nowrap", minWidth: 180 }}
                        >
                          <Tooltip
                            title={
                              isGroup
                                ? `Ver imagen compartida (${group.items.length} registros)`
                                : "Ver imagen"
                            }
                          >
                            <IconButton
                              onClick={() => handleOpenPreview(previewPayload)}
                              size="small"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Agregar variante">
                            <IconButton
                              onClick={() => handleOpenCreateVariant(image)}
                              size="small"
                            >
                              <AddCircleOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip
                            title={
                              isGroup
                                ? "Editar URL del conjunto"
                                : "Disponible solo para conjuntos"
                            }
                          >
                            <span>
                              <IconButton
                                onClick={() =>
                                  handleOpenBulkUrlEdit(group.items, group.url)
                                }
                                size="small"
                                disabled={!isGroup}
                              >
                                <LinkIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          {isEditing ? (
                            <>
                              <Tooltip title="Guardar">
                                <span>
                                  <IconButton
                                    onClick={handleInlineSave}
                                    disabled={savingInline}
                                    size="small"
                                  >
                                    <CheckIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title="Cancelar">
                                <IconButton
                                  onClick={handleInlineCancel}
                                  size="small"
                                >
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          ) : (
                            <Tooltip
                              title={
                                isGroup ? "Elegir registro a editar" : "Editar"
                              }
                            >
                              <IconButton
                                onClick={() => {
                                  if (isGroup) {
                                    handleOpenGroupEdit(group.items);
                                    return;
                                  }
                                  handleOpenEdit(image);
                                }}
                                size="small"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip
                            title={
                              isGroup
                                ? "Agrupado por URL: elimina desde un registro individual"
                                : "Eliminar"
                            }
                          >
                            <span>
                              <IconButton
                                onClick={() => handleDelete(image)}
                                size="small"
                                sx={{ color: "error.main" }}
                                disabled={isGroup}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              mt: 2,
              gap: 1.5,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Pag {Math.floor(offset / limit) + 1}
            </Typography>
            <IconButton
              variant="outlined"
              onClick={handlePrevPage}
              disabled={offset === 0}
              sx={{ m: 0, p: 0 }}
              color="inventario"
            >
              <ArrowBackIosIcon />
            </IconButton>
            <IconButton
              variant="outlined"
              onClick={handleNextPage}
              disabled={lastCount < limit}
              sx={{ m: 0, p: 0 }}
              color="inventario"
            >
              <ArrowForwardIosIcon />
            </IconButton>
            <TextField
              label="Límite"
              variant="standard"
              value={limit}
              color="inventario"
              size="small"
              sx={{ m: 0, p: 0, width: 40 }}
              onChange={handleLimitChange}
            />
          </Box>
        </>
      ) : (
        <>
          <TableContainer
            component={Paper}
            sx={{ overflowX: "auto", maxHeight: "70vh" }}
          >
            <Table sx={{ minWidth: 700 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Articulo</TableCell>
                  <TableCell>Marca</TableCell>
                  <TableCell>Proveedor</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {missingLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={28} />
                    </TableCell>
                  </TableRow>
                ) : missingRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                      No hay modelos pendientes por mapear.
                    </TableCell>
                  </TableRow>
                ) : (
                  missingRows.map((row, idx) => (
                    <TableRow key={`${row?.articulo || "row"}-${idx}`} hover>
                      <TableCell>{row?.articulo || "--"}</TableCell>
                      <TableCell>{row?.marca || "--"}</TableCell>
                      <TableCell>{row?.proveedor || "--"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              mt: 2,
              gap: 1.5,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Pag {Math.floor(missingOffset / missingLimit) + 1}
            </Typography>
            <IconButton
              onClick={handleMissingPrevPage}
              disabled={missingOffset === 0}
              sx={{ m: 0, p: 0 }}
              color="inventario"
            >
              <ArrowBackIosIcon />
            </IconButton>
            <IconButton
              onClick={handleMissingNextPage}
              disabled={missingLastCount < missingLimit}
              sx={{ m: 0, p: 0 }}
              color="inventario"
            >
              <ArrowForwardIosIcon />
            </IconButton>
            <TextField
              label="Límite visible"
              variant="standard"
              value={missingLimit}
              color="inventario"
              size="small"
              sx={{ m: 0, p: 0, width: 90 }}
              onChange={handleMissingLimitChange}
            />
          </Box>
        </>
      )}

      <Dialog
        open={editorOpen}
        onClose={handleCloseEditor}
        onKeyDown={handleEditorKeyDown}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editorMode === "edit" ? "Editar imagen" : "Agregar imagen"}
        </DialogTitle>
        <DialogContent dividers>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.3fr 1fr" },
              gap: 2,
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Autocomplete
                freeSolo
                options={modelos}
                filterOptions={filterModelos}
                value={formValues.model}
                onChange={(event, newValue) =>
                  setFormValues((prev) => ({ ...prev, model: newValue || "" }))
                }
                onInputChange={(event, newInputValue) =>
                  setFormValues((prev) => ({ ...prev, model: newInputValue }))
                }
                renderInput={(params) => (
                  <TextField {...params} label="Modelo" size="small" />
                )}
              />
              <TextField
                label="URL"
                value={formValues.url}
                onChange={(e) =>
                  setFormValues((prev) => ({ ...prev, url: e.target.value }))
                }
                size="small"
                multiline
                minRows={2}
              />
              <TextField
                label="description"
                value={formValues.description}
                onChange={(e) =>
                  setFormValues((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                size="small"
                multiline
                minRows={2}
              />
              <FormControl size="small">
                <InputLabel>Proveedor</InputLabel>
                <Select
                  label="Proveedor"
                  value={formValues.proveedor || DEFAULT_PROVEEDOR}
                  onChange={(e) =>
                    setFormValues((prev) => ({
                      ...prev,
                      proveedor: e.target.value,
                    }))
                  }
                >
                  {proveedores.map((prov) => (
                    <MenuItem key={prov} value={prov}>
                      {prov}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                p: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 240,
              }}
            >
              {formValues.url ? (
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    maxWidth: 720,
                    height: 440,
                  }}
                >
                  <UnoptimizedImage
                    src={formValues.url}
                    alt={formValues.model || "Preview"}
                    fill
                    sizes="(max-width: 900px) 80vw, 360px"
                    style={{ objectFit: "contain" }}
                  />
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Agrega una URL para ver la imagen.
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditor}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleEditorSave}
            disabled={savingModal}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={bulkUrlEditOpen}
        onClose={handleCloseBulkUrlEdit}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Editar URL del conjunto</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2 }} color="text.secondary">
            Se actualizará la URL de {bulkUrlEditItems.length} registros.
          </Typography>
          <TextField
            label="URL nueva"
            value={bulkUrlValue}
            onChange={(e) => setBulkUrlValue(e.target.value)}
            size="small"
            fullWidth
            multiline
            minRows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBulkUrlEdit} disabled={bulkUrlSaving}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleBulkUrlSave}
            disabled={bulkUrlSaving}
          >
            {bulkUrlSaving ? "Guardando..." : "Guardar URL"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={groupEditOpen}
        onClose={handleCloseGroupEdit}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Selecciona el registro a editar</DialogTitle>
        <DialogContent dividers>
          {groupEditItems.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No hay registros disponibles en este grupo.
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Modelo</TableCell>
                  <TableCell>Proveedor</TableCell>
                  <TableCell>Descripción</TableCell>
                  <TableCell align="right">Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {groupEditItems.map((item, idx) => {
                  const key = item?.id ?? `group-item-${idx}`;
                  return (
                    <TableRow key={key} sx={{ maxHeight: 43 }}>
                      <TableCell>{item?.id ?? "--"}</TableCell>
                      <TableCell>{item?.model || "--"}</TableCell>
                      <TableCell>{item?.proveedor || "--"}</TableCell>
                      <TableCell>{item?.description || "--"}</TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleSelectGroupEditItem(item)}
                        >
                          Editar
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseGroupEdit}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={previewOpen} onClose={handleClosePreview} maxWidth="md">
        <DialogTitle>{previewTarget?.model || "Vista previa"}</DialogTitle>
        <DialogContent dividers>
          {previewTarget?.url ? (
            <Box
              sx={{
                position: "relative",
                width: "min(80vw, 520px)",
                height: "min(60vh, 420px)",
              }}
            >
              <UnoptimizedImage
                src={previewTarget.url}
                alt={previewTarget?.model || "Vista previa"}
                fill
                sizes="(max-width: 900px) 80vw, 520px"
                style={{ objectFit: "contain" }}
              />
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No hay URL disponible para esta imagen.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePreview}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: opciones de transferencia */}
      <Dialog
        open={refreshDialogOpen}
        onClose={() => setRefreshDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Transferir imágenes</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Sincroniza las imágenes del catálogo hacia el destino. Puedes
              limitar la transferencia a una marca específica o procesar todas.
            </Typography>
            <FormControl variant="standard" fullWidth>
              <InputLabel>Marca</InputLabel>
              <Select
                value={refreshMarca}
                onChange={(e) => setRefreshMarca(e.target.value)}
                label="Marca"
              >
                <MenuItem value="">Todas las marcas</MenuItem>
                {marcaOptions.map((m) => (
                  <MenuItem key={m.value} value={m.value}>
                    {m.value}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={refreshClearAll}
                    onChange={(e) => setRefreshClearAll(e.target.checked)}
                  />
                }
                label="Limpiar imágenes existentes antes de transferir"
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", pl: "42px", mt: -0.5 }}
              >
                Elimina los registros actuales del destino antes de iniciar.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRefreshDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" color="inventario" onClick={handleConfirmRefresh}>
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ImagenesPage;
