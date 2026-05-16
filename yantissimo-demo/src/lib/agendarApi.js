import dayjs from "dayjs";
import api, { post } from "~/lib/api";
import { generateAnticipo } from "~/lib/anticipoApi.js";
import { toISO_MX } from "~/utils/formaters.js";

const isDayjs = (obj) => dayjs.isDayjs(obj);

const exceedsOfficeHours = (start, duration) => {
  if (!isDayjs(start)) return false;
  const finishTime = start.add(duration, "minute");
  if (finishTime.hour() >= 19 && finishTime.minute() > 0) return true;
  if (finishTime.hour() > 19) return true;
  return false;
};

export async function agendarServicio({
  cotId,
  quote,
  sucursal,
  startAt, // dayjs instance
  duration, // minutes
  importe, // anticipo amount (string or number)
  payMethod, // anticipo method
  folioMS, // anticipo folio
}) {
  if (!cotId || cotId === "nueva") {
    window?.showToast?.("ID de cotización inválido");
    return false;
  }
  if (!sucursal || !startAt || !duration) {
    window?.showToast?.("Complete sucursal, fecha y duración");
    return false;
  }
  if (exceedsOfficeHours(startAt, Number(duration))) {
    window?.showToast?.("La hora seleccionada excede el horario de atención.");
    return false;
  }

  const isToday = dayjs().isSame(startAt, "day");
  const requiresAnticipo = !isToday && quote?.pay_status === 0;

  if (requiresAnticipo) {
    const monto = parseFloat(String(importe ?? "").replace(/,/g, "."));
    if (!Number.isFinite(monto) || monto <= 0) {
      window?.showToast?.("Importe de anticipo inválido", "error");
      return false;
    }
    if (!payMethod) {
      window?.showToast?.("Selecciona método de pago del anticipo", "error");
      return false;
    }
    if (!folioMS?.trim()) {
      window?.showToast?.(
        "Folio Microsip obligatorio para el anticipo",
        "error"
      );
      return false;
    }
    const ok = await generateAnticipo({
      cotId: quote?.id || cotId,
      importe: monto,
      pay_method: payMethod,
      folio_ms: folioMS,
    });
    if (!ok) return false;
  }

  const body = {
    quote_id: quote?.id || cotId,
    sucursal,
    type: isToday ? "scheduled" : "appointed",
    // Interpretar como hora local de CDMX y serializar a UTC (Z)
    start_at: toISO_MX(startAt),
    duration_minutes: Number(duration),
  };

  const res = await post("/api/events/schedule", body);
  if (res.status === 409) {
    const err = await res.json().catch(() => ({}));
    window?.showToast?.(err?.error || "Conflicto de agenda");
    return false;
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    window?.showToast?.(err?.error || res.statusText || "Error al agendar");
    return false;
  }
  window?.showToast?.("Agendado correctamente");
  return true;
}

// verificar disponibilidad de horario
export async function checkDisponibilidad({
  sucursal,
  startAt, // dayjs instance
  duration, // minutes
}) {
  if (!sucursal || !startAt || !duration) {
    window?.showToast?.("Complete sucursal, fecha y duración");
    return false;
  }

  const body = {
    mins: Number(duration),
    suc: sucursal,
    date: toISO_MX(startAt),
  };
  // get
  const res = await api(
    "/bypass/calendar/get/availability" + "?" + new URLSearchParams(body)
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    window?.showToast?.(err?.error || res.statusText || "Error al verificar");
    return false;
  }
  const data = await res.json().catch(() => ({}));

  return data || false;
}
