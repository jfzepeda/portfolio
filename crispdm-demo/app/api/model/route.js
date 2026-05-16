import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "demo_mode",
      demo: true,
      message: "Demo mode — model training runs a Python sidecar in the live tool. Disabled here.",
    },
    { status: 503 },
  );
}
