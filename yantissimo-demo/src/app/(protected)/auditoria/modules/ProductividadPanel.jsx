"use client";
import { useAuditoria } from "../state/AuditoriaContext";
import ProductCard from "../components/ProductCard";
import Avatar from "../components/Avatar";
import { LBL } from "../lib/catalog/lineas";
import { fp } from "../lib/utils/format";

function initialesDe(nombre) {
  return (nombre || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || "")
    .join("");
}

export default function ProductividadPanel() {
  const { resultado } = useAuditoria();
  const data = resultado?.prodData;

  if (!data || (data.vendedores.length === 0 && data.tecnicos.length === 0)) {
    return <div className="aud-empty">No se importó el reporte de productividad.</div>;
  }

  return (
    <div>
      {data.vendedores.length > 0 && (
        <>
          <div className="stit">Vendedores</div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))",
              gap: 12,
              marginBottom: 16,
            }}
          >
            {data.vendedores.map((v) => {
              const udsTotales = v.lineas.reduce((s, l) => s + l.uds, 0);
              const margenTotal = v.lineas.reduce((s, l) => s + l.margen, 0);
              return (
                <ProductCard key={v.nombre}>
                  <div className="prod-person">
                    <Avatar initials={initialesDe(v.nombre)} tone="accent" />
                    <div style={{ flex: 1 }}>
                      <div className="prod-name">{v.nombre}</div>
                      <div className="prod-role">
                        {v.clientes} clientes · {udsTotales} uds · {fp(margenTotal)}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {v.lineas
                      .filter((l) => l.uds > 0 || l.margen > 0)
                      .map((l) => (
                        <div
                          key={l.linea}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            fontSize: 11,
                          }}
                        >
                          <span
                            style={{
                              width: 110,
                              color: "var(--t2)",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {LBL[l.linea] || l.linea}
                          </span>
                          <span
                            style={{
                              width: 32,
                              textAlign: "right",
                              fontFamily: "var(--mono)",
                            }}
                          >
                            {l.uds}
                          </span>
                          <span
                            style={{
                              flex: 1,
                              textAlign: "right",
                              fontFamily: "var(--mono)",
                              color: "var(--t3)",
                              fontSize: 10,
                            }}
                          >
                            {fp(l.margen)}
                          </span>
                        </div>
                      ))}
                  </div>
                </ProductCard>
              );
            })}
          </div>
        </>
      )}

      {data.tecnicos.length > 0 && (
        <>
          <div className="stit">Técnicos</div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
              gap: 10,
            }}
          >
            {data.tecnicos.map((t) => {
              const udsTotales = t.lineas.reduce((s, l) => s + l.uds, 0);
              return (
                <ProductCard key={t.nombre}>
                  <div className="prod-person">
                    <Avatar initials={initialesDe(t.nombre)} tone="warn" />
                    <div style={{ flex: 1 }}>
                      <div className="prod-name">{t.nombre}</div>
                      <div className="prod-role">
                        {t.ordenes} órdenes · {udsTotales} uds
                      </div>
                    </div>
                  </div>
                  {t.lineas
                    .filter((l) => l.uds > 0)
                    .map((l) => (
                      <div
                        key={l.linea}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 11,
                          padding: "4px 0",
                        }}
                      >
                        <span style={{ color: "var(--t2)" }}>
                          {LBL[l.linea] || l.linea}
                        </span>
                        <span style={{ fontFamily: "var(--mono)", fontWeight: 600 }}>
                          {l.uds}
                        </span>
                      </div>
                    ))}
                </ProductCard>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
