import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([{ id: "housing-demo", filename: "housing-example.csv", createdAt: "2026-10-17T12:00:00Z", objective: "Housing prices — simulated example", step: 6, demo: true }]);
}

export async function POST() {
  return NextResponse.json(
    {
      error: "demo_mode",
      demo: true,
      message: "Demo mode — sessions are file-backed in the live tool. Disabled here (Vercel filesystem is read-only at runtime).",
    },
    { status: 503 },
  );
}
