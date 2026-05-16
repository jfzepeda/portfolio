const BACKEND = process.env.NEXT_PUBLIC_API_URL;

export async function POST(request) {
  const body = await request.json();
  const res = await fetch(`${BACKEND}/api/garantia`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: request.headers.get('cookie') || '',
    },
    body: JSON.stringify(body),
  });
  return new Response(res.body, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const qs = searchParams.toString();
  const res = await fetch(`${BACKEND}/api/garantia${qs ? '?' + qs : ''}`, {
    headers: { Cookie: request.headers.get('cookie') || '' },
  });
  return new Response(res.body, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
