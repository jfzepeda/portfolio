"use client";
import { useMemo } from "react";
import { useAuditoria } from "../state/AuditoriaContext";
import StatusBanner from "../components/StatusBanner";
import { getIncidenciasDoc, corrBancoIncidencias } from "../lib/calc/adminIncidencias";
import { fp } from "../lib/utils/format";

/**
 * Puerto de `renderAdmin()` (HTML 5774–5952).
 *
 * Incluye:
 *   - Montajes sin técnico asignado (renglón 00 MBVYN con técnico no-T).
 *   - Correcciones manuales de tipo de cobro (banco / tipo / plazo).
 *   - Documentos con campos incompletos.
 *   - Piezas sin compra relacionada válida.
 *   - Servicios MO con PL distinto al catálogo.
 *   - Club Yantissimo sin placa.
 *   - Convenios MO confirmados por gerente sin capturar tipo cliente.
 */
export default function AdministrativasPanel() {
  const { resultado, correccionesBanco, conveniosAdminLL } = useAuditoria();

  const ventas = useMemo(() => resultado?.ventas ?? [], [resultado]);
  const comprasIntegradas = useMemo(() => resultado?.comprasIntegradas ?? [], [resultado]);
  const recepciones = useMemo(() => resultado?.recepciones ?? [], [resultado]);

  const sinTec = useMemo(() => ventas.filter((v) => v.sinTecnico), [ventas]);
  const incs = useMemo(
    () => getIncidenciasDoc({ ventas, comprasIntegradas, recepciones }),
    [ventas, comprasIntegradas, recepciones],
  );
  const corrInc = useMemo(() => corrBancoIncidencias(correccionesBanco), [correccionesBanco]);
  const corrPlazo = useMemo(
    () =>
      correccionesBanco.filter(
        (c) => c.bancoNuevo === c.bancoOrig && c.tipoNuevo === c.tipoOrig,
      ),
    [correccionesBanco],
  );

  const { incCamposInc, incPiezaSinCompra, incPLIncorrecto, incClubSinPlaca } = incs;

  const total =
    sinTec.length +
    corrInc.length +
    conveniosAdminLL.length +
    incCamposInc.length +
    incPiezaSinCompra.length +
    incPLIncorrecto.length +
    incClubSinPlaca.length;

  const nMO = conveniosAdminLL.filter((c) => c.tipo === "MO").length;
  const nLL = conveniosAdminLL.length - nMO;
  const descTipoConv = [nMO ? `${nMO} servicio MO` : "", nLL ? `${nLL} llanta` : ""]
    .filter(Boolean)
    .join(" · ");
  const totalMontoRech = conveniosAdminLL.reduce((s, c) => s + (c.monto || 0), 0);

  if (!total) {
    return (
      <StatusBanner variant="ok">
        <span style={{ fontSize: 18 }}>✓</span>
        <div>
          <p>100% Aprobado · Sin incidencias administrativas</p>
          <small>Todos los documentos correctamente capturados</small>
        </div>
      </StatusBanner>
    );
  }

  return (
    <div>
      {sinTec.length ? (
        <>
          <div className="warn-banner" style={{ marginBottom: 10 }}>
            ⚠ {sinTec.length} montaje{sinTec.length !== 1 ? "s" : ""} sin técnico asignado · El
            renglón 00 debe estar asignado a un técnico (T)
          </div>
          <div className="tw-brd" style={{ marginBottom: 14 }}>
            <table className="st">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Folio / Cliente</th>
                  <th>Artículo</th>
                  <th>Vendedor registrado</th>
                  <th>Debe ser técnico</th>
                </tr>
              </thead>
              <tbody>
                {sinTec.map((v, i) => (
                  <tr key={(v.folio || "") + i} className="rc">
                    <td style={{ fontSize: 9, color: "var(--t2)", fontWeight: 500 }}>
                      {v.fecha || "—"}
                    </td>
                    <td style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--t2)" }}>
                      {v.folio || "—"}
                      {v.cliente ? (
                        <>
                          <br />
                          <span style={{ fontSize: 9, fontFamily: "var(--sans)" }}>
                            {v.cliente}
                          </span>
                        </>
                      ) : null}
                    </td>
                    <td style={{ fontSize: 10 }}>
                      <strong>{v.desc || "—"}</strong>
                    </td>
                    <td style={{ fontSize: 10, color: "var(--danger)" }}>{v.vendedor || "—"}</td>
                    <td style={{ fontSize: 10, color: "var(--danger)" }}>
                      {v.tecnico || "—"}{" "}
                      <span style={{ fontSize: 8, color: "var(--t3)" }}>(no inicia con T)</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}

      {corrInc.length ? (
        <>
          <div className="warn-banner" style={{ marginBottom: 10 }}>
            ⚠ {corrInc.length} corrección{corrInc.length !== 1 ? "es" : ""} de tipo de cobro ·
            Error al seleccionar terminal en Microsip
          </div>
          <div className="tw-brd" style={{ marginBottom: 14 }}>
            <table className="st">
              <thead>
                <tr>
                  <th>Folio / Cliente</th>
                  <th>Vendedor</th>
                  <th>Terminal original</th>
                  <th>Corregido a</th>
                </tr>
              </thead>
              <tbody>
                {corrInc.map((c, i) => {
                  const plazoLbl =
                    c.plazo === "6m" ? " · 6M" : c.plazo === "12m" ? " · 12M" : " · 1 Exh";
                  const bancoCambio = c.bancoNuevo !== c.bancoOrig;
                  const tipoCambio = c.tipoNuevo !== c.tipoOrig;
                  return (
                    <tr key={(c.folio || "") + i} className="rw">
                      <td style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--t2)" }}>
                        {c.folio}
                        <br />
                        <span style={{ fontSize: 9, fontFamily: "var(--sans)", color: "var(--t2)" }}>
                          {c.cliente}
                        </span>
                      </td>
                      <td style={{ fontSize: 10, color: "var(--danger)" }}>{c.vendedor}</td>
                      <td style={{ fontSize: 10 }}>
                        {c.bancoOrig} · {c.tipoOrig}
                      </td>
                      <td style={{ fontSize: 10, fontWeight: 600, color: "var(--ok)" }}>
                        {c.bancoNuevo} · {c.tipoNuevo}
                        {plazoLbl}
                        <br />
                        {bancoCambio ? (
                          <span style={{ color: "var(--danger)", fontSize: 8 }}>banco </span>
                        ) : null}
                        {tipoCambio ? (
                          <span style={{ color: "var(--danger)", fontSize: 8 }}>tipo </span>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : null}

      {corrPlazo.length ? (
        <div
          style={{
            marginBottom: 10,
            padding: "8px 12px",
            borderRadius: 6,
            background: "rgba(99,102,241,.06)",
            border: "1px solid rgba(99,102,241,.2)",
            fontSize: 10,
            color: "var(--t2)",
          }}
        >
          📄 {corrPlazo.length} cambio{corrPlazo.length !== 1 ? "s" : ""} de plazo únicamente (sin
          incidencia) ·{" "}
          {corrPlazo
            .map((c) => {
              const lbl = c.plazo === "6m" ? "6M" : c.plazo === "12m" ? "12M" : "1 Exh";
              return `${c.folio} → ${lbl}`;
            })
            .join(" · ")}
        </div>
      ) : null}

      {conveniosAdminLL.length ? (
        <>
          <div
            className="warn-banner"
            style={{
              marginBottom: 10,
              borderColor: "rgba(var(--warn-rgb),.4)",
              background: "rgba(var(--warn-rgb),.06)",
            }}
          >
            🏷 {conveniosAdminLL.length} convenio{conveniosAdminLL.length !== 1 ? "s" : ""}{" "}
            confirmados por gerente sin capturar · {descTipoConv} · Tipo de cliente no capturado
            por vendedor
            {totalMontoRech > 0 ? (
              <span
                style={{
                  display: "inline-block",
                  marginLeft: 8,
                  fontSize: 10,
                  padding: "2px 7px",
                  borderRadius: 3,
                  background: "rgba(var(--danger-rgb),.15)",
                  color: "var(--danger)",
                  fontWeight: 700,
                }}
              >
                ⚠ {fp(totalMontoRech)} de cargo si admin rechaza
              </span>
            ) : null}
          </div>
          <div
            className="tw-brd"
            style={{ marginBottom: 14, borderColor: "rgba(var(--warn-rgb),.2)" }}
          >
            <table className="st">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Folio / Cliente</th>
                  <th>Descripción</th>
                  <th>Tipo</th>
                  <th>Vendedor</th>
                  <th>Dto %</th>
                  <th className="r">Monto si rechazan</th>
                  <th>Acción requerida</th>
                </tr>
              </thead>
              <tbody>
                {conveniosAdminLL.map((c, i) => (
                  <tr key={(c.folio || "") + i} className="rw">
                    <td style={{ fontSize: 9, color: "var(--t2)" }}>{c.fecha}</td>
                    <td style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--t2)" }}>
                      {c.folio}
                      <br />
                      <span style={{ fontFamily: "var(--sans)", fontSize: 9 }}>{c.cliente}</span>
                    </td>
                    <td style={{ fontSize: 10 }}>
                      <strong>{c.desc}</strong>
                    </td>
                    <td>
                      <span
                        className={c.tipo === "MO" ? "b bo" : "b bi"}
                        style={{ fontSize: 8 }}
                      >
                        {c.tipo === "MO" ? "MO" : "Llanta"}
                      </span>
                    </td>
                    <td style={{ fontSize: 10, color: "var(--danger)", fontWeight: 600 }}>
                      {c.vendedor}
                    </td>
                    <td style={{ fontSize: 10, fontWeight: 600, color: "var(--warn)" }}>
                      {c.dscto}%
                    </td>
                    <td className="r">
                      {c.monto > 0 ? (
                        <>
                          <span
                            style={{
                              fontFamily: "var(--mono)",
                              fontWeight: 700,
                              color: "var(--warn)",
                            }}
                          >
                            {fp(c.monto)}
                          </span>
                          {c.uds > 1 ? (
                            <>
                              <br />
                              <span style={{ fontSize: 8, color: "var(--t3)" }}>{c.uds} uds</span>
                            </>
                          ) : null}
                        </>
                      ) : (
                        <span style={{ color: "var(--t3)" }}>—</span>
                      )}
                    </td>
                    <td style={{ fontSize: 9, color: "var(--t2)" }}>
                      Capturar TIPO_CLI=CONVENIO en Microsip · Verificar contrato
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}

      {incCamposInc.length ? (
        <>
          <div
            className="warn-banner"
            style={{
              marginBottom: 10,
              borderColor: "rgba(var(--danger-rgb),.4)",
              background: "rgba(var(--danger-rgb),.06)",
            }}
          >
            📋 {incCamposInc.length} documento{incCamposInc.length !== 1 ? "s" : ""} con campos
            incompletos (modelo, placa o tipo de cliente)
          </div>
          <div className="tw-brd" style={{ marginBottom: 14 }}>
            <table className="st">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Folio / Cliente</th>
                  <th>Vendedor</th>
                  <th>Campos faltantes</th>
                </tr>
              </thead>
              <tbody>
                {incCamposInc.map((inc, i) => (
                  <tr key={(inc.folio || "") + i} className="rc">
                    <td style={{ fontSize: 9, color: "var(--t2)" }}>{inc.fecha || "—"}</td>
                    <td style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--t2)" }}>
                      {inc.folio}
                      <br />
                      <span style={{ fontFamily: "var(--sans)", fontSize: 9 }}>{inc.cliente}</span>
                    </td>
                    <td style={{ fontSize: 10, color: "var(--danger)" }}>{inc.vendedor}</td>
                    <td>
                      {inc.campos.map((c, j) => (
                        <span
                          key={j}
                          className="b bc"
                          style={{ fontSize: 9, marginRight: 3 }}
                        >
                          {c}
                        </span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}

      {incPiezaSinCompra.length ? (
        <>
          <div
            className="warn-banner"
            style={{
              marginBottom: 10,
              borderColor: "rgba(var(--warn-rgb),.4)",
              background: "rgba(var(--warn-rgb),.06)",
            }}
          >
            📦 {incPiezaSinCompra.length} documento{incPiezaSinCompra.length !== 1 ? "s" : ""} con
            piezas sin compra relacionada válida
          </div>
          <div
            className="tw-brd"
            style={{ marginBottom: 14, borderColor: "rgba(var(--warn-rgb),.2)" }}
          >
            <table className="st">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Folio venta / Cliente</th>
                  <th>Vendedor</th>
                  <th>Folio(s) compra capturado</th>
                  <th>Observación</th>
                </tr>
              </thead>
              <tbody>
                {incPiezaSinCompra.map((inc, i) => (
                  <tr key={(inc.folio || "") + i} className="rw">
                    <td style={{ fontSize: 9, color: "var(--t2)", whiteSpace: "nowrap" }}>
                      {inc.fecha || "—"}
                    </td>
                    <td style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--t2)" }}>
                      {inc.folio}
                      <br />
                      <span style={{ fontFamily: "var(--sans)", fontSize: 9 }}>{inc.cliente}</span>
                    </td>
                    <td style={{ fontSize: 10, color: "var(--warn)" }}>{inc.vendedor}</td>
                    <td style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--t3)" }}>
                      {inc.foliosCompra || "—"}
                    </td>
                    <td style={{ fontSize: 9, color: "var(--t2)" }}>{inc.razon}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}

      {incPLIncorrecto.length ? (
        <>
          <div
            className="warn-banner"
            style={{
              marginBottom: 10,
              borderColor: "rgba(var(--danger-rgb),.4)",
              background: "rgba(var(--danger-rgb),.06)",
            }}
          >
            📝 {incPLIncorrecto.length} servicio{incPLIncorrecto.length !== 1 ? "s" : ""} MO con PL
            capturado diferente al catálogo · artículo posiblemente mal capturado por el vendedor
          </div>
          <div
            className="tw-brd"
            style={{ marginBottom: 14, borderColor: "rgba(var(--danger-rgb),.2)" }}
          >
            <table className="st">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Folio / Cliente</th>
                  <th>Descripción</th>
                  <th>Vendedor</th>
                  <th className="r">PL capturado</th>
                  <th className="r">PL catálogo</th>
                  <th className="r">Uds</th>
                  <th style={{ width: 150 }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {incPLIncorrecto.map((inc, i) => {
                  const infl = inc.diff > 0;
                  const diffCol = infl ? "var(--danger)" : "var(--warn)";
                  const diffLbl = infl ? "INFLADO" : "BAJO";
                  return (
                    <tr key={(inc.folio || "") + i} className="rc">
                      <td style={{ fontSize: 9, color: "var(--t2)", whiteSpace: "nowrap" }}>
                        {inc.fecha || "—"}
                      </td>
                      <td style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--t2)" }}>
                        {inc.folio}
                        <br />
                        <span style={{ fontFamily: "var(--sans)", fontSize: 9 }}>
                          {inc.cliente}
                        </span>
                      </td>
                      <td style={{ fontSize: 10 }}>
                        <strong>{inc.desc}</strong>
                      </td>
                      <td style={{ fontSize: 10, color: "var(--danger)", fontWeight: 600 }}>
                        {inc.vendedor}
                      </td>
                      <td
                        className="r"
                        style={{ fontFamily: "var(--mono)", color: diffCol, fontWeight: 700 }}
                      >
                        {fp(inc.plCap)}
                        <br />
                        <span style={{ fontSize: 8 }}>{diffLbl}</span>
                      </td>
                      <td
                        className="r"
                        style={{ fontFamily: "var(--mono)", color: "var(--t2)" }}
                      >
                        {fp(inc.plCat)}
                      </td>
                      <td className="r" style={{ color: "var(--t2)" }}>
                        {inc.uds}
                      </td>
                      <td style={{ fontSize: 9, color: "var(--t2)" }}>
                        Verificar artículo correcto y corregir en Microsip
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : null}

      {incClubSinPlaca.length ? (
        <>
          <div
            className="warn-banner"
            style={{
              marginBottom: 10,
              borderColor: "rgba(var(--plum-rgb),.4)",
              background: "rgba(var(--plum-rgb),.08)",
              color: "#c4b5fd",
            }}
          >
            🏁 {incClubSinPlaca.length} folio{incClubSinPlaca.length !== 1 ? "s" : ""} con venta
            Club Yantissimo sin placa capturada · el Club es por vehículo, la placa es obligatoria
          </div>
          <div
            className="tw-brd"
            style={{ marginBottom: 14, borderColor: "rgba(var(--plum-rgb),.25)" }}
          >
            <table className="st">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Folio</th>
                  <th>Cliente</th>
                  <th>Teléfono</th>
                  <th>Vendedor</th>
                  <th style={{ width: 180 }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {incClubSinPlaca.map((inc, i) => (
                  <tr key={(inc.folio || "") + i} className="rc">
                    <td style={{ fontSize: 9, color: "var(--t2)", whiteSpace: "nowrap" }}>
                      {inc.fecha || "—"}
                    </td>
                    <td style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--t2)" }}>
                      {inc.folio}
                    </td>
                    <td style={{ fontSize: 10 }}>{inc.cliente || "—"}</td>
                    <td style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--t2)" }}>
                      {inc.tel || "—"}
                    </td>
                    <td style={{ fontSize: 10, color: "var(--danger)", fontWeight: 600 }}>
                      {inc.vendedor || "—"}
                    </td>
                    <td style={{ fontSize: 9, color: "var(--t2)" }}>
                      Capturar placa en Microsip y agregar al catálogo Club
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
}
