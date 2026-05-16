/**
 * Incidencias administrativas de documentos. Puerto de
 * `getIncidenciasDoc` + `esPLArticuloIncorrecto` + `corrBancoIncidencias`
 * del HTML (líneas 4057–4065, 5598–5772, 7082–7086).
 *
 * No maneja histórico de OV cerradas (ovHistComprasLoad) — se omite hasta
 * que exista persistencia en backend.
 */

import { parsearFoliosCompra, sufijosCompras, sufijosRecepciones } from "./foliosCompra";

export function esPLArticuloIncorrecto(v) {
  if (!v || !v.moEsp) return false;
  const plCat = v.moEsp.pl_sinIVA || 0;
  const plCap = v.precioLista || 0;
  if (plCat <= 0 || plCap <= 0) return false;
  const diff = Math.abs(plCap - plCat);
  const tol = Math.max(plCat * 0.05, 50);
  return diff > tol;
}

export function corrBancoIncidencias(correccionesBanco = []) {
  return correccionesBanco.filter(
    (c) => c.bancoNuevo !== c.bancoOrig || c.tipoNuevo !== c.tipoOrig,
  );
}

export function getIncidenciasDoc({ ventas = [], comprasIntegradas = [], recepciones = [] } = {}) {
  const foliosSufijos = sufijosCompras(comprasIntegradas);
  const sufijosRec = sufijosRecepciones(recepciones);

  const foliosVistos = new Set();
  const incPiezaSinCompra = [];
  const incCamposInc = [];

  ventas.forEach((v) => {
    if (v.tipoDoc !== "V") return;
    const folio = v.folio;
    if (foliosVistos.has(folio)) return;
    foliosVistos.add(folio);

    const faltaModelo = !v.modelo || !v.modelo.trim() || v.modelo.trim() === "-";
    const faltaPlaca = !v.placa || !v.placa.trim() || v.placa.trim() === "-";
    const faltaTipoCli = !v.tipoCli || !v.tipoCli.trim();
    const tienePiezas = ventas.some((a) => {
      if (a.folio !== folio) return false;
      if (a.esSrv || a.esLL || a.esMBVYN) return false;
      const lin = (a.lin || "").toUpperCase();
      if (
        lin === "CLUB YANTISSIMO" ||
        lin === "CLUB" ||
        lin === "VARIOS" ||
        lin === "PAQUETES" ||
        lin === "LLANTAS" ||
        lin === "AUTO Y CAMIONETA"
      )
        return false;
      const uMed = (a.uMed || "").toUpperCase();
      return uMed === "PIEZA" || uMed === "UNIDAD";
    });
    const faltaCompras = tienePiezas && (!v.folioCompraDoc || !v.folioCompraDoc.trim());
    if (faltaModelo || faltaPlaca || faltaTipoCli || faltaCompras) {
      const campos = [];
      if (faltaModelo) campos.push("Modelo auto");
      if (faltaPlaca) campos.push("Placa");
      if (faltaTipoCli) campos.push("Tipo cliente");
      if (faltaCompras) campos.push("Folio compra");
      incCamposInc.push({
        folio,
        cliente: v.cliente || "",
        fecha: v.fecha || "",
        vendedor: v.vendedor || "",
        campos,
      });
    }

    const tienePiezaReq = ventas.some((a) => {
      if (a.folio !== folio) return false;
      if (a.esSrv || a.esLL || a.esMBVYN) return false;
      const lin = (a.lin || "").toUpperCase();
      const uMed = (a.uMed || "").toUpperCase();
      const desc = (a.desc || "").toUpperCase();
      if (lin === "CLUB YANTISSIMO" || lin === "CLUB") return false;
      if (lin === "VARIOS") return false;
      if (lin === "PAQUETES") return false;
      if (lin === "LLANTAS" || lin === "AUTO Y CAMIONETA") return false;
      if (uMed === "SERVICIO" || (uMed === "PIEZA" && lin === "PAQUETES")) return false;
      if (desc.includes("GARANTIA") || desc.includes("CLUB YANTISSIMO")) return false;
      return uMed === "PIEZA" || uMed === "UNIDAD";
    });
    if (!tienePiezaReq) return;

    const parsed = parsearFoliosCompra(v.folioCompraDoc || "");
    if (parsed.vacio) {
      incPiezaSinCompra.push({
        folio,
        cliente: v.cliente || "",
        fecha: v.fecha || "",
        vendedor: v.vendedor || "",
        razon: "Sin folio de compra capturado",
        foliosVenta: [folio],
      });
      return;
    }

    const entradasCompra = parsed.entradas.filter((e) => e.tipo === "COMPRA" && e.sufijo != null);
    const entradasRec = parsed.entradas.filter((e) => e.tipo === "REC");
    const recSinSufijo = entradasRec.some((e) => e.sufijo == null);
    if (!entradasCompra.length && recSinSufijo && sufijosRec.size > 0) return;

    const recsSinMatch = entradasRec.filter((e) => e.sufijo != null && !sufijosRec.has(e.sufijo));
    const comprasSinMatch = entradasCompra.filter((e) => !foliosSufijos.has(e.sufijo));
    const algunaCompraMatch = entradasCompra.some((e) => foliosSufijos.has(e.sufijo));
    const algunaRecMatch = entradasRec.some((e) => e.sufijo != null && sufijosRec.has(e.sufijo));
    if (algunaCompraMatch || algunaRecMatch || (recSinSufijo && sufijosRec.size > 0)) return;

    const foliosCompraStr = v.folioCompraDoc || "";
    let razon = "Folio(s) no encontrados: " + foliosCompraStr;
    if (entradasRec.length > 0 && sufijosRec.size === 0) {
      razon = "Venta marca recepción pero no hay recepciones en el reporte: " + foliosCompraStr;
    } else if (recsSinMatch.length > 0 && comprasSinMatch.length === 0 && !entradasCompra.length) {
      razon = "Folio(s) de recepción no encontrados: " + foliosCompraStr;
    }
    incPiezaSinCompra.push({
      folio,
      cliente: v.cliente || "",
      fecha: v.fecha || "",
      vendedor: v.vendedor || "",
      razon,
      foliosCompra: foliosCompraStr,
      foliosVenta: [folio],
    });
  });

  const incPLIncorrecto = [];
  ventas.forEach((v) => {
    if (v.tipoDoc !== "V") return;
    if (!v.esSrv || v.esMBVYN || v.esRect) return;
    if (!esPLArticuloIncorrecto(v)) return;
    incPLIncorrecto.push({
      folio: v.folio,
      cliente: v.cliente || "",
      fecha: v.fecha || "",
      vendedor: v.vendedor || "",
      desc: v.desc || "",
      plCap: v.precioLista,
      plCat: v.moEsp.pl_sinIVA,
      uds: v.uds || 1,
      diff: v.precioLista - v.moEsp.pl_sinIVA,
    });
  });

  const incClubSinPlaca = [];
  const foliosClubSP = new Set();
  ventas.forEach((v) => {
    if (v.tipoDoc !== "V") return;
    const lin = (v.lin || "").toUpperCase();
    const esClubArt =
      lin === "CLUB YANTISSIMO" ||
      lin === "CLUB" ||
      (v.desc || "").toUpperCase().includes("CLUB YANTIS");
    if (!esClubArt) return;
    if (foliosClubSP.has(v.folio)) return;
    const placaOk = v.placa && v.placa.trim() && v.placa.trim() !== "-" && v.placa.trim() !== "—";
    if (placaOk) return;
    foliosClubSP.add(v.folio);
    incClubSinPlaca.push({
      folio: v.folio,
      cliente: v.cliente || "",
      tel: v.tel || "",
      fecha: v.fecha || "",
      vendedor: v.vendedor || "",
    });
  });

  return { incPiezaSinCompra, incCamposInc, incPLIncorrecto, incClubSinPlaca };
}
