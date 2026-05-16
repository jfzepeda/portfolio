import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      error: "not_found",
      demo: true,
      message: "Demo mode — no saved sessions are bundled in this build.",
    },
    { status: 404 },
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: "demo_mode", demo: true, message: "Demo mode — session updates disabled." },
    { status: 503 },
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "demo_mode", demo: true, message: "Demo mode — session deletes disabled." },
    { status: 503 },
  );
}
