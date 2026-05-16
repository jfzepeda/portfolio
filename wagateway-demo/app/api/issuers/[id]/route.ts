import { NextResponse } from 'next/server';

const BASE = process.env.GATEWAY_URL!;

function headers(): HeadersInit {
  return {
    'X-Master-Token': process.env.GATEWAY_MASTER_TOKEN!,
    'Content-Type': 'application/json',
  };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const res = await fetch(`${BASE}/issuers/${id}`, {
    headers: headers(),
    cache: 'no-store',
  });
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const res = await fetch(`${BASE}/issuers/${id}`, {
    method: 'DELETE',
    headers: headers(),
    cache: 'no-store',
  });
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
