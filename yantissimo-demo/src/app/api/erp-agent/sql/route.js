const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3050";

export async function POST(request) {
  const body = await request.json();

  const backendRes = await fetch(`${BACKEND_URL}/api/erp-agent/sql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: request.headers.get("cookie") || "",
    },
    body: JSON.stringify(body),
  });

  if (!backendRes.ok) {
    return new Response(backendRes.body, { status: backendRes.status });
  }

  return new Response(backendRes.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
