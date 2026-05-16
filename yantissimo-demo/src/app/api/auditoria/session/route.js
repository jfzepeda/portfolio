const BACKEND = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3050";

export async function GET(request) {
  const url = new URL(request.url);
  const target = `${BACKEND}/api/auditoria/session${url.search}`;
  const res = await fetch(target, {
    headers: { Cookie: request.headers.get("cookie") || "" },
  });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}

export async function POST(request) {
  const body = await request.json();
  const res = await fetch(`${BACKEND}/api/auditoria/session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: request.headers.get("cookie") || "",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return Response.json(data, { status: res.status });
}
