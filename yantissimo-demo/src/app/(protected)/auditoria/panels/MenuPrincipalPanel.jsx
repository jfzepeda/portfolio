"use client";
import { useAuditoria } from "../state/AuditoriaContext";

export default function MenuPrincipalPanel() {
  const { panels, togglePanel, setView, nuevoAnalisis } = useAuditoria();

  if (!panels.menu) return null;

  const close = () => togglePanel("menu", false);

  const ItemBtn = ({ icon, label, onClick, destructive = false }) => (
    <button
      onClick={() => {
        onClick?.();
        close();
      }}
      style={{
        width: "100%",
        padding: "10px 14px",
        background: destructive ? "transparent" : "var(--s2)",
        color: destructive ? "var(--warn)" : "var(--text)",
        border: destructive
          ? "1px solid rgba(var(--warn-rgb),.4)"
          : "1px solid var(--b1)",
        borderRadius: 6,
        cursor: "pointer",
        fontSize: 12,
        fontFamily: "inherit",
        textAlign: "left",
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 6,
      }}
    >
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      <span style={{ color: "var(--t3)" }}>›</span>
    </button>
  );

  return (
    <>
      <div className="aud-overlay" onClick={close} />
      <aside className="aud-aside right">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
            paddingBottom: 12,
            borderBottom: "1px solid var(--b1)",
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Menú</div>
            <div style={{ fontSize: 10.5, color: "var(--t3)", marginTop: 1 }}>
              Acciones del día
            </div>
          </div>
          <button
            onClick={close}
            style={{
              width: 28,
              height: 28,
              border: "none",
              background: "var(--s2)",
              color: "var(--t2)",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: 22 }}>
          <div
            style={{
              fontSize: 10,
              color: "var(--t3)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            Terminar día
          </div>
          <button
            style={{
              width: "100%",
              padding: "14px 16px",
              background: "var(--accent)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <span style={{ fontSize: 16 }}>💾</span> Guardar / Exportar / Enviar
          </button>
        </div>

        <ItemBtn
          icon="🏠"
          label="Vista general"
          onClick={() => setView("dashboardInicio")}
        />
        <ItemBtn
          icon="✉️"
          label="Configurar correos y ver bitácora"
          onClick={() => togglePanel("mail", true)}
        />
        <ItemBtn icon="📄" label="Generar PDF del corte" />
        <ItemBtn icon="👤" label="Gerentes por sucursal" />
        <ItemBtn
          icon="⚙️"
          label="Catálogos, objetivos y descuentos"
          onClick={() => setView("configuracion")}
        />

        <div
          style={{
            marginTop: 26,
            paddingTop: 16,
            borderTop: "1px solid var(--b1)",
          }}
        >
          <ItemBtn icon="↻" label="Nuevo análisis" destructive onClick={nuevoAnalisis} />
        </div>
      </aside>
    </>
  );
}
