"use client";

import { ReactNode, useCallback, useEffect, useState } from "react";
import HomepageLogoLoader from "./homepage-logo-loader";

const DEFAULT_COOKIE_NAME = "homepage_loader_seen";
const DEFAULT_COOKIE_MAX_AGE_SECONDS = 20 * 60 * 60;

function hasCookie(cookieName: string) {
  if (typeof document === "undefined") return false;

  return document.cookie
    .split("; ")
    .some((cookie) => cookie.startsWith(`${cookieName}=`));
}

function setCookie(cookieName: string, value: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") return;

  const secureAttribute =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";

  document.cookie = `${cookieName}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax${secureAttribute}`;
}

type HomepageLoaderGateProps = {
  children: ReactNode;
  cookieName?: string;
  cookieMaxAgeSeconds?: number;
};

export default function HomepageLoaderGate({
  children,
  cookieName = DEFAULT_COOKIE_NAME,
  cookieMaxAgeSeconds = DEFAULT_COOKIE_MAX_AGE_SECONDS,
}: HomepageLoaderGateProps) {
  const [shouldShowLoader, setShouldShowLoader] = useState<boolean | null>(() => {
    if (typeof document === "undefined") return null;
    return !hasCookie(cookieName);
  });

  useEffect(() => {
    setShouldShowLoader(!hasCookie(cookieName));
  }, [cookieName]);

  const handleFinish = useCallback(() => {
    setCookie(cookieName, new Date().toISOString(), cookieMaxAgeSeconds);
    setShouldShowLoader(false);
  }, [cookieMaxAgeSeconds, cookieName]);

  if (shouldShowLoader === null) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  if (!shouldShowLoader) {
    return <>{children}</>;
  }

  return (
    <>
      <HomepageLogoLoader onFinish={handleFinish} />
      <div style={{ visibility: "hidden" }}>{children}</div>
    </>
  );
}
