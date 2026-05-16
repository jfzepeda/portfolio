import { NextResponse } from 'next/server';

const BASE = process.env.GATEWAY_URL!;

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const res = await fetch(`${BASE}/issuers/${id}/logout`, {
    method: 'POST',
    headers: {
      'X-Master-Token': process.env.GATEWAY_MASTER_TOKEN!,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
