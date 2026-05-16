import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "demo_mode",
      demo: true,
      message: "Demo mode — data processing runs as a Python subprocess in the live tool. Disabled here.",
    },
    { status: 503 },
  );
}
