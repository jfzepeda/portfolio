import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([]);
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
