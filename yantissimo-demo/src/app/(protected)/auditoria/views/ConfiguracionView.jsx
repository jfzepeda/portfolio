"use client";
import Accordion from "../components/Accordion";
import SectionTitle from "../components/SectionTitle";
import { useAuditoria } from "../state/AuditoriaContext";

/**
 * Acordeones de configuración (catálogos, objetivos, descuentos).
 * Puerto pendiente de las secciones del HTML líneas 598–910:
 *   - Lista de precios MO, Promociones llantas, Apoyos RIN,
 *     Clientes especiales, Personal extra, Club Yantissimo,
 *     Descuentos por línea, Objetivos mensuales.
 * Cada acordeón debe cargar su catálogo con state/persistence.js.
 */
export default function ConfiguracionView() {
  const { setView } = useAuditoria();

  return (
    <div
      style={{
        padding: "24px 24px 60px",
        maxWidth: 620,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          background: "rgba(var(--accent-rgb),.1)",
          border: "1px solid rgba(var(--accent-rgb),.3)",
          borderRadius: 8,
          padding: "10px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <span style={{ fontSize: 12, color: "var(--text)" }}>
          ⚠️ Revisando la configuración
        </span>
        <button
          className="hbtn"
          onClick={() => setView("upload")}
          style={{ background: "var(--accent)", color: "#fff", border: "none" }}
        >
          ← Volver
        </button>
      </div>

      <SectionTitle>Catálogos · Objetivos · Descuentos</SectionTitle>

      <Accordion title="Lista de precios MO">
        <div className="aud-empty">Pendiente: portar carga de lista MO.</div>
      </Accordion>
      <Accordion title="Configuración de llantas (NC, Michelin, descuentos)">
        <div className="aud-empty">Pendiente.</div>
      </Accordion>
      <Accordion title="Promociones de llantas">
        <div className="aud-empty">Pendiente.</div>
      </Accordion>
      <Accordion title="Apoyos por RIN">
        <div className="aud-empty">Pendiente.</div>
      </Accordion>
      <Accordion title="Clientes especiales (50% MO)">
        <div className="aud-empty">Pendiente.</div>
      </Accordion>
      <Accordion title="Personal extra por sucursal">
        <div className="aud-empty">Pendiente.</div>
      </Accordion>
      <Accordion title="Club Yantissimo">
        <div className="aud-empty">Pendiente.</div>
      </Accordion>
      <Accordion title="Descuentos por línea">
        <div className="aud-empty">Pendiente.</div>
      </Accordion>
    </div>
  );
}
