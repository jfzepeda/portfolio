import { toFile } from "openai";

import { getOpenAIClient, getVectorStoreId } from "@/lib/openai/client";

export type VectorStoreUploadRecord = {
  fileName: string;
  fileId: string;
  vectorStoreId: string;
  status: "completed" | "failed" | "cancelled" | "in_progress";
};

export async function uploadFilesToVectorStore(files: File[]) {
  const openai = getOpenAIClient();
  const vectorStoreId = getVectorStoreId();

  const uploadedFiles = await Promise.all(
    files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadable = await toFile(buffer, file.name, {
        type: file.type || "application/octet-stream",
      });

      const uploaded = await openai.files.create({
        file: uploadable,
        purpose: "assistants",
      });

      return {
        fileName: file.name,
        fileId: uploaded.id,
      };
    }),
  );

  const batch = await openai.vectorStores.fileBatches.createAndPoll(
    vectorStoreId,
    {
      files: uploadedFiles.map((file) => ({
        file_id: file.fileId,
        attributes: {
          source: "dataknife_upload_bay",
          source_filename: file.fileName,
          uploaded_at: new Date().toISOString(),
        },
      })),
    },
    {
      pollIntervalMs: 1500,
    },
  );

  const records: VectorStoreUploadRecord[] = uploadedFiles.map((file) => ({
    ...file,
    vectorStoreId,
    status: batch.status,
  }));

  return {
    batchId: batch.id,
    fileCounts: batch.file_counts,
    files: records,
    status: batch.status,
    vectorStoreId,
  };
}
