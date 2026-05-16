import { NextRequest, NextResponse } from 'next/server';

const BASE = process.env.GATEWAY_URL!;

function headers(): HeadersInit {
  return {
    'X-Master-Token': process.env.GATEWAY_MASTER_TOKEN!,
    'Content-Type': 'application/json',
  };
}

export async function GET() {
  const res = await fetch(`${BASE}/issuers`, { headers: headers(), cache: 'no-store' });
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const res = await fetch(`${BASE}/issuers`, {
    method: 'POST',
    headers: headers(),
    body,
    cache: 'no-store',
  });
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
