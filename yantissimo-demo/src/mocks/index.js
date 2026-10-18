import me from "./me.json";
import invoices from "./invoices.json";
import invList from "./inv-list.json";
import ordersCount from "./orders-count.json";
import eventsAll from "./events-all.json";
import qrScans from "./qr-scans.json";
import qrStats from "./qr-stats.json";
import distInsights from "./dist-insights.json";

import customers from "./customers.json";
import vehicles from "./vehicles.json";
import quotes from "./quotes.json";
import orders from "./orders.json";
import productsCatalog from "./products-catalog.json";
import services from "./services.json";
import agreements from "./agreements.json";
import club from "./club.json";
import reminders from "./reminders.json";
import users from "./users.json";
import threads from "./threads.json";
import warranties from "./warranties.json";
import rampas from "./rampas.json";
import dashboard from "./dashboard.json";
import auditoria from "./auditoria.json";

const firstItem = (collection) =>
  Array.isArray(collection?.items) && collection.items.length > 0
    ? collection.items[0]
    : collection;

const michelinOnly = {
  items: productsCatalog.items.filter((p) => p.proveedor === "Michelin"),
};
michelinOnly.total = michelinOnly.items.length;

const servicesLines = { items: services.lines, total: services.lines.length };

const EXACT = {
  "/me": me,
  "/api/me": me,

  "/api/invoices": invoices,
  "/api/invoices/filters": invoices.filters || {},
  "/api/invoices/payment-complements": { items: [], total: 0 },

  "/api/inv/list": invList,
  "/api/inv/search": productsCatalog,
  "/api/inv/exis": productsCatalog,
  "/api/inv/inv_michelin": michelinOnly,

  "/api/orders/count": ordersCount,
  "/api/orders": orders,
  "/api/myr/orders/client": orders,

  "/api/quotes": quotes,
  "/api/quotes/save": { ok: true, id: "demo-quote-saved", message: "Demo mode — no real backend." },

  "/api/events/get/all": eventsAll,

  "/qr/scans": qrScans,
  "/qr/stats": qrStats,
  "/api/qr/scans": qrScans,
  "/api/qr/stats": qrStats,

  "/api/clients/get": firstItem(customers),
  "/api/clients/vehicles": vehicles,
  "/api/customers": customers,

  "/api/services/get/services": services.services,
  "/api/services/get/lines": servicesLines,

  "/api/mobile-app/club": club,
  "/api/mobile-app/convenios": agreements,
  "/api/mobile-app/reminders": reminders,
  "/api/mobile-app/visits": eventsAll,
  "/api/mobile-app/promotions": agreements,
  "/api/mobile-app/postchecks": { items: [], total: 0 },

  "/api/agreements": agreements,
  "/api/reminders": reminders,
  "/api/club": club,
  "/api/threads": threads,
  "/api/agent/threads": threads,
  "/api/conversations": threads,

  "/api/dashboard": dashboard,
  "/api/stats": dashboard,
  "/api/reportes": dashboard,

  "/api/auditoria": auditoria,
  "/api/auditoria/sessions": { items: auditoria.sessions, total: auditoria.total },
  "/api/auditoria/michelin-catalog": auditoria.michelinCatalog,

  "/api/garantias": warranties,
  "/api/warranties": warranties,

  "/api/users": users,
  "/api/schedules": rampas,
  "/api/rampas": rampas,
};

const PREFIX = [
  ["/api/dist-insights", distInsights],
  ["/api/dist/list", { items: [], total: 0 }],
  ["/api/dist", { items: [], total: 0 }],

  ["/api/garantias/", firstItem(warranties)],
  ["/api/warranties/", firstItem(warranties)],
  ["/api/quotes/", firstItem(quotes)],
  ["/api/orders/", firstItem(orders)],
  ["/api/invoices/", firstItem(invoices)],
  ["/api/clients/", firstItem(customers)],
  ["/api/customers/", firstItem(customers)],
  ["/api/users/", firstItem(users)],
  ["/api/threads/", firstItem(threads)],
  ["/api/auditoria/session", auditoria.sessions[0]],
  ["/api/auditoria/", auditoria.sessions[0]],
  ["/api/services/admin/services", { ok: true, message: "Demo mode — no real backend." }],
];

const EMPTY_COLLECTION = { items: [], data: [], total: 0 };

const SUCCESS_NOOP = (method) => ({
  ok: true,
  id: `demo-${Math.random().toString(36).slice(2, 10)}`,
  method,
  message: "Demo mode — no real backend.",
});

export function resolveMock(rawPath, method = "GET") {
  const path = (rawPath || "").split("?")[0];
  if (path === "/api/dashboard/store/summary" || path === "/api/dashboard/personal/summary" || path === "/api/dashboard/series") {
    const params = new URLSearchParams((rawPath || "").split("?")[1]);
    const branch = dashboard.salesBySucursal.find((item) => item.sucursal === params.get("sucursal")) || dashboard.salesBySucursal[0];
    const personal = path.includes("/personal/") || params.has("seller");
    const factor = personal ? 0.25 : 1;
    const sales = Math.round(branch.ventas * factor);
    const count = Math.round(branch.ordenes * factor);
    const from = new Date(`${params.get("from") || "2026-05-01"}T00:00:00Z`);
    const to = new Date(`${params.get("to") || "2026-05-31"}T00:00:00Z`);
    const days = Math.max(1, Math.min(366, Math.round((to - from) / 86400000) + 1));
    const points = Array.from({ length: days }, (_, index) => ({
      date: new Date(from.getTime() + index * 86400000).toISOString().slice(0, 10),
      value: params.get("metric") === "quotes" ? Math.round(count / days) : Math.round(sales / days),
    }));
    if (path === "/api/dashboard/series") return points;
    return {
      demo: true,
      kpis: {
        sales_amount_period: sales, sales_count_period: count,
        quotes_count_period: count + 12, quotes_open_count: 12,
        avg_ticket_period: count ? sales / count : 0,
        customers_served_period: count, tires_qty_period: count * 3,
        services_qty_period: count * 2,
      },
      leaderboards: {
        sellers: dashboard.sellerLeaderboard.filter((item) => item.sucursal === branch.sucursal).map((item) => ({ seller: item.seller, amount: item.ventas * factor })),
        brands: [{ brand: "Michelin", qty: count * 2 }, { brand: "Yantissimo", qty: count }],
      },
      heatmap: [9, 10, 11, 12, 14, 15, 16].map((hour) => ({ ramp: "Rampa A", hour, minutes: 30 + hour })),
    };
  }
  if (EXACT[path] !== undefined) return EXACT[path];
  for (const [prefix, value] of PREFIX) {
    if (path.startsWith(prefix)) return value;
  }
  if (method.toUpperCase() === "GET") return EMPTY_COLLECTION;
  return SUCCESS_NOOP(method);
}
