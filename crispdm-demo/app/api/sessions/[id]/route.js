import demoSession from "../../../lib/demo-session.json";
import { NextResponse } from "next/server";

export async function GET(_request, { params }) {
  const { id } = await params;
  if (id !== demoSession.id) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(demoSession);
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
