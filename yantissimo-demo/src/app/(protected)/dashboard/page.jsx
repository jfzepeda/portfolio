"use client";
import React, { useEffect, useState } from "react";
import { getUserProfile } from "~/utils/session";
import { ROLES } from "~/utils/global";
import InventarioPage from "@/inventario/page";
import DashboardPage from "@/dashboard/DashboardPage";
import HomepageLoaderGate from "~/resources/loading/homepage-loader-gate";

export default function DashboardRouter() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    try {
      const currentProfile = getUserProfile();
      setProfile(currentProfile || null);
    } catch (_e) {
      setProfile(null);
    }
  }, []);

  return (
    <HomepageLoaderGate>
      {profile?.role >= ROLES.ADMIN ? (
        <DashboardPage />
      ) : profile ? (
        <InventarioPage />
      ) : (
        <h2>Loading...</h2>
      )}
    </HomepageLoaderGate>
  );
}
