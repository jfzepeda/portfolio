export type StructuredUploadRecord = {
  fileName: string;
  mimeType: string;
  size: number;
  status: "pending_structured_pipeline";
  nextStep: "supabase_ingestion";
};

export async function queueStructuredUploadPlaceholder(
  file: File,
): Promise<StructuredUploadRecord> {
  // Future plug-in point: persist the raw object and a processing job in Supabase.
  return {
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    status: "pending_structured_pipeline",
    nextStep: "supabase_ingestion",
  };
}
