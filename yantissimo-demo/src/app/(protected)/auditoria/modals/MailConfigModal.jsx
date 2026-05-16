"use client";
import { useEffect, useMemo, useState } from "react";
import { SUCURSALES } from "../lib/constants";
import { useAuditoria } from "../state/AuditoriaContext";

const LS_MAIL_CONFIG = "mailConfig_v1";
const LS_MAIL_LOG = "mailLog_v1";

const EMPTY_CONFIG = { remitenteGerente: "", porSucursal: {} };

function readJson(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    return JSON.parse(window.localStorage.getItem(key) || "null") || fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (_) {}
}

function formatDate(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function resumenLog(entry) {
  const res = entry.resumen || {};
  const parts = [];
  if (res.fecha) parts.push(res.fecha);
  if (res.incidencias) parts.push(`${res.incidencias} inc.`);
  if (res.apelacionesPendientes) parts.push(`${res.apelacionesPendientes} apel.`);
  if (res.apelacionesResueltas) parts.push(`${res.apelacionesResueltas} apel. resueltas`);
  return parts.join(" · ") || "—";
}

function notify(message) {
  if (typeof window !== "undefined" && window.showToast) {
    window.showToast(message, "success");
    return;
  }
  alert(message);
}

function downloadJson(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json;charset=utf-8",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename.endsWith(".json") ? filename : `${filename}.json`;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(a.href);
  a.remove();
}

export default function MailConfigModal({ open, onClose }) {
  const { sucursal } = useAuditoria();
  const [config, setConfig] = useState(EMPTY_CONFIG);
  const [log, setLog] = useState([]);

  useEffect(() => {
    if (!open) return;
    setConfig(readJson(LS_MAIL_CONFIG, EMPTY_CONFIG));
    const savedLog = readJson(LS_MAIL_LOG, []);
    setLog(Array.isArray(savedLog) ? savedLog : []);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const visibleLog = useMemo(
    () =>
      log
        .map((entry, index) => ({ ...entry, originalIndex: index }))
        .slice()
        .reverse()
        .slice(0, 30),
    [log],
  );

  const updateMail = (sucursal, key, value) => {
    setConfig((prev) => ({
      ...prev,
      porSucursal: {
        ...(prev.porSucursal || {}),
        [sucursal]: {
          ...(prev.porSucursal?.[sucursal] || {}),
          [key]: value,
        },
      },
    }));
  };

  const saveConfig = () => {
    writeJson(LS_MAIL_CONFIG, config);
    notify("Correos guardados ✓");
    onClose?.();
  };

  const addLogEntry = (entry) => {
    const next = [...log, { ts: new Date().toISOString(), ...entry }].slice(-500);
    setLog(next);
    writeJson(LS_MAIL_LOG, next);
  };

  const resend = (entry) => {
    if (entry.direccion !== "enviado") {
      alert("Solo se pueden reenviar envíos, no recepciones.");
      return;
    }
    if (!entry.payload || !entry.nombreArchivo) {
      alert("Este envío es de una versión anterior y no tiene el archivo guardado.");
      return;
    }

    try {
      downloadJson(entry.nombreArchivo, entry.payload);
    } catch (err) {
      alert(`No se pudo descargar el archivo: ${err.message}`);
      return;
    }

    const body = `${entry.cuerpoOriginal || ""}\n\n[REENVÍO · ${new Date().toLocaleString("es-MX")}]`;
    const ccParam = entry.cc ? `&cc=${encodeURIComponent(entry.cc)}` : "";
    const gmailUrl =
      `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(entry.para || "")}` +
      `&su=${encodeURIComponent(entry.asuntoOriginal || entry.asunto || "")}` +
      `&body=${encodeURIComponent(body)}${ccParam}`;
    window.open(gmailUrl, "_blank");

    addLogEntry({
      direccion: "enviado",
      sucursal: entry.sucursal,
      asunto: `${entry.asunto || ""} [REENVÍO]`,
      para: entry.para || "",
      cc: entry.cc || "",
      resumen: entry.resumen,
      archivo: entry.archivo,
      payload: entry.payload,
      nombreArchivo: entry.nombreArchivo,
      cuerpoOriginal: entry.cuerpoOriginal,
      asuntoOriginal: entry.asuntoOriginal,
      esReenvio: true,
      reenvioDe: entry.ts,
    });
  };

  if (!open) return null;

  return (
    <div
      className="mail-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="mail-box">
        <div className="mail-titlebar">
          <div>
            <h3>
              <span aria-hidden="true">✉️</span>
              Configuración de correos y bitácora
            </h3>
            <p>
              Configuración de {sucursal || "la sucursal"}. Al enviar, se abre
              Gmail con el correo prellenado.
            </p>
          </div>
          <button className="mail-close" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>

        <div className="mail-modal">
          <section className="mail-card">
            <div className="mail-section-title">Destinatarios por sucursal</div>
            <div className="mail-table-wrap">
              <table className="mail-table">
                <thead>
                  <tr>
                    <th>Sucursal</th>
                    <th>Admin (Para)</th>
                    <th>Comercial / CC</th>
                  </tr>
                </thead>
                <tbody>
                  {SUCURSALES.map((s) => {
                    const row = config.porSucursal?.[s.value] || {};
                    return (
                      <tr key={s.value}>
                        <td className="mail-sucursal">{s.value}</td>
                        <td>
                          <input
                            type="email"
                            value={row.adminTo || ""}
                            placeholder="admin@..."
                            onChange={(e) => updateMail(s.value, "adminTo", e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="email"
                            value={row.adminCc || ""}
                            placeholder="cc@..."
                            onChange={(e) => updateMail(s.value, "adminCc", e.target.value)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="mail-actions">
              <button className="mail-save" onClick={saveConfig}>Guardar correos</button>
            </div>
          </section>

          <section className="mail-card">
            <div className="mail-log-head">
              <div className="mail-section-title">Bitácora de envíos y recepciones</div>
              <span>Últimas 30 · {log.length} totales</span>
            </div>
            <div className="mail-table-wrap mail-log-wrap">
              <table className="mail-table mail-log-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Acción</th>
                    <th>Sucursal</th>
                    <th>Asunto</th>
                    <th>Para/De</th>
                    <th>Resumen</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleLog.length ? (
                    visibleLog.map((entry) => (
                      <tr key={`${entry.ts}-${entry.originalIndex}`}>
                        <td>{formatDate(entry.ts)}</td>
                        <td className={entry.direccion === "enviado" ? "mail-sent" : "mail-received"}>
                          {entry.direccion === "enviado" ? "Enviado" : "Recibido"}
                        </td>
                        <td className="mail-sucursal">{entry.sucursal || "—"}</td>
                        <td>{entry.asunto || "—"}</td>
                        <td className="mail-address">{entry.para || "—"}</td>
                        <td>{resumenLog(entry)}</td>
                        <td className="mail-action-cell">
                          {entry.direccion === "enviado" && entry.payload && entry.nombreArchivo ? (
                            <button className="mail-resend" onClick={() => resend(entry)}>
                              Reenviar
                            </button>
                          ) : entry.direccion === "enviado" ? (
                            <span className="mail-muted">envío anterior</span>
                          ) : (
                            "—"
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="mail-empty">
                        Sin registros todavía. Envía un reporte o importa uno y verás la bitácora aquí.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
