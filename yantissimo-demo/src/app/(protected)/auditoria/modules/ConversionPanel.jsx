"use client";
import { useMemo, useState } from "react";
import { useAuditoria } from "../state/AuditoriaContext";
import SectionTitle from "../components/SectionTitle";
import ConversionCard from "../components/ConversionCard";
import Accordion from "../components/Accordion";
import DataTable from "../components/DataTable";
import FilterBar from "../components/FilterBar";
import { calcularConversion } from "../lib/calc/conversion";
import { fp } from "../lib/utils/format";

export default function ConversionPanel() {
  const { resultado } = useAuditoria();
  const [clientes, setClientes] = useState(() => resultado?.numClientes ?? 0);
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroLinea, setFiltroLinea] = useState("");
  const [query, setQuery] = useState("");

  const ventas = useMemo(() => resultado?.ventas ?? [], [resultado]);
  const { cards, resumen } = useMemo(
    () => calcularConversion(ventas, clientes),
    [ventas, clientes],
  );

  const lineasUnicas = useMemo(
    () => Array.from(new Set(ventas.map((v) => v.lin))).filter(Boolean).sort(),
    [ventas],
  );

  const ventasFiltradas = useMemo(() => {
    const q = query.trim().toUpperCase();
    return ventas.filter((v) => {
      if (filtroTipo && v.uMed !== filtroTipo) return false;
      if (filtroLinea && v.lin !== filtroLinea) return false;
      if (q && !(v.desc || "").toUpperCase().includes(q)) return false;
      return true;
    });
  }, [ventas, filtroTipo, filtroLinea, query]);

  const columns = [
    { key: "fecha", header: "Fecha" },
    {
      key: "folio",
      header: "Folio / Cliente",
      render: (r) => (
        <div>
          <div style={{ fontFamily: "var(--mono)", fontSize: 11 }}>{r.folio}</div>
          <div style={{ fontSize: 10, color: "var(--t3)" }}>{r.cliente}</div>
        </div>
      ),
    },
    { key: "vendedor", header: "Vendedor" },
    {
      key: "articulo",
      header: "Artículo",
      render: (r) => (
        <div>
          <div>{r.desc}</div>
          <div style={{ fontSize: 10, color: "var(--t3)" }}>{r.clave}</div>
        </div>
      ),
    },
    { key: "linea_raw", header: "Línea" },
    { key: "uMed", header: "Tipo" },
    { key: "uds", header: "Uds", align: "right" },
    {
      key: "ventaCobradaU",
      header: "Venta unit.",
      align: "right",
      render: (r) => fp(r.ventaCobradaU),
    },
    { key: "venta", header: "Venta total", align: "right", render: (r) => fp(r.venta) },
    { key: "costo", header: "Costo", align: "right", render: (r) => fp(r.costo) },
    { key: "utilidad", header: "Utilidad", align: "right", render: (r) => fp(r.utilidad) },
    {
      key: "margen",
      header: "Margen %",
      align: "right",
      render: (r) => (r.margen != null ? r.margen.toFixed(1) + "%" : "—"),
    },
    {
      key: "dscto",
      header: "Dto %",
      align: "right",
      render: (r) => (r.dscto ? r.dscto.toFixed(1) + "%" : "—"),
    },
    { key: "tecnico", header: "Técnico" },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        <label style={{ fontSize: 11, color: "var(--t2)" }}>
          Clientes atendidos:
        </label>
        <input
          className="aud-input"
          type="number"
          min={0}
          value={clientes}
          onChange={(e) => setClientes(Number(e.target.value) || 0)}
          style={{ width: 70, fontFamily: "var(--mono)" }}
        />
        <span style={{ fontSize: 10, color: "var(--t3)", fontFamily: "var(--mono)" }}>
          {resumen}
        </span>
      </div>

      <SectionTitle>Resultado de conversión por línea</SectionTitle>
      <div className="conv-grid">
        {cards.map((c, i) => (
          <ConversionCard key={i} {...c} />
        ))}
      </div>

      <Accordion
        title="Detalle de ventas del día"
        meta={ventas.length ? `${ventas.length} filas` : null}
      >
        <FilterBar>
          <label>Tipo:</label>
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="SERVICIO">Servicio</option>
            <option value="PIEZA">Pieza</option>
          </select>
          <label>Línea:</label>
          <select
            value={filtroLinea}
            onChange={(e) => setFiltroLinea(e.target.value)}
          >
            <option value="">Todas</option>
            {lineasUnicas.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Buscar artículo..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: 160 }}
          />
        </FilterBar>
        <DataTable
          columns={columns}
          rows={ventasFiltradas}
          emptyMessage="Sin ventas"
        />
      </Accordion>
    </div>
  );
}
