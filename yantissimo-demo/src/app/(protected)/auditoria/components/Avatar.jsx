"use client";

export default function Avatar({ initials, tone = "accent" }) {
  const cls = tone === "warn" ? "av-a" : "av-b";
  return <div className={`avatar ${cls}`}>{initials}</div>;
}
