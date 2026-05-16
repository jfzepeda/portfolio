import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
export const MX_TZ = "America/Mexico_City";
try {
  dayjs.tz.setDefault(MX_TZ);
} catch {}

export function toISO(dateLike) {
  if (!dateLike) throw new Error("Fecha inválida");
  if (dayjs.isDayjs(dateLike)) return dateLike.toDate().toISOString();
  if (dateLike instanceof Date) return dateLike.toISOString();
  throw new Error("Fecha inválida: se esperaba Dayjs o Date");
}

// Interpreta el valor como hora local de CDMX y serializa a UTC ISO.
export function toISO_MX(dateLike) {
  if (!dateLike) throw new Error("Fecha inválida");
  if (dayjs.isDayjs(dateLike)) return dateLike.tz(MX_TZ, true).toISOString();
  if (dateLike instanceof Date)
    return dayjs(dateLike).tz(MX_TZ, true).toISOString();
  throw new Error("Fecha inválida: se esperaba Dayjs o Date");
}

// Genera un Date "naive" con la hora de pared (wall time) de la zona tz.
// Útil para componentes que renderizan según la zona del navegador (p.ej. react-big-calendar),
// pero queremos mostrar siempre la hora de CDMX sin depender del navegador del usuario.
export function toLocalWallDate(dateLike, tz = MX_TZ) {
  if (!dateLike) return null;
  const d = dayjs.isDayjs(dateLike) ? dateLike : dayjs(dateLike);
  const local = d.tz(tz);
  return new Date(
    local.year(),
    local.month(),
    local.date(),
    local.hour(),
    local.minute(),
    local.second(),
    local.millisecond()
  );
}

export const round10 = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return Math.ceil(num / 5) * 5;
};

export const round2 = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return Math.round(num * 100) / 100;
};

export const currencyFormatter = (value, decimal = 0) => {
  const num = Number(value);
  if (Number.isNaN(num)) {
    return value;
  }
  const hasCents = num % 1 !== 0;
  const rounded = decimal === 0 ? round10(num) : num;
  return rounded.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: hasCents ? decimal : 0,
  });
};

export const dateFormatter = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

// quitar ceros de los decimales
export const zeroRemove = (value) => {
  if (typeof value !== "number") return value;
  const strValue = value.toString();
  if (strValue.includes(".")) {
    return strValue.replace(/\.?0+$/, "");
  }
  return strValue;
};

export const percentFormatter = (value) => {
  if (typeof value !== "number") return value;
  if (value > 100) value = 100;
  if (value < 0) value = 0;
  const strValue = value.toString();
  return `${strValue}%`;
};

export function firstUpperCase(str) {
  if (!str) return "";
  str = str.toLowerCase();
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const epsilon = 0.1;

export const mustHighlight = (precioSet, precioLista, pzas = 1) => {
  if (Math.abs(precioSet - precioLista * pzas) > epsilon) {
    return true;
  }
  return false;
};

export const calcDescuento = (precio, precio_ref) => {
  if (!precio_ref || !precio) return 0;
  const ref = parseFloat(precio_ref);
  const p = parseFloat(precio);
  const d = ((ref - p) / ref) * 100;
  return isNaN(d) ? 0 : d.toFixed(0);
};

export const splitName = (fullName, maxNames = 1) => {
  if (!fullName) return "";
  const names = fullName.trim().split(" ");
  return names.slice(0, maxNames).join(" ");
};

export const trimName = (fullName, maxLength = 20) => {
  if (!fullName) return "";
  if (fullName.length <= maxLength) return fullName;
  return `${fullName.substring(0, maxLength - 3)}...`;
};

export const handleWrite = (searchTerm, setSearchTerm) => {
  if (/[*?+]/.test(searchTerm)) {
    const cleanTerm = searchTerm.replace(/[*?+]/g, "").trim();
    const specialChars = searchTerm.match(/[*?+]/g).join("");
    setSearchTerm(cleanTerm + specialChars);
    return;
  }
  setSearchTerm(searchTerm);
};

export const get6msi = (it) => {
  const seis =
    (it.seisMeses
      ? it.seisMeses === it.precioContado
        ? it.precioPromo
        : it.seisMeses
      : it.precioContado * 1.1375) / 6;
  return seis;
};

export const get12msi = (it) => {
  const doce =
    (it.doceMeses
      ? it.doceMeses === it.precioContado
        ? it.precioPromo
        : it.doceMeses
      : it.precioContado * 1.21875) / 12;
  return doce;
};

export const phoneFormatter = (value = "") => {
  if (typeof value !== "string") return value;
  value = value?.replace(/[^0-9]/g, "");
  value = value?.slice(0, 10);
  return value;
};

export const numberFormatter = (value = "", maxLength = 10) => {
  if (typeof value !== "string") return value;
  value = value?.replace(/[^0-9]/g, "");
  value = value?.slice(0, maxLength);
  return value;
};

export const formatFolioMicrosip = (value) => {
  const input = String(value ?? "").toUpperCase();
  let letters = "";
  let digits = "";

  for (const ch of input) {
    if (letters.length < 3 && /[A-Z]/.test(ch)) {
      letters += ch;
      continue;
    }
    if (letters.length >= 3 && digits.length < 5 && /[0-9]/.test(ch)) {
      digits += ch;
    }
    if (letters.length === 3 && digits.length === 5) break;
  }

  return `${letters}${digits}`;
};

export const shortK = (value) => {
  value = Number(value);
  if (typeof value !== "number") return value;
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K`;
  }
  return value.toString();
};
