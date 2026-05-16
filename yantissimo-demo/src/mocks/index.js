import me from "./me.json";
import invoices from "./invoices.json";
import invList from "./inv-list.json";
import ordersCount from "./orders-count.json";
import eventsAll from "./events-all.json";
import qrScans from "./qr-scans.json";
import qrStats from "./qr-stats.json";
import distInsights from "./dist-insights.json";

const EXACT = {
  "/me": me,
  "/api/invoices": invoices,
  "/api/inv/list": invList,
  "/api/orders/count": ordersCount,
  "/api/events/get/all": eventsAll,
  "/qr/scans": qrScans,
  "/qr/stats": qrStats,
};

const PREFIX = [
  ["/api/dist-insights", distInsights],
  ["/api/dist/list", { items: [], total: 0 }],
  ["/api/dist", { items: [], total: 0 }],
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
