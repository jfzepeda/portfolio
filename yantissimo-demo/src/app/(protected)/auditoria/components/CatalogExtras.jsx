"use client";
import { useEffect, useState } from "react";
import { fetchMichelinCatalog } from "../lib/api";

const LS_CAT = "tec_ll_catalogo_v1";
const TTL_MS = 24 * 60 * 60 * 1000;

export function readCatalogCount() {
  try {
    const s = localStorage.getItem(LS_CAT);
    if (!s) return 0;
    const d = JSON.parse(s);
    return d?.items?.length ?? Math.floor(Object.keys(d).length / 2);
  } catch {
    return 0;
  }
}

function readCachedCatalog() {
  try {
    const d = JSON.parse(localStorage.getItem(LS_CAT) || "null");
    if (!d?.items?.length || !d?.ts) return null;
    if (Date.now() - d.ts > TTL_MS) return null;
    return d;
  } catch {
    return null;
  }
}

function resetAdminImports() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith("tec_retro_admin_v1_")) keys.push(k);
  }
  if (!keys.length) {
    alert("No hay importaciones de admin para borrar.\n\nYa estás en estado limpio.");
    return;
  }
  const sucs = keys.map((k) => k.replace("tec_retro_admin_v1_", "")).join(", ");
  if (!confirm(`🧪 TESTING — Borrar importaciones de admin\n\nSucursales: ${sucs}\n\nNO se toca el historial del mes ni la configuración.\n\n¿Continuar?`)) return;
  keys.forEach((k) => { try { localStorage.removeItem(k); } catch (_) {} });
  alert(`✓ Borradas ${keys.length} importación(es) de admin.\n\nEstado limpio para reiniciar las pruebas.`);
}

export default function CatalogExtras({ catCount, setCatCount }) {
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const catLoaded = catCount > 0;

  async function loadCatalog(forceRefresh = false) {
    if (!forceRefresh) {
      const cached = readCachedCatalog();
      if (cached) { setCatCount(cached.items.length); return; }
    }
    setLoading(true);
    setFetchError(null);
    try {
      const items = await fetchMichelinCatalog();
      if (!items.length) {
        setFetchError("Sin productos Michelin en BD");
        return;
      }
      localStorage.setItem(LS_CAT, JSON.stringify({ items, ts: Date.now() }));
      setCatCount(items.length);
    } catch (e) {
      setFetchError("Error al cargar catálogo");
      console.warn("[auditoria] michelin catalog fetch failed:", e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCatalog(false); }, []);

  function clearCatalog() {
    try { localStorage.removeItem(LS_CAT); } catch (_) {}
    setCatCount(0);
    setFetchError(null);
  }

  return (
    <>
      {/* Catálogo Michelin / BFG */}
      <div style={{ marginTop: 14, padding: "12px 14px", background: "rgba(var(--accent-rgb),.05)", border: "1px solid rgba(var(--accent-rgb),.2)", borderRadius: 8, width: "100%", maxWidth: 580, boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 200 }}>
            <span style={{ fontSize: 20 }}>📧</span>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--t1)" }}>Lista Michelin / BFG</div>
              <div style={{ fontSize: 10, color: "var(--t2)", marginTop: 1 }}>
                {loading
                  ? "Cargando desde servidor..."
                  : catLoaded
                  ? `Cargado: ${catCount} artículos Michelin/BFG`
                  : "Sin catálogo — llantas indexadas no auditadas"}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 10,
              background: loading
                ? "rgba(var(--accent-rgb),.15)"
                : catLoaded
                ? "rgba(var(--ok-rgb),.15)"
                : "rgba(var(--warn-rgb),.15)",
              color: loading ? "var(--accent)" : catLoaded ? "var(--ok)" : "var(--warn-2)",
            }}>
              {loading ? "Cargando..." : catLoaded ? `${catCount} art.` : "Sin catálogo"}
            </span>
            <button
              onClick={() => loadCatalog(true)}
              disabled={loading}
              title="Recargar catálogo desde servidor"
              style={{ fontSize: 10.5, padding: "5px 12px", borderRadius: 5, cursor: loading ? "default" : "pointer", border: "1px solid var(--accent)", background: "rgba(var(--accent-rgb),.1)", color: "var(--accent)", fontWeight: 600, whiteSpace: "nowrap", opacity: loading ? 0.5 : 1 }}
            >
              Recargar
            </button>
            <button onClick={clearCatalog} title="Limpiar catálogo" style={{ fontSize: 11, padding: "4px 8px", borderRadius: 5, cursor: "pointer", border: "1px solid var(--b1)", background: "var(--s2)", color: "var(--t2)" }}>
              🗑
            </button>
          </div>
        </div>
        {fetchError && (
          <div style={{ marginTop: 6, fontSize: 10, color: "var(--danger-2)" }}>{fetchError}</div>
        )}
      </div>

      {/* Modo testing */}
      <div style={{ marginTop: 10, padding: "10px 12px", background: "rgba(var(--warn-rgb),.08)", border: "1px dashed rgba(var(--warn-rgb),.4)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", width: "100%", maxWidth: 580, boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 200 }}>
          <span style={{ fontSize: 16 }}>🧪</span>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--warn-2)" }}>Modo testing · limpiar importaciones</div>
            <div style={{ fontSize: 9.5, color: "var(--t2)", lineHeight: 1.4 }}>Borra respuestas de admin importadas. No afecta historial.</div>
          </div>
        </div>
        <button
          onClick={resetAdminImports}
          style={{ fontSize: 10.5, padding: "6px 12px", borderRadius: 5, cursor: "pointer", border: "1px solid rgba(var(--warn-rgb),.5)", background: "rgba(var(--warn-rgb),.12)", color: "var(--warn-2)", fontWeight: 600, whiteSpace: "nowrap" }}
        >
          Reset
        </button>
      </div>
    </>
  );
}
