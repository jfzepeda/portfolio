import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

export const MX_TZ = "America/Mexico_City";
export const DATE_FMT = "YYYY-MM-DD";
export const HERO_ALL_KEY = "__all__";

const PERIOD_MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const PERIOD_QUARTER_RE = /^\d{4}-Q[1-4]$/;
const QUARTER_LABELS = {
  1: "Ene-Mar",
  2: "Abr-Jun",
  3: "Jul-Sep",
  4: "Oct-Dic",
};

export const creditColors = {
  verde: "#16a34a",
  amarillo: "#f59e0b",
  rojo: "#ef4444",
  gris: "#9ca3af",
};

export const marginColors = creditColors;

export const headerColumns = [
  { key: "cliente", label: "Cliente" },
  { key: "customer_id", label: "ID CxC" },
  { key: "client_type", label: "Tipo" },
  { key: "client_tier", label: "Clasif." },
  { key: "sucursal", label: "Sucursal" },
  { key: "seller_name", label: "Vendedor" },
  { key: "linea", label: "Línea" },
  { key: "condicion_pago", label: "Pago" },
  { key: "estatus_credito", label: "Estatus" },
  { key: "limite_credito", label: "Límite crédito", type: "currency" },
  { key: "volumen", label: "Vol." },
  { key: "venta", label: "Venta", type: "currency" },
  { key: "margen", label: "Margen", type: "currency" },
  { key: "margen_pct", label: "% Margen", type: "percent" },
  { key: "saldo_actual", label: "Saldo actual", type: "currency" },
  { key: "cartera_vencida", label: "Cartera vencida", type: "currency" },
  { key: "dias_vencidos", label: "Días venc." },
  { key: "ultima_compra", label: "Última compra", type: "date" },
  { key: "semaforo_credito", label: "Crédito" },
  { key: "semaforo_margen", label: "Margen" },
];

const getQuarterToken = (monthPeriod) => {
  if (!PERIOD_MONTH_RE.test(monthPeriod)) return null;
  const [year, month] = monthPeriod.split("-");
  const quarter = Math.ceil(Number(month) / 3);
  return `${year}-Q${quarter}`;
};

const formatMonthPeriod = (period) => {
  const d = dayjs.tz(`${period}-01`, MX_TZ);
  return d.format("MMMM YYYY");
};

const formatQuarterPeriod = (period) => {
  if (!PERIOD_QUARTER_RE.test(period)) return period;
  const [year, qToken] = period.split("-Q");
  const quarter = Number(qToken);
  return `T${quarter} (${QUARTER_LABELS[quarter]}) ${year}`;
};

export const createInitialFilters = (todayMx) => {
  const start = todayMx.startOf("month").format(DATE_FMT);
  const end = todayMx.endOf("month").format(DATE_FMT);
  return {
    period: todayMx.format("YYYY-MM"),
    from: start,
    to: end,
    sucursal: "",
    linea: "",
    client_type: "",
    classification: "",
    pay_condition: "",
    credit_status: "",
    seller_id: "",
    search: "",
  };
};

export const getPeriodRange = (period) => {
  if (!period) return {};

  if (PERIOD_QUARTER_RE.test(period)) {
    const [year, qToken] = period.split("-Q");
    const quarter = Number(qToken);
    const startMonth = (quarter - 1) * 3 + 1;
    const start = dayjs.tz(
      `${year}-${String(startMonth).padStart(2, "0")}-01`,
      MX_TZ
    );
    return {
      from: start.startOf("month").format(DATE_FMT),
      to: start.add(2, "month").endOf("month").format(DATE_FMT),
    };
  }

  if (!PERIOD_MONTH_RE.test(period)) return {};
  const start = dayjs.tz(`${period}-01`, MX_TZ).startOf("month");
  return {
    from: start.format(DATE_FMT),
    to: start.endOf("month").format(DATE_FMT),
  };
};

export const buildPeriodOptions = (periods = []) => {
  const monthOptions = periods
    .filter((period) => PERIOD_MONTH_RE.test(period))
    .map((period) => ({
      value: period,
      label: formatMonthPeriod(period),
      group: "Meses",
    }));

  const quarterSet = new Set();
  periods.forEach((period) => {
    const quarter = getQuarterToken(period);
    if (quarter) quarterSet.add(quarter);
  });

  const quarterOptions = [...quarterSet]
    .sort((a, b) => b.localeCompare(a))
    .map((period) => ({
      value: period,
      label: formatQuarterPeriod(period),
      group: "Trimestres",
    }));

  return { monthOptions, quarterOptions };
};

export const buildQueryParams = (filters) => {
  const query = { ...filters };
  delete query.period;
  return query;
};

export const toHeroSelectedKey = (value) =>
  value === undefined || value === null || value === ""
    ? HERO_ALL_KEY
    : String(value);

export const parseHeroSelection = (selection) => {
  if (selection === "all") return HERO_ALL_KEY;
  const [firstKey] = Array.from(selection || []);
  return firstKey ? String(firstKey) : HERO_ALL_KEY;
};
