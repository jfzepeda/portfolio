export type UploadRoute = "vector_store" | "structured_pipeline" | "unsupported";

const structuredExtensions = new Set([
  "csv",
  "tsv",
  "xls",
  "xlsx",
  "ods",
  "json",
  "jsonl",
  "parquet",
]);

const vectorStoreExtensions = new Set([
  "txt",
  "md",
  "markdown",
  "pdf",
  "doc",
  "docx",
  "html",
  "htm",
  "rtf",
]);

const structuredMimeTypes = new Set([
  "text/csv",
  "text/tab-separated-values",
  "application/csv",
  "application/json",
  "application/jsonl",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.oasis.opendocument.spreadsheet",
]);

const vectorStoreMimeTypes = new Set([
  "text/plain",
  "text/markdown",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/html",
  "application/rtf",
]);

export function getFileExtension(fileName: string) {
  const normalized = fileName.toLowerCase().trim();
  const lastDot = normalized.lastIndexOf(".");

  if (lastDot === -1 || lastDot === normalized.length - 1) {
    return "";
  }

  return normalized.slice(lastDot + 1);
}

export function classifyUpload(file: File): UploadRoute {
  const extension = getFileExtension(file.name);
  const mimeType = file.type.toLowerCase();

  if (structuredExtensions.has(extension) || structuredMimeTypes.has(mimeType)) {
    return "structured_pipeline";
  }

  if (vectorStoreExtensions.has(extension) || vectorStoreMimeTypes.has(mimeType)) {
    return "vector_store";
  }

  return "unsupported";
}

export function getUploadRouteLabel(route: UploadRoute) {
  switch (route) {
    case "vector_store":
      return "Vector Store";
    case "structured_pipeline":
      return "Flujo estructurado";
    case "unsupported":
      return "No soportado";
  }
}
