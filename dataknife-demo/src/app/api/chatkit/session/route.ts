import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      client_secret: null,
      demo: true,
      message:
        "Demo mode — ChatKit is not connected. In production this endpoint creates an OpenAI ChatKit session for RAG queries over the uploaded documents.",
    },
    { status: 503 },
  );
}
