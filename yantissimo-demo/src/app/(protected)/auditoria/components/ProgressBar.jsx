"use client";

const TONE_COLOR = {
  ok: "var(--ok)",
  warn: "var(--warn)",
  danger: "var(--danger)",
  accent: "var(--accent)",
};

export default function ProgressBar({
  percent = 0,
  tone = "accent",
  mark,
  showPct = true,
}) {
  const p = Math.max(0, Math.min(100, Number(percent) || 0));
  return (
    <div className="pb-wrap">
      <div className="pb-bg">
        <div
          className="pb-fill"
          style={{
            width: `${p}%`,
            background: TONE_COLOR[tone] || TONE_COLOR.accent,
          }}
        />
        {mark != null ? (
          <div
            className="pb-mark"
            style={{
              position: "absolute",
              top: -1,
              left: `${mark}%`,
              height: 8,
              width: 1.5,
              background: "var(--t2)",
              zIndex: 2,
            }}
          />
        ) : null}
      </div>
      {showPct ? <span className="pb-pct">{Math.round(p)}%</span> : null}
    </div>
  );
}
