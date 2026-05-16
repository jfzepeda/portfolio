import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "demo_mode",
      demo: true,
      message: "Demo mode — dataset analysis runs a Python sidecar in the live tool. Disabled here so a visitor can't trigger arbitrary subprocess execution.",
    },
    { status: 503 },
  );
}
