"use client";
import { useState } from "react";

export default function Accordion({
  title,
  meta,
  defaultOpen = false,
  children,
  variant = "acc",
  headerExtra,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const rootClass = variant === "obj" ? "obj-acc" : "acc";
  const hdrClass = variant === "obj" ? "obj-acc-hdr" : "acc-hdr";
  const arrowClass = variant === "obj" ? "obj-arrow" : "acc-ar";
  const bodyClass = variant === "obj" ? "obj-acc-body" : "acc-body";

  return (
    <div className={`${rootClass} ${open ? "open" : ""}`}>
      <div className={hdrClass} onClick={() => setOpen((v) => !v)}>
        <span className={arrowClass}>▶</span>
        <span className="acc-title" style={{ flex: 1 }}>
          {title}
        </span>
        {meta ? (
          <span style={{ fontSize: 10, color: "var(--t2)", marginRight: 8 }}>
            {meta}
          </span>
        ) : null}
        {headerExtra}
      </div>
      <div className={bodyClass}>{children}</div>
    </div>
  );
}
