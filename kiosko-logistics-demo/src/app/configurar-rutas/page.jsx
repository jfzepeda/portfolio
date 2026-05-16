"use client";

import RouteConfigDashboard from "@/components/RouteConfigDashboard";
import { useDashboardState } from "@/components/DashboardStateProvider";

export default function ConfigurarRutasPage() {
  const {
    onDownloadVrpJson,
    onRunConfigChange,
    onRunVrp,
    onVrpConfigChange,
    routeRunState,
    runConfig,
    vrpConfig,
  } = useDashboardState();

  return (
    <RouteConfigDashboard
      vrpConfig={vrpConfig}
      onVrpConfigChange={onVrpConfigChange}
      runConfig={runConfig}
      onRunConfigChange={onRunConfigChange}
      onRunVrp={onRunVrp}
      onDownloadVrpJson={onDownloadVrpJson}
      routeRunState={routeRunState}
    />
  );
}
