"use client";

import MapDashboard from "@/components/MapDashboard";
import { useDashboardState } from "@/components/DashboardStateProvider";

export default function RutasPage() {
  const { externalVrpResult } = useDashboardState();

  return <MapDashboard externalVrpResult={externalVrpResult} />;
}
