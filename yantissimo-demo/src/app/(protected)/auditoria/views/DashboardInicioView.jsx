"use client";
import { useEffect, useState, useMemo } from "react";
import { useAuditoria } from "../state/AuditoriaContext";
import { SUCURSALES } from "../lib/constants";
import { fetchSessions } from "../lib/api";

const LS_HIST = "tec_hist_v1";
const LS_OBJ = "tec_obj_v1";

const OBJ_DEFAULT = {
  dias: 26,
  diaAct: 1,
  lineas: [
    { k: "venta", l: "Venta total", b1: 1000000, b2: 1300000, isVenta: true },
    { k: "ll", l: "Llantas", b1: 490, b2: 490 },
    { k: "alin", l: "Alineación", b1: 100, b2: 130 },
    { k: "fren", l: "Frenos", b1: 70, b2: 90 },
    { k: "susp", l: "Suspensión", b1: 100, b2: 130 },
    { k: "amort", l: "Amortiguadores", b1: 24, b2: 30 },
    { k: "paq", l: "Paquetes", b1: 24, b2: 30 },
    { k: "club", l: "Club Yantissimo", b1: 80, b2: 100 },
    { k: "afin", l: "Afinación", b1: 16, b2: 20 },
    { k: "purga", l: "Purgado", b1: 12, b2: 20 },
  ],
};

const OX10 = {
  ALINEACION: 5,
  FRENOS: 2,
  SUSPENSION: 5,
  AFINACION: 2,
  PAQUETES: 1.5,
  AMORTIGUADORES: 2,
  "CLUB YANTISSIMO": 4,
};

const MAP_CONV = {
  alin: { key: "ALINEACION", lbl: "Alineación" },
  fren: { key: "FRENOS", lbl: "Frenos" },
  susp: { key: "SUSPENSION", lbl: "Suspensión" },
  afin: { key: "AFINACION", lbl: "Afinación" },
  paq: { key: "PAQUETES", lbl: "Paquetes" },
  amort: { key: "AMORTIGUADORES", lbl: "Amortig." },
  club: { key: "CLUB YANTISSIMO", lbl: "Club Y." },
};

const MAP_VEND = {
  alin: { lbl: "Alin.", lineaK: "ALINEACION" },
  fren: { lbl: "Fren.", lineaK: "FRENOS" },
  susp: { lbl: "Susp.", lineaK: "SUSPENSION" },
  amort: { lbl: "Amort.", lineaK: "AMORTIGUADORES" },
  ll: { lbl: "Llantas", lineaK: "LLANTAS" },
};

function fmtMoney(n) {
  return "$" + new Intl.NumberFormat("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Math.round(n));
}
function fmtNum(n, d = 0) {
  return new Intl.NumberFormat("es-MX", { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
}
function fmtCompact(v) {
  return "$" + new Intl.NumberFormat("es-MX", { notation: v >= 10000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(Math.round(v));
}

function semColor(acum, b1, b2) {
  if (acum >= b2) return "#5d7c4c";
  if (acum >= b1) return "#c49b1d";
  return "#cb4532";
}
function semColorEnd(acum, b1, b2) {
  if (acum >= b2) return "#7ba36a";
  if (acum >= b1) return "#e0b944";
  return "#e56750";
}
function semSoft(acum, b1, b2) {
  if (acum >= b2) return "rgba(93,124,76,.12)";
  if (acum >= b1) return "rgba(196,155,29,.12)";
  return "rgba(203,69,50,.12)";
}

function KpiCard({ label, value, sub, color }) {
  return (
    <div style={{ background: "var(--s1)", border: "1px solid var(--b1)", borderRadius: 10, padding: "12px 14px" }}>
      <div style={{ fontSize: 9.5, color: "var(--t3)", textTransform: "uppercase", letterSpacing: ".06em", fontWeight: 600, marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 600, color: color || "var(--text)", lineHeight: 1.1, fontFamily: "var(--serif,Georgia),serif", letterSpacing: "-.01em" }}>{value}</div>
      <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function ConvCard({ lbl, ox10Key, uds, totClientes }) {
  const obj = OX10[ox10Key] || 0;
  const x10 = totClientes > 0 ? (uds / totClientes) * 10 : null;
  const pct = x10 !== null && obj > 0 ? x10 / obj : null;
  let color, estado;
  if (pct === null) { color = "var(--t3)"; estado = "SIN DATOS"; }
  else if (pct >= 1.0) { color = "#5d7c4c"; estado = "objetivo"; }
  else if (pct >= 0.7) { color = "#a37a10"; estado = Math.round(pct * 100) + "%"; }
  else { color = "#cb4532"; estado = Math.round(pct * 100) + "%"; }
  const fill = pct !== null ? Math.min(pct * 100, 110) : 0;
  const x10Fmt = x10 !== null ? x10.toFixed(2) : "—";

  return (
    <div style={{ background: "var(--s2)", border: "1px solid var(--b1)", borderRadius: 8, padding: "10px 12px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: "var(--text)", fontWeight: 600 }}>{lbl}</span>
        <span style={{ fontSize: 9.5, color, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em" }}>{estado}</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
        <span style={{ fontSize: 18, fontWeight: 600, color, fontFamily: "var(--serif,Georgia),serif", letterSpacing: "-.01em", lineHeight: 1 }}>{x10Fmt}</span>
        <span style={{ fontSize: 9, color: "var(--t3)", textTransform: "uppercase", letterSpacing: ".04em" }}>/10 cli</span>
      </div>
      <div style={{ height: 4, background: "var(--b1)", borderRadius: 2, overflow: "hidden", marginBottom: 3 }}>
        <div style={{ height: "100%", width: fill + "%", background: color, transition: "width .4s" }} />
      </div>
      <div style={{ fontSize: 9, color: "var(--t3)", fontFamily: "var(--mono)" }}>
        Obj: {obj}/10 · {Math.round(uds)} uds
      </div>
    </div>
  );
}

function ProgresoLinea({ l, acum }) {
  const b1 = l.b1 || 0, b2 = l.b2 || 0;
  const meta = b2 || b1 || 1;
  const pct1 = b1 > 0 ? (acum / b1) * 100 : 0;
  const pctFill = meta > 0 ? Math.min((acum / meta) * 100, 100) : 0;
  const posB1 = b2 > 0 && b1 > 0 ? Math.min((b1 / b2) * 100, 100) : 0;
  const cBar = semColor(acum, b1, b2);
  const cEnd = semColorEnd(acum, b1, b2);
  const cSoft = semSoft(acum, b1, b2);
  let estadoIcon, estadoTxt;
  if (acum >= b2) { estadoIcon = "✓"; estadoTxt = "Bono 2"; }
  else if (acum >= b1) { estadoIcon = "✓"; estadoTxt = "Bono 1"; }
  else { estadoIcon = ""; estadoTxt = Math.round(pct1) + "%"; }
  const fmtVal = (v) => l.isVenta ? fmtCompact(v) : fmtNum(Math.round(v));

  return (
    <div style={{ padding: "10px 0", borderBottom: "1px solid var(--b1)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, gap: 8 }}>
        <span style={{ fontSize: 11.5, color: "var(--text)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.l}</span>
        <span style={{ fontSize: 9.5, color: cBar, background: cSoft, padding: "2px 8px", borderRadius: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", whiteSpace: "nowrap", flexShrink: 0 }}>
          {estadoIcon} {estadoTxt}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 5, gap: 6 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4, minWidth: 0 }}>
          <span style={{ fontFamily: "var(--serif,Georgia),serif", fontSize: 17, fontWeight: 600, color: cBar, letterSpacing: "-.01em", lineHeight: 1 }}>{fmtVal(acum)}</span>
          <span style={{ fontSize: 10, color: "var(--t3)", fontFamily: "var(--mono)" }}>/ {fmtVal(b2)}</span>
        </div>
        <span style={{ fontSize: 9, color: "var(--t3)", fontFamily: "var(--mono)", whiteSpace: "nowrap" }}>B1 {fmtVal(b1)}</span>
      </div>
      <div style={{ position: "relative", height: 7, background: "var(--b1)", borderRadius: 4, overflow: "visible" }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 4, overflow: "hidden" }}>
          <div style={{ height: "100%", width: pctFill + "%", background: `linear-gradient(90deg,${cBar},${cEnd})`, boxShadow: `0 0 6px ${cSoft}`, transition: "width .5s" }} />
        </div>
        {b1 > 0 && b1 < b2 && (
          <div style={{ position: "absolute", top: -2, bottom: -2, left: posB1 + "%", width: 2, background: "var(--s1)", borderLeft: "1px dashed var(--t3)", opacity: .75 }} />
        )}
      </div>
    </div>
  );
}

function MiniBars({ lineas, mapKeys, objByK, count }) {
  const bars = [];
  Object.keys(mapKeys).forEach((k) => {
    const cfg = mapKeys[k];
    const obj = objByK[k];
    if (!obj || !obj.b1) return;
    const metaInd = count > 0 ? obj.b1 / count : 0;
    const lineaData = lineas?.[cfg.lineaK];
    const udsLinea = lineaData?.uds || 0;
    if (udsLinea === 0 && metaInd === 0) return;
    const pct = metaInd > 0 ? Math.min((udsLinea / metaInd) * 100, 110) : 0;
    const barColor = pct >= 100 ? "#5d7c4c" : pct >= 70 ? "#a37a10" : "#cb4532";
    bars.push(
      <div key={k} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 9.5, color: "var(--t3)", marginTop: 3 }}>
        <span style={{ minWidth: 42, color: "var(--t2)", fontWeight: 600 }}>{cfg.lbl}</span>
        <span style={{ minWidth: 46, color: "var(--text)", fontFamily: "var(--mono)", fontWeight: 600 }}>
          {Math.round(udsLinea)}<span style={{ color: "var(--t3)", fontWeight: 400 }}> / {Math.round(metaInd)}</span>
        </span>
        <div style={{ flex: 1, height: 3, background: "var(--b1)", borderRadius: 2, overflow: "hidden", minWidth: 40 }}>
          <div style={{ height: "100%", width: pct + "%", background: barColor, transition: "width .3s" }} />
        </div>
      </div>
    );
  });
  return bars.length > 0 ? <div style={{ marginTop: 6, paddingLeft: 32 }}>{bars}</div> : null;
}

function RankVend({ v, pos, tipo, vendCount, objByK }) {
  const firmeN = Math.round(v.alertas.firme || 0);
  const pendN = Math.round(v.alertas.pendAdmin || 0);
  const color = tipo === "dest" ? "#5d7c4c" : "#cb4532";
  const bgColor = tipo === "dest" ? "rgba(93,124,76,.15)" : "rgba(203,69,50,.15)";
  return (
    <div style={{ padding: "10px 0", borderTop: "1px solid var(--b1)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 22, height: 22, background: bgColor, color, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 10, flexShrink: 0 }}>{pos}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11.5, color: "var(--text)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {v.nombre}
            {firmeN > 0 && <span style={{ background: "rgba(203,69,50,.1)", color: "#cb4532", padding: "1px 6px", borderRadius: 4, fontSize: 9, fontWeight: 700, marginLeft: 6 }}>{firmeN} firme{firmeN !== 1 ? "s" : ""}</span>}
            {pendN > 0 && <span style={{ background: "rgba(163,122,16,.1)", color: "#a37a10", padding: "1px 6px", borderRadius: 4, fontSize: 9, fontWeight: 700, marginLeft: 6 }}>{pendN} pend</span>}
          </div>
          <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 1 }}>
            {fmtNum(Math.round(v.totUds))} uds · {fmtNum(Math.round(v.clientes))} clientes · {v.diasActivo}d
          </div>
        </div>
      </div>
      <MiniBars lineas={v.lineas} mapKeys={MAP_VEND} objByK={objByK} count={vendCount} />
    </div>
  );
}

function RankTec({ t, pos, tipo, tecCount, objByK }) {
  const color = tipo === "dest" ? "#5d7c4c" : "#a37a10";
  const bgColor = tipo === "dest" ? "rgba(93,124,76,.15)" : "rgba(163,122,16,.15)";
  return (
    <div style={{ padding: "10px 0", borderTop: "1px solid var(--b1)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 22, height: 22, background: bgColor, color, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 10, flexShrink: 0 }}>{pos}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11.5, color: "var(--text)", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.nombre}</div>
          <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 1 }}>{fmtNum(Math.round(t.totUds))} uds · {t.diasActivo}d activo</div>
        </div>
      </div>
      <MiniBars lineas={t.lineas} mapKeys={MAP_VEND} objByK={objByK} count={tecCount} />
    </div>
  );
}

function loadHistorial() {
  try { return JSON.parse(localStorage.getItem(LS_HIST) || "[]"); } catch { return []; }
}
function loadObjetivos() {
  try {
    const s = JSON.parse(localStorage.getItem(LS_OBJ) || "null");
    return s || OBJ_DEFAULT;
  } catch { return OBJ_DEFAULT; }
}

export default function DashboardInicioView() {
  const { sucursal, setSucursal, togglePanel } = useAuditoria();
  const [historial, setHistorial] = useState([]);
  const [obj, setObj] = useState(OBJ_DEFAULT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setObj(loadObjetivos());
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchSessions(sucursal, now.getMonth() + 1, now.getFullYear())
      .then((rows) => {
        setHistorial(rows);
        // keep localStorage in sync as offline fallback
        try { localStorage.setItem(LS_HIST, JSON.stringify(rows)); } catch (_) {}
      })
      .catch(() => {
        // fall back to localStorage when offline / backend unavailable
        setHistorial(loadHistorial());
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sucursal]);

  const now = new Date();
  const mesIndex = now.getMonth();
  const mesAct = mesIndex + 1;
  const anioAct = now.getFullYear();
  const MES_NOMBRES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

  const recsDelMes = useMemo(() =>
    historial
      .filter((h) => Number(h.mes) === mesAct && Number(h.anio) === anioAct)
      .filter((h) => !sucursal || !h.sucursal || h.sucursal === sucursal)
      .sort((a, b) => Number(a.dia) - Number(b.dia)),
    [historial, sucursal, mesAct, anioAct]
  );

  const agg = useMemo(() => {
    let totVenta = 0, totLlantas = 0, totServicios = 0, totClientes = 0;
    let totAlertasMarg = 0, totAlertasComp = 0, totAlertasBit = 0;
    const acumLineas = {};
    const vendAcum = {};
    const tecAcum = {};
    const vendAlertas = {};

    recsDelMes.forEach((r) => {
      totVenta     += r.venta || 0;
      totLlantas   += r.llantas || 0;
      totServicios += r.servicios || 0;
      totClientes  += r.clientes || 0;
      totAlertasMarg += r.alertasMarg || 0;
      totAlertasComp += r.alertasComp || 0;
      totAlertasBit  += r.alertasBit || 0;

      if (r.lineas) {
        Object.entries(r.lineas).forEach(([k, v]) => {
          acumLineas[k] = (acumLineas[k] || 0) + (v || 0);
        });
      }

      if (r.prod && Array.isArray(r.prod.vendedores)) {
        r.prod.vendedores.forEach((v) => {
          if (!v.nombre) return;
          if (!vendAcum[v.nombre]) vendAcum[v.nombre] = { lineas: {}, clientes: 0, diasActivo: 0 };
          vendAcum[v.nombre].clientes += v.clientes || 0;
          vendAcum[v.nombre].diasActivo += 1;
          Object.entries(v.lineas || {}).forEach(([lk, arr]) => {
            if (typeof arr === "object" && arr !== null) {
              if (!vendAcum[v.nombre].lineas[lk]) vendAcum[v.nombre].lineas[lk] = { uds: 0, venta: 0, utilidad: 0 };
              vendAcum[v.nombre].lineas[lk].uds      += arr.uds || 0;
              vendAcum[v.nombre].lineas[lk].venta    += arr.venta || 0;
              vendAcum[v.nombre].lineas[lk].utilidad += arr.utilidad || 0;
            } else if (typeof arr === "number") {
              if (!vendAcum[v.nombre].lineas[lk]) vendAcum[v.nombre].lineas[lk] = { uds: 0 };
              vendAcum[v.nombre].lineas[lk].uds += arr;
            }
          });
        });
      }

      if (r.prod && Array.isArray(r.prod.tecnicos)) {
        r.prod.tecnicos.forEach((t) => {
          if (!t.nombre) return;
          if (!tecAcum[t.nombre]) tecAcum[t.nombre] = { lineas: {}, diasActivo: 0 };
          tecAcum[t.nombre].diasActivo += 1;
          Object.entries(t.lineas || {}).forEach(([lk, arr]) => {
            if (!tecAcum[t.nombre].lineas[lk]) tecAcum[t.nombre].lineas[lk] = { uds: 0 };
            tecAcum[t.nombre].lineas[lk].uds += (typeof arr === "object" ? arr?.uds : arr) || 0;
          });
        });
      }

      if (r.resumenVend) {
        Object.entries(r.resumenVend).forEach(([nombre, d]) => {
          if (!vendAlertas[nombre]) vendAlertas[nombre] = { firme: 0, pendAdmin: 0, validado: 0, cantIncidencias: 0 };
          vendAlertas[nombre].firme           += d.firme || 0;
          vendAlertas[nombre].pendAdmin       += d.pendAdmin || 0;
          vendAlertas[nombre].validado        += d.validado || 0;
          vendAlertas[nombre].cantIncidencias += d.cantIncidencias || 0;
        });
      }
    });

    const margenProm = recsDelMes.length
      ? recsDelMes.reduce((s, r) => s + (r.margen || 0), 0) / recsDelMes.length
      : 0;
    const totAlertas = totAlertasMarg + totAlertasComp + totAlertasBit;

    const sumUdsVend = (v) => Object.values(v.lineas || {}).reduce((s, x) => s + (x.uds || 0), 0);
    const sumUdsTec  = (t) => Object.values(t.lineas || {}).reduce((s, x) => s + (x.uds || 0), 0);

    const vendList = Object.entries(vendAcum).map(([n, d]) => ({
      nombre: n, ...d,
      totUds: sumUdsVend(d),
      totUtilidad: Object.values(d.lineas || {}).reduce((s, x) => s + (x.utilidad || 0), 0),
      totVenta: Object.values(d.lineas || {}).reduce((s, x) => s + (x.venta || 0), 0),
      alertas: vendAlertas[n] || { firme: 0, pendAdmin: 0, cantIncidencias: 0 },
    }));

    const topVendDest = [...vendList]
      .filter((v) => (v.alertas.firme + v.alertas.pendAdmin) === 0)
      .sort((a, b) => b.totUds - a.totUds)
      .slice(0, 3);
    const topVendAl = [...vendList]
      .filter((v) => v.alertas.firme + v.alertas.pendAdmin > 0)
      .sort((a, b) => (b.alertas.firme + b.alertas.pendAdmin) - (a.alertas.firme + a.alertas.pendAdmin) || b.alertas.cantIncidencias - a.alertas.cantIncidencias)
      .slice(0, 3);

    const tecList = Object.entries(tecAcum).map(([n, d]) => ({ nombre: n, ...d, totUds: sumUdsTec(d) }));
    const topTecDest  = [...tecList].sort((a, b) => b.totUds - a.totUds).slice(0, 3);
    const topTecBajos = [...tecList].filter((t) => t.totUds > 0).sort((a, b) => a.totUds - b.totUds).slice(0, 3);

    return {
      totVenta, totLlantas, totServicios, totClientes,
      totAlertas, margenProm,
      acumLineas,
      topVendDest, topVendAl, vendList,
      topTecDest, topTecBajos, tecList,
    };
  }, [recsDelMes]);

  const hayDatos = !loading && recsDelMes.length > 0;
  const diasAuditados = recsDelMes.length;
  const mesLbl = MES_NOMBRES[mesIndex] + " " + anioAct;

  const objByK = useMemo(() => {
    const m = {};
    (obj.lineas || []).forEach((o) => { m[o.k] = o; });
    return m;
  }, [obj]);

  return (
    <div style={{ maxWidth: 1200, margin: "20px auto", padding: "0 20px", fontFamily: "var(--sans)" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20, paddingBottom: 14, borderBottom: "1px solid var(--b1)", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: 22, color: "var(--text)", fontFamily: "var(--serif,Georgia),serif", fontWeight: 500, letterSpacing: "-.01em" }}>Resumen del mes</h1>
          <div style={{ fontSize: 12, color: "var(--t3)", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span>{mesLbl}</span>
            <span style={{ color: "var(--b2)" }}>·</span>
            <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <label style={{ fontSize: 11, color: "var(--t2)" }}>🏢 Sucursal:</label>
              <select
                value={sucursal}
                onChange={(e) => setSucursal(e.target.value)}
                style={{ background: "var(--s2)", border: "1px solid var(--b1)", borderRadius: 4, padding: "2px 6px", color: "var(--text)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
              >
                {SUCURSALES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </span>
            <span style={{ color: "var(--b2)" }}>·</span>
            <span>{diasAuditados} día{diasAuditados !== 1 ? "s" : ""} auditado{diasAuditados !== 1 ? "s" : ""}</span>
          </div>
        </div>
        <button
          onClick={() => togglePanel("import", true)}
          style={{ background: "var(--accent)", color: "#fff", border: "none", padding: "9px 18px", borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
        >
          📤 Importar reportes de hoy
        </button>
      </div>

      {/* Banner sin datos */}
      {!hayDatos && (
        <div style={{ background: "linear-gradient(135deg,rgba(var(--accent-rgb),.08),rgba(var(--accent-rgb),.02))", border: "1px dashed rgba(var(--accent-rgb),.35)", borderRadius: 10, padding: "18px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 32 }}>📄</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)", marginBottom: 2 }}>Aún no hay datos guardados este mes</div>
            <div style={{ fontSize: 11.5, color: "var(--t2)", lineHeight: 1.5 }}>Importa los reportes de hoy con el botón de arriba para comenzar a construir el resumen del mes. Al guardar el día, verás aquí la productividad acumulada.</div>
          </div>
        </div>
      )}

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 10, marginBottom: 22 }}>
        <KpiCard label="VENTA TOTAL" value={fmtMoney(agg.totVenta)} sub={hayDatos ? "acumulado del mes" : "sin datos"} color={hayDatos ? "#355d6b" : "var(--t3)"} />
        <KpiCard label="MARGEN PROM." value={hayDatos ? fmtNum(agg.margenProm, 1) + "%" : "—"} sub={hayDatos ? (agg.margenProm >= 25 ? "en objetivo" : "bajo objetivo") : "sin datos"} color={hayDatos ? (agg.margenProm >= 25 ? "#5d7c4c" : "#a37a10") : "var(--t3)"} />
        <KpiCard label="CLIENTES" value={fmtNum(agg.totClientes)} sub={hayDatos ? "atendidos en el mes" : "sin datos"} color={hayDatos ? "#8a6a4b" : "var(--t3)"} />
        <KpiCard label="LLANTAS" value={fmtNum(agg.totLlantas)} sub={hayDatos ? "unidades vendidas" : "sin datos"} color={hayDatos ? "#5d7c4c" : "var(--t3)"} />
        <KpiCard label="SERVICIOS" value={fmtNum(agg.totServicios)} sub={hayDatos ? "unidades vendidas" : "sin datos"} color={hayDatos ? "#5d7c4c" : "var(--t3)"} />
        <KpiCard label="ALERTAS" value={fmtNum(agg.totAlertas)} sub={hayDatos ? (agg.totAlertas > 0 ? "revisar" : "sin alertas") : "sin datos"} color={hayDatos ? (agg.totAlertas > 0 ? "#cb4532" : "#5d7c4c") : "var(--t3)"} />
      </div>

      {/* Score de conversión */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
          <h2 style={{ margin: 0, fontSize: 13, color: "var(--t2)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em" }}>Score de conversión acumulada</h2>
          <span style={{ fontSize: 10.5, color: "var(--t3)" }}>Unidades por cada 10 clientes vs objetivo · {Math.round(agg.totClientes)} clientes del mes</span>
        </div>
        <div style={{ background: "var(--s1)", border: "1px solid var(--b1)", borderRadius: 10, padding: "14px 16px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10 }}>
          {Object.keys(MAP_CONV).map((k) => (
            <ConvCard key={k} lbl={MAP_CONV[k].lbl} ox10Key={MAP_CONV[k].key} uds={agg.acumLineas[k] || 0} totClientes={agg.totClientes} />
          ))}
        </div>
      </div>

      {/* Progreso por línea */}
      {obj.lineas && obj.lineas.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 10 }}>
            <h2 style={{ margin: 0, fontSize: 13, color: "var(--t2)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em" }}>Progreso por línea vs objetivos</h2>
            <span style={{ fontSize: 10.5, color: "var(--t3)" }}>Bono 1 / Bono 2 · día {obj.diaAct || "?"} de {obj.dias || "?"}</span>
          </div>
          <div style={{ background: "var(--s1)", border: "1px solid var(--b1)", borderRadius: 10, padding: "14px 18px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "4px 26px" }}>
            {obj.lineas.map((l) => (
              <ProgresoLinea key={l.k} l={l} acum={agg.acumLineas[l.k] || 0} />
            ))}
          </div>
        </div>
      )}

      {/* Vendedores */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 22 }}>
        <div style={{ background: "var(--s1)", border: "1px solid var(--b1)", borderRadius: 10, padding: "14px 16px" }}>
          <h3 style={{ margin: "0 0 10px", fontSize: 12, color: "#5d7c4c", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", display: "flex", alignItems: "center", gap: 8 }}>
            <span>⭐</span> Vendedores destacados
          </h3>
          {agg.topVendDest.length > 0
            ? agg.topVendDest.map((v, i) => <RankVend key={v.nombre} v={v} pos={i + 1} tipo="dest" vendCount={agg.vendList.length} objByK={objByK} />)
            : <div style={{ fontSize: 11, color: "var(--t3)", padding: "12px 4px", fontStyle: "italic", textAlign: "center" }}>Sin datos de vendedores en el mes</div>
          }
        </div>
        <div style={{ background: "var(--s1)", border: "1px solid var(--b1)", borderRadius: 10, padding: "14px 16px" }}>
          <h3 style={{ margin: "0 0 10px", fontSize: 12, color: "#cb4532", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", display: "flex", alignItems: "center", gap: 8 }}>
            <span>⚠️</span> Vendedores con alertas
          </h3>
          {agg.topVendAl.length > 0
            ? agg.topVendAl.map((v, i) => <RankVend key={v.nombre} v={v} pos={i + 1} tipo="al" vendCount={agg.vendList.length} objByK={objByK} />)
            : <div style={{ fontSize: 11, color: "var(--t3)", padding: "12px 4px", fontStyle: "italic", textAlign: "center" }}>Sin alertas acumuladas</div>
          }
        </div>
      </div>

      {/* Técnicos */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 22 }}>
        <div style={{ background: "var(--s1)", border: "1px solid var(--b1)", borderRadius: 10, padding: "14px 16px" }}>
          <h3 style={{ margin: "0 0 10px", fontSize: 12, color: "#5d7c4c", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", display: "flex", alignItems: "center", gap: 8 }}>
            <span>🛠️</span> Técnicos destacados
          </h3>
          {agg.topTecDest.length > 0
            ? agg.topTecDest.map((t, i) => <RankTec key={t.nombre} t={t} pos={i + 1} tipo="dest" tecCount={agg.tecList.length} objByK={objByK} />)
            : <div style={{ fontSize: 11, color: "var(--t3)", padding: "12px 4px", fontStyle: "italic", textAlign: "center" }}>Sin datos de técnicos en el mes</div>
          }
        </div>
        <div style={{ background: "var(--s1)", border: "1px solid var(--b1)", borderRadius: 10, padding: "14px 16px" }}>
          <h3 style={{ margin: "0 0 10px", fontSize: 12, color: "#a37a10", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", display: "flex", alignItems: "center", gap: 8 }}>
            <span>📉</span> Técnicos con menor productividad
          </h3>
          {agg.topTecBajos.length > 0
            ? agg.topTecBajos.map((t, i) => <RankTec key={t.nombre} t={t} pos={i + 1} tipo="bajo" tecCount={agg.tecList.length} objByK={objByK} />)
            : <div style={{ fontSize: 11, color: "var(--t3)", padding: "12px 4px", fontStyle: "italic", textAlign: "center" }}>Sin datos</div>
          }
        </div>
      </div>

      {/* Últimos días */}
      <div style={{ marginBottom: 22 }}>
        <details style={{ background: "var(--s1)", border: "1px solid var(--b1)", borderRadius: 10, overflow: "hidden" }}>
          <summary style={{ padding: "12px 16px", cursor: "pointer", listStyle: "none", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, userSelect: "none" }}>
            <h2 style={{ margin: 0, fontSize: 13, color: "var(--t2)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".06em" }}>
              Últimos días guardados
              {hayDatos && <span style={{ color: "var(--t3)", fontWeight: 400, textTransform: "none", letterSpacing: 0, marginLeft: 4 }}>({Math.min(recsDelMes.length, 6)} de {recsDelMes.length})</span>}
            </h2>
            <span style={{ fontSize: 11, color: "var(--t3)", display: "flex", alignItems: "center", gap: 6 }}>
              <span>Ver detalle</span>
              <span style={{ fontSize: 9 }}>▼</span>
            </span>
          </summary>
          <div style={{ borderTop: "1px solid var(--b1)" }}>
            {hayDatos ? (
              <>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
                  <thead>
                    <tr style={{ background: "var(--s2)" }}>
                      {["Día","Venta","Margen","Llantas","Servicios","Clientes","Alertas"].map((h) => (
                        <th key={h} style={{ padding: "8px 12px", textAlign: h === "Día" ? "left" : h === "Alertas" ? "center" : "right", fontSize: 9.5, color: "var(--t3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recsDelMes.slice(-6).reverse().map((r) => {
                      const al = (r.alertasMarg || 0) + (r.alertasComp || 0) + (r.alertasBit || 0);
                      return (
                        <tr key={r.id || r.fecha} style={{ borderTop: "1px solid var(--b1)" }}>
                          <td style={{ padding: "8px 12px", color: "var(--text)", fontWeight: 500 }}>{r.fecha}</td>
                          <td style={{ padding: "8px 12px", textAlign: "right", fontFamily: "var(--mono)", color: "var(--text)" }}>{fmtMoney(r.venta || 0)}</td>
                          <td style={{ padding: "8px 12px", textAlign: "right", fontFamily: "var(--mono)", color: (r.margen || 0) >= 25 ? "#5d7c4c" : "#a37a10" }}>{fmtNum(r.margen || 0, 1)}%</td>
                          <td style={{ padding: "8px 12px", textAlign: "right", fontFamily: "var(--mono)", color: "var(--text)" }}>{fmtNum(r.llantas || 0)}</td>
                          <td style={{ padding: "8px 12px", textAlign: "right", fontFamily: "var(--mono)", color: "var(--text)" }}>{fmtNum(r.servicios || 0)}</td>
                          <td style={{ padding: "8px 12px", textAlign: "right", fontFamily: "var(--mono)", color: "var(--text)" }}>{fmtNum(r.clientes || 0)}</td>
                          <td style={{ padding: "8px 12px", textAlign: "center", fontFamily: "var(--mono)", color: al > 0 ? "#cb4532" : "var(--t3)", fontWeight: al > 0 ? 600 : 400 }}>{al > 0 ? al : "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {recsDelMes.length > 6 && (
                  <div style={{ padding: "8px 12px", borderTop: "1px solid var(--b1)", fontSize: 10, color: "var(--t3)", textAlign: "center", background: "var(--s2)" }}>
                    Se muestran los últimos 6 días. Abre el <button onClick={() => togglePanel("historial", true)} style={{ background: "none", border: "none", color: "var(--accent)", textDecoration: "underline", cursor: "pointer", fontSize: 10, fontFamily: "inherit", padding: 0 }}>Historial completo</button> para ver más.
                  </div>
                )}
              </>
            ) : (
              <div style={{ padding: "30px 20px", textAlign: "center", color: "var(--t3)", fontSize: 12, fontStyle: "italic" }}>
                No hay días guardados este mes. Importa los reportes y guarda el primer día.
              </div>
            )}
          </div>
        </details>
      </div>

    </div>
  );
}
