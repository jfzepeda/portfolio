import { RIN_FIELDS } from "./constants";

const toArray = (v) => (Array.isArray(v) ? v : v == null ? [] : [v]);

export const makeEmptyRinRow = () =>
  RIN_FIELDS.reduce((acc, k) => ({ ...acc, [k]: 0 }), { rim: "" });

export const parseConditionsForEdit = (cond) => {
  const norm = (c) => ({
    ...c,
    param: toArray(c?.param).map((x) =>
      typeof x === "string" ? x : String(x)
    ),
  });
  return Array.isArray(cond)
    ? cond.map(norm)
    : cond && typeof cond === "object"
    ? [norm(cond)]
    : [];
};

export const sanitizeConditionsForSave = (conditions, allowedColumns) =>
  conditions
    .map((c) => {
      const raw = Array.isArray(c.param) ? c.param : c.param == null ? [] : [c.param];
      const cleaned = raw
        .map((v) => (typeof v === "string" ? v : String(v)))
        .map((v) => v.trim())
        .filter((v) => v !== "");
      return { column: c.column, operator: c.operator, param: cleaned };
    })
    .filter((c) => c.param.length > 0 && allowedColumns.includes(c.column));

export const parseRinesFromRow = (r) => {
  if (Array.isArray(r)) {
    return r.map((x) => ({
      rim: x.rim ?? x.rin ?? "",
      ...RIN_FIELDS.reduce((acc, k) => ({ ...acc, [k]: Number(x[k]) || 0 }), {}),
    }));
  } else if (r && typeof r === "object") {
    return [
      {
        rim: "",
        ...RIN_FIELDS.reduce((acc, k) => ({ ...acc, [k]: Number(r[k]) || 0 }), {}),
      },
    ];
  }
  return [];
};

export const serializeRinesForSave = (rows) =>
  rows
    .filter((r) => (r.rim ?? "").toString().trim() !== "")
    .map((r) => ({
      rim: isNaN(Number(r.rim)) ? r.rim : Number(r.rim),
      ...RIN_FIELDS.reduce(
        (acc, k) => ({ ...acc, [k]: r[k] === "" ? 0 : Number(r[k]) || 0 }),
        {}
      ),
    }));

