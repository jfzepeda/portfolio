"use client";

export default function StatusBanner({ variant = "ok", children, className = "" }) {
  const cls = variant === "warn" ? "warn-banner" : "ok-banner";
  return <div className={`${cls} ${className}`}>{children}</div>;
}
