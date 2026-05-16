"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { putJson } from "~/lib/api";
import { getUserProfile, saveUserProfile } from "~/utils/session";

const notify = (msg, type = "info") => {
  if (typeof window !== "undefined" && window.showToast) {
    window.showToast(msg, type);
  }
};

const ConfigTab = ({ client, clientId, canEdit, onUpdated }) => {
  const [form, setForm] = useState({
    margen: "",
    logo: "",
    color: "#000000",
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showReloginNotice, setShowReloginNotice] = useState(false);

  useEffect(() => {
    setForm({
      margen: client?.margen ?? client?.margins ?? client?.margin ?? "",
      logo: client?.logo ?? client?.logo_url ?? "",
      color: client?.color ?? client?.colors ?? "#000000",
    });
  }, [client]);

  const usesLegacyKeys = useMemo(() => {
    if (!client) return false;
    return (
      Object.prototype.hasOwnProperty.call(client, "margen") ||
      Object.prototype.hasOwnProperty.call(client, "logo") ||
      Object.prototype.hasOwnProperty.call(client, "color")
    );
  }, [client]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async () => {
    setErrorMsg("");
    const margenValue =
      form.margen === "" || form.margen === null || form.margen === undefined
        ? null
        : Number(form.margen);
    if (margenValue !== null && Number.isNaN(margenValue)) {
      setErrorMsg("El margen debe ser un número válido.");
      return;
    }

    const logoValue = String(form.logo || "").trim() || null;
    const colorValue = String(form.color || "").trim() || null;
    const payload = usesLegacyKeys
      ? { margen: margenValue, logo: logoValue, color: colorValue }
      : { margins: margenValue, logo_url: logoValue, colors: colorValue };

    setSaving(true);
    try {
      await putJson(`/api/dist/${clientId}/panel`, payload);
      const nextClient = {
        ...(client || {}),
        margen: margenValue,
        logo: logoValue,
        color: colorValue,
      };
      onUpdated?.(nextClient);

      const profile = getUserProfile();
      const sameClient =
        profile &&
        profile.company_id !== undefined &&
        profile.company_id !== null &&
        String(profile.company_id) === String(clientId);

      if (sameClient) {
        const nextColor = colorValue ?? profile.color ?? profile.colors ?? null;
        const nextLogo = logoValue ?? profile.logo_url ?? profile.logo ?? null;
        const nextProfile = {
          ...profile,
          color: nextColor,
          colors: nextColor,
          logo: nextLogo,
          logo_url: nextLogo,
          company: {
            ...(profile.company || {}),
            color: nextColor,
            colors: nextColor,
            logo: nextLogo,
            logo_url: nextLogo,
            margen:
              margenValue ??
              profile?.company?.margen ??
              profile?.company?.margins ??
              null,
            margins:
              margenValue ??
              profile?.company?.margins ??
              profile?.company?.margen ??
              null,
          },
        };
        saveUserProfile(nextProfile);
      }

      notify("Configuración actualizada", "success");
      if (sameClient) {
        setShowReloginNotice(false);
      } else {
        setShowReloginNotice(true);
        notify(
          "Tus cambios se han guardado. Para verlos en esta cuenta, cierra sesión y vuelve a iniciar sesión.",
          "warning"
        );
      }
    } catch (err) {
      setErrorMsg(err?.message || "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 720 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Configuración visual
      </Typography>
      {errorMsg ? <Alert severity="error">{errorMsg}</Alert> : null}
      {showReloginNotice ? (
        <Alert severity="warning" sx={{ mt: errorMsg ? 1 : 0 }}>
          Tus cambios se han guardado. Para ver los cambios aplicados cierra
          sesión y vuelve a iniciar sesión.
        </Alert>
      ) : null}
      <Stack spacing={2} sx={{ mt: 2 }}>
        <TextField
          label="Margen"
          type="number"
          value={form.margen}
          onChange={handleChange("margen")}
          disabled={!canEdit}
          helperText="Opcional"
        />
        <TextField
          label="Logo (URL)"
          value={form.logo}
          onChange={handleChange("logo")}
          disabled={!canEdit}
          helperText="Opcional"
        />
        <TextField
          label="Color (hex)"
          value={form.color}
          onChange={handleChange("color")}
          disabled={!canEdit}
          helperText="Ej: #0F172A"
        />
        {canEdit ? (
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            sx={{ alignSelf: "flex-start" }}
          >
            Guardar
          </Button>
        ) : (
          <Alert severity="info">No tienes permisos para editar.</Alert>
        )}
      </Stack>
    </Box>
  );
};

export default ConfigTab;
