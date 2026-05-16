"use client";
import { useEffect, useMemo, useState } from "react";
import { useAuditoria } from "../state/AuditoriaContext";
import HistorialCalendar from "../components/HistorialCalendar";
import HistList from "../components/HistList";
import { fp } from "../lib/utils/format";
import { cargarDia, listarHistorial } from "../state/persistence";

function getDateParts(fecha) {
  if (!fecha || typeof fecha !== "string") return null;
  const iso = fecha.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [year, month, day] = iso.split("-").map(Number);
  return { year, month, day };
}

function buildResumen(item) {
  const alertas =
    (Number(item.alertasMarg) || 0) +
    (Number(item.alertasComp) || 0) +
    (Number(item.alertasBit) || 0);
  const piezas = [
    fp(item.venta || 0),
    `${Number(item.llantas) || 0} llantas`,
    alertas > 0 ? `${alertas} alertas` : "sin alertas",
  ];
  return piezas.join(" · ");
}

export default function HistorialPanel() {
  const { panels, togglePanel, sucursal, setResultado, setView } = useAuditoria();
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState("");
  const now = new Date();
  const [year] = useState(now.getFullYear());
  const [month] = useState(now.getMonth());

  useEffect(() => {
    if (!panels.historial) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    listarHistorial({ sucursal, mes: month + 1, anio: year })
      .then((res) => {
        if (!cancelled) setHistorial(res.dias || []);
      })
      .catch((e) => {
        if (!cancelled) setHistorial([]);
        if (!cancelled) setError(e.message || "No se pudo cargar el historial.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [panels.historial, sucursal, month, year]);

  const close = () => togglePanel("historial", false);
  const monthForDb = month + 1;
  const displayItems = useMemo(
    () => historial.map((item) => ({ ...item, resumen: item.resumen || buildResumen(item) })),
    [historial],
  );
  const daysWithData = useMemo(
    () =>
      new Set(
        historial
          .map((h) => {
            const parts = getDateParts(h.fecha);
            const rowYear = Number(h.anio) || parts?.year;
            const rowMonth = Number(h.mes) || parts?.month;
            const rowDay = Number(h.dia) || parts?.day;
            return rowMonth === monthForDb && rowYear === year ? rowDay : null;
          })
          .filter(Boolean),
      ),
    [historial, monthForDb, year],
  );
  const selectedDay = useMemo(() => {
    const selected = historial.find((item) => (item.id || item.fecha) === selectedId);
    if (!selected) return null;
    const parts = getDateParts(selected.fecha);
    return Number(selected.dia) || parts?.day || null;
  }, [historial, selectedId]);

  const loadItem = async (item) => {
    const fecha = item?.fecha;
    if (!fecha || loadingSession) return;
    const id = item.id || fecha;
    setSelectedId(id);
    setLoadingSession(true);
    setError("");
    try {
      const session = await cargarDia({ sucursal, fecha, resultado: item.resultado });
      if (!session?.resultado) throw new Error("La sesión no contiene datos.");
      setResultado(session.resultado);
      setView("dashboard");
      close();
    } catch (e) {
      setError(e.message || "No se pudo cargar la sesión guardada.");
    } finally {
      setLoadingSession(false);
    }
  };

  const loadDay = (day) => {
    const item = historial.find((h) => {
      const parts = getDateParts(h.fecha);
      const rowYear = Number(h.anio) || parts?.year;
      const rowMonth = Number(h.mes) || parts?.month;
      const rowDay = Number(h.dia) || parts?.day;
      return rowDay === day && rowMonth === monthForDb && rowYear === year;
    });
    if (item) loadItem(item);
  };

  if (!panels.historial) return null;

  return (
    <>
      <div className="aud-overlay" onClick={close} />
      <aside className="aud-aside left">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
            paddingBottom: 12,
            borderBottom: "1px solid var(--b1)",
          }}
        >
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>📅 Historial</div>
            <div style={{ fontSize: 10.5, color: "var(--t3)", marginTop: 1 }}>
              Días guardados · clic en un día para cargar
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

        <div className="hist-section">
          <div className="hist-header">
            <h3 style={{ fontSize: 12 }}>
              {now.toLocaleString("es-MX", { month: "long", year: "numeric" })}
            </h3>
          </div>
          <HistorialCalendar
            year={year}
            month={month}
            daysWithData={daysWithData}
            selectedDay={selectedDay}
            today={now.getDate()}
            onSelectDay={loadDay}
          />
          {error && (
            <div
              style={{
                color: "var(--danger-2)",
                background: "var(--danger-bg)",
                border: "1px solid var(--danger)",
                borderRadius: 6,
                fontSize: 11,
                lineHeight: 1.35,
                margin: "0 14px 10px",
                padding: "8px 10px",
              }}
            >
              {error}
            </div>
          )}
          {loading ? (
            <div className="aud-empty">Cargando historial...</div>
          ) : loadingSession ? (
            <div className="aud-empty">Cargando sesión...</div>
          ) : (
            <HistList items={displayItems} activeId={selectedId} onSelect={loadItem} />
          )}
        </div>
      </aside>
    </>
  );
}
