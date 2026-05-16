"use client";

const VARIANT_CLASS = {
  critical: "bc",
  warn: "bw",
  ok: "bo",
  info: "bi",
  muted: "bm",
  plum: "bp",
};

export default function Badge({ variant = "muted", children, className = "", ...rest }) {
  const cls = VARIANT_CLASS[variant] || "bm";
  return (
    <span className={`b ${cls} ${className}`} {...rest}>
      {children}
    </span>
  );
}
