"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Tab,
  Tabs,
} from "@mui/material";
import { getUserProfile, ROLES } from "~/utils/session";
import { getJson } from "~/lib/api";
import ConfigTab from "./ConfigTab.jsx";
import UsersTab from "./UsersTab.jsx";
import Header from "~/components/header";

const ClientPanel = ({ clientId }) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    setProfile(getUserProfile());
  }, []);

  const isInternal = (profile?.role ?? 0) >= ROLES.INTERNAL_TEAM;
  const isClientAdmin =
    profile?.role === ROLES.CLIENT_ADMIN && profile?.company_id;
  const canEdit = isInternal || isClientAdmin;

  const load = async () => {
    if (!clientId) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await getJson(`/api/dist/${clientId}/panel`);
      console.log("Client panel data:", data);
      setClient(data.client || null);
    } catch (err) {
      setErrorMsg(err?.message || "Error al cargar panel");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  const headerTitle = useMemo(() => {
    const name = client?.name || client?.company || "Cliente";
    const status = client?.status ? `(${client.status})` : "";
    return `${name} ${status}`.trim();
  }, [client]);

  if (!profile) {
    return null;
  }

  if (!isInternal && !isClientAdmin) {
    return (
      <Box sx={{ pt: 3 }}>
        <Alert severity="error">No tienes permisos para ver este panel.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ pt: 3 }}>
      <Header
        title={headerTitle}
        subtitle="Configuración y usuarios del distribuidor"
        actions={
          <Button variant="outlined" onClick={load} disabled={loading}>
            Recargar
          </Button>
        }
        sx={{ pt: 0 }}
      />

      {errorMsg ? <Alert severity="error">{errorMsg}</Alert> : null}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Tabs
            value={tabIndex}
            onChange={(_e, next) => setTabIndex(next)}
            sx={{ mb: 2 }}
          >
            <Tab label="Configuración" />
            <Tab label="Usuarios" />
          </Tabs>
          {tabIndex === 0 ? (
            <ConfigTab
              client={client}
              clientId={clientId}
              canEdit={canEdit}
              onUpdated={(next) => setClient(next)}
            />
          ) : null}
          {tabIndex === 1 ? (
            <UsersTab
              clientId={clientId}
              initialUsers={client?.users || []}
              canEdit={canEdit}
            />
          ) : null}
        </>
      )}
    </Box>
  );
};

export default ClientPanel;
