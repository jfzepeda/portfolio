"use client";

import { useRef } from "react";
import { Icon } from "./icons";
import { useT, bi } from "@/lib/i18n";

export function openDialog(id: string) {
  const d = document.getElementById(id);
  if (d instanceof HTMLDialogElement && !d.open) d.showModal();
}

// Native <dialog>: focus trap, ESC and inert background come for free, and the
// content is in the server-rendered HTML even while closed.
// Children must render an element with id={`${id}-title`} for the label.
export function GlassDialog({
  id,
  wide,
  children,
}: {
  id: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  const t = useT();
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <dialog
      id={id}
      ref={ref}
      aria-labelledby={`${id}-title`}
      className={`gdialog${wide ? " gdialog-wide" : ""}`}
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close();
      }}
    >
      <div className="gdialog-panel glass">
        <button
          type="button"
          className="icon-btn gdialog-close"
          aria-label={t(bi("Close", "Cerrar"))}
          onClick={() => ref.current?.close()}
        >
          <Icon name="close" />
        </button>
        {children}
      </div>
    </dialog>
  );
}
