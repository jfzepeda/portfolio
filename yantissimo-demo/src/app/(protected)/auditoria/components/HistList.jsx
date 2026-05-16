"use client";

export default function HistList({ items = [], activeId, onSelect }) {
  if (items.length === 0) {
    return <div className="aud-empty">Sin días guardados</div>;
  }
  return (
    <div
      className="hist-list"
      style={{
        padding: "0 14px 10px",
        display: "flex",
        flexDirection: "column",
        gap: 4,
        maxHeight: 160,
        overflowY: "auto",
      }}
    >
      {items.map((it) => (
        <div
          key={it.id || it.fecha}
          onClick={() => onSelect?.(it)}
          className={`hist-item ${activeId === (it.id || it.fecha) ? "active" : ""}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "7px 10px",
            borderRadius: 6,
            cursor: "pointer",
            border: "1px solid var(--b1)",
            background: "var(--s1)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: 11,
              fontWeight: 500,
              width: 56,
              flexShrink: 0,
            }}
          >
            {it.fecha}
          </div>
          <div style={{ flex: 1, fontSize: 11, color: "var(--t2)" }}>
            {it.resumen}
          </div>
          <span style={{ fontSize: 11, color: "var(--t3)" }}>›</span>
        </div>
      ))}
    </div>
  );
}
