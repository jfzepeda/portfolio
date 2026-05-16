"use client";

const TONE_CLASS = {
  critical: "sc",
  warn: "sw",
  ok: "so",
  accent: "sa",
};

export default function SummaryCard({
  tone = "accent",
  value,
  label,
  sub,
  onClick,
  className = "",
}) {
  const cls = TONE_CLASS[tone] || "sa";
  return (
    <div
      className={`scard ${cls} ${onClick ? "clickable" : ""} ${className}`}
      onClick={onClick}
    >
      <div className="sv">{value}</div>
      <div className="sl">{label}</div>
      {sub ? <div className="ss">{sub}</div> : null}
    </div>
  );
}
