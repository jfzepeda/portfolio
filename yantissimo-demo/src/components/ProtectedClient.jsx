"use client";
import { saveUserProfile, getUserProfile } from "../utils/session";
import { MOCK_USER } from "~/lib/mock-user";

// Seed the mock session at module load — before any child useEffect reads it.
// Doing this inside a useEffect runs AFTER child effects, leaving pages like
// /dashboard stuck on their "no profile yet" Loading branch in production
// (React strict-mode hides the bug in dev by double-invoking effects).
if (typeof window !== "undefined" && !getUserProfile()) {
  saveUserProfile(MOCK_USER);
}

export function ProtectedClient({ children }) {
  return <>{children}</>;
}
