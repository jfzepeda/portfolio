export function showLoadingOverlay() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return () => {};
  }

  // Evitar duplicados si ya existe
  const existing = document.getElementById("global-loading-overlay");
  if (existing) {
    return () => {
      try {
        existing.remove();
      } catch {}
    };
  }

  const overlay = document.createElement("div");
  overlay.id = "global-loading-overlay";
  overlay.setAttribute(
    "style",
    [
      "position: fixed",
      "inset: 0",
      "background: var(--app-overlay-scrim)",
      "backdrop-filter: blur(1px)",
      "display: flex",
      "align-items: center",
      "justify-content: center",
      "z-index: 99999",
      "transition: opacity 120ms ease",
      "opacity: 1",
    ].join(";")
  );

  const spinner = document.createElement("div");
  spinner.setAttribute(
    "style",
    [
      "width: 56px",
      "height: 56px",
      "border-radius: 50%",
      "border: 6px solid var(--app-border-subtle)",
      "border-top-color: var(--app-info-main)",
      "animation: yssm-spin 0.8s linear infinite",
      "box-shadow: var(--app-shadow-inset)",
      "background: transparent",
    ].join(";")
  );

  // Keyframes para el spinner
  const styleTag = document.createElement("style");
  styleTag.textContent = `@keyframes yssm-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`;

  overlay.appendChild(spinner);
  overlay.appendChild(styleTag);
  document.body.appendChild(overlay);

  // Devuelve función para remover el overlay
  return () => {
    try {
      overlay.style.opacity = "0";
      // Pequeño delay para respetar la transición
      setTimeout(() => {
        try {
          overlay.remove();
        } catch {}
      }, 140);
    } catch {
      try {
        overlay.remove();
      } catch {}
    }
  };
}
