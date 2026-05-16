"use client";
import { useEffect } from "react";
import { saveUserProfile, getUserProfile } from "../utils/session";
import { MOCK_USER } from "~/lib/mock-user";

export function ProtectedClient({ children }) {
  useEffect(() => {
    if (!getUserProfile()) saveUserProfile(MOCK_USER);
  }, []);
  return <>{children}</>;
}
