/**
 * Parser del Excel "Auditoría (Reporte Integrado)".
 * Puerto 1:1 del HTML (función `parseAuditoria`, líneas 2493–3095).
 * Sin mutación de globales: todo lo que antes era estado de módulo se retorna.
 */
import { rxl, gc } from "../utils/cells";
import { exD, nm } from "../utils/format";
import { mapL, LINEAS_ORD_PROD, LINEAS_ORD_TEC } from "../catalog/lineas";
import { clubEsMiembro, clubRegistrar, clubNormPlaca } from "../catalog/club";
import {
  moGetEsperado,
  lcfgGetFactor,
  LINEAS_CFG_DEF,
  MO_CFG,
  especGetCategoria,
} from "../catalog/mo";

function normSuc(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/Ñ/gi, "N")
    .toUpperCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * @param {File} file — archivo Excel
 * @param {string} sucursalActiva — p.ej. "CONSTITUCION"
 */
export async function parseAuditoria(file, sucursalActiva) {
  const rd = await rxl(file);
  return parseAuditoriaRd(rd, sucursalActiva);
}

export function parseAuditoriaRd(rd, sucursalActiva) {
  const rows = Object.keys(rd).map(Number).sort((a, b) => a - b);
  const SUC_ACT_N = normSuc(sucursalActiva);
  const matchSuc = (s) => normSuc(s) === SUC_ACT_N;

  const esFormatoNuevo = rows.some((rn) => {
    const v = gc(rd, rn, "A");
    return v && String(v).trim().toUpperCase() === "VENTAS/ORD VTA";
  });

  const ventasOut = [];
  const ovOut = [];
  const cobranzasOut = [];
  const cargosCPOut = [];
  const comprasIntOut = [];
  const recepcionesOut = [];
  const vendMap = {};
  const tecMap = {};
  const foliosUnicos = new Set();
  const foliosPorVend = {};
  const foliosPorTec = {};
  const lineasPorTec = {};
  const lineasPorVend = {};
  const foliosClub = new Map();
  const foliosLlantas = new Map();
  let fechaDoc = "";
  const diasCubiertosSet = new Set();

  // ── PRE-PASADA: detectar Club y llantas por folio ───────────────────────────
  {
    let preDoc = null;
    for (const rn of rows) {
      const A = gc(rd, rn, "A");
      const E = gc(rd, rn, "E");
      const F = gc(rd, rn, "F");
      const aNum = parseFloat(A);
      const fT = F ? F.trim().toUpperCase() : "";
      const esDocRow =
        A &&
        !Number.isNaN(aNum) &&
        aNum > 40000 &&
        E &&
        E.length > 2 &&
        (fT === "V" || fT === "O" || fT === "ORDEN VTA" || fT === "F");
      if (esDocRow) {
        const folioVenta = (gc(rd, rn, "C") && gc(rd, rn, "C").trim()) || "";
        const folioOV = (gc(rd, rn, "B") && gc(rd, rn, "B").trim()) || "";
        const folio =
          folioVenta ||
          (preDoc && folioOV && preDoc.folioOV === folioOV ? preDoc.folio : "") ||
          folioOV ||
          "";
        const suc = E.trim().toUpperCase();
        preDoc = {
          folio,
          folioOV,
          activo: suc === SUC_ACT_N,
          cliente: gc(rd, rn, "H") ? gc(rd, rn, "H").trim() : "",
          tel: gc(rd, rn, "I") ? String(gc(rd, rn, "I")).trim() : "",
          placa: gc(rd, rn, "L") ? String(gc(rd, rn, "L")).trim() : "",
        };
        continue;
      }
      if (!preDoc || !preDoc.activo || !preDoc.folio) continue;
      const B = gc(rd, rn, "B");
      const E2 = gc(rd, rn, "E");
      const G = gc(rd, rn, "G");
      if (!B || nm(B) === "ARTICULO") continue;
      const lin2 = mapL(E2 ? E2.trim() : "");
      const bNorm = nm(B);
      const esClubRow =
        lin2 === "CLUB YANTISSIMO" || bNorm.includes("CLUB") || bNorm.includes("YANTIS");
      if (esClubRow) {
        foliosClub.set(preDoc.folio, {
          cliente: preDoc.cliente,
          tel: preDoc.tel,
          placa: preDoc.placa,
        });
      }
      if (lin2 === "LLANTAS") {
        const uds = parseFloat(G) || 0;
        foliosLlantas.set(preDoc.folio, (foliosLlantas.get(preDoc.folio) || 0) + uds);
      }
    }
  }

  let docActual = null;

  for (const rn of rows) {
    const A = gc(rd, rn, "A");
    const B = gc(rd, rn, "B");
    const C = gc(rd, rn, "C");
    const E = gc(rd, rn, "E");
    const F = gc(rd, rn, "F");
    const G = gc(rd, rn, "G");
    const H = gc(rd, rn, "H");
    const I = gc(rd, rn, "I");
    const K = gc(rd, rn, "K");
    const L = gc(rd, rn, "L");
    const M_col = gc(rd, rn, "M");
    const N = gc(rd, rn, "N");
    const O = gc(rd, rn, "O");
    const Q = gc(rd, rn, "Q");

    const aNum = parseFloat(A);
    const fTrim = F ? F.trim().toUpperCase() : "";
    const esDocVenta = fTrim === "V" || fTrim === "F";
    const esDocOV = fTrim === "ORDEN VTA" || fTrim === "O";
    const esDocCompra = fTrim === "COMPRA" || fTrim === "C";
    const esDocCobro = fTrim === "COBRO";
    const esDocCargo = fTrim === "CARGO" || fTrim === "CARGOS_CP" || fTrim === "CARGO_CP";
    const esDocRecepcion = fTrim === "RECEPCION" || fTrim === "RECEPCIÓN";
    const esDocDevolucion =
      fTrim === "DEVOLUCION" || fTrim === "DEVOLUCIÓN" || fTrim === "DEV";
    const esDocOtro = esDocRecepcion || esDocDevolucion;
    const aEsFecha =
      A && ((!Number.isNaN(aNum) && aNum > 40000) || /^\d{2}\/\d{2}\/\d{4}$/.test(String(A).trim()));
    const esDocRow =
      aEsFecha &&
      E &&
      E.length > 2 &&
      (esDocVenta || esDocOV || esDocCompra || esDocCobro || esDocCargo || esDocOtro);

    if (esDocRow) {
      const folioVenta = (C && C.trim()) || "";
      const folioOV = (B && B.trim()) || "";
      const folioVentaFinal =
        folioVenta ||
        (docActual && folioOV && docActual.folioOV === folioOV ? docActual.folio : "") ||
        folioOV ||
        "";
      const folio = folioVentaFinal;
      const sucursal = E.trim().toUpperCase();
      const tipoDoc = fTrim;
      const estatus = G
        ? G.trim().toUpperCase()
        : docActual && docActual.folioOV === folioOV
        ? docActual.estatus
        : "N";

      const _rawD = gc(rd, rn, "D");
      const folioFactura =
        _rawD &&
        String(_rawD).trim() &&
        String(_rawD).trim() !== folioOV &&
        String(_rawD).trim() !== folioVenta
          ? String(_rawD).trim()
          : "";
      const esFactura = folioFactura !== "";

      if (!fechaDoc && matchSuc(sucursal)) fechaDoc = exD(A);
      if (matchSuc(sucursal)) {
        const fDoc = exD(A);
        if (fDoc) diasCubiertosSet.add(fDoc);
      }

      const _totalVenta = esFormatoNuevo
        ? parseFloat(gc(rd, rn, "O")) || 0
        : parseFloat(L) || 0;
      const _formaCobro = esFormatoNuevo ? gc(rd, rn, "Q") || "" : N || "";
      const _importeRaw = esFormatoNuevo
        ? String(gc(rd, rn, "R") || "0")
        : String(O || "0");
      const _vendedor = esFormatoNuevo ? gc(rd, rn, "T") || "" : Q || "";
      const _condPago = esFormatoNuevo ? String(gc(rd, rn, "Q") || "") : "";
      const _tipoCli = esFormatoNuevo
        ? String(gc(rd, rn, "N") || "").trim().toUpperCase()
        : "";
      docActual = {
        folio,
        folioOV,
        sucursal,
        tipoDoc,
        estatus,
        folioFactura,
        esFactura,
        fecha: exD(A),
        cliente: H ? H.trim() : "",
        tel: I ? String(I).trim() : "",
        modelo: K ? K.trim() : "",
        placa: esFormatoNuevo ? (L ? String(L).trim() : "") : "",
        folioCompraDoc: esFormatoNuevo ? (M_col ? String(M_col).trim() : "") : "",
        totalVenta: _totalVenta,
        formaCobro: _formaCobro.trim(),
        importeRaw: _importeRaw.trim(),
        vendedor: _vendedor.trim(),
        condPago: _condPago.trim(),
        tipoCli: _tipoCli,
        esConvenioDoc: _tipoCli === "CONVENIO",
        esDocCompra,
        esDocCobro,
        esDocCargo,
        esDocOtro,
        esDocRecepcion,
        activo: matchSuc(sucursal),
      };
      if (esDocRecepcion && matchSuc(sucursal)) {
        if (folio && !recepcionesOut.some((r) => r.folio === folio)) {
          recepcionesOut.push({
            folio,
            folioOV,
            fecha: exD(A),
            proveedor: H ? H.trim() : "",
            estatus,
          });
        }
      }
      if (esDocCobro && matchSuc(sucursal)) {
        const rcoFolio = (gc(rd, rn, "D") || "").trim() || folio;
        const cavFolio = (gc(rd, rn, "B") || "").trim() || "";
        const importeNum =
          parseFloat(String(_importeRaw).replace(/[^0-9.]/g, "")) || _totalVenta || 0;
        if (!cobranzasOut.some((c) => c.folio === rcoFolio)) {
          cobranzasOut.push({
            folio: rcoFolio,
            folioVenta: cavFolio,
            folioOrig: cavFolio,
            fecha: exD(A),
            cliente: H ? H.trim() : "",
            formaCobro: _formaCobro.trim(),
            importeRaw: _importeRaw.trim(),
            total: importeNum,
            vendedor: _vendedor.trim(),
          });
        }
      }
      continue;
    }

    const esHeaderRow =
      nm(B) === "ARTICULO" || nm(A) === "FECHA" || nm(A) === "CLAVE_ARTICULO";
    if (esHeaderRow) continue;
    if (!B || !B.trim()) continue;
    if (!docActual || !docActual.activo) continue;

    const clave = A ? String(A).trim() : "";
    const desc = B.trim();
    const linea_raw = E ? E.trim() : "";
    const uMed = F ? F.trim().toUpperCase() : "";
    const uds = parseFloat(G) || 0;
    const costoImp = parseFloat(H) || 0;
    const ultCosto = esFormatoNuevo ? parseFloat(gc(rd, rn, "M")) || 0 : 0;
    const costo = costoImp;
    const precioLista = parseFloat(gc(rd, rn, "J")) || 0;
    const dscto = parseFloat(K) || 0;
    const utilidad = esFormatoNuevo
      ? parseFloat(gc(rd, rn, "N")) || 0
      : parseFloat(gc(rd, rn, "L")) || 0;
    const tecnico = esFormatoNuevo
      ? (gc(rd, rn, "P") || "").trim()
      : N
      ? N.trim()
      : "";

    const ventaCobradaU = precioLista * (1 - dscto / 100);
    const venta = ventaCobradaU * uds;
    const margenPct = venta > 0 ? (utilidad / venta) * 100 : null;

    const lin = mapL(linea_raw);
    const esSrv = uMed === "SERVICIO";
    const esRect = nm(desc).includes("RECTIFICADO");
    const esMBVYN = nm(desc).includes("MONTAJE") && nm(desc).includes("BALANCEO");
    const esClub = lin === "CLUB YANTISSIMO";
    const esLL = lin === "LLANTAS";

    const costoU_ref =
      esLL && ultCosto > 0 ? ultCosto : uds > 0 ? costoImp / uds : costoImp;

    const cuentaConv = (esSrv || esClub) && !esRect && !esMBVYN ? 1 : 0;

    let alerta = null;
    let enPromo = false;
    let factorUsado = 30;
    if (!esLL && !esRect && !esMBVYN && !esClub && !esSrv) {
      const costoU = costoU_ref > 0 ? costoU_ref : uds > 0 ? costo / uds : costo;
      const factor = lcfgGetFactor(lin);
      factorUsado = factor;
      const margenReal =
        costoU > 0 && ventaCobradaU > 0
          ? ((ventaCobradaU - costoU) / ventaCobradaU) * 100
          : margenPct;
      if (margenReal !== null && margenReal < 0) alerta = "critica";
      else if (
        costoU > 0 &&
        ((ventaCobradaU - costoU) / ventaCobradaU) * 100 < factor - 2
      )
        alerta = "baja";
      const lcPromo = LINEAS_CFG_DEF.find((c) => c.k === lin);
      if (!alerta && lcPromo && lcPromo.promoActiva && (lcPromo.margenPiezas || 30) < 30 && costoU > 0)
        enPromo = true;
    }

    let moAlerta = null;
    let moEsp = null;
    const esEspecialV = especGetCategoria(docActual.cliente, docActual.tel);
    const llantasFolioV = foliosLlantas.get(docActual.folio) || 0;
    const esConvenioDoc = docActual.esConvenioDoc || false;
    const posibleConvenio = esConvenioDoc;

    const _descNormMO = nm(desc);
    const esRotacionClub =
      _descNormMO.includes("ROTAC") && _descNormMO.includes("CLUB");
    if (
      esRotacionClub &&
      !foliosClub.has(docActual.folio) &&
      !clubEsMiembro(docActual.cliente, docActual.tel, docActual.placa)
    ) {
      docActual._posibleNuevoClub = true;
    }
    if (esSrv && !esMBVYN && !esRect && !esClub && !esRotacionClub && precioLista > 0) {
      const esClienteClub =
        foliosClub.has(docActual.folio) ||
        clubEsMiembro(docActual.cliente, docActual.tel, docActual.placa);
      const llantasFolio = llantasFolioV;
      const moe = moGetEsperado(desc, lin, posibleConvenio, esClienteClub, esEspecialV, llantasFolio);
      if (moe) {
        const plBajo = moe.pl_sinIVA !== null && precioLista < moe.pl_sinIVA * 0.98;
        const dtoBajo = dscto > moe.dtoMax + 0.5;
        const convenioJustificado = esConvenioDoc && !plBajo && !dtoBajo;
        if (convenioJustificado) {
          // no incidencia
        } else if (dtoBajo && !plBajo) {
          const dtoMaxConvClub = MO_CFG.convenio + MO_CFG.club;
          const dtoMaxPromoClub = moe.dtoMax + MO_CFG.club;
          const cabe_convenio_club = !esConvenioDoc && dscto <= dtoMaxConvClub + 0.5;
          const cabe_promo_club = !esClienteClub && dscto <= dtoMaxPromoClub + 0.5;
          if (cabe_convenio_club && cabe_promo_club && !esClienteClub) moAlerta = "posibleAmbos";
          else if (cabe_convenio_club) moAlerta = "posibleConvenio";
          else if (cabe_promo_club) moAlerta = "posibleClub";
          else moAlerta = "dto";
        } else if (plBajo) {
          moAlerta = dtoBajo ? "ambos" : "pl";
        }
        moEsp = {
          ...moe,
          pl: precioLista,
          precioBase: precioLista * (1 - moe.dtoMax / 100),
          plBajo,
          dtoBajo,
        };
      }
    }

    if ((docActual.tipoDoc === "O" || docActual.tipoDoc === "ORDEN VTA") && docActual.estatus !== "N") {
      ovOut.push({
        folio: docActual.folio,
        cliente: docActual.cliente,
        modelo: docActual.modelo,
        vendedor: docActual.vendedor,
        fecha: docActual.fecha || "",
        importe: docActual.totalVenta,
        folioCompraDoc: docActual.folioCompraDoc || "",
        desc,
        linea_raw,
        uds,
        total: parseFloat(gc(rd, rn, "O")) || 0,
      });
      continue;
    }

    if (docActual.esDocOtro) continue;

    if (docActual.esDocCompra) {
      if (desc && uds) {
        const esContado = /contado/i.test(docActual.condPago);
        comprasIntOut.push({
          folio: docActual.folio,
          fecha: docActual.fecha,
          prov: docActual.cliente,
          art: desc,
          artNorm: nm(desc),
          linea_raw,
          uds,
          importe: costoImp,
          ultCosto,
          total: parseFloat(gc(rd, rn, "O")) || 0,
          condPago: docActual.condPago,
          esContado,
        });
      }
      continue;
    }
    if (docActual.esDocCobro) {
      if (!cobranzasOut.some((c) => c.folio === docActual.folio)) {
        cobranzasOut.push({
          folio: gc(rd, rn, "D") || docActual.folio,
          folioVenta: docActual.folioOV || docActual.folio,
          folioOrig: docActual.folioOV || "",
          fecha: docActual.fecha,
          cliente: docActual.cliente,
          formaCobro: docActual.formaCobro,
          importeRaw: docActual.importeRaw,
          total:
            parseFloat(String(docActual.importeRaw).replace(/[^0-9.]/g, "")) ||
            docActual.totalVenta,
          vendedor: docActual.vendedor,
        });
      }
      continue;
    }
    if (docActual.esDocCargo) {
      if (docActual.sucursal && matchSuc(docActual.sucursal) && desc) {
        const _totalCargo =
          parseFloat(gc(rd, rn, "O")) ||
          parseFloat(gc(rd, rn, "L")) ||
          costoImp ||
          docActual.totalVenta ||
          0;
        let _prov = docActual.cliente || "";
        if (!_prov) {
          _prov = (gc(rd, rn, "C") || gc(rd, rn, "D") || gc(rd, rn, "I") || "").trim();
        }
        cargosCPOut.push({
          folio: docActual.folio,
          fecha: docActual.fecha,
          desc,
          proveedor: _prov,
          cliente: docActual.cliente || "",
          importe: _totalCargo,
          total: _totalCargo,
          vendedor: docActual.vendedor || "",
          condPago: (docActual.condPago || "").toUpperCase(),
        });
      }
      continue;
    }
    if (!((docActual.tipoDoc === "V" || docActual.tipoDoc === "F") && docActual.estatus === "N"))
      continue;

    const vend = docActual.vendedor;
    const esTec = tecnico && tecnico.trim().toUpperCase().startsWith("T ");

    if (vend) {
      if (!vendMap[vend]) vendMap[vend] = { nombre: vend, lineas: {} };
      const vl = vendMap[vend].lineas;
      if (!vl[lin]) vl[lin] = { uds: 0, margen: 0 };
      if (esLL) vl[lin].uds += uds;
      else if (esClub) vl[lin].uds += uds;
      else if (esSrv && !esMBVYN && !esRect) vl[lin].uds += uds;
      if (!esMBVYN) vl[lin].margen += utilidad;
    }

    if (esTec && esSrv && !esMBVYN) {
      if (!tecMap[tecnico]) tecMap[tecnico] = { nombre: tecnico, lineas: {} };
      const tl = tecMap[tecnico].lineas;
      if (!tl[lin]) tl[lin] = { uds: 0, margen: 0 };
      tl[lin].uds += uds;
      tl[lin].margen += utilidad;
      if (!foliosPorTec[tecnico]) foliosPorTec[tecnico] = new Set();
      if (!lineasPorTec[tecnico]) lineasPorTec[tecnico] = {};
      foliosPorTec[tecnico].add(docActual.folio);
      if (!lineasPorTec[tecnico][docActual.folio])
        lineasPorTec[tecnico][docActual.folio] = new Set();
      lineasPorTec[tecnico][docActual.folio].add(lin);
    }
    if (esMBVYN && esTec) {
      if (!tecMap[tecnico]) tecMap[tecnico] = { nombre: tecnico, lineas: {} };
      const tl = tecMap[tecnico].lineas;
      if (!tl.LLANTAS) tl.LLANTAS = { uds: 0, margen: 0 };
      tl.LLANTAS.uds += uds;
      if (!foliosPorTec[tecnico]) foliosPorTec[tecnico] = new Set();
      foliosPorTec[tecnico].add(docActual.folio);
    }

    foliosUnicos.add(docActual.folio);
    if (vend && docActual.folio) {
      if (!foliosPorVend[vend]) foliosPorVend[vend] = new Set();
      foliosPorVend[vend].add(docActual.folio);
      if (!lineasPorVend[vend]) lineasPorVend[vend] = {};
      if (!lineasPorVend[vend][docActual.folio])
        lineasPorVend[vend][docActual.folio] = new Set();
      if (esSrv && !esMBVYN) lineasPorVend[vend][docActual.folio].add(lin);
      if (esLL) lineasPorVend[vend][docActual.folio].add("LLANTAS");
      if (esClub) lineasPorVend[vend][docActual.folio].add("CLUB YANTISSIMO");
    }
    ventasOut.push({
      folio: docActual.folio,
      folioOV: docActual.folioOV || "",
      folioFactura: docActual.folioFactura || "",
      esFactura: docActual.esFactura || false,
      fecha: docActual.fecha || "",
      cliente: docActual.cliente,
      tel: docActual.tel,
      modelo: docActual.modelo,
      placa: docActual.placa || "",
      folioCompraDoc: docActual.folioCompraDoc || "",
      tipoCli: docActual.tipoCli || "",
      formaCobro: docActual.formaCobro,
      importeRaw: docActual.importeRaw || "0",
      tipoDoc: docActual.tipoDoc || "V",
      totalVenta: docActual.totalVenta || 0,
      vendedor: vend,
      tecnico,
      clave,
      dscto,
      precioLista,
      ventaCobradaU,
      desc,
      linea_raw,
      lin,
      uMed,
      esSrv,
      esRect,
      esLL,
      esMBVYN,
      uds,
      venta,
      costo,
      utilidad,
      margen: margenPct,
      cuentaConv,
      alerta,
      artNorm: nm(desc),
      sinTecnico: esMBVYN && tecnico && !esTec,
      esConvenio: posibleConvenio || false,
      esConvenioDoc,
      esClienteClub:
        foliosClub.has(docActual.folio) ||
        clubEsMiembro(docActual.cliente, docActual.tel, docActual.placa),
      esEspecial: especGetCategoria(docActual.cliente, docActual.tel),
      llantasFolio: foliosLlantas.get(docActual.folio) || 0,
      moAlerta,
      moEsp,
      enPromo,
      factorUsado,
      ultCosto,
    });
  }

  foliosClub.forEach(({ cliente, tel, placa }, folio) => {
    if (placa && clubNormPlaca(placa)) {
      clubRegistrar(cliente, tel, placa, folio, fechaDoc);
    }
  });

  const prodOut = {
    vendedores: Object.values(vendMap)
      .map((v) => ({
        nombre: v.nombre,
        clientes: foliosPorVend[v.nombre] ? foliosPorVend[v.nombre].size : 0,
        lineasProm: (() => {
          const lf = lineasPorVend[v.nombre];
          if (!lf) return 0;
          const vals = Object.values(lf);
          return vals.length ? vals.reduce((s, s2) => s + s2.size, 0) / vals.length : 0;
        })(),
        lineas: LINEAS_ORD_PROD.map((linea) => ({
          linea,
          uds: v.lineas[linea]?.uds || 0,
          margen: v.lineas[linea]?.margen || 0,
        })),
      }))
      .filter((v) => v.lineas.length > 0),
    tecnicos: Object.values(tecMap)
      .map((t) => ({
        nombre: t.nombre,
        ordenes: foliosPorTec[t.nombre] ? foliosPorTec[t.nombre].size : 0,
        lineasProm: (() => {
          const lf = lineasPorTec[t.nombre];
          if (!lf) return 0;
          const vals = Object.values(lf);
          return vals.length ? vals.reduce((s, s2) => s + s2.size, 0) / vals.length : 0;
        })(),
        lineas: LINEAS_ORD_TEC.map((linea) => ({
          linea,
          uds: t.lineas[linea]?.uds || 0,
          margen: t.lineas[linea]?.margen || 0,
        })),
      }))
      .filter((t) => t.lineas.length > 0),
  };

  return {
    ventas: ventasOut,
    prodData: prodOut,
    ovPendientes: ovOut,
    cobranzas: cobranzasOut,
    cargosCP: cargosCPOut,
    comprasIntegradas: comprasIntOut,
    recepciones: recepcionesOut,
    fechaDoc,
    numClientes: foliosUnicos.size,
    diasCubiertos: Array.from(diasCubiertosSet),
  };
}
