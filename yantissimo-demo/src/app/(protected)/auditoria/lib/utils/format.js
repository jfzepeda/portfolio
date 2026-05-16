/**
 * Helpers de formato portados 1:1 de AUDITORIA 23A.html (líneas 1077–1090).
 * `cn`/`gc` no aplican aquí (manipulan celdas de SheetJS); viven en lib/excel.
 */

export function fp(n) {
  return (
    "$" +
    Number(n).toLocaleString("es-MX", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export function fn(n, d = 1) {
  return Number(n).toFixed(d);
}

export function nm(s) {
  return (s || "").trim().toUpperCase();
}

/** Excel serial date → 'dd/mm/yyyy' */
export function exD(s) {
  if (!s) return "";
  const sStr = String(s).trim();
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(sStr)) return sStr;
  const d = new Date(Date.UTC(1899, 11, 30) + parseFloat(s) * 86400000);
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return dd + "/" + mm + "/" + d.getUTCFullYear();
}

/** Excel time fraction → 'HH:mm' */
export function exH(s) {
  if (s == null || s === "") return "";
  const v = parseFloat(s);
  if (Number.isNaN(v)) return String(s);
  const totalMin = Math.round(v * 24 * 60);
  const hh = String(Math.floor(totalMin / 60)).padStart(2, "0");
  const mm = String(totalMin % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function toISODate(ddmmyyyy) {
  const [dd, mm, yyyy] = ddmmyyyy.split("/");
  return `${yyyy}-${mm}-${dd}`;
}

export function fromISODate(iso) {
  const [yyyy, mm, dd] = iso.split("-");
  return `${dd}/${mm}/${yyyy}`;
}
