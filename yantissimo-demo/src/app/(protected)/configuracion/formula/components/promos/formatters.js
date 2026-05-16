export function conditionsToSummary(conditions) {
  if (!conditions) return "—";
  const list = Array.isArray(conditions) ? conditions : [conditions];
  if (!list.length) return "—";
  return list
    .map((c) => {
      const col = c.column ?? c.col ?? "?";
      const op = c.operator ?? c.op ?? "?";
      const raw = c.param ?? c.value ?? c.val ?? "?";
      const p = Array.isArray(raw)
        ? raw.join(", ")
        : typeof raw === "object"
        ? JSON.stringify(raw)
        : raw;
      return `${col} ${op} ${p}`;
    })
    .join(" · ");
}

export function rinesToSummary(rines) {
  if (!rines) return "—";
  if (Array.isArray(rines)) {
    if (!rines.length) return "—";
    const rims = rines
      .map((r) => r.rim ?? r.rin ?? r.rines ?? r.size ?? r)
      .filter((v) => v !== undefined && v !== null)
      .slice(0, 4)
      .join(", ");
    const extra = rines.length - Math.min(4, rines.length);
    return `${rines.length} medidas${rims ? ": " + rims : ""}${
      extra > 0 ? ` (+${extra})` : ""
    }`;
  }
  if (typeof rines === "object") {
    const keys = Object.keys(rines).filter((k) => Number(rines[k]) !== 0);
    return keys.length ? `default (${keys.length} campos)` : "—";
  }
  return "—";
}

