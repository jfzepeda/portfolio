"use client";
import { useEffect, useMemo, useState } from "react";
import { useAuditoria } from "../state/AuditoriaContext";
import { TABS } from "../lib/constants";
import SectionTitle from "../components/SectionTitle";
import SummaryCard from "../components/SummaryCard";
import Accordion from "../components/Accordion";
import BonoTable from "../components/BonoTable";

import { fp } from "../lib/utils/format";
import { buildCruce } from "../lib/calc/compras";
import {
  calcularObjetivos,
  LS_HISTORIAL,
  readHistorial,
  readObjetivos,
} from "../lib/calc/objetivos";
import { fetchSessions } from "../lib/api";
import ConversionPanel from "../modules/ConversionPanel";
import MargenesPanel from "../modules/MargenesPanel";
import MoPanel from "../modules/MoPanel";
import ComprasPanel from "../modules/ComprasPanel";
import ProductividadPanel from "../modules/ProductividadPanel";
import AdministrativasPanel from "../modules/AdministrativasPanel";
import LlantasPanel from "../modules/LlantasPanel";
import BitacoraPanel from "../modules/BitacoraPanel";
import CortePanel from "../modules/CortePanel";
import OvPanel from "../modules/OvPanel";

const PANEL_BY_ID = {
  conv: ConversionPanel,
  marg: MargenesPanel,
  mo: MoPanel,
  comp: ComprasPanel,
  prod: ProductividadPanel,
  admin: AdministrativasPanel,
  ll: LlantasPanel,
  bit: BitacoraPanel,
  corte: CortePanel,
  ov: OvPanel,
};

const POSIBLE_MO = new Set(["posibleConvenio", "posibleClub", "posibleAmbos"]);

function margenRealLL(v) {
  const costoU = v.ultCosto || (v.uds > 0 ? v.costo / v.uds : 0);
  if (!(v.ventaCobradaU > 0) || !(costoU > 0)) return null;
  return ((v.ventaCobradaU - costoU) / v.ventaCobradaU) * 100;
}

export default function DashboardView() {
  const { activeTab, setActiveTab, resultado, conveniosAdminLL, sucursal } = useAuditoria();
  const ActivePanel = PANEL_BY_ID[activeTab] || ConversionPanel;
  const [objetivosCfg, setObjetivosCfg] = useState(null);
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    setObjetivosCfg(readObjetivos());
    setHistorial(readHistorial());
  }, []);

  useEffect(() => {
    const now = new Date();
    fetchSessions(sucursal, now.getMonth() + 1, now.getFullYear())
      .then((rows) => {
        setHistorial(rows);
        try { window.localStorage.setItem(LS_HISTORIAL, JSON.stringify(rows)); } catch (_) {}
      })
      .catch(() => {
        setHistorial(readHistorial());
      });
  }, [sucursal]);

  const sumbar = useMemo(() => {
    const ventas = resultado?.ventas ?? [];
    const cobranzas = resultado?.cobranzas ?? [];
    const cargosCP = resultado?.cargosCP ?? [];

    const totalVenta = ventas.reduce((s, v) => s + (v.venta || 0), 0);
    const totalCosto = ventas.reduce((s, v) => s + (v.costo || 0), 0);
    const totalUtilidad = ventas.reduce((s, v) => s + (v.utilidad || 0), 0);
    const margenPct = totalVenta > 0 ? (totalUtilidad / totalVenta) * 100 : null;

    const llantas = ventas.filter((v) => v.esLL).reduce((s, v) => s + (v.uds || 0), 0);
    const servicios = ventas
      .filter((v) => v.cuentaConv)
      .reduce((s, v) => s + (v.uds || 0), 0);

    const totalCobros = cobranzas.reduce((s, c) => s + (c.total || 0), 0);
    const totalCargos = cargosCP.reduce((s, c) => s + (c.total || c.importe || 0), 0);

    const { sinVenta, bannerCount } = buildCruce({
      ventas,
      comprasIntegradas: resultado?.comprasIntegradas ?? [],
      ovPendientes: resultado?.ovPendientes ?? [],
    });
    const alertasComp = bannerCount + sinVenta.length;

    const alertasMarg = ventas.filter((v) => v.alerta).length;
    const alertasMOReales = ventas.filter(
      (v) => v.moAlerta && !POSIBLE_MO.has(v.moAlerta),
    ).length;
    const posiblesMO = ventas.filter(
      (v) => v.moAlerta && POSIBLE_MO.has(v.moAlerta),
    ).length;
    const totalMO = alertasMOReales + posiblesMO;

    const llPendConv = ventas.filter((v) => {
      if (!v.esLL) return false;
      const mg = margenRealLL(v);
      if (mg == null) return false;
      const esPosibleConv =
        !v.esConvenioDoc && mg < 24 && (v.dscto || 0) > 0;
      if (!esPosibleConv) return false;
      const k = (v.folio || "") + "|" + (v.desc || "");
      const yaMarcado = conveniosAdminLL.some(
        (c) => c.tipo === "LL" && c.folio + "|" + c.desc === k,
      );
      return !yaMarcado;
    }).length;

    const sinTecnico = ventas.filter((v) => v.sinTecnico).length;
    const totalAdmin = sinTecnico + conveniosAdminLL.length;

    const bitacora = resultado?.bitacora;
    const bitRows = Array.isArray(bitacora?.rows) ? bitacora.rows.length : 0;

    return {
      totalVenta,
      totalCosto,
      totalUtilidad,
      margenPct,
      totalCobros,
      nCobros: cobranzas.length,
      totalCargos,
      nCargos: cargosCP.length,
      llantas,
      servicios,
      alertasMarg,
      alertasComp,
      compBanner: bannerCount,
      compSinVenta: sinVenta.length,
      alertasMOReales,
      posiblesMO,
      totalMO,
      llPendConv,
      totalAdmin,
      sinTecnico,
      bitCargada: !!bitacora,
      bitRows,
    };
  }, [resultado, conveniosAdminLL]);

  const objetivos = useMemo(
    () =>
      calcularObjetivos({
        objetivos: objetivosCfg,
        ventas: resultado?.ventas ?? [],
        historial,
        sucursal,
      }),
    [objetivosCfg, resultado, historial, sucursal],
  );

  const go = (tab) => () => setActiveTab(tab);

  return (
    <div className="dash">
      <SectionTitle>Resumen del día</SectionTitle>
      <div className="sumbar">
        <SummaryCard
          tone="accent"
          value={fp(sumbar.totalVenta)}
          label="Venta total"
          sub={`Costo ${fp(sumbar.totalCosto)}`}
        />
        <SummaryCard
          tone="accent"
          value={sumbar.nCobros ? fp(sumbar.totalCobros) : "—"}
          label="Cobros del día"
          sub={
            sumbar.nCobros
              ? `${sumbar.nCobros} cobro${sumbar.nCobros !== 1 ? "s" : ""}`
              : "Sin cobros"
          }
          onClick={go("corte")}
        />
        <SummaryCard
          tone="accent"
          value={sumbar.nCargos ? fp(sumbar.totalCargos) : "—"}
          label="Cargos CP"
          sub={
            sumbar.nCargos
              ? `${sumbar.nCargos} cargo${sumbar.nCargos !== 1 ? "s" : ""}`
              : "Sin cargos"
          }
          onClick={go("corte")}
        />
        <SummaryCard
          tone={
            sumbar.margenPct == null
              ? "accent"
              : sumbar.margenPct >= 29
              ? "ok"
              : sumbar.margenPct >= 25
              ? "accent"
              : "critical"
          }
          value={sumbar.margenPct != null ? sumbar.margenPct.toFixed(1) + "%" : "—"}
          label="Margen global"
          sub={`Utilidad ${fp(sumbar.totalUtilidad)}`}
        />
        <SummaryCard
          tone="accent"
          value={String(sumbar.llantas)}
          label="Llantas vendidas"
        />
        <SummaryCard
          tone="accent"
          value={String(sumbar.servicios)}
          label="Servicios totales"
        />
        <SummaryCard
          tone={sumbar.alertasMarg > 0 ? "critical" : "ok"}
          value={sumbar.alertasMarg > 0 ? String(sumbar.alertasMarg) : "✓"}
          label={sumbar.alertasMarg > 0 ? "Alertas margen" : "Márgenes OK"}
          sub="Subventa detectada"
          onClick={go("marg")}
        />
        <SummaryCard
          tone={sumbar.totalMO > 0 ? "critical" : "ok"}
          value={sumbar.totalMO > 0 ? String(sumbar.totalMO) : "✓"}
          label={sumbar.totalMO > 0 ? "Alertas MO" : "MO OK"}
          sub={
            sumbar.totalMO > 0
              ? `${sumbar.alertasMOReales} real${sumbar.alertasMOReales !== 1 ? "es" : ""} · ${sumbar.posiblesMO} por confirmar`
              : "Sin incidencias"
          }
          onClick={go("mo")}
        />
        <SummaryCard
          tone={sumbar.alertasComp > 0 ? "critical" : "ok"}
          value={sumbar.alertasComp > 0 ? String(sumbar.alertasComp) : "✓"}
          label={sumbar.alertasComp > 0 ? "Alertas compras" : "Compras OK"}
          sub={
            sumbar.alertasComp > 0
              ? `${sumbar.compBanner} cruce · ${sumbar.compSinVenta} sin venta`
              : "Compras cuadradas"
          }
          onClick={go("comp")}
        />
        <SummaryCard
          tone={sumbar.totalAdmin > 0 ? "critical" : "ok"}
          value={sumbar.totalAdmin > 0 ? String(sumbar.totalAdmin) : "✓"}
          label={sumbar.totalAdmin > 0 ? "Administrativas" : "Admin OK"}
          sub={
            sumbar.totalAdmin > 0
              ? `${sumbar.sinTecnico} sin técnico · ${conveniosAdminLL.length} convenio${conveniosAdminLL.length !== 1 ? "s" : ""}`
              : "Sin incidencias"
          }
          onClick={go("admin")}
        />
        <SummaryCard
          tone={sumbar.llPendConv > 0 ? "critical" : "ok"}
          value={sumbar.llPendConv > 0 ? String(sumbar.llPendConv) : "✓"}
          label={sumbar.llPendConv > 0 ? "Llantas · convenio?" : "Llantas OK"}
          sub={`${sumbar.llantas} pieza${sumbar.llantas !== 1 ? "s" : ""}`}
          onClick={go("ll")}
        />
        <SummaryCard
          tone={sumbar.bitRows > 0 ? "warn" : "ok"}
          value={
            !sumbar.bitCargada
              ? "—"
              : sumbar.bitRows > 0
              ? String(sumbar.bitRows)
              : "✓"
          }
          label="Bitácora"
          sub={
            !sumbar.bitCargada
              ? "No importada"
              : sumbar.bitRows > 0
              ? `${sumbar.bitRows} evento${sumbar.bitRows !== 1 ? "s" : ""}`
              : "Sin incidencias"
          }
          onClick={go("bit")}
        />
      </div>

      <Accordion
        variant="obj"
        title="Objetivos mensuales · Bono 1 y Bono 2"
        meta={objetivos.resumen}
      >
        <BonoTable rows={objetivos.rows} />
      </Accordion>

      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tbtn ${activeTab === t.id ? "active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
            {resultado?.counts?.[t.id] != null ? (
              <span className="tcnt">{resultado.counts[t.id]}</span>
            ) : null}
          </button>
        ))}
      </div>

      <ActivePanel />
    </div>
  );
}
