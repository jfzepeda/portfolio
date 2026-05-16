const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3050";

export async function GET(request) {
  const res = await fetch(`${BACKEND}/api/auditoria/michelin-catalog`, {
    headers: { Cookie: request.headers.get("cookie") || "" },
  });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}
