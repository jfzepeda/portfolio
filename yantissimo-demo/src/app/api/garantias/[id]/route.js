const BACKEND = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request, { params }) {
  const { id } = await params;
  const res = await fetch(`${BACKEND}/api/garantia/${id}`, {
    headers: { Cookie: request.headers.get('cookie') || '' },
  });
  return new Response(res.body, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const res = await fetch(`${BACKEND}/api/garantia/${id}`, {
    method: 'PUT',
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
