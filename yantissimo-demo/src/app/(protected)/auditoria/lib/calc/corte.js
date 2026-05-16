/**
 * Corte de caja. Puerto de `fcClasificar` + `buildCorte` del HTML
 * (líneas 6919–7073). Versión pura: recibe ventas + cobranzas y agrupa
 * por forma de cobro. No incluye correcciones manuales de banco ni
 * terminales con plazo (UI stateful que se porta en iteración dedicada).
 */

const FC_MAP = {
  efectivo: { re: /^efectivo$/i, grupo: "efectivo", lbl: "Efectivo" },
  tc_afirme: { re: /tarjeta de cr.dito afirme/i, grupo: "tc", lbl: "TC Afirme" },
  tc_banamex: { re: /tarjeta de cr.dito banamex/i, grupo: "tc", lbl: "TC Banamex" },
  tc_bancomer: {
    re: /tarjeta de cr.dito (bancomer|bbva)/i,
    grupo: "tc",
    lbl: "TC BBVA",
  },
  td_afirme: { re: /tarjeta de d.bito afirme/i, grupo: "td", lbl: "TD Afirme" },
  td_banamex: { re: /tarjeta de d.bito banamex/i, grupo: "td", lbl: "TD Banamex" },
  td_bancomer: {
    re: /tarjeta de d.bito (bancomer|bbva)/i,
    grupo: "td",
    lbl: "TD BBVA",
  },
  transferencia: { re: /transferencia/i, grupo: "transf", lbl: "Transferencia" },
  cred_yant: { re: /^cr.dito$/i, grupo: "cred", lbl: "Crédito Yantissimo" },
  anticipo: { re: /^anticipo$/i, grupo: "cred", lbl: "Anticipo" },
  marina_6m: { re: /la marina 6m/i, grupo: "cred", lbl: "La Marina 6M" },
  marina_12m: { re: /la marina 12m/i, grupo: "cred", lbl: "La Marina 12M" },
  sutuc: { re: /^sutuc$/i, grupo: "cred", lbl: "SUTUC" },
  nota_cred: { re: /nota de cr.dito/i, grupo: "nota", lbl: "Nota de crédito" },
};

export function fcClasificar(formaCobro, importeRaw) {
  const partes = String(formaCobro || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const importes = String(importeRaw || "0")
    .split(",")
    .map((s) => parseFloat(s.trim()) || 0);
  const result = [];
  partes.forEach((p, idx) => {
    const importe =
      importes[idx] !== undefined ? importes[idx] : importes[importes.length - 1] || 0;
    let matched = false;
    for (const [k, v] of Object.entries(FC_MAP)) {
      if (v.re.test(p)) {
        result.push({ key: k, grupo: v.grupo, lbl: v.lbl, raw: p, importe });
        matched = true;
        break;
      }
    }
    if (!matched && p) result.push({ key: "otro", grupo: "otro", lbl: p, raw: p, importe });
  });
  return result;
}

const CORR_BANCO_KEY = { BBVA: "bancomer", Afirme: "afirme", Banamex: "banamex" };

function aplicarCorreccion(grupos, entry, claseKey, correcciones) {
  if (!correcciones?.length) return false;
  const corr = correcciones.find((c) => c.folio === entry.folio);
  if (!corr) return false;
  const esTerminal =
    claseKey === "tc_afirme" ||
    claseKey === "tc_banamex" ||
    claseKey === "tc_bancomer" ||
    claseKey === "td_afirme" ||
    claseKey === "td_banamex" ||
    claseKey === "td_bancomer";
  if (!esTerminal) return false;
  const bk = CORR_BANCO_KEY[corr.bancoNuevo];
  const tk = corr.tipoNuevo === "TC" ? "tc" : "td";
  if (!bk) return false;
  grupos[tk + "_" + bk].push(entry);
  return true;
}

export function buildCorte({ ventas = [], cobranzas = [], correcciones = [] } = {}) {
  const folioMap = {};
  ventas.forEach((v) => {
    if (!v.folio) return;
    if (!folioMap[v.folio]) {
      folioMap[v.folio] = {
        folio: v.folio,
        tipoDoc: v.tipoDoc,
        fecha: v.fecha,
        folioFactura: v.folioFactura || "",
        esFactura: v.esFactura || false,
        cliente: v.cliente,
        vendedor: v.vendedor,
        formaCobro: v.formaCobro,
        importeRaw: v.importeRaw || "0",
        total: v.totalVenta || 0,
      };
    }
  });

  const grupos = {
    efectivo_fac: [],
    efectivo_vm: [],
    tc_afirme: [],
    tc_banamex: [],
    tc_bancomer: [],
    td_afirme: [],
    td_banamex: [],
    td_bancomer: [],
    transf: [],
    cred_yant: [],
    cred_inst: [],
    nota: [],
    otro: [],
    cobros: [],
  };

  const GRUPO_KEYS = {
    tc_afirme: "tc_afirme",
    tc_banamex: "tc_banamex",
    tc_bancomer: "tc_bancomer",
    td_afirme: "td_afirme",
    td_banamex: "td_banamex",
    td_bancomer: "td_bancomer",
    transferencia: "transf",
    nota_cred: "nota",
  };

  Object.values(folioMap).forEach((f) => {
    const clases = fcClasificar(f.formaCobro, f.importeRaw);
    if (!clases.length)
      clases.push({ key: "otro", grupo: "otro", lbl: f.formaCobro || "—", raw: "", importe: 0 });
    const keysVistos = new Set();
    clases.forEach((c) => {
      if (keysVistos.has(c.key)) return;
      keysVistos.add(c.key);
      const esMultiple = clases.length > 1;
      const entry = { ...f, fc: c, total: esMultiple ? c.importe : f.total };
      if (aplicarCorreccion(grupos, entry, c.key, correcciones)) return;
      if (c.key === "efectivo") {
        if (f.esFactura) grupos.efectivo_fac.push(entry);
        else grupos.efectivo_vm.push(entry);
      } else if (GRUPO_KEYS[c.key]) {
        grupos[GRUPO_KEYS[c.key]].push(entry);
      } else if (c.key === "cred_yant" || c.key === "anticipo") {
        grupos.cred_yant.push(entry);
      } else if (c.key === "marina_6m" || c.key === "marina_12m" || c.key === "sutuc") {
        grupos.cred_inst.push(entry);
      } else {
        grupos.otro.push(entry);
      }
    });
  });

  cobranzas.forEach((c) => {
    const totalCobro =
      parseFloat(String(c.importeRaw || "").replace(/[^0-9.]/g, "")) || c.total || 0;
    const clases = fcClasificar(c.formaCobro, String(totalCobro));
    if (!clases.length)
      clases.push({
        key: "cobros",
        grupo: "cobros",
        lbl: c.formaCobro || "Cobro",
        raw: "",
        importe: totalCobro,
      });
    const keysVistos = new Set();
    clases.forEach((fc) => {
      if (keysVistos.has(fc.key)) return;
      keysVistos.add(fc.key);
      const monto = clases.length > 1 ? fc.importe : totalCobro;
      const entry = {
        folio: c.folio,
        folioVenta: c.folioVenta || c.folioOrig || "",
        fecha: c.fecha,
        cliente: c.cliente,
        formaCobro: c.formaCobro,
        total: monto,
        vendedor: c.vendedor,
        fc,
        esCobro: true,
        tipoDoc: "COBRO",
      };
      if (aplicarCorreccion(grupos, entry, fc.key, correcciones)) return;
      if (fc.key === "efectivo") {
        grupos.efectivo_vm.push(entry);
      } else if (GRUPO_KEYS[fc.key]) {
        grupos[GRUPO_KEYS[fc.key]].push(entry);
      } else if (fc.key === "cred_yant") {
        grupos.cred_yant.push(entry);
      } else if (fc.key === "cred_inst") {
        grupos.cred_inst.push(entry);
      } else {
        grupos.cobros.push(entry);
      }
    });
  });

  const fechaSort = (a, b) => {
    const p = (s) => {
      const [d, m, y] = (s || "").split("/");
      return (y || "0") + (m || "0") + (d || "0");
    };
    return p(a.fecha).localeCompare(p(b.fecha));
  };
  Object.keys(grupos).forEach((k) => grupos[k].sort(fechaSort));

  const sum = (arr) => arr.reduce((s, f) => s + (f.total || 0), 0);
  const totales = {
    efectivoFac: sum(grupos.efectivo_fac),
    efectivoVm: sum(grupos.efectivo_vm),
    transf: sum(grupos.transf),
    credYant: sum(grupos.cred_yant),
    credInst: sum(grupos.cred_inst),
    nota: sum(grupos.nota),
    tc:
      sum(grupos.tc_afirme) + sum(grupos.tc_banamex) + sum(grupos.tc_bancomer),
    td:
      sum(grupos.td_afirme) + sum(grupos.td_banamex) + sum(grupos.td_bancomer),
    otro: sum(grupos.otro),
    cobros: sum(grupos.cobros),
  };

  return { grupos, totales };
}
