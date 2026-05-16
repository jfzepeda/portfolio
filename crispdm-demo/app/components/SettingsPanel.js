"use client";
import { useState, useEffect } from "react";
import { Settings, X, Eye, EyeOff } from "lucide-react";

const PROVIDERS = [
  {
    id: "anthropic",
    name: "Claude",
    model: "claude-sonnet-4-5-20250929",
    color: "#d97706",
  },
  { id: "openai", name: "OpenAI", model: "gpt-5.4", color: "#10b981" },
];

export default function SettingsPanel({ onSettingsChange }) {
  const [open, setOpen] = useState(false);
  const [provider, setProvider] = useState("anthropic");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("crisp_ai_provider");
    const savedKey = localStorage.getItem("crisp_ai_apikey");
    if (saved) setProvider(saved);
    if (savedKey) setApiKey(savedKey);
    onSettingsChange?.({
      provider: saved || "anthropic",
      apiKey: savedKey || "",
    });
  }, []);

  const handleSave = () => {
    localStorage.setItem("crisp_ai_provider", provider);
    localStorage.setItem("crisp_ai_apikey", apiKey);
    onSettingsChange?.({ provider, apiKey });
    setOpen(false);
  };

  const current = PROVIDERS.find((p) => p.id === provider);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all hover:opacity-80"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        <span
          className="w-2 h-2 rounded-full"
          style={{ background: current.color }}
        />
        <span style={{ color: "var(--text-secondary)" }}>{current.name}</span>
        <Settings size={14} style={{ color: "var(--text-secondary)" }} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.6)" }}
        >
          <div
            className="card w-full max-w-md mx-4"
            style={{ background: "var(--bg-secondary)" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold">AI Provider Settings</h3>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded hover:opacity-70"
              >
                <X size={18} style={{ color: "var(--text-secondary)" }} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  className="text-xs font-semibold mb-2 block"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Provider
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PROVIDERS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setProvider(p.id);
                        setApiKey("");
                      }}
                      className="p-3 rounded-lg text-left transition-all"
                      style={{
                        background:
                          provider === p.id
                            ? "rgba(99,102,241,0.1)"
                            : "var(--bg-primary)",
                        border: `1px solid ${
                          provider === p.id ? "var(--accent)" : "var(--border)"
                        }`,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ background: p.color }}
                        />
                        <span className="text-sm font-semibold">{p.name}</span>
                      </div>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {p.model}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  className="text-xs font-semibold mb-2 block"
                  style={{ color: "var(--text-secondary)" }}
                >
                  API Key{" "}
                  {provider === "anthropic" ? "(Anthropic)" : "(OpenAI)"}
                </label>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={
                      provider === "anthropic" ? "sk-ant-..." : "sk-..."
                    }
                    className="w-full rounded-lg p-3 pr-10 text-sm"
                    style={{
                      background: "var(--bg-primary)",
                      border: "1px solid var(--border)",
                      color: "var(--text-primary)",
                    }}
                  />
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showKey ? (
                      <EyeOff
                        size={14}
                        style={{ color: "var(--text-secondary)" }}
                      />
                    ) : (
                      <Eye
                        size={14}
                        style={{ color: "var(--text-secondary)" }}
                      />
                    )}
                  </button>
                </div>
                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Leave empty to use server environment variable
                </p>
              </div>
            </div>

            <button className="btn-primary w-full mt-6" onClick={handleSave}>
              Save Settings
            </button>
          </div>
        </div>
      )}
    </>
  );
}
