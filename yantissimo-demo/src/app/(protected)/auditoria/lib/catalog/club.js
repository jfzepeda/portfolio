/**
 * Club Yantissimo — catálogo de miembros. Placeholder funcional.
 * Puerto completo pendiente del HTML líneas 12518–12700 (clubRegistrar,
 * clubEsMiembro, legacy matching). Por ahora usa localStorage directo;
 * migrar a backend cuando /api/auditoria/catalogos/clubYantissimo exista.
 */

const STORAGE_KEY = "clubMiembros";

export function clubNormPlaca(placa) {
  return (placa || "").toString().toUpperCase().replace(/[\s\-.·]/g, "").trim();
}

function clubNormTel(tel) {
  const t = (tel || "").toString().replace(/\D/g, "");
  return t.length > 10 ? t.slice(-10) : t;
}

function clubNormNombre(nombre) {
  return (nombre || "")
    .toString()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function clubLoad() {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function clubSave(miembros) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(miembros));
  } catch {
    /* noop */
  }
}

export function clubRegistrar(nombre, tel, placa, folio, fecha) {
  if (!placa || !clubNormPlaca(placa)) return;
  const miembros = clubLoad();
  const k = clubNormPlaca(placa);
  if (!miembros[k]) {
    miembros[k] = {
      placa: clubNormPlaca(placa),
      placaRaw: (placa || "").trim(),
      nombre: (nombre || "").trim(),
      tel: (tel || "").trim(),
      fechaAlta: fecha || "",
      folioAlta: folio || "",
    };
    clubSave(miembros);
  }
}

export function clubEsMiembro(nombre, tel, placa) {
  const miembros = clubLoad();
  const pk = clubNormPlaca(placa);
  if (pk && miembros[pk]) return true;
  const nNorm = clubNormNombre(nombre);
  const tNorm = clubNormTel(tel);
  if (!nNorm && !tNorm) return false;
  for (const m of Object.values(miembros)) {
    if (m.placa) continue;
    const mn = clubNormNombre(m.nombre);
    const mt = clubNormTel(m.tel);
    if (mt && tNorm && mt === tNorm && mn === nNorm) return true;
    if (!mt && mn && mn === nNorm) return true;
  }
  return false;
}
