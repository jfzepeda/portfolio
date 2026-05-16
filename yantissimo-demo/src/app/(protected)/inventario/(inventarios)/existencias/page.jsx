"use client";
import React from "react";
import { getUserProfile, ROLES } from "~/utils/session.js";
import AdminView from "./AdminView.jsx";
import BasicView from "./BasicView.jsx";

const userProfile = getUserProfile();
const curRole = userProfile ? userProfile.role : null;

const ExistenciasRouterPage = () => {
  if (curRole != null && curRole >= ROLES.MARKETING) return <AdminView />;
  return <BasicView />;
};

export default ExistenciasRouterPage;
