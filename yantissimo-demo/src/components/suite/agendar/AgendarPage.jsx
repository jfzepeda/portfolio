"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import EventIcon from "@mui/icons-material/Event";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CarRepairIcon from "@mui/icons-material/CarRepair";
import BusinessIcon from "@mui/icons-material/Business";
import PlaceIcon from "@mui/icons-material/Place";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PaidIcon from "@mui/icons-material/Paid";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

import {
  LocalizationProvider,
  TimePicker,
  DatePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { SUCS, doctypeOptions } from "~/utils/global";
import { agendarServicio, checkDisponibilidad } from "~/lib/agendarApi.js";
import { fetchEventByQuoteId } from "~/lib/eventsApi.js";
import { formatFolioMicrosip } from "~/utils/formaters.js";

const isDayjs = (obj) => dayjs.isDayjs(obj);
const SLOT_MINUTES = [0, 30];
const OPEN_HOUR = 9;
const LAST_START_HOUR = 18;
const WEEKDAY_CLOSE_HOUR = 19;
const SATURDAY_CLOSE_HOUR = 14;

const isSunday = (date) => isDayjs(date) && date.day() === 0;

const getClosingTimeForDate = (start) => {
  if (!isDayjs(start)) return null;
  const closeHour = start.day() === 6 ? SATURDAY_CLOSE_HOUR : WEEKDAY_CLOSE_HOUR;
  return start
    .startOf("day")
    .hour(closeHour)
    .minute(0)
    .second(0)
    .millisecond(0);
};

const getNextSelectableHalfHour = () => {
  const now = dayjs();
  let candidate = now.second(0).millisecond(0);
  const mod = candidate.minute() % 30;
  if (mod !== 0) candidate = candidate.add(30 - mod, "minute");
  if (mod === 0 && now.second() > 0) candidate = candidate.add(30, "minute");
  return candidate;
};

const isPastTimeForToday = (start) => {
  if (!isDayjs(start)) return false;
  if (!start.isSame(dayjs(), "day")) return false;
  return start.isBefore(getNextSelectableHalfHour());
};

const isStartWithinBusinessHours = (start) => {
  if (!isDayjs(start)) return false;
  const minute = start.minute();
  const hour = start.hour();
  if (!SLOT_MINUTES.includes(minute)) return false;
  if (hour < OPEN_HOUR || hour > LAST_START_HOUR) return false;
  if (isSunday(start)) return false;
  if (isPastTimeForToday(start)) return false;
  return true;
};

const shouldDisableTimeStart = (value, view) => {
  // Soporta MUI X: value puede ser número o dayjs
  if (typeof value === "number") {
    if (view === "hours") return value < OPEN_HOUR || value > LAST_START_HOUR;
    if (view === "minutes") return value % 30 !== 0;
    return false;
  }
  if (!isDayjs(value)) return false;
  const hour = value.hour();
  if (view === "hours") return hour < OPEN_HOUR || hour > LAST_START_HOUR;
  if (view === "minutes") return value.minute() % 30 !== 0;
  return false;
};

const SDFT = (start, duration) => {
  if (!dayjs.isDayjs(start)) return false;
  const closeTime = getClosingTimeForDate(start);
  if (!closeTime) return false;
  const finishTime = start.add(duration, "minute");
  return finishTime.isAfter(closeTime);
};

const durationOptions = [30, 60, 90, 120, 180, 240, 360];

// --------- Preview helpers ---------
const PREVIEW_START_HOUR = 9;
const PREVIEW_END_HOUR = 19;

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function PreviewPanel({
  start,
  end,
  ramp,
  title = "Previsualización",
  emptyText = "Selecciona fecha y duración para ver la previsualización.",
}) {
  const theme = useTheme();

  const startD = start ? (dayjs.isDayjs(start) ? start : dayjs(start)) : null;
  const endD = end ? (dayjs.isDayjs(end) ? end : dayjs(end)) : null;

  const totalMinutes = (PREVIEW_END_HOUR - PREVIEW_START_HOUR) * 60;
  const containerHeight = 640; // un poco más cómodo visualmente
  const pxPerMin = containerHeight / totalMinutes;

  const { topPx, heightPx, isValid } = useMemo(() => {
    if (!startD || !endD || !endD.isAfter(startD)) {
      return { topPx: 0, heightPx: 0, isValid: false };
    }
    const startMin =
      startD.hour() * 60 + startD.minute() - PREVIEW_START_HOUR * 60;
    const endMin = endD.hour() * 60 + endD.minute() - PREVIEW_START_HOUR * 60;

    const clampedStart = clamp(startMin, 0, totalMinutes);
    const clampedEnd = clamp(endMin, 0, totalMinutes);

    const top = clampedStart * pxPerMin;
    const height = Math.max(10, (clampedEnd - clampedStart) * pxPerMin);

    return { topPx: top, heightPx: height, isValid: height > 0 };
  }, [startD, endD, pxPerMin, totalMinutes]);

  const hours = useMemo(
    () =>
      Array.from({ length: PREVIEW_END_HOUR - PREVIEW_START_HOUR + 1 }).map(
        (_, i) => PREVIEW_START_HOUR + i
      ),
    []
  );

  return (
    <Card sx={{ height: "fit-content" }}>
      <CardHeader
        title={
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            gap={1}
          >
            <Typography variant="subtitle1" fontWeight={700}>
              {title}
            </Typography>
            {isValid ? (
              <Chip
                size="small"
                label={`${startD.format("HH:mm")} – ${endD.format("HH:mm")}`}
                variant="outlined"
              />
            ) : (
              <Chip size="small" label="Sin selección" variant="outlined" />
            )}
          </Stack>
        }
        sx={{ pb: 1 }}
      />
      <CardContent sx={{ pt: 0 }}>
        <Box
          sx={{
            position: "relative",
            height: containerHeight,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            background: theme.palette.background.default,
            overflow: "hidden",
          }}
        >
          {/* Gutter de horas */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: 64,
              borderRight: `1px solid ${theme.palette.divider}`,
              background: theme.palette.background.paper,
              zIndex: 1,
            }}
          />

          {/* líneas y etiquetas */}
          {hours.map((hour, i) => {
            const y = i * 60 * pxPerMin;
            return (
              <Box
                key={hour}
                sx={{
                  position: "absolute",
                  top: y,
                  left: 0,
                  right: 0,
                  height: 1,
                  background: theme.palette.divider,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    position: "absolute",
                    left: 12,
                    top: -9,
                    color: theme.palette.text.secondary,
                    px: 0.5,
                    bgcolor: "transparent",
                    zIndex: 2,
                  }}
                >
                  {String(hour).padStart(2, "0")}:00
                </Typography>
              </Box>
            );
          })}

          {/* bloque del evento */}
          {isValid ? (
            <Box
              sx={{
                position: "absolute",
                top: topPx,
                left: 76,
                right: 14,
                height: heightPx,
                borderRadius: 2,
                border: `1px solid ${theme.palette.primary.main}`,
                background: theme.palette.primary.light,
                boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
                p: 1.25,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 0.5,
              }}
            >
              <Typography
                variant="body2"
                fontWeight={700}
                sx={{ lineHeight: 1.2 }}
              >
                {startD.format("HH:mm")} – {endD.format("HH:mm")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {startD.format("DD/MM/YYYY")}
              </Typography>
              {ramp ? (
                <Chip
                  size="small"
                  label={ramp}
                  sx={{ width: "fit-content", mt: 0.5 }}
                />
              ) : null}
            </Box>
          ) : (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 2,
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ maxWidth: 280, textAlign: "center" }}
              >
                {emptyText}
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

function KeyValueChipsRow({ items }) {
  return (
    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
      {items.filter(Boolean).map((it, idx) => (
        <Chip
          key={`${it.label}-${idx}`}
          size="small"
          variant="outlined"
          icon={it.icon || undefined}
          label={
            <Box sx={{ display: "flex", gap: 0.75, alignItems: "center" }}>
              <Typography variant="caption" color="text.secondary">
                {it.label}:
              </Typography>
              <Typography variant="caption" fontWeight={700}>
                {it.value}
              </Typography>
            </Box>
          }
        />
      ))}
    </Stack>
  );
}

function EventDetailsCard({
  quote,
  cotId,
  statusLabel,
  loadingEvent,
  eventInfo,
}) {
  const start = eventInfo?.start_at ? dayjs(eventInfo.start_at) : null;
  const end = eventInfo?.end_at ? dayjs(eventInfo.end_at) : null;

  return (
    <Card
      sx={{
        backgroundColor: (theme) => theme.palette.action.hover,
        border: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <CardHeader
        title={
          <Stack spacing={0.5}>
            <Typography variant="h6" fontWeight={800}>
              Cotización agendada
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Estado actual: <b>{statusLabel?.text || "Programada"}</b>
            </Typography>
          </Stack>
        }
        action={
          <Tooltip title="No se puede generar una segunda agenda para este folio">
            <span>
              <Chip
                icon={<InfoOutlinedIcon />}
                label="Bloqueado"
                color="default"
                variant="outlined"
                sx={{ mt: 0.5 }}
              />
            </span>
          </Tooltip>
        }
        sx={{ pb: 1 }}
      />
      <CardContent sx={{ pt: 0 }}>
        <KeyValueChipsRow
          items={[
            quote?.id || cotId
              ? {
                  label: "Folio",
                  value: String(quote?.id ?? cotId),
                  icon: <ReceiptLongIcon />,
                }
              : null,
            quote?.car
              ? {
                  label: "Auto",
                  value: String(quote.car),
                  icon: <CarRepairIcon />,
                }
              : null,
            eventInfo?.ramp
              ? {
                  label: "Rampa",
                  value: String(eventInfo.ramp),
                  icon: <PlaceIcon />,
                }
              : null,
            eventInfo?.sucursal
              ? {
                  label: "Sucursal",
                  value: String(eventInfo.sucursal),
                  icon: <BusinessIcon />,
                }
              : null,
          ]}
        />

        <Divider sx={{ my: 2 }} />

        {loadingEvent ? (
          <Stack direction="row" alignItems="center" spacing={1}>
            <CircularProgress size={18} />
            <Typography variant="body2" color="text.secondary">
              Cargando detalles del evento...
            </Typography>
          </Stack>
        ) : eventInfo ? (
          <List dense disablePadding>
            <ListItem disableGutters>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <EventIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Fecha"
                secondary={start ? start.format("DD/MM/YYYY") : "-"}
                primaryTypographyProps={{ variant: "body2", fontWeight: 700 }}
                secondaryTypographyProps={{
                  variant: "body2",
                  color: "text.secondary",
                }}
              />
            </ListItem>

            <ListItem disableGutters>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <ScheduleIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Horario"
                secondary={
                  start && end
                    ? `${start.format("HH:mm")} – ${end.format("HH:mm")}`
                    : "-"
                }
                primaryTypographyProps={{ variant: "body2", fontWeight: 700 }}
                secondaryTypographyProps={{
                  variant: "body2",
                  color: "text.secondary",
                }}
              />
            </ListItem>

            <ListItem disableGutters>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <PlaceIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Rampa"
                secondary={eventInfo?.ramp || "-"}
                primaryTypographyProps={{ variant: "body2", fontWeight: 700 }}
                secondaryTypographyProps={{
                  variant: "body2",
                  color: "text.secondary",
                }}
              />
            </ListItem>

            <ListItem disableGutters>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <BusinessIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary="Sucursal"
                secondary={eventInfo?.sucursal || "-"}
                primaryTypographyProps={{ variant: "body2", fontWeight: 700 }}
                secondaryTypographyProps={{
                  variant: "body2",
                  color: "text.secondary",
                }}
              />
            </ListItem>
          </List>
        ) : (
          <Alert severity="warning">
            No se encontraron detalles del evento.
          </Alert>
        )}

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Button variant="outlined" disabled>
            Ver agenda
          </Button>
          <Button variant="outlined" disabled>
            Editar datos
          </Button>
          <Tooltip title="No se puede reagendar porque ya existe una agenda activa">
            <span>
              <Button variant="contained" disabled>
                Reagendar
              </Button>
            </span>
          </Tooltip>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function AgendarPage({ cotId, quote }) {
  const [sucursal, setSucursal] = useState();
  const [startAt, setStartAt] = useState(null);
  const [duration, setDuration] = useState(60);
  const [submitting, setSubmitting] = useState(false);
  const [quoteType, setQuoteType] = useState(quote?.type || "quote");

  const [loadingEvent, setLoadingEvent] = useState(false);
  const [eventInfo, setEventInfo] = useState(null);

  // Disponibilidad del día (set de strings "HH:mm")
  const [availableSet, setAvailableSet] = useState(null);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  // Anticipo fields (when scheduling for a day other than today and no anticipo yet)
  const [importe, setImporte] = useState("");
  const [payMethod, setPayMethod] = useState("");
  const [folioMS, setFolioMS] = useState("");

  useEffect(() => {
    if (quote?.sucursal) setSucursal(quote.sucursal);
  }, [quote]);

  useEffect(() => {
    if (quote?.type) setQuoteType(quote.type);
  }, [quote?.type]);

  const canScheduleByType =
    (quoteType && doctypeOptions[quoteType]
      ? doctypeOptions[quoteType].idx
      : 0) < 3;

  const statusLabel = doctypeOptions[quoteType || "quote"]; // fallback

  const refreshEventInfo = useCallback(async () => {
    const quote_id = quote?.id || cotId;
    if (!quote_id) {
      setEventInfo(null);
      return null;
    }
    setLoadingEvent(true);
    try {
      const data = await fetchEventByQuoteId(quote_id);
      setEventInfo(data);
      return data;
    } finally {
      setLoadingEvent(false);
    }
  }, [quote?.id, cotId]);

  useEffect(() => {
    // Si ya está agendada / en proceso, cargamos la info del evento
    if (!canScheduleByType) {
      refreshEventInfo();
    }
  }, [canScheduleByType, refreshEventInfo]);

  const endAt = useMemo(() => {
    if (!startAt || !duration) return null;
    if (!dayjs.isDayjs(startAt)) return null;
    return startAt.add(Number(duration), "minute");
  }, [startAt, duration]);

  // Función para deshabilitar horas/minutos según disponibilidad
  const disableTimeFn = useMemo(() => {
    const buildSlot = (hour, minute) => {
      if (!isDayjs(startAt)) return null;
      return startAt
        .hour(hour)
        .minute(minute)
        .second(0)
        .millisecond(0);
    };

    const isSlotEnabled = (slot) => {
      if (!isDayjs(slot)) return false;
      if (!isStartWithinBusinessHours(slot)) return false;
      if (SDFT(slot, Number(duration))) return false;
      if (!availableSet) return true;
      return availableSet.has(slot.format("HH:mm"));
    };

    return (val, view) => {
      // MUI X pasa number; soportar ambos (number/dayjs)
      if (typeof val === "number") {
        if (view === "hours") {
          const hour = val;
          if (hour < OPEN_HOUR || hour > LAST_START_HOUR) return true;
          if (!isDayjs(startAt)) return false;
          return !SLOT_MINUTES.some((minute) =>
            isSlotEnabled(buildSlot(hour, minute))
          );
        }
        if (view === "minutes") {
          const minute = val;
          if (minute % 30 !== 0) return true;
          const hour = isDayjs(startAt) ? startAt.hour() : null;
          if (hour == null) return false;
          return !isSlotEnabled(buildSlot(hour, minute));
        }
        return false;
      }

      if (isDayjs(val)) {
        const hour = val.hour();
        const minute = val.minute();
        if (view === "hours") {
          if (hour < OPEN_HOUR || hour > LAST_START_HOUR) return true;
          if (!isDayjs(startAt)) return false;
          return !SLOT_MINUTES.some((slotMinute) =>
            isSlotEnabled(buildSlot(hour, slotMinute))
          );
        }
        if (view === "minutes") {
          if (minute % 30 !== 0) return true;
          const slot = isDayjs(startAt)
            ? startAt
                .hour(hour)
                .minute(minute)
                .second(0)
                .millisecond(0)
            : val.second(0).millisecond(0);
          return !isSlotEnabled(slot);
        }
      }
      return shouldDisableTimeStart(val, view);
    };
  }, [availableSet, startAt, duration]);

  // Cargar disponibilidad cuando haya sucursal + fecha (día) + duración
  useEffect(() => {
    let ignore = false;
    async function load() {
      if (!sucursal || !startAt || !dayjs.isDayjs(startAt) || !duration) {
        setAvailableSet(null);
        return;
      }
      try {
        setLoadingAvailability(true);
        const dayOnly = startAt.startOf("day");
        const available = await checkDisponibilidad({
          sucursal,
          startAt: dayOnly,
          duration,
        });
        // available = [
        //   '09:00', '09:30', '10:00',
        //   '10:30', '11:00', '11:30',
        //   '12:00', '12:30', '13:00',
        //   '13:30', '14:00', '14:30',
        //   '15:00', '15:30', '16:00',
        //   '16:30', '17:00', '17:30',
        //   '18:00'
        // ]
        if (ignore) return;
        if (Array.isArray(available)) {
          // normalizar a Set("HH:mm")
          const norm = new Set(
            available
              .map((v) =>
                typeof v === "string" ? v : v && v.time ? String(v.time) : null
              )
              .filter(Boolean)
          );
          setAvailableSet(norm);
        } else if (available === false) {
          // sin disponibilidad explícita
          setAvailableSet(new Set());
        } else {
          // true u otro valor => no limitar por API
          setAvailableSet(null);
        }
      } catch (e) {
        console.error("Error cargando disponibilidad:", e);
        setAvailableSet(null);
      } finally {
        if (!ignore) setLoadingAvailability(false);
      }
    }
    load();
    return () => {
      ignore = true;
    };
  }, [sucursal, duration, startAt]);

  // Si el horario seleccionado no está disponible, ajustar al primer slot disponible
  useEffect(() => {
    if (!availableSet || !isDayjs(startAt)) return;
    const currentIsValid =
      availableSet.size > 0 &&
      availableSet.has(startAt.format("HH:mm")) &&
      isStartWithinBusinessHours(startAt) &&
      !SDFT(startAt, Number(duration));
    if (currentIsValid) return;

    const sorted = Array.from(availableSet).sort();
    const next = sorted.find((slot) => {
      const [h, m] = slot.split(":").map((n) => parseInt(n, 10));
      const candidate = startAt.hour(h).minute(m).second(0).millisecond(0);
      return isStartWithinBusinessHours(candidate) && !SDFT(candidate, Number(duration));
    });

    if (!next) return;
    const [h, m] = next.split(":").map((n) => parseInt(n, 10));
    setStartAt((prev) =>
      isDayjs(prev)
        ? prev.hour(h).minute(m).second(0).millisecond(0)
        : dayjs().hour(h).minute(m).second(0).millisecond(0)
    );
  }, [availableSet, startAt, duration]);

  const anticipoRequired = useMemo(() => {
    if (!startAt) return false;
    if (!dayjs.isDayjs(startAt)) return false;
    return !dayjs().isSame(startAt, "day") && quote?.pay_status === 0;
  }, [startAt, quote?.pay_status]);

  const durationIsValid = useMemo(() => {
    if (!startAt) return true;
    if (!dayjs.isDayjs(startAt)) return true;
    return !SDFT(startAt, Number(duration));
  }, [startAt, duration]);

  const startTimeIsValid = useMemo(() => {
    if (!startAt) return true;
    if (!dayjs.isDayjs(startAt)) return true;
    if (!isStartWithinBusinessHours(startAt)) return false;
    return !SDFT(startAt, Number(duration));
  }, [startAt, duration]);

  const canSubmit = useMemo(() => {
    if (!canScheduleByType) return false;
    if (!sucursal) return false;
    if (!startAt || !dayjs.isDayjs(startAt)) return false;
    if (!duration || !durationIsValid || !startTimeIsValid) return false;
    // Validar disponibilidad si está cargada
    if (availableSet) {
      if (availableSet.size === 0) return false;
      const key = startAt.format("HH:mm");
      if (!availableSet.has(key)) return false;
    }
    if (anticipoRequired) {
      if (!importe || Number(importe) <= 0) return false;
      if (!payMethod) return false;
      if (!folioMS) return false;
    }
    return true;
  }, [
    canScheduleByType,
    sucursal,
    startAt,
    duration,
    durationIsValid,
    startTimeIsValid,
    availableSet,
    anticipoRequired,
    importe,
    payMethod,
    folioMS,
  ]);

  async function handleSubmit(e) {
    e?.preventDefault?.();

    if (!canScheduleByType) {
      window?.showToast?.(
        "La cotización ya está agendada o en proceso",
        "error"
      );
      return;
    }
    if (!canSubmit) {
      window?.showToast?.(
        "Revisa sucursal, fecha/hora y campos requeridos",
        "error"
      );
      return;
    }

    try {
      setSubmitting(true);
      const ok = await agendarServicio({
        cotId,
        quote,
        sucursal,
        startAt,
        duration,
        importe,
        payMethod,
        folioMS,
      });
      if (!ok) return;
      const nextType = dayjs().isSame(startAt, "day")
        ? "scheduled"
        : "appointed";
      setQuoteType(nextType);
      await refreshEventInfo();
    } catch (err) {
      console.error("Agendar error:", err);
      window?.showToast?.(String(err?.message || err) || "Error al agendar");
    } finally {
      setSubmitting(false);
    }
  }

  // --------- UI (solo contenido) ---------
  if (!canScheduleByType) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4, mt: 8 }}>
          <Grid container spacing={2} alignItems="flex-start">
            <Grid item xs={12} md={7}>
              <EventDetailsCard
                quote={quote}
                cotId={cotId}
                statusLabel={statusLabel}
                loadingEvent={loadingEvent}
                eventInfo={eventInfo}
              />
            </Grid>

            <Grid item xs={12} md={5}>
              <PreviewPanel
                title="Agenda"
                start={eventInfo ? eventInfo.start_at : null}
                end={eventInfo ? eventInfo.end_at : null}
                ramp={eventInfo ? eventInfo.ramp : null}
                emptyText="No hay datos suficientes para dibujar la agenda."
              />
            </Grid>
          </Grid>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8 }}>
        {/* Header */}
        <Box mb={3} display="flex" gap={1}>
          <Typography variant="h5" fontWeight={900} sx={{ lineHeight: 1.1 }}>
            Agendar servicio
          </Typography>
          <KeyValueChipsRow
            items={[
              quote?.id || cotId
                ? {
                    label: "Folio",
                    value: String(quote?.id ?? cotId),
                    icon: <ReceiptLongIcon />,
                  }
                : null,
              quote?.car
                ? {
                    label: "Auto",
                    value: String(quote.car),
                    icon: <CarRepairIcon />,
                  }
                : null,
            ]}
          />
        </Box>

        <Grid container spacing={2} alignItems="flex-start">
          {/* Form */}
          <Grid item xs={12} md={7}>
            <Card>
              <CardHeader
                title={
                  <Typography variant="subtitle1" fontWeight={800}>
                    Datos de la agenda
                  </Typography>
                }
                sx={{ pb: 1 }}
              />
              <CardContent sx={{ pt: 0 }}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <FormControl fullWidth error={!sucursal}>
                          <InputLabel id="sucursal-label">Sucursal</InputLabel>
                          <Select
                            labelId="sucursal-label"
                            label="Sucursal"
                            value={sucursal || ""}
                            onChange={(e) => setSucursal(e.target.value)}
                          >
                            {SUCS.map((s) => (
                              <MenuItem key={s} value={s}>
                                {s}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12}>
                        <Stack
                          direction={{ xs: "column", md: "row" }}
                          spacing={2}
                          alignItems="stretch"
                        >
                          {/* Izquierda: fecha / hora / duración */}
                          <Stack
                            spacing={2}
                            sx={{
                              flex: { md: "0 0 40%" },
                              minWidth: 0,
                            }}
                          >
                            <DatePicker
                              label="Fecha"
                              value={startAt}
                              disablePast
                              shouldDisableDate={(date) => isSunday(date)}
                              onChange={(newDate) => {
                                if (!newDate) return;
                                if (isSunday(newDate)) return;
                                setStartAt((prev) => {
                                  if (!isDayjs(prev)) {
                                    return newDate
                                      .hour(9)
                                      .minute(0)
                                      .second(0)
                                      .millisecond(0);
                                  }
                                  return prev
                                    .set("year", newDate.year())
                                    .set("month", newDate.month())
                                    .set("date", newDate.date());
                                });
                              }}
                              slotProps={{
                                textField: { fullWidth: true },
                              }}
                            />

                            <TimePicker
                              label="Hora de inicio"
                              value={startAt}
                              onChange={(newValue) => setStartAt(newValue)}
                              timeSteps={{ minutes: 30 }}
                              skipDisabled
                              shouldDisableTime={disableTimeFn}
                              ampm={false}
                              slotProps={{
                                textField: { fullWidth: true },
                              }}
                            />

                            <FormControl fullWidth error={!durationIsValid}>
                              <InputLabel id="duration-label">
                                Duración
                              </InputLabel>
                              <Select
                                labelId="duration-label"
                                label="Duración"
                                value={duration}
                                onChange={(e) =>
                                  setDuration(Number(e.target.value))
                                }
                              >
                                {durationOptions.map((option) => {
                                  const disabled =
                                    startAt && SDFT(startAt, option);
                                  if (disabled) return null;
                                  const label =
                                    option === 30
                                      ? `${option} minutos`
                                      : option === 60
                                      ? "1 hora"
                                      : option === 90
                                      ? "1 hr 30 min"
                                      : option === 120
                                      ? "2 horas"
                                      : option === 180
                                      ? "3 horas"
                                      : option === 240
                                      ? "4 horas"
                                      : option === 360
                                      ? "6 horas"
                                      : `${option} minutos`;
                                  return (
                                    <MenuItem key={option} value={option}>
                                      {label}
                                    </MenuItem>
                                  );
                                })}
                              </Select>
                            </FormControl>
                          </Stack>

                          {/* Derecha: resumen + disponibilidad */}
                          <Stack spacing={2} sx={{ flex: 1, minWidth: 0 }}>
                            <Card variant="outlined">
                              <CardContent sx={{ py: 1.25 }}>
                                <Stack spacing={0.75}>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Resumen
                                  </Typography>

                                  <Stack
                                    direction="row"
                                    spacing={1}
                                    useFlexGap
                                    flexWrap="wrap"
                                  >
                                    <Chip
                                      size="small"
                                      icon={<EventIcon />}
                                      label={
                                        startAt && dayjs.isDayjs(startAt)
                                          ? startAt.format("DD/MM/YYYY")
                                          : "Sin fecha"
                                      }
                                      variant="outlined"
                                    />
                                    <Chip
                                      size="small"
                                      icon={<ScheduleIcon />}
                                      label={
                                        startAt && endAt
                                          ? `${startAt.format(
                                              "HH:mm"
                                            )} – ${endAt.format("HH:mm")}`
                                          : "Sin horario"
                                      }
                                      variant="outlined"
                                    />
                                    <Chip
                                      size="small"
                                      icon={<BusinessIcon />}
                                      label={sucursal || "Sin sucursal"}
                                      variant="outlined"
                                    />
                                  </Stack>

                                  {!durationIsValid ? (
                                    <Alert severity="warning" sx={{ mt: 0.5 }}>
                                      La duración seleccionada se pasa del
                                      horario permitido para ese día.
                                    </Alert>
                                  ) : null}
                                </Stack>
                              </CardContent>
                            </Card>

                            {availableSet ? (
                              <Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {loadingAvailability
                                    ? "Cargando disponibilidad..."
                                    : availableSet.size > 0
                                    ? "Horarios disponibles:"
                                    : "Sin horarios disponibles"}
                                </Typography>

                                {availableSet.size > 0 ? (
                                  <Stack
                                    direction="row"
                                    spacing={0.5}
                                    useFlexGap
                                    flexWrap="wrap"
                                    sx={{ mt: 0.5 }}
                                  >
                                    {Array.from(availableSet)
                                      .sort()
                                      .map((t) => (
                                        <Chip key={t} size="small" label={t} />
                                      ))}
                                  </Stack>
                                ) : null}
                              </Box>
                            ) : null}
                          </Stack>
                        </Stack>
                      </Grid>

                      {/* Anticipo */}
                      {anticipoRequired ? (
                        <Grid item xs={12}>
                          <Card variant="outlined">
                            <CardHeader
                              title={
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={1}
                                >
                                  <PaidIcon fontSize="small" />
                                  <Typography
                                    variant="subtitle1"
                                    fontWeight={800}
                                  >
                                    Anticipo requerido
                                  </Typography>
                                </Stack>
                              }
                              sx={{ pb: 1 }}
                            />
                            <CardContent sx={{ pt: 0 }}>
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={4}>
                                  <TextField
                                    label="Importe"
                                    type="number"
                                    inputProps={{ step: "0.01", min: "0" }}
                                    value={importe}
                                    onChange={(e) => setImporte(e.target.value)}
                                    required
                                    fullWidth
                                  />
                                </Grid>

                                <Grid item xs={12} sm={4}>
                                  <TextField
                                    label="Método de pago"
                                    select
                                    value={payMethod}
                                    onChange={(e) =>
                                      setPayMethod(e.target.value)
                                    }
                                    required
                                    fullWidth
                                  >
                                    {[
                                      { value: "efectivo", label: "Efectivo" },
                                      {
                                        value: "mercado_pago",
                                        label: "Mercado Pago",
                                      },
                                      { value: "afirme", label: "Afirme" },
                                      { value: "bbva", label: "BBVA" },
                                      {
                                        value: "santander",
                                        label: "Santander",
                                      },
                                      { value: "spei", label: "SPEI" },
                                    ].map((opt) => (
                                      <MenuItem
                                        key={opt.value}
                                        value={opt.value}
                                      >
                                        {opt.label}
                                      </MenuItem>
                                    ))}
                                  </TextField>
                                </Grid>

                                <Grid item xs={12} sm={4}>
                                  <TextField
                                    label="Folio Microsip"
                                    value={folioMS}
                                    onChange={(e) =>
                                      setFolioMS(
                                        formatFolioMicrosip(e.target.value)
                                      )
                                    }
                                    required
                                    fullWidth
                                  />
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>
                        </Grid>
                      ) : null}

                      <Grid item xs={12}>
                        <Divider sx={{ my: 0.5 }} />
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          useFlexGap
                          flexWrap="wrap"
                        >
                          <Button
                            type="submit"
                            variant="contained"
                            disabled={submitting || !canSubmit}
                          >
                            {submitting ? "Agendando..." : "Agendar"}
                          </Button>

                          {!canSubmit ? (
                            <Typography variant="body2" color="text.secondary">
                              Completa sucursal, fecha/hora y campos requeridos.
                            </Typography>
                          ) : null}
                        </Stack>
                      </Grid>
                    </Grid>
                  </Box>
                </LocalizationProvider>
              </CardContent>
            </Card>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Selecciona sucursal, fecha/hora y duración. Si la fecha no es hoy
              y no hay anticipo, se solicitará.
            </Typography>
          </Grid>

          {/* Preview */}
          <Grid item xs={12} md={5}>
            <PreviewPanel
              title="Agenda"
              start={startAt}
              end={endAt}
              ramp={null}
            />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
