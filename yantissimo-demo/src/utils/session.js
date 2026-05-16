// src/utils/session.js
"use client";
const SESSION_KEY = "userProfile";
const emitUserProfileUpdated = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("user-profile-updated"));
  }
};

export const ROLES = {
  OWNER: 100,
  ADMIN: 30,
  MARKETING: 26,
  MANAGER: 22,
  SELLER: 18,
  MYR_MANAGER: 15,
  MYR_SELLER: 13,
  MYR_HELPER: 11,
  TECHNICIAN: 8,
  CLIENT_ADMIN: 4,
  CLIENT: 3,
};

export const ROLES_PATIO = [
  ROLES.OWNER,
  ROLES.ADMIN,
  ROLES.MARKETING,
  ROLES.MANAGER,
  ROLES.SELLER,
];
export const ROLES_MYR = [
  ROLES.MYR_MANAGER,
  ROLES.MYR_SELLER,
  ROLES.MYR_HELPER,
];
export const ROLES_CORP = [ROLES.OWNER, ROLES.ADMIN, ROLES.MARKETING];
export const ROLES_CLIENTS = [ROLES.CLIENT_ADMIN, ROLES.CLIENT];

export const saveUserProfile = (profile) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(profile));
    emitUserProfileUpdated();
  }
};

export const getUserProfile = () => {
  if (typeof window !== "undefined") {
    const profile = localStorage.getItem(SESSION_KEY);
    return profile ? JSON.parse(profile) : null;
  }
  return null;
};

export const getSucursal = () => {
  if (typeof window !== "undefined") {
    const sucursal = localStorage.getItem("sucursal");
    return sucursal ?? null;
  }
  return null;
};

export const setSucursal = (sucursal) => {
  if (typeof window !== "undefined") {
    if (sucursal !== "Todas") {
      localStorage.setItem("sucursal", sucursal);
    }
  }
};

export const getCotiFilter = () => {
  if (typeof window !== "undefined") {
    const type = localStorage.getItem("cotifilter");
    return type ?? "Todas";
  }
  return "Todas";
};

export const removeUserProfile = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
    emitUserProfileUpdated();
  }
};

export const decodeToken = (token) => {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch (_e) {
    return null;
  }
};

// --- Token storage (for cross-domain / Vercel previews) ---
const ACC_KEY = "acc_token";
const REF_KEY = "ref_token";

export const saveTokens = (acc, ref) => {
  if (typeof window === "undefined") return;
  if (acc) sessionStorage.setItem(ACC_KEY, acc);
  if (ref) sessionStorage.setItem(REF_KEY, ref);
};

export const getAccessToken = () =>
  typeof window !== "undefined" ? sessionStorage.getItem(ACC_KEY) : null;

export const getRefreshToken = () =>
  typeof window !== "undefined" ? sessionStorage.getItem(REF_KEY) : null;

export const clearTokens = () => {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ACC_KEY);
  sessionStorage.removeItem(REF_KEY);
};
