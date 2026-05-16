import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "demo_mode",
      demo: true,
      message: "Demo mode — file uploads are disabled to prevent unbounded disk writes. Run the workbench locally to upload your own CSVs.",
    },
    { status: 503 },
  );
}
