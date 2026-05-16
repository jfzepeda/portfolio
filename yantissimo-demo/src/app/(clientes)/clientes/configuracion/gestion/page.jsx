"use client";
import React from "react";
import ClientPanel from "~/components/client/ClientPanel.jsx";
import { getUserProfile } from "~/utils/session";

const userProfile = getUserProfile();
const company_id = userProfile ? userProfile.company_id : null;

export default function ClientPanelPage() {
  return <ClientPanel clientId={company_id} />;
}
