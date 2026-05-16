import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEMO_ROWS = [
  { client_id: "C-001", name: "Distribuidora Norte SA", revenue_ytd: 248750.0, orders: 18, last_order: "2026-05-12" },
  { client_id: "C-002", name: "Llantas y Rines del Bajío", revenue_ytd: 187320.0, orders: 14, last_order: "2026-05-09" },
  { client_id: "C-003", name: "AutoCenter Pacífico", revenue_ytd: 142100.0, orders: 22, last_order: "2026-05-14" },
  { client_id: "C-004", name: "Servicios Express Monterrey", revenue_ytd: 98540.0, orders: 11, last_order: "2026-05-07" },
  { client_id: "C-005", name: "Refaccionaria Central", revenue_ytd: 76340.0, orders: 9, last_order: "2026-05-11" },
];

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const sql = typeof body.sql === "string" ? body.sql : "SELECT * FROM demo_clients;";

  return NextResponse.json({
    ok: true,
    demo: true,
    executed_sql: sql,
    result: {
      rowCount: DEMO_ROWS.length,
      rows: DEMO_ROWS,
    },
    demoNote:
      "Demo mode — canned data. In production this tool runs validated SELECT-only SQL against Supabase via an RPC.",
  });
}
