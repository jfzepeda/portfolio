"use client";
import { useEffect } from "react";

export default function Modal({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 400,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="modal-box" style={{ maxWidth }}>
        {title ? <h3>{title}</h3> : null}
        <div>{children}</div>
        {actions ? <div className="modal-btns">{actions}</div> : null}
      </div>
    </div>
  );
}
