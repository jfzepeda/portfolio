"use client";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { DEFAULT_SUCURSAL } from "../lib/constants";

/**
 * Estado global del módulo Auditoría.
 * Mínimo para que AuditoriaShell decida qué vista renderizar.
 * Conforme se porten los calculadores (lib/calc/*), este store se enriquece
 * con `resultado` (snapshot del día ya analizado) en lugar de mutar DOM.
 */

const AuditoriaContext = createContext(null);

export function AuditoriaProvider({ children }) {
  const [view, setView] = useState("dashboardInicio"); // upload | processing | dashboard | dashboardInicio | configuracion
  const [sucursal, setSucursal] = useState(DEFAULT_SUCURSAL);
  const [files, setFiles] = useState({
    auditoria: null,
    bitacora: null,
    resultadosAdmin: null,
  });
  const [resultado, setResultado] = useState(null);
  const [activeTab, setActiveTab] = useState("conv");
  const [panels, setPanels] = useState({
    menu: false,
    historial: false,
    import: false,
    mail: false,
  });
  const [correccionesBanco, setCorreccionesBanco] = useState([]);
  const [conveniosAdminLL, setConveniosAdminLL] = useState([]);

  const addConvenioAdmin = useCallback((entry) => {
    setConveniosAdminLL((prev) => {
      if (prev.some((c) => c.folio === entry.folio && c.desc === entry.desc)) return prev;
      return [...prev, entry];
    });
  }, []);

  const removeConvenioAdmin = useCallback((folio, desc) => {
    setConveniosAdminLL((prev) => prev.filter((c) => !(c.folio === folio && c.desc === desc)));
  }, []);

  const upsertCorreccionBanco = useCallback((entry) => {
    setCorreccionesBanco((prev) => {
      const i = prev.findIndex((c) => c.folio === entry.folio);
      if (i < 0) return [...prev, entry];
      const next = prev.slice();
      next[i] = entry;
      return next;
    });
  }, []);

  const removeCorreccionBanco = useCallback((folio) => {
    setCorreccionesBanco((prev) => prev.filter((c) => c.folio !== folio));
  }, []);

  const setFile = useCallback((kind, file) => {
    setFiles((prev) => ({ ...prev, [kind]: file }));
  }, []);

  const togglePanel = useCallback((name, value) => {
    setPanels((prev) => ({
      ...prev,
      [name]: value == null ? !prev[name] : Boolean(value),
    }));
  }, []);

  const nuevoAnalisis = useCallback(() => {
    setResultado(null);
    setFiles({ auditoria: null, bitacora: null, resultadosAdmin: null });
    setCorreccionesBanco([]);
    setConveniosAdminLL([]);
    setView("upload");
  }, []);

  const value = useMemo(
    () => ({
      view,
      setView,
      sucursal,
      setSucursal,
      files,
      setFile,
      resultado,
      setResultado,
      activeTab,
      setActiveTab,
      panels,
      togglePanel,
      nuevoAnalisis,
      correccionesBanco,
      upsertCorreccionBanco,
      removeCorreccionBanco,
      conveniosAdminLL,
      addConvenioAdmin,
      removeConvenioAdmin,
    }),
    [
      view,
      sucursal,
      files,
      setFile,
      resultado,
      activeTab,
      panels,
      togglePanel,
      nuevoAnalisis,
      correccionesBanco,
      upsertCorreccionBanco,
      removeCorreccionBanco,
      conveniosAdminLL,
      addConvenioAdmin,
      removeConvenioAdmin,
    ],
  );

  return <AuditoriaContext.Provider value={value}>{children}</AuditoriaContext.Provider>;
}

export function useAuditoria() {
  const ctx = useContext(AuditoriaContext);
  if (!ctx) throw new Error("useAuditoria must be used inside AuditoriaProvider");
  return ctx;
}
