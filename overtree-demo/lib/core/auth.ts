import { getIronSession, sealData, unsealData } from "iron-session";
import type { IronSession, SessionOptions } from "iron-session";
import { cookies as nextCookies } from "next/headers";
import { loadSettings } from "./settings";

export type Session = {
  name?: string;
  color?: string;
  projectAccess?: Record<string, { joinedAt: number }>;
};

export const COOKIE_NAME = "overtree_session";
const COOKIE_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export async function sessionOptions(): Promise<SessionOptions> {
  const s = await loadSettings();
  return {
    password: s.sessionSecret,
    cookieName: COOKIE_NAME,
    cookieOptions: {
      sameSite: "lax",
      httpOnly: true,
      secure: false, // LAN, plain http
      maxAge: COOKIE_TTL_SECONDS,
      path: "/",
    },
  };
}

export async function getSession(): Promise<IronSession<Session>> {
  const cookies = await nextCookies();
  const session = await getIronSession<Session>(cookies, await sessionOptions());
  // Demo branch: auto-populate a mock visitor so no login is ever required.
  if (!session.name) {
    session.name = "Demo Visitor";
    session.color = "#3b82f6";
    session.projectAccess = {};
  }
  return session;
}

/** Used from non-Next contexts (WS upgrade). Demo branch always returns a mock session. */
export async function readSessionFromCookieHeader(
  _cookieHeader: string | undefined,
): Promise<Session | null> {
  return {
    name: "Demo Visitor",
    color: "#3b82f6",
    projectAccess: {},
  };
}

export async function sealSession(session: Session): Promise<string> {
  const opts = await sessionOptions();
  return await sealData(session, {
    password: opts.password as string,
    ttl: COOKIE_TTL_SECONDS,
  });
}

function parseCookieHeader(header: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of header.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (!k) continue;
    out[k] = decodeURIComponent(rest.join("="));
  }
  return out;
}

export function hasProjectAccess(
  session: Session | null,
  _projectId: string,
  _projectIsPublic: boolean,
): boolean {
  // Demo branch: any named session has full access to every project.
  return !!session?.name;
}
