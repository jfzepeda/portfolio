"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { DEFAULT_VRP_CONFIG, deriveParams } from "./ConfigPanel";
import { SERVER_URL } from "@/lib/serverUrl";

const DashboardStateContext = createContext(null);

export function DashboardStateProvider({ children }) {
  const [vrpConfig, setVrpConfig] = useState(DEFAULT_VRP_CONFIG);
  const [runConfig, setRunConfig] = useState({
    file: null,
    fileName: "",
    sheetName: "PMO",
    filterZone: "",
    filterState: "",
  });
  const [routeRunState, setRouteRunState] = useState({
    running: false,
    status: "info",
    message: "",
    logs: "",
    result: null,
  });
  const [externalVrpResult, setExternalVrpResult] = useState(null);

  const handleRunConfigChange = useCallback((patch) => {
    setRunConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleRunVrp = useCallback(async () => {
    if (!runConfig.file) {
      setRouteRunState((prev) => ({
        ...prev,
        status: "error",
        message: "Selecciona un archivo Excel antes de ejecutar el solver.",
      }));
      return;
    }

    const params = deriveParams(vrpConfig);
    const payload = {
      sheetName: runConfig.sheetName || "PMO",
      filterZone: runConfig.filterZone.trim() || null,
      filterState: runConfig.filterState.trim() || null,
      PRECIO_DIESEL_MXN: vrpConfig.precioDiesel,
      COSTO_CHOFER_DIA_MXN: vrpConfig.costoChofer,
      COSTO_DESGASTE_KM_MXN: 2.5,
      RENDIMIENTO_SOLVER_KML: 7.0,
      CENTROID_DEV_FACTOR: params.CENTROID_DEV_FACTOR,
      CLUSTER_CROSS_PENALTY: params.CLUSTER_CROSS_PENALTY,
      ...params,
    };

    setRouteRunState((prev) => ({
      ...prev,
      running: true,
      status: "info",
      message: "Ejecutando solver…",
      logs: "",
    }));

    try {
      const formData = new FormData();
      formData.append("file", runConfig.file);
      formData.append("config_json", JSON.stringify(payload));

      const response = await fetch(`${SERVER_URL}/run`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (data.error) {
        setRouteRunState({
          running: false,
          status: "error",
          message: data.error,
          logs: data.log || "",
          result: null,
        });
        return;
      }

      setExternalVrpResult(data.result);
      setRouteRunState({
        running: false,
        status: "success",
        message: `${data.result.kpis_globales.total_rutas} rutas · ${data.result.kpis_globales.total_tiendas} tiendas`,
        logs: data.log || "",
        result: data.result,
      });
    } catch (error) {
      setRouteRunState((prev) => ({
        ...prev,
        running: false,
        status: "error",
        message: `Error de conexión: ${error.message}`,
      }));
    }
  }, [
    runConfig.file,
    runConfig.filterState,
    runConfig.filterZone,
    runConfig.sheetName,
    vrpConfig,
  ]);

  const handleDownloadVrpJson = useCallback(() => {
    if (!routeRunState.result) return;
    const blob = new Blob([JSON.stringify(routeRunState.result, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "vrp_rutas_optimizadas.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [routeRunState.result]);

  const value = useMemo(
    () => ({
      externalVrpResult,
      routeRunState,
      runConfig,
      vrpConfig,
      onDownloadVrpJson: handleDownloadVrpJson,
      onRunConfigChange: handleRunConfigChange,
      onRunVrp: handleRunVrp,
      onVrpConfigChange: setVrpConfig,
    }),
    [
      externalVrpResult,
      handleDownloadVrpJson,
      handleRunConfigChange,
      handleRunVrp,
      routeRunState,
      runConfig,
      vrpConfig,
    ]
  );

  return (
    <DashboardStateContext.Provider value={value}>
      {children}
    </DashboardStateContext.Provider>
  );
}

export function useDashboardState() {
  const value = useContext(DashboardStateContext);

  if (!value) {
    throw new Error(
      "useDashboardState must be used within DashboardStateProvider"
    );
  }

  return value;
}
