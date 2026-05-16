"use client";
import { Terminal } from "lucide-react";

export default function LogPanel({ logs }) {
  if (!logs.length) return null;

  return (
    <div className="card mt-4" style={{ background: "#0d0d14" }}>
      <div className="flex items-center gap-2 mb-3">
        <Terminal size={14} style={{ color: "var(--accent)" }} />
        <span className="text-xs font-semibold" style={{ color: "var(--text-secondary)" }}>
          PIPELINE LOG
        </span>
      </div>
      <div className="max-h-48 overflow-y-auto scrollbar-thin">
        {logs.map((log, i) => (
          <div key={i} className="log-entry">
            <span style={{ color: "var(--accent)", marginRight: 8 }}>
              [{log.time}]
            </span>
            <span style={{ color: log.type === "error" ? "var(--error)" : log.type === "success" ? "var(--success)" : "var(--text-secondary)" }}>
              {log.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
