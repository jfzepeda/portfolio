import { NextResponse } from 'next/server';

const BASE = process.env.GATEWAY_URL!;

export async function GET() {
  const res = await fetch(`${BASE}/projects`, {
    headers: { 'X-Master-Token': process.env.GATEWAY_MASTER_TOKEN! },
    cache: 'no-store',
  });
  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
