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
  if (EXACT[path] !== undefined) return EXACT[path];
  for (const [prefix, value] of PREFIX) {
    if (path.startsWith(prefix)) return value;
  }
  if (method.toUpperCase() === "GET") return EMPTY_COLLECTION;
  return SUCCESS_NOOP(method);
}
