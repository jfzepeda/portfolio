"use client";

import type {
  AuthUser, Role, Feature, KioskSession, LicenseCodeRecord,
} from "@karate/core";

export interface NetworkStatusSnapshot {
  mode: "standalone" | "server" | "client";
  connected: boolean;
  serverInfo: {
    serverId: string;
    serverIp: string | null;
    serverPort: number;
    hostname: string | null;
  } | null;
  clients: Array<{
    clientId: string | null;
    hostname: string | null;
    role: string;
    connectedAt: number;
    rttMs: number | null;
  }>;
  stateVersion: number;
}

export interface NetworkStateEnvelope {
  kind: "full";
  state: unknown;
  stateVersion: number;
}

export interface NetworkActionEnvelope {
  actionId: string;
  actionType: string;
  area?: number;
  payload?: Record<string, unknown>;
  clientId?: string;
  ts?: number;
}

export interface NetworkAckEnvelope { actionId: string; newVersion: number; }
export interface NetworkRejectedEnvelope {
  actionId: string;
  reason: string;
  message?: string;
}

export interface DiscoveredServer {
  serverId: string;
  serverIp: string;
  serverPort: number;
  appVersion?: string;
  tournamentName?: string | null;
  startedAt?: number;
}

declare global {
  interface Window {
    __KARATE__?: {
      isElectron?: boolean;
      serverUrl?: string;
      kioskSession?: KioskSession | null;
      license?: {
        getBootstrap: () => Promise<{
          state: unknown;
          token: string | null;
          serverUrl: string;
          machineFingerprint: string;
          kioskSession: KioskSession | null;
        }>;
        getState: () => Promise<{ state: unknown; token: string | null }>;
        activateCode: (code: string) => Promise<{ ok: boolean; error?: string; state?: unknown; token?: string | null }>;
        retryRenewal: () => Promise<{ state: unknown; token: string | null }>;
        reset: () => Promise<{ state: unknown; token: string | null }>;
        onChange: (cb: (envelope: { state: unknown; token: string | null }) => void) => () => void;
      };
      openPublicWindow?: () => void;
      overlay?: {
        onOpen(cb: (payload: { localAdminToken: string; serverUrl: string }) => void): () => void;
        onClose(cb: () => void): () => void;
        onListening?: (cb: () => void) => () => void;
        requestClose(): Promise<{ ok: boolean }>;
      };
      network?: {
        getStatus(): Promise<NetworkStatusSnapshot>;
        setMode(mode: "standalone" | "server" | "client"): Promise<{ ok: boolean; needsImport?: boolean; error?: string }>;
        importLocalState(state: unknown): Promise<{ ok: boolean; error?: string }>;
        sendAction(action: NetworkActionEnvelope): Promise<{ ok: boolean; error?: string }>;
        listDiscoveredServers(): Promise<DiscoveredServer[]>;
        connectTo(serverId: string): Promise<{ ok: boolean; error?: string }>;
        disconnectAllClients(): Promise<{ ok: boolean }>;
        onState(cb: (envelope: NetworkStateEnvelope) => void): () => void;
        onStatus(cb: (status: NetworkStatusSnapshot) => void): () => void;
        onAck(cb: (envelope: NetworkAckEnvelope) => void): () => void;
        onRejected(cb: (envelope: NetworkRejectedEnvelope) => void): () => void;
        onRivalServer(cb: (server: DiscoveredServer) => void): () => void;
      };
    };
  }
}

const DEFAULT_PORT = 47291;

export function getServerUrl(): string {
  if (typeof window === "undefined") return `http://127.0.0.1:${DEFAULT_PORT}`;
  if (window.__KARATE__?.serverUrl) return window.__KARATE__.serverUrl;
  const override = window.localStorage.getItem("karate.serverUrl");
  if (override) return override;
  const envUrl =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_KARATE_SERVER_URL
      : undefined;
  if (envUrl) return envUrl;
  return `http://127.0.0.1:${DEFAULT_PORT}`;
}

export function isElectron(): boolean {
  if (typeof window === "undefined") return false;
  return !!window.__KARATE__?.isElectron;
}

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message?: string) {
    super(message ?? code);
    this.status = status;
    this.code = code;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  token?: string;
  signal?: AbortSignal;
  isForm?: boolean;
  headers?: Record<string, string>;
}

/**
 * Demo branch — every request resolves to a canned response. No fetch is
 * issued, no token is checked, no real backend is contacted.
 */
const DEMO_NOW = () => Date.now();
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

const DEMO_USER = {
  role: "superadmin" as Role,
  features: [] as Feature[],
};

const DEMO_ACTIVATION = {
  token: "demo.kiosk.token",
  payload: {
    sub: "demo-user",
    role: DEMO_USER.role,
    features: DEMO_USER.features,
    plan: "superadmin",
    activated_at: Math.floor(DEMO_NOW() / 1000),
    exp: Math.floor((DEMO_NOW() + ONE_YEAR_MS) / 1000),
    iat: Math.floor(DEMO_NOW() / 1000),
    jti: "demo",
  },
};

const DEMO_TOURNAMENT_DATA = {
  version: 1,
  updatedAt: DEMO_NOW(),
  etag: "demo-etag",
  data: {} as Record<string, unknown>,
};

function demoResolve<T>(path: string, opts: RequestOptions): T {
  const pathOnly = path.split("?")[0];
  const method = (opts.method ?? "GET").toUpperCase();

  if (pathOnly === "/api/data") {
    if (method === "GET") {
      return { ...DEMO_TOURNAMENT_DATA, updatedAt: DEMO_NOW() } as unknown as T;
    }
    return {
      version: DEMO_TOURNAMENT_DATA.version + 1,
      updatedAt: DEMO_NOW(),
      etag: `demo-etag-${Math.random().toString(36).slice(2, 8)}`,
      data: (opts.body as Record<string, unknown>) ?? {},
    } as unknown as T;
  }

  if (pathOnly === "/api/me") {
    return {
      user: DEMO_USER,
      jti: "demo",
      exp: DEMO_ACTIVATION.payload.exp,
    } as unknown as T;
  }

  if (pathOnly === "/api/activate" || pathOnly === "/api/renew-token") {
    return { ...DEMO_ACTIVATION } as unknown as T;
  }

  if (pathOnly === "/api/kiosk-session") {
    return {
      token: DEMO_ACTIVATION.token,
      issuedAt: DEMO_NOW(),
      expiresAt: DEMO_NOW() + ONE_YEAR_MS,
      user: DEMO_USER,
    } as unknown as T;
  }

  if (pathOnly === "/api/logo-info") {
    return { logo: null } as unknown as T;
  }

  if (pathOnly === "/api/upload-logo") {
    return { logo: null } as unknown as T;
  }

  if (pathOnly === "/api/download-info") {
    return { mac: null, win: null } as unknown as T;
  }

  if (pathOnly === "/api/app-config") {
    return { sessionTtlMinutes: 60 } as unknown as T;
  }

  if (pathOnly === "/api/admin/licenses") {
    if (method === "GET") return { licenses: [] } as unknown as T;
    return {
      code: "000000",
      userId: "demo",
      label: "demo",
      role: DEMO_USER.role,
      features: DEMO_USER.features,
      expiresAt: DEMO_NOW() + ONE_YEAR_MS,
    } as unknown as T;
  }

  if (pathOnly === "/api/prepare-download") {
    return { tokenId: "demo-download-token" } as unknown as T;
  }

  // Default: success-shaped no-op for any unhandled mutation, empty object for GETs.
  if (method !== "GET") {
    return { ok: true } as unknown as T;
  }
  return {} as T;
}

export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  return demoResolve<T>(path, opts);
}

// ---------- Licensing ----------
export interface ActivationResponse {
  token: string;
  payload: {
    sub: string;
    role: Role;
    features: Feature[];
    plan: string;
    activated_at: number;
    exp: number;
    iat: number;
    jti: string;
  };
}

export async function apiActivate(code: string, machineFingerprint: string): Promise<ActivationResponse> {
  return apiRequest<ActivationResponse>("/api/activate", {
    method: "POST",
    body: { code, machineFingerprint },
  });
}

export async function apiRenewToken(
  currentJwt: string,
  machineFingerprint: string,
): Promise<ActivationResponse> {
  return apiRequest<ActivationResponse>("/api/renew-token", {
    method: "POST",
    body: { currentJwt, machineFingerprint },
  });
}

export async function apiMe(token: string): Promise<{ user: AuthUser; jti: string; exp: number }> {
  return apiRequest("/api/me", { token });
}

// ---------- Kiosk ----------
export async function apiGetKioskSession(signal?: AbortSignal): Promise<KioskSession> {
  return apiRequest<KioskSession>("/api/kiosk-session", { signal });
}

export interface LaunchConfig {
  issuedAt: number;
  expiresAt: number;
  role: string;
  data: Record<string, unknown>;
}

export async function apiPrepareDownload(token: string): Promise<{ tokenId: string }> {
  return apiRequest("/api/prepare-download", { token, method: "POST" });
}

// ---------- Downloads ----------
export interface DownloadInfo { mac: string | null; win: string | null; }

export async function apiGetDownloadInfo(): Promise<DownloadInfo> {
  return apiRequest("/api/download-info");
}

export function downloadUrl(filename: string): string {
  return getServerUrl().replace(/\/+$/, "") + `/api/downloads/${encodeURIComponent(filename)}`;
}

// ---------- License administration (superadmin) ----------
export async function apiAdminGetLicenses(token: string): Promise<{ licenses: LicenseCodeRecord[] }> {
  return apiRequest("/api/admin/licenses", { token });
}

export async function apiAdminCreateLicense(token: string, body: {
  role: Role;
  features?: Feature[];
  label: string;
  ttlDays?: number;
}): Promise<{ code: string; userId: string; label: string; role: Role; features: Feature[]; expiresAt: number }> {
  return apiRequest("/api/admin/licenses", { token, method: "POST", body });
}

export async function apiAdminRevokeLicense(token: string, userId: string): Promise<{ ok: true }> {
  return apiRequest(`/api/admin/licenses/${encodeURIComponent(userId)}/revoke`, { token, method: "POST" });
}

export async function apiAdminTransferLicense(token: string, userId: string): Promise<{ ok: true }> {
  return apiRequest(`/api/admin/licenses/${encodeURIComponent(userId)}/transfer`, { token, method: "POST" });
}

export async function apiAdminExtendLicense(token: string, userId: string, days: number): Promise<{ ok: true; expiresAt: number }> {
  return apiRequest(`/api/admin/licenses/${encodeURIComponent(userId)}/extend`, {
    token, method: "POST", body: { days },
  });
}

// ---------- Tournament data ----------
export interface TournamentDataFile {
  version: number;
  updatedAt: number;
  etag: string;
  data: Record<string, unknown>;
}

export async function apiGetData(token: string): Promise<TournamentDataFile> {
  return apiRequest("/api/data", { token });
}

export async function apiPutData(
  token: string,
  data: Record<string, unknown>
): Promise<TournamentDataFile> {
  return apiRequest("/api/data", { token, method: "PUT", body: data });
}

// ---------- Logo ----------
export interface LogoInfo { filename: string; mime: string; size: number; url: string; }

export async function apiGetLogoInfo(token: string): Promise<{ logo: LogoInfo | null }> {
  return apiRequest("/api/logo-info", { token });
}

export async function apiUploadLogo(token: string, file: File): Promise<{ logo: LogoInfo | null }> {
  const fd = new FormData();
  fd.append("logo", file);
  return apiRequest("/api/upload-logo", { token, method: "POST", body: fd, isForm: true });
}

export async function apiRemoveLogo(token: string): Promise<{ ok: true }> {
  return apiRequest("/api/upload-logo", { token, method: "DELETE" });
}

export function logoSrc(): string {
  return getServerUrl().replace(/\/+$/, "") + "/api/logo";
}

// ---------- App config (superadmin) ----------
export async function apiGetAppConfig(token: string): Promise<{ sessionTtlMinutes: number }> {
  return apiRequest("/api/app-config", { token });
}

export async function apiUpdateAppConfig(token: string, sessionTtlMinutes: number): Promise<{ sessionTtlMinutes: number }> {
  return apiRequest("/api/app-config", { token, method: "PUT", body: { sessionTtlMinutes } });
}
