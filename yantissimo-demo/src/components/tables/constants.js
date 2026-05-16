import { currencyFormatter, dateFormatter, percentFormatter } from "~/utils/formaters";

/** Default formatter functions keyed by column `type`. */
export const FORMATTERS = {
  text: (value) => (value ?? ""),
  currency: (value, col) => currencyFormatter(value, col?.decimals ?? 0),
  date: (value) => dateFormatter(value),
  percent: (value) => percentFormatter(value),
};

/** Recognised filter operators. */
export const FILTER_OPERATORS = {
  eq: "eq",
  neq: "neq",
  gt: "gt",
  gte: "gte",
  lt: "lt",
  lte: "lte",
  contains: "contains",
  in: "in",
  between: "between",
};

/** Threshold below which a select dropdown is shown instead of autocomplete. */
export const DISTINCT_THRESHOLD = 10;

/** Default page-size options for pagination. */
export const PAGE_SIZE_OPTIONS = [25, 50, 100];

/** localStorage key prefix for column visibility preferences. */
export const COLUMN_PREFS_PREFIX = "st_cols_v1_";
