"use client";
import { useState } from "react";
import { History, X, Trash2, ArrowUpRight, Loader2, FolderOpen } from "lucide-react";

export default function SessionsPanel({ onLoadSession }) {
  const [open, setOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sessions");
      const data = await res.json();
      setSessions(Array.isArray(data) ? data : []);
    } catch {
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    fetchSessions();
  };

  const handleLoad = (id) => {
    onLoadSession?.(id);
    setOpen(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this session? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await fetch(`/api/sessions/${id}`, { method: "DELETE" });
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all hover:opacity-80"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        <History size={14} style={{ color: "var(--text-secondary)" }} />
        <span style={{ color: "var(--text-secondary)" }}>Sessions</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.6)" }}
        >
          <div
            className="card w-full max-w-lg mx-4 max-h-[80vh] flex flex-col"
            style={{ background: "var(--bg-secondary)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History size={18} style={{ color: "var(--accent)" }} />
                <h3 className="text-base font-bold">Saved Sessions</h3>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(99,102,241,0.15)",
                    color: "var(--accent)",
                  }}
                >
                  {sessions.length}
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded hover:opacity-70"
              >
                <X size={18} style={{ color: "var(--text-secondary)" }} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2
                    size={24}
                    className="pulse"
                    style={{ color: "var(--accent)" }}
                  />
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen
                    size={40}
                    className="mx-auto mb-3"
                    style={{ color: "var(--text-secondary)", opacity: 0.5 }}
                  />
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    No saved sessions yet
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: "var(--text-secondary)", opacity: 0.7 }}
                  >
                    Sessions are saved automatically after each analysis
                  </p>
                </div>
              ) : (
                sessions.map((s) => (
                  <div
                    key={s.id}
                    className="p-3 rounded-lg transition-all"
                    style={{
                      background: "var(--bg-primary)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">
                          {s.filename}
                        </p>
                        <p
                          className="text-xs mt-0.5 line-clamp-2"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {s.objective}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span
                            className="text-xs"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {formatDate(s.createdAt)}
                          </span>
                          {s.taskType && (
                            <span
                              className="text-xs px-1.5 py-0.5 rounded"
                              style={{
                                background: "rgba(99,102,241,0.15)",
                                color: "var(--accent)",
                              }}
                            >
                              {s.taskType}
                            </span>
                          )}
                          {s.bestModel && (
                            <span
                              className="text-xs px-1.5 py-0.5 rounded"
                              style={{
                                background: "rgba(34,197,94,0.15)",
                                color: "var(--success)",
                              }}
                            >
                              {s.bestModel}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => handleLoad(s.id)}
                          className="p-1.5 rounded-lg transition-all hover:opacity-80"
                          style={{
                            background: "rgba(99,102,241,0.15)",
                            color: "var(--accent)",
                          }}
                          title="Load session"
                        >
                          <ArrowUpRight size={14} />
                        </button>
                        <button
                          disabled={s.demo}
                          onClick={() => handleDelete(s.id)}
                          disabled={deleting === s.id}
                          className="p-1.5 rounded-lg transition-all hover:opacity-80"
                          style={{
                            background: "rgba(239,68,68,0.1)",
                            color: "var(--error)",
                          }}
                          title="Delete session"
                        >
                          {deleting === s.id ? (
                            <Loader2 size={14} className="pulse" />
                          ) : (
                            <Trash2 size={14} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
