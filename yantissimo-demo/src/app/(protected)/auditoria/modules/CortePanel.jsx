"use client";
import { useEffect, useMemo, useState } from "react";
import { useAuditoria } from "../state/AuditoriaContext";
import SectionTitle from "../components/SectionTitle";
import { buildCorte } from "../lib/calc/corte";
import { fp } from "../lib/utils/format";

/**
 * Puerto de `renderCorte()` (HTML 7101–7526).
 * Mantiene: efectivo facturado, efectivo VM neto con reposición caja chica,
 * terminales agrupadas por banco con selector de plazo (TC 1exh / 6M / 12M),
 * transferencias, cobros del día, compras de contado, créditos Yantissimo,
 * créditos institucionales (La Marina / SUTUC), notas de crédito, cargos CP
 * y resumen final.
 * Pendiente: persistencia de `personalExtra` por sucursal en backend.
 */

const PE_LS_KEY = "aud_personal_extra_v1";

function personalExtraLoad(suc) {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(PE_LS_KEY) || "{}");
    return Array.isArray(raw[suc]) ? raw[suc] : [];
  } catch {
    return [];
  }
}
function personalExtraSave(suc, lista) {
  if (typeof window === "undefined") return;
  try {
    const raw = JSON.parse(localStorage.getItem(PE_LS_KEY) || "{}");
    raw[suc] = lista;
    localStorage.setItem(PE_LS_KEY, JSON.stringify(raw));
  } catch {}
}

function FilaSimple({ f }) {
  return (
    <tr style={f.esCobro ? { background: "rgba(var(--ok-rgb),.04)" } : undefined}>
      <td className="mo" style={{ fontSize: 10, whiteSpace: "nowrap" }}>{f.fecha}</td>
      <td className="mo" style={{ fontSize: 10, fontFamily: "var(--mono)" }}>
        {f.esCobro ? (
          <>
            <span style={{ fontSize: 9, color: "var(--ok)" }}>{f.folio}</span>
            {f.folioVenta ? (
              <>
                <br />
                <span style={{ fontSize: 8, color: "var(--t3)" }}>Venta: {f.folioVenta}</span>
              </>
            ) : null}
          </>
        ) : (
          f.folio
        )}
      </td>
      <td style={{ fontSize: 11 }}>
        {f.esCobro ? (
          <span
            style={{
              fontSize: 8,
              padding: "1px 5px",
              borderRadius: 3,
              background: "rgba(var(--ok-rgb),.12)",
              color: "var(--ok)",
              fontWeight: 600,
              marginRight: 4,
            }}
          >
            COBRO
          </span>
        ) : null}
        {f.cliente}
      </td>
      <td style={{ fontSize: 10, color: "var(--t2)" }}>{f.vendedor}</td>
      <td className="r" style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 600 }}>
        {fp(f.total)}
      </td>
    </tr>
  );
}

function TablaSimple({ rows, footLbl, footTotal, footColor }) {
  return (
    <table className="st">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Folio</th>
          <th>Cliente</th>
          <th>Vendedor</th>
          <th className="r">Total c/IVA</th>
        </tr>
      </thead>
      <tbody>
        {rows.length ? (
          rows.map((f, i) => <FilaSimple key={(f.folio || "") + i} f={f} />)
        ) : (
          <tr>
            <td colSpan={5} style={{ textAlign: "center", color: "var(--t3)", padding: 10, fontSize: 11 }}>
              Sin registros
            </td>
          </tr>
        )}
      </tbody>
      {footLbl ? (
        <tfoot>
          <tr>
            <td colSpan={4} style={{ fontWeight: 700 }}>{footLbl}</td>
            <td className="r" style={{ fontWeight: 700, color: footColor || "var(--text)" }}>
              {fp(footTotal)}
            </td>
          </tr>
        </tfoot>
      ) : null}
    </table>
  );
}

const BANCO_DISPLAY = { bancomer: "BBVA", afirme: "Afirme", banamex: "Banamex" };

function FilaTerminal({
  f,
  tipoActual,
  bancoActual,
  plazo,
  onPlazoChange,
  correccion,
  onCorregir,
  onClearCorreccion,
}) {
  const esTD = tipoActual === "TD";
  const [editing, setEditing] = useState(false);
  const [bancoSel, setBancoSel] = useState(correccion?.bancoNuevo || BANCO_DISPLAY[bancoActual] || "BBVA");
  const [tipoSel, setTipoSel] = useState(correccion?.tipoNuevo || tipoActual || "TC");
  const [plazoSel, setPlazoSel] = useState(correccion?.plazo || plazo || "1exh");

  const aplicar = () => {
    onCorregir({
      folio: f.folio,
      cliente: f.cliente || "",
      vendedor: f.vendedor || "",
      bancoOrig: BANCO_DISPLAY[bancoActual] || "",
      tipoOrig: tipoActual || "",
      bancoNuevo: bancoSel,
      tipoNuevo: tipoSel,
      plazo: plazoSel,
    });
    onPlazoChange(f.folio, plazoSel);
    setEditing(false);
  };

  return (
    <>
    <tr style={f.esCobro ? { background: "rgba(var(--ok-rgb),.04)" } : undefined}>
      <td className="mo" style={{ fontSize: 10, whiteSpace: "nowrap" }}>{f.fecha}</td>
      <td className="mo" style={{ fontSize: 10, fontFamily: "var(--mono)" }}>
        {f.esCobro ? (
          <>
            <span style={{ fontSize: 9, color: "var(--ok)" }}>{f.folio}</span>
            {f.folioVenta ? (
              <>
                <br />
                <span style={{ fontSize: 8, color: "var(--t3)" }}>Venta: {f.folioVenta}</span>
              </>
            ) : null}
            <br />
            <span style={{ fontSize: 8, color: "var(--t3)" }}>{f.cliente}</span>
          </>
        ) : (
          <>
            {f.folio}
            <br />
            <span style={{ fontSize: 9, color: "var(--t3)" }}>{f.cliente}</span>
          </>
        )}
      </td>
      <td style={{ fontSize: 10, color: "var(--t2)" }}>
        {f.esCobro ? (
          <span
            style={{
              fontSize: 8,
              padding: "1px 4px",
              borderRadius: 3,
              background: "rgba(var(--ok-rgb),.12)",
              color: "var(--ok)",
              marginRight: 4,
            }}
          >
            COBRO
          </span>
        ) : null}
        {f.vendedor}
      </td>
      <td style={{ textAlign: "center" }}>
        {esTD ? (
          <span style={{ fontSize: 10, color: "var(--t3)" }}>—</span>
        ) : (
          <select
            value={plazo}
            onChange={(e) => onPlazoChange(f.folio, e.target.value)}
            style={{
              fontSize: 10,
              padding: "2px 4px",
              borderRadius: 4,
              border: "1px solid var(--b1)",
              background: "var(--s3)",
              color: "var(--text)",
            }}
          >
            <option value="1exh">1 Exhibición</option>
            <option value="6m">6 Meses</option>
            <option value="12m">12 Meses</option>
          </select>
        )}
      </td>
      <td className="r" style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 600 }}>
        {fp(f.total)}
      </td>
      <td className="ns" style={{ whiteSpace: "nowrap", textAlign: "right" }}>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          style={{
            fontSize: 9,
            padding: "2px 7px",
            borderRadius: 4,
            cursor: "pointer",
            border: "1px solid var(--b2)",
            background: correccion ? "rgba(var(--warn-rgb),.12)" : "var(--s3)",
            color: correccion ? "var(--warn)" : "var(--t2)",
          }}
        >
          ✎ {correccion ? "Editar" : "Corregir"}
        </button>
        {correccion ? (
          <button
            type="button"
            onClick={() => onClearCorreccion(f.folio)}
            style={{
              marginLeft: 4,
              fontSize: 9,
              padding: "2px 5px",
              borderRadius: 4,
              cursor: "pointer",
              border: "1px solid var(--b2)",
              background: "var(--s3)",
              color: "var(--t3)",
            }}
          >
            ✕
          </button>
        ) : null}
      </td>
    </tr>
    {editing ? (
      <tr style={{ background: "var(--s2)" }}>
        <td colSpan={6} style={{ padding: "8px 10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 10, color: "var(--t2)" }}>Banco:</span>
            <select
              value={bancoSel}
              onChange={(e) => setBancoSel(e.target.value)}
              style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, border: "1px solid var(--b1)", background: "var(--s3)", color: "var(--text)" }}
            >
              <option value="BBVA">BBVA</option>
              <option value="Afirme">Afirme</option>
              <option value="Banamex">Banamex</option>
            </select>
            <span style={{ fontSize: 10, color: "var(--t2)" }}>Tipo:</span>
            <select
              value={tipoSel}
              onChange={(e) => setTipoSel(e.target.value)}
              style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, border: "1px solid var(--b1)", background: "var(--s3)", color: "var(--text)" }}
            >
              <option value="TC">TC · Crédito</option>
              <option value="TD">TD · Débito</option>
            </select>
            <span style={{ fontSize: 10, color: "var(--t2)" }}>Plazo:</span>
            <select
              value={plazoSel}
              onChange={(e) => setPlazoSel(e.target.value)}
              style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, border: "1px solid var(--b1)", background: "var(--s3)", color: "var(--text)" }}
            >
              <option value="1exh">1 Exhibición</option>
              <option value="6m">6 Meses</option>
              <option value="12m">12 Meses</option>
            </select>
            <button
              type="button"
              onClick={aplicar}
              style={{ fontSize: 10, padding: "3px 10px", borderRadius: 4, cursor: "pointer", background: "rgba(var(--ok-rgb),.15)", color: "var(--ok)", border: "1px solid rgba(var(--ok-rgb),.3)", fontWeight: 600 }}
            >
              Aplicar
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, cursor: "pointer", background: "var(--s3)", color: "var(--t2)", border: "1px solid var(--b2)" }}
            >
              Cancelar
            </button>
          </div>
        </td>
      </tr>
    ) : null}
    </>
  );
}

function TablaTerminal({ rows, tipo, banco, cortePlazo, onPlazoChange, correcciones, onCorregir, onClearCorreccion }) {
  return (
    <table className="st">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Folio / Cliente</th>
          <th>Vendedor</th>
          <th>Plazo</th>
          <th className="r">Total c/IVA</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {rows.length ? (
          rows.map((f, i) => (
            <FilaTerminal
              key={(f.folio || "") + i}
              f={f}
              tipoActual={tipo}
              bancoActual={banco}
              plazo={cortePlazo[f.folio] || "1exh"}
              onPlazoChange={onPlazoChange}
              correccion={correcciones.find((c) => c.folio === f.folio)}
              onCorregir={onCorregir}
              onClearCorreccion={onClearCorreccion}
            />
          ))
        ) : (
          <tr>
            <td colSpan={6} style={{ textAlign: "center", color: "var(--t3)", padding: 10, fontSize: 11 }}>
              Sin registros
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default function CortePanel() {
  const {
    resultado,
    sucursal,
    correccionesBanco,
    upsertCorreccionBanco,
    removeCorreccionBanco,
  } = useAuditoria();

  const ventas = useMemo(() => resultado?.ventas ?? [], [resultado]);
  const cobranzas = useMemo(() => resultado?.cobranzas ?? [], [resultado]);
  const cargosCPDia = useMemo(() => resultado?.cargosCP ?? [], [resultado]);
  const comprasIntDia = useMemo(() => resultado?.comprasIntegradas ?? [], [resultado]);

  const [cortePlazo, setCortePlazo] = useState({});
  const [cajaChica, setCajaChica] = useState(0);
  const [cajaChicaEditada, setCajaChicaEditada] = useState(false);
  const [personalExtra, setPersonalExtra] = useState([]);
  const [personalExtraInput, setPersonalExtraInput] = useState("");

  useEffect(() => {
    const lista = personalExtraLoad(sucursal);
    setPersonalExtra(lista);
    setPersonalExtraInput(lista.join(", "));
  }, [sucursal]);

  const { grupos } = useMemo(
    () => buildCorte({ ventas, cobranzas, correcciones: correccionesBanco }),
    [ventas, cobranzas, correccionesBanco],
  );

  const uSuc = useMemo(() => {
    const s = new Set();
    ventas.forEach((v) => v.vendedor && s.add(v.vendedor.trim().toUpperCase()));
    comprasIntDia.forEach((c) => c.usuario && s.add(c.usuario.trim().toUpperCase()));
    personalExtra.forEach((u) => s.add(u));
    return s;
  }, [ventas, comprasIntDia, personalExtra]);

  const cargosContado = useMemo(
    () =>
      cargosCPDia.filter((c) => {
        const u = (c.vendedor || "").trim().toUpperCase();
        return u && uSuc.has(u) && (c.condPago || "").toUpperCase() === "CONTADO";
      }),
    [cargosCPDia, uSuc],
  );
  const totalCargosContado = cargosContado.reduce((s, c) => s + (c.total || c.importe || 0), 0);

  useEffect(() => {
    if (!cajaChicaEditada) setCajaChica(totalCargosContado);
  }, [totalCargosContado, cajaChicaEditada]);

  if (!ventas.length) {
    return <div className="aud-empty">Importa un reporte para ver el corte de caja.</div>;
  }

  const sum = (arr) => arr.reduce((s, f) => s + f.total, 0);
  const totalEfFac = sum(grupos.efectivo_fac);
  const totalEfVm = sum(grupos.efectivo_vm);
  const totalTransf = sum(grupos.transf);
  const totalCredYant = sum(grupos.cred_yant);
  const totalCredInst = sum(grupos.cred_inst);
  const totalNota = sum(grupos.nota);
  const netoEfVm = totalEfVm - cajaChica;

  const bancos = [
    { key: "bancomer", nombre: "BBVA", tc: grupos.tc_bancomer, td: grupos.td_bancomer },
    { key: "afirme", nombre: "Afirme", tc: grupos.tc_afirme, td: grupos.td_afirme },
    { key: "banamex", nombre: "Banamex", tc: grupos.tc_banamex, td: grupos.td_banamex },
  ];
  const hayTerminal = bancos.some((b) => b.tc.length || b.td.length);
  let totalTerminal = 0;
  bancos.forEach((b) => {
    totalTerminal +=
      b.tc.reduce((s, f) => s + f.total, 0) + b.td.reduce((s, f) => s + f.total, 0);
  });

  const compContado = comprasIntDia.filter((c) => c.esContado);
  const totCompContado = compContado.reduce((s, c) => s + c.total, 0);

  const instMarina = grupos.cred_inst.filter((f) => /marina/i.test(f.formaCobro));
  const instSutuc = grupos.cred_inst.filter((f) => /sutuc/i.test(f.formaCobro));

  const totalCobros = grupos.cobros.reduce((s, c) => s + c.total, 0);
  const ingresoCobranzas = cobranzas.reduce(
    (s, c) =>
      s + (parseFloat(String(c.importeRaw || "").replace(/[^0-9.]/g, "")) || c.total || 0),
    0,
  );

  const handlePlazoChange = (folio, valor) => {
    setCortePlazo((prev) => ({ ...prev, [folio]: valor }));
  };

  const guardarPersonalExtra = () => {
    const lista = personalExtraInput
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);
    setPersonalExtra(lista);
    personalExtraSave(sucursal, lista);
    setCajaChicaEditada(false);
  };

  const cajaChicaSugerida = !cajaChicaEditada && totalCargosContado > 0;
  const totalTodos = cargosCPDia.reduce((s, c) => s + (c.total || c.importe || 0), 0);

  return (
    <div>
      <SectionTitle style={{ marginTop: 0 }}>Efectivo facturado · a depositar</SectionTitle>
      <TablaSimple
        rows={grupos.efectivo_fac}
        footLbl="Total a depositar"
        footTotal={totalEfFac}
        footColor="var(--ok)"
      />

      <SectionTitle>Efectivo venta de mostrador · a entregar</SectionTitle>
      <TablaSimple rows={grupos.efectivo_vm} />

      <div
        style={{
          background: "var(--s2)",
          border: "1px solid var(--b1)",
          borderRadius: "var(--r)",
          padding: ".85rem 1rem",
          marginTop: 8,
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
          💸 Reposición de caja chica · gastos del día
        </div>
        {cajaChicaSugerida ? (
          <div style={{ fontSize: 10, color: "var(--warn)", marginBottom: 6 }}>
            ⚠ Auto-llenado por cargos de contado · el gerente puede modificarlo
          </div>
        ) : null}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 11,
            color: "var(--t2)",
            flexWrap: "wrap",
          }}
        >
          <span>Monto a reponer:</span>
          <input
            type="number"
            min="0"
            value={cajaChica}
            onChange={(e) => {
              setCajaChica(parseFloat(e.target.value) || 0);
              setCajaChicaEditada(true);
            }}
            style={{ width: 110, borderColor: cajaChicaSugerida ? "var(--warn)" : undefined }}
          />
          <span style={{ color: "var(--t3)", fontSize: 10 }}>
            (se descuenta del efectivo VM entregable)
          </span>
        </div>
        <div
          style={{
            borderTop: "1px solid var(--b1)",
            marginTop: 10,
            paddingTop: 8,
          }}
        >
          <div style={{ fontSize: 10, color: "var(--t2)", marginBottom: 4 }}>
            <strong>Personal de sucursal extra (no-vendedores que descuentan)</strong> — {sucursal}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Ej: RICARDO, ROCIO"
              value={personalExtraInput}
              onChange={(e) => setPersonalExtraInput(e.target.value)}
              style={{
                flex: 1,
                minWidth: 200,
                fontSize: 11,
                padding: "4px 8px",
                border: "1px solid var(--b1)",
                borderRadius: 4,
                background: "var(--s1)",
                color: "var(--text)",
              }}
            />
            <button
              type="button"
              onClick={guardarPersonalExtra}
              style={{
                fontSize: 10,
                padding: "4px 10px",
                borderRadius: 4,
                border: "1px solid var(--b1)",
                background: "var(--s1)",
                color: "var(--text)",
                cursor: "pointer",
              }}
            >
              Guardar
            </button>
          </div>
          <div style={{ fontSize: 9, color: "var(--t3)", marginTop: 4 }}>
            Lista separada por coma · sus cargos CONTADO descontarán igual que los de vendedores
          </div>
        </div>
      </div>

      <div
        style={{
          background: "var(--s2)",
          border: "1px solid var(--b1)",
          borderRadius: "var(--r)",
          padding: ".75rem 1rem",
          marginTop: 6,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>
          Efectivo VM a entregar
        </span>
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: 14,
            fontWeight: 700,
            color: "var(--ok)",
          }}
        >
          {fp(netoEfVm)}
        </span>
      </div>

      <SectionTitle>Terminales · agrupado por banco</SectionTitle>
      {!hayTerminal ? (
        <div style={{ color: "var(--t3)", fontSize: 11, padding: "8px 0" }}>
          Sin cobros con tarjeta
        </div>
      ) : (
        <>
          {bancos.map((b) => {
            if (!b.tc.length && !b.td.length) return null;
            const tcExh = b.tc.filter((f) => (cortePlazo[f.folio] || "1exh") === "1exh");
            const tcMsi = b.tc.filter(
              (f) => cortePlazo[f.folio] === "6m" || cortePlazo[f.folio] === "12m",
            );
            const totTcExh = tcExh.reduce((s, f) => s + f.total, 0);
            const totTcMsi = tcMsi.reduce((s, f) => s + f.total, 0);
            const totTd = b.td.reduce((s, f) => s + f.total, 0);
            const totBanco = totTcExh + totTcMsi + totTd;
            return (
              <div
                key={b.nombre}
                style={{
                  background: "var(--s2)",
                  border: "1px solid var(--b1)",
                  borderRadius: "var(--r)",
                  overflow: "hidden",
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    background: "var(--s3)",
                    padding: "6px 10px",
                    borderBottom: "1px solid var(--b1)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>
                    {b.nombre}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--text)",
                    }}
                  >
                    {fp(totBanco)}
                  </span>
                </div>
                <div style={{ padding: "8px 10px" }}>
                  {b.tc.length ? (
                    <>
                      {tcExh.length ? (
                        <>
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: "var(--t2)",
                              textTransform: "uppercase",
                              letterSpacing: ".05em",
                              margin: "0 0 4px",
                            }}
                          >
                            TC · 1 Exhibición
                          </div>
                          <TablaTerminal
                            rows={tcExh}
                            tipo="TC"
                            banco={b.key}
                            cortePlazo={cortePlazo}
                            onPlazoChange={handlePlazoChange}
                            correcciones={correccionesBanco}
                            onCorregir={upsertCorreccionBanco}
                            onClearCorreccion={removeCorreccionBanco}
                          />
                        </>
                      ) : null}
                      {tcMsi.length ? (
                        <>
                          <div
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: "var(--t2)",
                              textTransform: "uppercase",
                              letterSpacing: ".05em",
                              margin: "8px 0 4px",
                            }}
                          >
                            TC · Meses sin intereses
                          </div>
                          <TablaTerminal
                            rows={tcMsi}
                            tipo="TC"
                            banco={b.key}
                            cortePlazo={cortePlazo}
                            onPlazoChange={handlePlazoChange}
                            correcciones={correccionesBanco}
                            onCorregir={upsertCorreccionBanco}
                            onClearCorreccion={removeCorreccionBanco}
                          />
                        </>
                      ) : null}
                      {!tcExh.length && !tcMsi.length ? (
                        <div style={{ color: "var(--t3)", fontSize: 10, padding: "4px 0" }}>
                          Sin cobros TC
                        </div>
                      ) : null}
                      {tcExh.length ? (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 11,
                            padding: "4px 0",
                            borderTop: "1px solid var(--b1)",
                            marginTop: 4,
                          }}
                        >
                          <span style={{ color: "var(--t2)" }}>Subtotal 1 Exhibición</span>
                          <span style={{ fontFamily: "var(--mono)", fontWeight: 600 }}>
                            {fp(totTcExh)}
                          </span>
                        </div>
                      ) : null}
                      {tcMsi.length ? (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 11,
                            padding: "4px 0",
                            borderTop: "1px solid var(--b1)",
                            marginTop: 2,
                          }}
                        >
                          <span style={{ color: "var(--t2)" }}>Subtotal MSI</span>
                          <span style={{ fontFamily: "var(--mono)", fontWeight: 600 }}>
                            {fp(totTcMsi)}
                          </span>
                        </div>
                      ) : null}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 11,
                          padding: "5px 0",
                          borderTop: "2px solid var(--b1)",
                          marginTop: 2,
                        }}
                      >
                        <span style={{ fontWeight: 600, color: "var(--text)" }}>Total TC</span>
                        <span style={{ fontFamily: "var(--mono)", fontWeight: 700 }}>
                          {fp(totTcExh + totTcMsi)}
                        </span>
                      </div>
                    </>
                  ) : null}
                  {b.td.length ? (
                    <>
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: "var(--t2)",
                          textTransform: "uppercase",
                          letterSpacing: ".05em",
                          margin: (b.tc.length ? "10px" : "0") + " 0 4px",
                        }}
                      >
                        TD · Débito
                      </div>
                      <TablaTerminal
                        rows={b.td}
                        tipo="TD"
                        banco={b.key}
                        cortePlazo={cortePlazo}
                        onPlazoChange={handlePlazoChange}
                        correcciones={correccionesBanco}
                        onCorregir={upsertCorreccionBanco}
                        onClearCorreccion={removeCorreccionBanco}
                      />
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 11,
                          padding: "4px 0",
                          borderTop: "1px solid var(--b1)",
                          marginTop: 4,
                        }}
                      >
                        <span style={{ color: "var(--t2)" }}>Subtotal TD</span>
                        <span style={{ fontFamily: "var(--mono)", fontWeight: 600 }}>
                          {fp(totTd)}
                        </span>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            );
          })}
          <div
            style={{
              background: "var(--s2)",
              border: "1px solid var(--b1)",
              borderRadius: "var(--r)",
              padding: ".75rem 1rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>
              Total terminal (todos los bancos)
            </span>
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: 14,
                fontWeight: 700,
                color: "var(--text)",
              }}
            >
              {fp(totalTerminal)}
            </span>
          </div>
        </>
      )}

      <SectionTitle>Transferencias</SectionTitle>
      <TablaSimple
        rows={grupos.transf}
        footLbl={grupos.transf.length ? "Total transferencias" : null}
        footTotal={totalTransf}
      />

      {grupos.cobros.length ? (
        <>
          <SectionTitle>Cobros de crédito del día · ingreso</SectionTitle>
          <table className="st">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Recibo</th>
                <th>Venta acreditada</th>
                <th>Cliente</th>
                <th>Forma de cobro</th>
                <th>Cobrador</th>
                <th className="r">Total</th>
              </tr>
            </thead>
            <tbody>
              {grupos.cobros.map((c, i) => (
                <tr key={(c.folio || "") + i}>
                  <td className="mo" style={{ fontSize: 10, whiteSpace: "nowrap" }}>
                    {c.fecha || "--"}
                  </td>
                  <td
                    className="mo"
                    style={{ fontSize: 10, fontFamily: "var(--mono)", color: "var(--ok)" }}
                  >
                    {c.folio || "--"}
                  </td>
                  <td
                    className="mo"
                    style={{ fontSize: 10, fontFamily: "var(--mono)", color: "var(--t3)" }}
                  >
                    {c.folioVenta || c.folioOrig || "--"}
                  </td>
                  <td style={{ fontSize: 11 }}>{c.cliente || "--"}</td>
                  <td style={{ fontSize: 10, color: "var(--t2)" }}>{c.formaCobro || "--"}</td>
                  <td style={{ fontSize: 10, color: "var(--t2)" }}>{c.vendedor || "--"}</td>
                  <td
                    className="r"
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--ok)",
                    }}
                  >
                    {fp(c.total)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={6} style={{ fontWeight: 700 }}>
                  Total cobros del día
                </td>
                <td className="r" style={{ fontWeight: 700, color: "var(--ok)" }}>
                  {fp(totalCobros)}
                </td>
              </tr>
            </tfoot>
          </table>
        </>
      ) : null}

      {compContado.length ? (
        <>
          <SectionTitle>Compras de contado · gasto del día</SectionTitle>
          <table className="st">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Folio</th>
                <th>Proveedor</th>
                <th>Artículo</th>
                <th className="r">Total</th>
              </tr>
            </thead>
            <tbody>
              {compContado.map((c, i) => (
                <tr key={(c.folio || "") + i}>
                  <td className="mo" style={{ fontSize: 10, whiteSpace: "nowrap" }}>
                    {c.fecha}
                  </td>
                  <td className="mo" style={{ fontSize: 10, fontFamily: "var(--mono)" }}>
                    {c.folio}
                  </td>
                  <td style={{ fontSize: 11 }}>{c.prov}</td>
                  <td style={{ fontSize: 11 }}>{c.art}</td>
                  <td
                    className="r"
                    style={{ fontFamily: "var(--mono)", fontSize: 11, fontWeight: 600 }}
                  >
                    {fp(c.total)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} style={{ fontWeight: 700 }}>
                  Total
                </td>
                <td className="r" style={{ fontWeight: 700, color: "var(--danger)" }}>
                  {fp(totCompContado)}
                </td>
              </tr>
            </tfoot>
          </table>
        </>
      ) : null}

      <SectionTitle>Crédito Yantissimo · pendiente de cobro</SectionTitle>
      <TablaSimple
        rows={grupos.cred_yant}
        footLbl={grupos.cred_yant.length ? "Total crédito Yantissimo" : null}
        footTotal={totalCredYant}
        footColor="var(--warn)"
      />

      <SectionTitle>Créditos institucionales · La Marina y SUTUC</SectionTitle>
      {instMarina.length ? (
        <>
          <div style={{ fontSize: 11, color: "var(--t2)", margin: "6px 0 3px", fontWeight: 600 }}>
            La Marina
          </div>
          <TablaSimple
            rows={instMarina}
            footLbl="Subtotal La Marina"
            footTotal={sum(instMarina)}
            footColor="var(--warn)"
          />
        </>
      ) : null}
      {instSutuc.length ? (
        <>
          <div style={{ fontSize: 11, color: "var(--t2)", margin: "8px 0 3px", fontWeight: 600 }}>
            SUTUC
          </div>
          <TablaSimple
            rows={instSutuc}
            footLbl="Subtotal SUTUC"
            footTotal={sum(instSutuc)}
            footColor="var(--warn)"
          />
        </>
      ) : null}
      {!instMarina.length && !instSutuc.length ? (
        <div style={{ color: "var(--t3)", fontSize: 11, padding: "8px 0" }}>
          Sin créditos institucionales
        </div>
      ) : null}
      {grupos.cred_inst.length ? (
        <div
          style={{
            background: "var(--s2)",
            border: "1px solid var(--b1)",
            borderRadius: "var(--r)",
            padding: ".75rem 1rem",
            marginTop: 6,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text)" }}>
            Total institucional
          </span>
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: 13,
              fontWeight: 700,
              color: "var(--warn)",
            }}
          >
            {fp(totalCredInst)}
          </span>
        </div>
      ) : null}

      {grupos.nota.length ? (
        <>
          <SectionTitle>Notas de crédito · descuentos aplicados</SectionTitle>
          <TablaSimple
            rows={grupos.nota}
            footLbl="Total notas"
            footTotal={totalNota}
            footColor="var(--danger)"
          />
        </>
      ) : null}

      <SectionTitle>Cargos CP · salidas de caja</SectionTitle>
      {!cargosCPDia.length ? (
        <div style={{ color: "var(--t3)", fontSize: 11, padding: "8px 0" }}>
          Sin cargos registrados en el período
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 14 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text)" }}>
                💳 Cargos del día · {cargosCPDia.length} total
              </span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--t2)" }}>
                {fp(totalTodos)}
              </span>
            </div>
            <table className="st">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Folio</th>
                  <th>Proveedor</th>
                  <th>Descripción</th>
                  <th>Realizó</th>
                  <th>Condición</th>
                  <th>Tipo</th>
                  <th className="r">Importe</th>
                </tr>
              </thead>
              <tbody>
                {cargosCPDia.map((c, i) => {
                  const u = (c.vendedor || "").trim().toUpperCase();
                  const esSuc = !!u && uSuc.has(u);
                  const esCont = (c.condPago || "").toUpperCase() === "CONTADO";
                  const descuenta = esSuc && esCont;
                  const imp = c.total || c.importe || 0;
                  const colorImp = descuenta
                    ? "var(--danger)"
                    : esSuc
                    ? "var(--warn)"
                    : "#7ba4b4";
                  const rowBg = descuenta
                    ? undefined
                    : esSuc
                    ? { background: "rgba(var(--warn-rgb),.04)" }
                    : { background: "rgba(99,102,241,.05)" };
                  const badgeStyle = {
                    fontSize: 9,
                    padding: "1px 5px",
                    borderRadius: 3,
                    fontWeight: 600,
                  };
                  const badge = descuenta ? (
                    <span
                      style={{
                        ...badgeStyle,
                        background: "rgba(var(--danger-rgb),.12)",
                        color: "var(--danger)",
                      }}
                    >
                      REPOSICIÓN
                    </span>
                  ) : esSuc ? (
                    <span
                      style={{
                        ...badgeStyle,
                        background: "rgba(var(--warn-rgb),.12)",
                        color: "var(--warn)",
                      }}
                    >
                      SUCURSAL CRÉD
                    </span>
                  ) : (
                    <span
                      style={{
                        ...badgeStyle,
                        background: "rgba(99,102,241,.15)",
                        color: "#7ba4b4",
                      }}
                    >
                      ADMÓN
                    </span>
                  );
                  return (
                    <tr key={(c.folio || "") + i} style={rowBg}>
                      <td className="mo" style={{ fontSize: 10, whiteSpace: "nowrap" }}>
                        {c.fecha || "--"}
                      </td>
                      <td className="mo" style={{ fontSize: 10, fontFamily: "var(--mono)" }}>
                        {c.folio || "--"}
                      </td>
                      <td style={{ fontSize: 10, color: "var(--t2)" }}>
                        {c.proveedor || c.cliente || "—"}
                      </td>
                      <td style={{ fontSize: 11 }}>
                        <strong>{c.desc || "--"}</strong>
                      </td>
                      <td style={{ fontSize: 10, color: "var(--t2)" }}>{c.vendedor || "—"}</td>
                      <td style={{ fontSize: 10, color: "var(--t2)" }}>{c.condPago || "—"}</td>
                      <td>{badge}</td>
                      <td
                        className="r"
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: 11,
                          fontWeight: 600,
                          color: colorImp,
                        }}
                      >
                        {fp(imp)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {cargosContado.length ? (
            <div
              style={{
                background: "var(--s2)",
                border: "1px solid rgba(var(--danger-rgb),.3)",
                borderRadius: "var(--r)",
                padding: ".65rem 1rem",
                marginTop: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text)" }}>
                  💸 Reposición caja chica · {cargosContado.length} cargo
                  {cargosContado.length !== 1 ? "s" : ""} de contado por personal de sucursal
                </span>
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--danger)",
                  }}
                >
                  − {fp(totalCargosContado)}
                </span>
              </div>
              <table className="st" style={{ marginTop: 2 }}>
                <tbody>
                  {cargosContado.map((c, i) => (
                    <tr key={(c.folio || "") + i}>
                      <td
                        className="mo"
                        style={{ fontSize: 10, whiteSpace: "nowrap", color: "var(--t2)" }}
                      >
                        {c.fecha || "--"}
                      </td>
                      <td
                        className="mo"
                        style={{ fontSize: 10, fontFamily: "var(--mono)", color: "var(--t2)" }}
                      >
                        {c.folio || "--"}
                      </td>
                      <td style={{ fontSize: 10, color: "var(--t2)" }}>
                        {c.proveedor || c.cliente || "—"}
                      </td>
                      <td style={{ fontSize: 11 }}>
                        <strong>{c.desc || "--"}</strong>
                      </td>
                      <td style={{ fontSize: 10, color: "var(--t2)" }}>{c.vendedor || "—"}</td>
                      <td
                        className="r"
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: 11,
                          fontWeight: 600,
                          color: "var(--danger)",
                        }}
                      >
                        − {fp(c.total || c.importe || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 6 }}>
                Estos cargos descuentan del efectivo VM a entregar al supervisor
              </div>
            </div>
          ) : null}
        </>
      )}

      <SectionTitle>Resumen del corte</SectionTitle>
      <div
        style={{
          background: "var(--s2)",
          border: "1px solid var(--b1)",
          borderRadius: "var(--r)",
          padding: ".85rem 1rem",
        }}
      >
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
        >
          {[
            ["Depósito bancario (efectivo facturado)", fp(totalEfFac), "var(--ok)"],
            ["Entrega supervisor (efectivo VM neto)", fp(netoEfVm), "var(--ok)"],
            ["Terminal TC + TD", fp(totalTerminal), "var(--text)"],
            ["Cobros de crédito del día", fp(ingresoCobranzas), "var(--ok)"],
            ["Transferencias", fp(totalTransf), "var(--text)"],
            ["Crédito Yantissimo", fp(totalCredYant), "var(--warn)"],
            ["Créditos institucionales", fp(totalCredInst), "var(--warn)"],
            ["Reposición caja chica", fp(cajaChica), "var(--t2)"],
            ["Cargos de contado (descuento ef. VM)", fp(totalCargosContado), "var(--danger)"],
          ].map(([lbl, val, col]) => (
            <div
              key={lbl}
              style={{
                background: "var(--s3)",
                borderRadius: 5,
                padding: "8px 10px",
              }}
            >
              <div style={{ fontSize: 10, color: "var(--t2)", marginBottom: 2 }}>{lbl}</div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 13,
                  fontWeight: 600,
                  color: col,
                }}
              >
                {val}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
