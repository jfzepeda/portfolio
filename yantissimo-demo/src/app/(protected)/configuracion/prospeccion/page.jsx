"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  createDistribuidor,
  deleteDistribuidor,
  fetchDistribuidores,
  updateDistribuidor,
  fetchSellers,
  fetchRutas,
} from "~/lib/apiDist";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  IconButton,
  Tooltip,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import { MYR_DIST_TYPES } from "~/utils/global";
import ProspeccionTable from "./components/table.jsx";
import { numberFormatter } from "~/utils/formaters";
import Header from "~/components/header";
import { uploadFileToBackblaze } from "~/lib/backblazeUpload";
import { getUserProfile } from "~/utils/session";
import DistribuidorFormDialog, {
  EMPTY_DISTRIBUIDOR_FORM,
  buildDistribuidorPayload,
  mapProspectToDistribuidorForm,
} from "../distribuidores/components/DistribuidorFormDialog.jsx";

const emptyForm = {
  id: null,
  company: "",
  sucursal: "",
  zone: "",
  only_ctdo: false,
  client_type: "",
  client_tier: "",
  location: "",
  phone: "",
  delivery_type: "",

  // Controlled fields (avoid undefined -> defined warnings)
  assigned_seller: "",
  ruta_id: "",
  creditPolicy_days: 15,
  creditPolicy_limit: 15_000,

  // Only used on create (but keep defined to stay controlled)
  adminUsername: "",
  adminPassword: "",
  adminPhone: "",

  // Extras
  empresa_actual_atiende: "",
  frecuencia_compra: "",
  tipo_compra: "",
  monto_credito_actual: "",
  volumen_compra_piezas: "",
  tire_compra: "",
  pct_tier_1: "",
  pct_tier_2: "",
  pct_tier_3: "",
  tipo_servicio_extra: "",
  tiene_programa_incentivos: false,
  tiene_plataforma_cotizador: false,
  notas: "",
  imagen_referencia_url: "",
  unidades_camion_flota: "",
  tipo_uso: "",
  tiene_servicio_semaforeo: false,
};

const zonas = { colima: "MYRCOL", manzanillo: "MYRMZO" };
const CLIENT_TIERS = ["1", "2", "3"];
const DELIVERY_TYPES = ["RUTA", "RECOLECCION", "REPARTO", "ESPECIAL"];
const FRECUENCIAS_COMPRA = ["DIARIO", "SEMANAL", "MENSUAL"];
const TIPOS_COMPRA = ["CONTADO", "CREDITO"];
const TIRES_COMPRA = ["1", "2", "3", "4"];
const TIPOS_SERVICIO_EXTRA = ["RECOLECCION", "RUTA", "VENTANA ENTREGA"];
const TIPOS_USO = ["LOCAL", "FORANEO", "CAÑERO"];
const TIPOS_DISTRIBUIDOR_EXTRAS = ["DISTR MIXTO", "DISTR AYC", "DISTR CAMION"];
const TIPOS_CAMION_FLOTA_EXTRAS = ["CAMION", "FLOTILLA"];

const ENDPOINT = "/api/prospeccion";

export default function ClientesDistribuidoresPage() {
  const userProfile = getUserProfile();
  const [rows, setRows] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [convertSellers, setConvertSellers] = useState([]);
  const [rutas, setRutas] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [sucursalFilter, setSucursalFilter] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [form, setForm] = useState(() => ({ ...emptyForm }));
  const [isEdit, setIsEdit] = useState(false);

  const [openDelete, setOpenDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [openConvertForm, setOpenConvertForm] = useState(false);
  const [convertForm, setConvertForm] = useState(() => ({
    ...EMPTY_DISTRIBUIDOR_FORM,
  }));
  const [convertingProspect, setConvertingProspect] = useState(false);
  const [uploadingExtraImage, setUploadingExtraImage] = useState(false);
  const showDistribuidorExtras = TIPOS_DISTRIBUIDOR_EXTRAS.includes(
    String(form.client_type || "")
  );
  const showCamionFlotaExtras = TIPOS_CAMION_FLOTA_EXTRAS.includes(
    String(form.client_type || "")
  );

  const sucursales = useMemo(() => {
    const set = new Set(rows.map((r) => r.sucursal).filter(Boolean));
    return Array.from(set).sort((a, b) => String(a).localeCompare(String(b)));
  }, [rows]);

  const filteredRows = useMemo(() => {
    const s = searchTerm.trim().toLowerCase();
    return rows.filter((r) => {
      const matchSucursal = sucursalFilter
        ? String(r.sucursal || "") === sucursalFilter
        : true;
      const matchSearch = s
        ? String(r.company || "")
            .toLowerCase()
            .includes(s)
        : true;
      return matchSucursal && matchSearch;
    });
  }, [rows, searchTerm, sucursalFilter]);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchDistribuidores(ENDPOINT);
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      window.showToast(e.message || "Error al cargar", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers(setSellers, form?.sucursal);
    fetchRutas(setRutas);
    load();
  }, [form?.sucursal]);

  useEffect(() => {
    if (!openConvertForm) return;
    fetchSellers(setConvertSellers, convertForm?.sucursal);
  }, [openConvertForm, convertForm?.sucursal]);

  useEffect(() => {
    setOpenForm(false);
    setOpenDelete(false);
    setIsEdit(false);
    setDeleteTarget(null);
    setForm({ ...emptyForm });
    setOpenConvertForm(false);
    setConvertForm({ ...EMPTY_DISTRIBUIDOR_FORM });
  }, []);

  const openCreate = () => {
    setIsEdit(false);
    setForm({ ...emptyForm });
    setOpenForm(true);
  };

  const handleChange =
    (field, isNumber = false) =>
    (e) => {
      const value = isNumber ? numberFormatter(e.target.value) : e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };

  const openEdit = (row) => {
    setIsEdit(true);
    setForm({
      id: row.id,
      company: row.company ?? "",
      sucursal: String(row.sucursal ?? ""),
      zone: String(row.zone ?? row.extras?.zone ?? ""),
      only_ctdo: Boolean(row.only_ctdo),
      assigned_seller: String(row.assigned_seller ?? ""),
      ruta_id: String(row.ruta_id ?? ""),
      client_type: String(row.client_type ?? ""),
      client_tier: String(row.client_tier ?? ""),
      location: String(row.location ?? ""),
      phone: String(row.phone ?? row.extras?.phone ?? ""),
      delivery_type: String(row.delivery_type ?? ""),
      creditPolicy_days: row.credit_policy?.days || 15,
      creditPolicy_limit: row.credit_policy?.limit || 15_000,
      adminUsername: row.admin?.username || "",
      adminPassword: "",
      adminPhone: row.admin?.phone || "",
      empresa_actual_atiende: String(
        row.empresa_actual_atiende ?? row.extras?.empresa_actual_atiende ?? ""
      ),
      frecuencia_compra: String(
        row.frecuencia_compra ?? row.extras?.frecuencia_compra ?? ""
      ),
      tipo_compra: String(row.tipo_compra ?? row.extras?.tipo_compra ?? ""),
      monto_credito_actual: String(
        row.monto_credito_actual ?? row.extras?.monto_credito_actual ?? ""
      ),
      volumen_compra_piezas: String(
        row.volumen_compra_piezas ?? row.extras?.volumen_compra_piezas ?? ""
      ),
      tire_compra: String(row.tire_compra ?? row.extras?.tire_compra ?? ""),
      pct_tier_1: String(row.pct_tier_1 ?? row.extras?.pct_tier_1 ?? ""),
      pct_tier_2: String(row.pct_tier_2 ?? row.extras?.pct_tier_2 ?? ""),
      pct_tier_3: String(row.pct_tier_3 ?? row.extras?.pct_tier_3 ?? ""),
      tipo_servicio_extra: String(
        row.tipo_servicio_extra ?? row.extras?.tipo_servicio_extra ?? ""
      ),
      tiene_programa_incentivos: Boolean(
        row.tiene_programa_incentivos ?? row.extras?.tiene_programa_incentivos
      ),
      tiene_plataforma_cotizador: Boolean(
        row.tiene_plataforma_cotizador ?? row.extras?.tiene_plataforma_cotizador
      ),
      notas: String(row.notas ?? row.extras?.notas ?? ""),
      imagen_referencia_url: String(
        row.imagen_referencia_url ?? row.extras?.imagen_referencia_url ?? ""
      ),
      unidades_camion_flota: String(
        row.unidades_camion_flota ?? row.extras?.unidades_camion_flota ?? ""
      ),
      tipo_uso: String(row.tipo_uso ?? row.extras?.tipo_uso ?? ""),
      tiene_servicio_semaforeo: Boolean(
        row.tiene_servicio_semaforeo ?? row.extras?.tiene_servicio_semaforeo
      ),
    });
    setOpenForm(true);
  };

  const closeForm = () => {
    setOpenForm(false);
    setForm({ ...emptyForm });
  };

  const submitForm = async () => {
    const isDistribuidorExtrasType = TIPOS_DISTRIBUIDOR_EXTRAS.includes(
      String(form.client_type || "")
    );
    const isCamionFlotaExtrasType = TIPOS_CAMION_FLOTA_EXTRAS.includes(
      String(form.client_type || "")
    );

    const payload = {
      company: String(form.company || "").trim(),
      ruta_id: form.ruta_id ? Number(form.ruta_id) : null,
      assigned_seller: Number(form.assigned_seller),
      only_ctdo: Boolean(form.only_ctdo),
      location: String(form.location || "").trim() || null,
      phone: String(form.phone || "").trim() || null,
      delivery_type: String(form.delivery_type || "").trim() || null,
      client_type: String(form.client_type || "").trim() || null,
      sucursal: String(form.sucursal || "").trim() || null,
      zone: String(form.zone || "").trim() || null,
      client_tier: String(form.client_tier || "").trim() || null,
      credit_policy: {
        days: form.creditPolicy_days ?? 0,
        limit: form.creditPolicy_limit ?? 0,
      },
      extras: {
        empresa_actual_atiende: isDistribuidorExtrasType
          ? String(form.empresa_actual_atiende || "").trim() || null
          : null,
        frecuencia_compra: isDistribuidorExtrasType
          ? String(form.frecuencia_compra || "").trim() || null
          : null,
        tipo_compra: isDistribuidorExtrasType
          ? String(form.tipo_compra || "").trim() || null
          : null,
        monto_credito_actual:
          !isDistribuidorExtrasType ||
          form.tipo_compra !== "CREDITO" ||
          form.monto_credito_actual === ""
            ? null
            : Number(form.monto_credito_actual),
        volumen_compra_piezas:
          !isDistribuidorExtrasType || form.volumen_compra_piezas === ""
            ? null
            : Number(form.volumen_compra_piezas),
        tire_compra: isDistribuidorExtrasType
          ? String(form.tire_compra || "").trim() || null
          : null,
        pct_tier_1: isDistribuidorExtrasType
          ? Number(form.pct_tier_1 || 0)
          : null,
        pct_tier_2: isDistribuidorExtrasType
          ? Number(form.pct_tier_2 || 0)
          : null,
        pct_tier_3: isDistribuidorExtrasType
          ? Number(form.pct_tier_3 || 0)
          : null,
        tipo_servicio_extra: isDistribuidorExtrasType
          ? String(form.tipo_servicio_extra || "").trim() || null
          : null,
        tiene_programa_incentivos: isDistribuidorExtrasType
          ? Boolean(form.tiene_programa_incentivos)
          : false,
        tiene_plataforma_cotizador: isDistribuidorExtrasType
          ? Boolean(form.tiene_plataforma_cotizador)
          : false,
        notas: isDistribuidorExtrasType
          ? String(form.notas || "").trim() || null
          : null,
        imagen_referencia_url:
          isDistribuidorExtrasType || isCamionFlotaExtrasType
            ? String(form.imagen_referencia_url || "").trim() || null
            : null,
        unidades_camion_flota:
          !isCamionFlotaExtrasType || form.unidades_camion_flota === ""
            ? null
            : Number(form.unidades_camion_flota),
        tipo_uso: isCamionFlotaExtrasType
          ? String(form.tipo_uso || "").trim() || null
          : null,
        tiene_servicio_semaforeo: isCamionFlotaExtrasType
          ? Boolean(form.tiene_servicio_semaforeo)
          : false,
      },
    };

    try {
      if (isEdit) {
        const updated = await updateDistribuidor(form.id, payload, ENDPOINT);
        setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
        window.showToast("Actualizado");
      } else {
        delete payload.credit_policy;
        const created = await createDistribuidor(payload, ENDPOINT);
        setRows((prev) => [created, ...prev]);
        window.showToast("Creado");
      }
      closeForm();
    } catch (e) {
      window.showToast(e.message || "Error al guardar", "error");
    }
  };

  const askDelete = (row) => {
    setDeleteTarget(row);
    setOpenDelete(true);
  };

  const closeDelete = () => {
    setOpenDelete(false);
    setDeleteTarget(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget?.id) return;

    try {
      await deleteDistribuidor(deleteTarget.id, ENDPOINT);
      setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      window.showToast("Eliminado");
      closeDelete();
    } catch (e) {
      window.showToast(e.message || "Error al eliminar", "error");
    }
  };

  const openConvertDialog = (row) => {
    setConvertForm(mapProspectToDistribuidorForm(row));
    setOpenConvertForm(true);
  };

  const closeConvertDialog = () => {
    setOpenConvertForm(false);
    setConvertForm({ ...EMPTY_DISTRIBUIDOR_FORM });
  };

  const submitConvertProspect = async () => {
    const payload = buildDistribuidorPayload(convertForm, {
      isConAcceso: false,
    });
    delete payload.credit_policy;

    setConvertingProspect(true);
    try {
      await createDistribuidor(payload);
      window.showToast("Prospecto convertido a distribuidor sin acceso");
      closeConvertDialog();
      await load();
    } catch (e) {
      window.showToast(e.message || "Error al convertir prospecto", "error");
    } finally {
      setConvertingProspect(false);
    }
  };

  const buildExtraImageFileName = () => {
    const timestamp = Date.now();
    const baseName = String(form.company || "prospeccion")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 60);
    return `prospeccion-${baseName || "cliente"}_${timestamp}`;
  };

  const handleExtraImageChange = async (event) => {
    const file = event.target.files?.[0] || null;
    event.target.value = "";
    if (!file) return;
    if (!file.type?.startsWith("image/")) {
      window.showToast("Solo se permiten archivos de imagen", "error");
      return;
    }

    setUploadingExtraImage(true);
    try {
      const { publicUrl: imageUrl } = await uploadFileToBackblaze({
        file,
        fileName: buildExtraImageFileName(),
        bucketName: "prospeccion-yssm",
        uploadEndpoint: "/prospeccion",
      });
      console.debug("URL de imagen extra cargada:", imageUrl);
      setForm((prev) => ({ ...prev, imagen_referencia_url: imageUrl }));
      window.showToast("Imagen cargada correctamente");
    } catch (e) {
      console.error("Error al subir imagen de prospeccion:", e);
      window.showToast(e.message || "Error al subir imagen", "error");
    } finally {
      setUploadingExtraImage(false);
    }
  };

  return (
    <Box>
      <Stack spacing={2}>
        <Header title="Prospeccion de clientes" />

        <Box sx={{ display: "flex", mb: 2 }}>
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
            }}
          >
            <Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openCreate}
                sx={{ ml: 2 }}
              >
                Nuevo
              </Button>
            </Box>
            <Tooltip title="Recargar">
              <span>
                <IconButton onClick={load} disabled={loading}>
                  <RefreshIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
            <TextField
              label="Buscar por nombre"
              variant="standard"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: 300 }}
            />
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              justifyContent: "flex-end",
              display: "flex",
            }}
          >
            <FormControl sx={{ width: 200 }} variant="standard">
              <InputLabel id="sucursal-label">Sucursal</InputLabel>
              <Select
                labelId="sucursal-label"
                label="Sucursal"
                value={sucursalFilter}
                onChange={(e) => setSucursalFilter(e.target.value)}
              >
                <MenuItem value="">Todas</MenuItem>
                {sucursales.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        <ProspeccionTable
          rows={filteredRows}
          loading={loading}
          onEdit={openEdit}
          onDelete={askDelete}
          onConvert={openConvertDialog}
        />
      </Stack>

      {/* Form dialog */}
      <Dialog open={openForm} onClose={closeForm} fullWidth maxWidth={"md"}>
        <DialogTitle>
          {isEdit ? "Editar prospecto" : "Nuevo prospecto"}
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              mt: 1,
              display: "grid",
              gap: 2,
              gridTemplateColumns: {
                xs: "1fr",
                md: "1fr 1fr",
              },
            }}
          >
            <Stack spacing={2}>
              <Typography variant="h6">Datos de la Empresa</Typography>
              <TextField
                label="Nombre"
                value={form.company}
                onChange={handleChange("company")}
                required
                autoFocus
                disabled={isEdit}
              />
              <FormControl fullWidth>
                <TextField
                  select
                  label="Tipo de cliente"
                  value={String(form.client_type ?? "")}
                  onChange={handleChange("client_type")}
                >
                  {MYR_DIST_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
              </FormControl>
              <FormControl fullWidth>
                <TextField
                  select
                  label="Potencial de cliente"
                  value={String(form.client_tier ?? "")}
                  onChange={handleChange("client_tier")}
                >
                  {CLIENT_TIERS.map((tier) => (
                    <MenuItem key={tier} value={tier}>
                      {tier}
                    </MenuItem>
                  ))}
                </TextField>
              </FormControl>
              <FormControl fullWidth>
                <TextField
                  select
                  label="Sucursal de atención"
                  value={String(form.sucursal ?? "")}
                  onChange={handleChange("sucursal")}
                >
                  {Object.entries(zonas).map(([key, value]) => (
                    <MenuItem key={key} value={value}>
                      {key}
                    </MenuItem>
                  ))}
                </TextField>
              </FormControl>
              <FormControl fullWidth>
                <TextField
                  select
                  label="Agente de ventas"
                  value={String(form.assigned_seller ?? "")}
                  onChange={handleChange("assigned_seller")}
                >
                  {sellers.map((seller) => (
                    <MenuItem key={seller.id} value={String(seller.id)}>
                      {seller.name}
                    </MenuItem>
                  ))}
                </TextField>
              </FormControl>
              <TextField
                label="Zona"
                value={String(form.zone ?? "")}
                onChange={handleChange("zone")}
              />
              <TextField
                label="Link de ubicación (Google Maps)"
                value={form.location}
                onChange={handleChange("location")}
              />
              <TextField
                label="Teléfono"
                value={form.phone}
                onChange={handleChange("phone")}
              />
              <FormControl fullWidth>
                <TextField
                  select
                  label="Tipo de entrega"
                  value={String(form.delivery_type ?? "")}
                  onChange={handleChange("delivery_type")}
                >
                  {DELIVERY_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
              </FormControl>
              {form.delivery_type === "RUTA" && (
                <FormControl fullWidth>
                  <TextField
                    select
                    label="Ruta de distribución"
                    value={String(form.ruta_id ?? "")}
                    onChange={handleChange("ruta_id")}
                    disabled={form.delivery_type !== "RUTA"}
                  >
                    {rutas.map((route) => (
                      <MenuItem key={route.id} value={String(route.id)}>
                        {route.zona}
                      </MenuItem>
                    ))}
                  </TextField>
                </FormControl>
              )}
              <FormControlLabel
                control={
                  <Checkbox
                    checked={Boolean(form.only_ctdo)}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, only_ctdo: e.target.checked }))
                    }
                  />
                }
                label="Solo Contado"
                sx={{ px: 2 }}
              />
              {!form.only_ctdo && (
                <Box sx={{ display: "flex", gap: 4, px: 2 }}>
                  <TextField
                    label="Días de crédito"
                    variant="standard"
                    value={form.creditPolicy_days ?? 0}
                    onChange={handleChange("creditPolicy_days", true)}
                  />
                  <TextField
                    label="Limite de crédito"
                    variant="standard"
                    value={form.creditPolicy_limit ?? 0}
                    onChange={handleChange("creditPolicy_limit", true)}
                  />
                </Box>
              )}
            </Stack>

            <Stack spacing={2}>
              {showDistribuidorExtras && (
                <>
                  <Typography variant="h6">
                    Distribuidor AYC, Camión y Mixto
                  </Typography>
                  <TextField
                    label="Empresa actual que lo atiende"
                    value={form.empresa_actual_atiende}
                    onChange={handleChange("empresa_actual_atiende")}
                  />
                  <FormControl fullWidth>
                    <TextField
                      select
                      label="Frecuencia de compra"
                      value={String(form.frecuencia_compra ?? "")}
                      onChange={handleChange("frecuencia_compra")}
                    >
                      {FRECUENCIAS_COMPRA.map((value) => (
                        <MenuItem key={value} value={value}>
                          {value}
                        </MenuItem>
                      ))}
                    </TextField>
                  </FormControl>
                  <FormControl fullWidth>
                    <TextField
                      select
                      label="Tipo de compra"
                      value={String(form.tipo_compra ?? "")}
                      onChange={handleChange("tipo_compra")}
                    >
                      {TIPOS_COMPRA.map((value) => (
                        <MenuItem key={value} value={value}>
                          {value}
                        </MenuItem>
                      ))}
                    </TextField>
                  </FormControl>
                  {form.tipo_compra === "CREDITO" && (
                    <TextField
                      label="Monto del crédito actual"
                      value={form.monto_credito_actual}
                      onChange={handleChange("monto_credito_actual")}
                    />
                  )}
                  <TextField
                    label="Volumen de compra (cuántas piezas)"
                    value={form.volumen_compra_piezas}
                    onChange={handleChange("volumen_compra_piezas", true)}
                  />
                  <FormControl fullWidth>
                    <TextField
                      select
                      label="Tire de compra"
                      value={String(form.tire_compra ?? "")}
                      onChange={handleChange("tire_compra")}
                    >
                      {TIRES_COMPRA.map((value) => (
                        <MenuItem key={value} value={value}>
                          {value}
                        </MenuItem>
                      ))}
                    </TextField>
                  </FormControl>
                  <Typography variant="subtitle2" color="text.secondary">
                    ¿Qué porcentaje compra de cada tier? (0 a 100)
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <TextField
                      label="Tier 1 (%)"
                      value={form.pct_tier_1}
                      onChange={handleChange("pct_tier_1", true)}
                      fullWidth
                    />
                    <TextField
                      label="Tier 2 (%)"
                      value={form.pct_tier_2}
                      onChange={handleChange("pct_tier_2", true)}
                      fullWidth
                    />
                    <TextField
                      label="Tier 3 (%)"
                      value={form.pct_tier_3}
                      onChange={handleChange("pct_tier_3", true)}
                      fullWidth
                    />
                  </Box>
                  <FormControl fullWidth>
                    <TextField
                      select
                      label="Tipo de servicio"
                      value={String(form.tipo_servicio_extra ?? "")}
                      onChange={handleChange("tipo_servicio_extra")}
                    >
                      {TIPOS_SERVICIO_EXTRA.map((value) => (
                        <MenuItem key={value} value={value}>
                          {value}
                        </MenuItem>
                      ))}
                    </TextField>
                  </FormControl>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={Boolean(form.tiene_programa_incentivos)}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            tiene_programa_incentivos: e.target.checked,
                          }))
                        }
                      />
                    }
                    label="Cuenta con algún programa de incentivos"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={Boolean(form.tiene_plataforma_cotizador)}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            tiene_plataforma_cotizador: e.target.checked,
                          }))
                        }
                      />
                    }
                    label="Cuenta con alguna plataforma (cotizador)"
                  />
                  <TextField
                    label="Notas"
                    multiline
                    minRows={3}
                    value={form.notas}
                    onChange={handleChange("notas")}
                  />
                </>
              )}

              {showCamionFlotaExtras && (
                <>
                  <Typography variant="h6">Cliente Camión y Flota</Typography>
                  <TextField
                    label="¿Con cuántas unidades cuenta?"
                    value={form.unidades_camion_flota}
                    onChange={handleChange("unidades_camion_flota", true)}
                  />
                  <FormControl fullWidth>
                    <TextField
                      select
                      label="Tipo de uso"
                      value={String(form.tipo_uso ?? "")}
                      onChange={handleChange("tipo_uso")}
                    >
                      {TIPOS_USO.map((value) => (
                        <MenuItem key={value} value={value}>
                          {value}
                        </MenuItem>
                      ))}
                    </TextField>
                  </FormControl>
                  <FormControl fullWidth>
                    <TextField
                      select
                      label="Tire de compra"
                      value={String(form.tire_compra ?? "")}
                      onChange={handleChange("tire_compra")}
                    >
                      {TIRES_COMPRA.map((value) => (
                        <MenuItem key={value} value={value}>
                          {value}
                        </MenuItem>
                      ))}
                    </TextField>
                  </FormControl>
                  <Typography variant="subtitle2" color="text.secondary">
                    ¿Qué porcentaje compra de cada tier? (0 a 100)
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <TextField
                      label="Tier 1 (%)"
                      value={form.pct_tier_1}
                      onChange={handleChange("pct_tier_1", true)}
                      fullWidth
                    />
                    <TextField
                      label="Tier 2 (%)"
                      value={form.pct_tier_2}
                      onChange={handleChange("pct_tier_2", true)}
                      fullWidth
                    />
                    <TextField
                      label="Tier 3 (%)"
                      value={form.pct_tier_3}
                      onChange={handleChange("pct_tier_3", true)}
                      fullWidth
                    />
                  </Box>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={Boolean(form.tiene_servicio_semaforeo)}
                        onChange={(e) =>
                          setForm((p) => ({
                            ...p,
                            tiene_servicio_semaforeo: e.target.checked,
                          }))
                        }
                      />
                    }
                    label="Cuenta con servicio semaforeo"
                  />
                </>
              )}

              {(showDistribuidorExtras || showCamionFlotaExtras) && (
                <Stack spacing={1}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Imagen de referencia (extra props)
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    disabled={uploadingExtraImage}
                  >
                    {uploadingExtraImage
                      ? "Subiendo imagen..."
                      : "Subir imagen"}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleExtraImageChange}
                    />
                  </Button>
                  <TextField
                    label="URL imagen referencia"
                    value={form.imagen_referencia_url || ""}
                    onChange={handleChange("imagen_referencia_url")}
                    placeholder="Se llena automáticamente al subir"
                    fullWidth
                    disabled
                  />
                </Stack>
              )}

              {!showDistribuidorExtras && !showCamionFlotaExtras && (
                <TextField
                  label="Sin campos extra para este tipo de cliente"
                  value={
                    form.client_type
                      ? "Selecciona otro tipo para capturar extras"
                      : "Selecciona un tipo de cliente"
                  }
                  disabled
                />
              )}
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeForm}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={submitForm}
            disabled={uploadingExtraImage}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <DistribuidorFormDialog
        open={openConvertForm}
        onClose={closeConvertDialog}
        onSubmit={submitConvertProspect}
        form={convertForm}
        setForm={setConvertForm}
        isEdit={false}
        isConAcceso={false}
        sellers={convertSellers}
        rutas={rutas}
        userRole={userProfile?.role}
        title="Convertir prospecto a distribuidor sin acceso"
        submitLabel={convertingProspect ? "Guardando..." : "Guardar"}
        submitting={convertingProspect}
      />

      {/* Delete dialog */}
      <Dialog open={openDelete} onClose={closeDelete} maxWidth="xs" fullWidth>
        <DialogTitle>Eliminar</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Se eliminará <b>{deleteTarget?.company}</b> (id: {deleteTarget?.id}
            ).
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDelete}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
