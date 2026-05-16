"use client";

import { useState, useRef, useEffect, useCallback, memo } from "react";
import Image from "next/image";
import { post } from "~/lib/api";
import { Box } from "@mui/material";
// import Markdown from "markdown-to-jsx";
import { getUserProfile } from "~/utils/session";
import { firstUpperCase } from "~/utils/formaters";

// --- Static icon components (module scope to avoid re-creation on render) ---

const SendIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);

const PlusIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const ChevronIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const AnthropicStar = () => (
  <Image width="36" height="36" alt="Anthropic Star" src="claude-logo.svg" />
);

const DriveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path d="M6.28 3h11.44l5.28 9.14-2.64 4.57H3.64L1 12.14Z" fill="#FBBC04" />
    <path d="M3.64 16.71 1 12.14l5.28-9.14L9.3 8.57Z" fill="#34A853" />
    <path d="M9.3 8.57l2.7 4.68h9.52L18.07 8.57Z" fill="#4285F4" />
  </svg>
);

const categories = [
  { icon: "✏️", label: "Escribir" },
  { icon: "🎓", label: "Aprender" },
  { icon: "</>", label: "Código", isCode: true },
  { icon: "☕", label: "Vida personal" },
  { icon: null, label: "Desde Drive", isDrive: true },
];

const UI_FONT = "'Nunito Sans', 'Avenir Next', 'Segoe UI', sans-serif";
const DATA_FONT = "'IBM Plex Mono', 'SFMono-Regular', Consolas, monospace";

const UI_COLORS = {
  canvas: "#f2ece4",
  surface: "#fffaf3",
  surfaceSoft: "#f8efe4",
  line: "rgba(67, 45, 26, 0.16)",
  lineStrong: "rgba(67, 45, 26, 0.28)",
  text: "#261b15",
  textSoft: "#6f594a",
  accent: "#b95635",
  accentMuted: "#dfc7b5",
};

// --- ChatInput: isolated component so typing doesn't re-render the rest ---

const ChatInput = memo(function ChatInput({ onSend, isStreaming }) {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const query = input.trim();
      if (!query || isStreaming) return;
      setInput("");
      onSend(query);
    }
  };

  const handleSend = () => {
    const query = input.trim();
    if (!query || isStreaming) return;
    setInput("");
    onSend(query);
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "640px",
        backgroundColor: UI_COLORS.surface,
        borderRadius: "18px",
        padding: "16px 16px 14px",
        boxShadow: "0 6px 18px rgba(52, 34, 20, 0.06)",
        border: focused
          ? `1px solid ${UI_COLORS.lineStrong}`
          : `1px solid ${UI_COLORS.line}`,
        transition: "border-color 150ms ease, box-shadow 150ms ease",
      }}
    >
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={handleKeyDown}
        placeholder="¿Cómo puedo ayudarle hoy?"
        rows={3}
        style={{
          width: "100%",
          border: "none",
          outline: "none",
          resize: "none",
          fontSize: "15px",
          color: UI_COLORS.text,
          backgroundColor: "transparent",
          fontFamily: UI_FONT,
          lineHeight: "1.55",
          caretColor: UI_COLORS.accent,
          boxSizing: "border-box",
        }}
      />

      {/* Bottom bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "12px",
        }}
      >
        {/* Left: Plus */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            type="button"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              color: UI_COLORS.textSoft,
              display: "flex",
              alignItems: "center",
              borderRadius: "6px",
              transition: "opacity 120ms ease",
            }}
            aria-label="Adjuntar"
          >
            <PlusIcon />
          </button>
        </div>

        {/* Right: Model + Send */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            style={{
              background: "none",
              border: "none",
              cursor: "default",
              color: UI_COLORS.textSoft,
              fontSize: "13px",
              fontFamily: UI_FONT,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 8px",
              borderRadius: "8px",
            }}
          >
            Sonnet 4.6 <ChevronIcon />
          </button>

          <button
            onClick={handleSend}
            disabled={!input.trim()}
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "50%",
              border: "none",
              cursor: input.trim() ? "pointer" : "default",
              backgroundColor: input.trim()
                ? UI_COLORS.accent
                : UI_COLORS.accentMuted,
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background-color 120ms ease",
              flexShrink: 0,
            }}
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </div>
  );
});

// --- Main page component ---

const ClaudePage = () => {
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [_error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const [profile, setProfile] = useState(null);

  useEffect(() => {
    setProfile(getUserProfile());
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async (query) => {
    console.log("[chat] sendMessage called with:", query);
    setError(null);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: query },
      { role: "assistant", content: "" },
    ]);
    setIsStreaming(true);

    try {
      const res = await post("/api/erp-agent/sql", { query });
      console.log(
        "[chat] fetch response status:",
        res.status,
        "ok:",
        res.ok,
        "body:",
        !!res.body
      );

      if (!res.ok) {
        throw new Error(`Error ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let sseBuffer = "";
      let chunkCount = 0;

      const processFrame = (frame) => {
        if (!frame.trim()) return;

        let eventType = "message";
        let dataStr = "";

        for (const line of frame.split("\n")) {
          if (line.startsWith("event: ")) {
            eventType = line.slice(7).trim();
          } else if (line.startsWith("data: ")) {
            dataStr = line.slice(6);
          }
        }

        console.log(`[chat] SSE event: "${eventType}"`, dataStr.slice(0, 100));

        if (eventType === "output_delta") {
          try {
            const parsed = JSON.parse(dataStr);
            const text = parsed.text || "";
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                content: updated[updated.length - 1].content + text,
              };
              return updated;
            });
          } catch (e) {
            console.error("[chat] output_delta parse error:", e);
          }
        } else if (eventType === "final_answer") {
          try {
            const parsed = JSON.parse(dataStr);
            const text = parsed.answer || "";
            console.log("[chat] final_answer text:", text.slice(0, 100));
            if (text) {
              setMessages((prev) => {
                const last = prev[prev.length - 1];
                if (last.content) {
                  console.log(
                    "[chat] skipping final_answer — content already set"
                  );
                  return prev;
                }
                console.log("[chat] setting final_answer as content");
                const updated = [...prev];
                updated[updated.length - 1] = {
                  ...last,
                  content: text,
                };
                return updated;
              });
            }
          } catch (e) {
            console.error("[chat] final_answer parse error:", e);
          }
        } else if (eventType === "error") {
          try {
            const parsed = JSON.parse(dataStr);
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "assistant",
                content: `_Error: ${parsed.details || parsed.error}_`,
                isError: true,
              };
              return updated;
            });
          } catch (e) {
            console.error("[chat] error event parse error:", e);
          }
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log(
            "[chat] reader done. Total chunks:",
            chunkCount,
            "remaining buffer:",
            JSON.stringify(sseBuffer)
          );
          if (sseBuffer.trim()) {
            for (const frame of sseBuffer.split("\n\n")) {
              processFrame(frame);
            }
          }
          break;
        }

        chunkCount++;
        const chunk = decoder.decode(value, { stream: true });
        console.log(
          `[chat] chunk #${chunkCount} (${chunk.length} chars):`,
          JSON.stringify(chunk.slice(0, 200))
        );

        sseBuffer += chunk;
        const frames = sseBuffer.split("\n\n");
        sseBuffer = frames.pop();

        console.log(
          `[chat] frames extracted: ${frames.length}, buffer remaining: ${sseBuffer.length} chars`
        );

        for (const frame of frames) {
          processFrame(frame);
        }
      }
    } catch (err) {
      console.error("[chat] sendMessage error:", err);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "_Error al conectar con el agente. Intenta de nuevo._",
          isError: true,
        };
        return updated;
      });
      setError(err.message);
    } finally {
      setIsStreaming(false);
    }
  }, []);

  const hasMessages = messages.length > 0;

  return (
    <Box
      sx={{
        backgroundColor: "transparent",
        border: "none",
        borderRadius: 0,
        height: "100dvh",
        minHeight: "100dvh",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          backgroundColor: UI_COLORS.canvas,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          fontFamily: UI_FONT,
          padding: "20px 16px",
          overflow: "hidden",
          overflowY: hasMessages ? "hidden" : "auto",
        }}
      >
        {/* Greeting — hidden once conversation starts */}
        {!hasMessages && (
          <div
            style={{
              width: "100%",
              maxWidth: "900px",
              height: "100%",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                position: "absolute",
                left: "50%",
                top: "22%",
                transform: "translateX(-50%)",
                width: "max-content",
                maxWidth: "100%",
              }}
            >
              <AnthropicStar />
              <h1
                style={{
                  fontSize: "clamp(1.75rem, 4vw, 2.4rem)",
                  fontWeight: "700",
                  color: UI_COLORS.text,
                  margin: 0,
                  letterSpacing: "-0.02em",
                }}
              >
                Buenos días {firstUpperCase(profile?.name) || "Usuario"}.
              </h1>
            </div>

            <div
              style={{
                width: "min(640px, 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                position: "absolute",
                left: "50%",
                top: "68%",
                transform: "translate(-50%, -50%)",
              }}
            >
              {/* Input Card (empty state) */}
              <ChatInput onSend={sendMessage} isStreaming={isStreaming} />

              {/* Category Pills */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  marginTop: "20px",
                  justifyContent: "center",
                  maxWidth: "640px",
                }}
              >
                {categories.map((cat) => (
                  <button
                    key={cat.label}
                    type="button"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      padding: "8px 14px",
                      borderRadius: "999px",
                      border: `1px solid ${UI_COLORS.line}`,
                      backgroundColor: UI_COLORS.surfaceSoft,
                      color: UI_COLORS.textSoft,
                      fontSize: "13px",
                      fontWeight: 600,
                      fontFamily: UI_FONT,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {cat.isDrive ? (
                      <DriveIcon />
                    ) : cat.isCode ? (
                      <span
                        style={{
                          fontFamily: DATA_FONT,
                          fontSize: "13px",
                          color: UI_COLORS.textSoft,
                        }}
                      >
                        &lt;/&gt;
                      </span>
                    ) : (
                      <span style={{ fontSize: "15px" }}>{cat.icon}</span>
                    )}
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chat view — shown once conversation starts */}
        {hasMessages && (
          <div
            style={{
              width: "100%",
              maxWidth: "640px",
              display: "flex",
              flexDirection: "column",
              paddingTop: "12px",
              flex: 1,
              minHeight: 0,
            }}
          >
            {/* Message list */}
            <div
              style={{
                flex: 1,
                marginBottom: "14px",
                minHeight: 0,
                overflowY: "auto",
                overflowX: "hidden",
                paddingRight: "4px",
              }}
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent:
                      msg.role === "user" ? "flex-end" : "flex-start",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "85%",
                      padding: "12px 16px",
                      borderRadius:
                        msg.role === "user"
                          ? "18px 18px 4px 18px"
                          : "18px 18px 18px 4px",
                      backgroundColor:
                        msg.role === "user" ? UI_COLORS.accent : UI_COLORS.surface,
                      color: msg.role === "user" ? "#fff" : UI_COLORS.text,
                      border:
                        msg.role === "assistant"
                          ? `1px solid ${UI_COLORS.line}`
                          : "none",
                      fontSize: "14px",
                      lineHeight: "1.5",
                      boxShadow: "0 4px 12px rgba(50, 32, 20, 0.06)",
                      fontFamily: UI_FONT,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.content ||
                      (msg.role === "assistant" &&
                      isStreaming &&
                      i === messages.length - 1 ? (
                        <span
                          style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
                        >
                          <span className="claude-typing-dot" />
                          <span className="claude-typing-dot" />
                          <span className="claude-typing-dot" />
                        </span>
                      ) : null)}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Card (chat state) */}
            <ChatInput onSend={sendMessage} isStreaming={isStreaming} />
          </div>
        )}
      </div>

      {/* Cursor blink keyframe */}
      <style>{`
        .claude-typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: ${UI_COLORS.accent};
          opacity: 0.75;
          animation: claude-pulse 0.9s ease-in-out infinite;
        }
        .claude-typing-dot:nth-child(2) { animation-delay: 0.12s; }
        .claude-typing-dot:nth-child(3) { animation-delay: 0.24s; }
        @keyframes claude-pulse {
          0%, 100% { transform: translateY(0); opacity: 0.35; }
          50% { transform: translateY(-1px); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .claude-typing-dot { animation: none; }
        }
      `}</style>
    </Box>
  );
};

export default ClaudePage;
