export const SQL_TOOL_NAMES = new Set([
  "execute_sql",
  "sql_tool",
  "query_database",
  "onSqlTool",
]);

const FORBIDDEN_KEYWORDS = [
  "insert",
  "update",
  "delete",
  "drop",
  "alter",
  "truncate",
  "create",
  "grant",
  "revoke",
  "comment",
  "merge",
  "call",
  "do",
  "copy",
  "vacuum",
  "analyze",
  "refresh",
];

export function isSqlToolName(name) {
  return typeof name === "string" && SQL_TOOL_NAMES.has(name);
}

export function stripSqlComments(sql) {
  return sql.replace(/--.*$/gm, "").replace(/\/\*[\s\S]*?\*\//g, "");
}

export function validateSelectOnly(rawSql) {
  if (typeof rawSql !== "string" || !rawSql.trim()) {
    throw new Error("SQL vacio.");
  }

  const sql = stripSqlComments(rawSql).trim();
  const semicolons = (sql.match(/;/g) || []).length;

  if (semicolons > 1) {
    throw new Error("Solo se permite una sentencia SQL.");
  }

  if (semicolons === 1 && !sql.endsWith(";")) {
    throw new Error("El punto y coma solo se permite al final.");
  }

  const normalized = sql.replace(/;$/, "").trim();

  if (!/^(select|with)\b/i.test(normalized)) {
    throw new Error("Solo se permiten consultas SELECT o WITH ... SELECT.");
  }

  if (/\b(pg_catalog|information_schema)\b/i.test(normalized)) {
    throw new Error("No se permite consultar schemas del sistema.");
  }

  const lower = normalized.toLowerCase();

  for (const keyword of FORBIDDEN_KEYWORDS) {
    if (new RegExp(`\\b${keyword}\\b`, "i").test(lower)) {
      throw new Error(`Keyword no permitida: ${keyword}`);
    }
  }

  if (/\bpg_sleep\s*\(/i.test(lower)) {
    throw new Error("Funcion no permitida: pg_sleep");
  }

  return `${normalized};`;
}

export function enforceLimit(sql, rowLimit = 500) {
  const normalized = sql.trim().replace(/;$/, "");

  if (/\blimit\b/i.test(normalized)) {
    return `${normalized};`;
  }

  return `${normalized} LIMIT ${Number(rowLimit)};`;
}

export function extractSqlFromToolCall(toolCallOrParams) {
  const params = toolCallOrParams?.params ?? toolCallOrParams ?? {};
  const sql = params.sql ?? params.query ?? params.statement;

  if (typeof sql !== "string") {
    throw new Error("La tool SQL debe enviar un parametro sql.");
  }

  return sql;
}

export async function executeSqlViaApi(toolCallOrParams) {
  const sql = extractSqlFromToolCall(toolCallOrParams);
  const safeSql = validateSelectOnly(sql);
  const params = toolCallOrParams?.params ?? toolCallOrParams ?? {};

  const response = await fetch("/api/tools/sql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sql: safeSql,
      rowLimit: params.rowLimit,
      timeoutMs: params.timeoutMs,
    }),
  });

  const payload = await response.json();

  if (!response.ok) {
    return {
      ok: false,
      error: payload.message ?? "No se pudo ejecutar SQL.",
    };
  }

  return payload;
}

export async function onSqlTool(toolCall) {
  try {
    return await executeSqlViaApi(toolCall);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Error ejecutando SQL.",
    };
  }
}
