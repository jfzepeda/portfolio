import { NextRequest, NextResponse } from 'next/server';

const BASE = process.env.GATEWAY_URL!;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const body = await req.text();
  const res = await fetch(`${BASE}/projects/${encodeURIComponent(name)}/issuer`, {
    method: 'PATCH',
    headers: {
      'X-Master-Token': process.env.GATEWAY_MASTER_TOKEN!,
      'Content-Type': 'application/json',
    },
    body,
    cache: 'no-store',
  });
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
