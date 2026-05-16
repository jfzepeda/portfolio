import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 10;

export async function POST(request: Request) {
  const formData = await request.formData().catch(() => null);
  const files = formData
    ? formData.getAll("files").filter((value): value is File => value instanceof File)
    : [];

  const accepted = files.map((file) => ({
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    size: file.size,
    status: "demo_accepted" as const,
  }));

  return NextResponse.json({
    vectorStore: {
      demo: true,
      batchId: `demo-batch-${Math.random().toString(36).slice(2, 10)}`,
      filesAccepted: accepted,
    },
    structured: [],
    unsupported: [],
    summary: {
      received: files.length,
      sentToVectorStore: files.length,
      sentToStructuredPipeline: 0,
      unsupported: 0,
    },
    demoNote:
      "Demo mode — no file was uploaded to OpenAI. The production pipeline routes documents to a Vector Store and/or a structured-data extractor.",
  });
}
