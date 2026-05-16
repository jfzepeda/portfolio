"use client";

const TONE_CLASS = {
  red: "cv-r",
  yellow: "cv-y",
  green: "cv-g",
  neutral: "cv-z",
};

export default function ConversionCard({
  tone = "neutral",
  line,
  value,
  unit,
  objective,
  percent,
}) {
  const cls = TONE_CLASS[tone] || "cv-z";
  return (
    <div className={`conv-card ${cls}`}>
      <div className="cc-line">{line}</div>
      <div className="cc-main">
        <span className="cc-val">{value}</span>
        {unit ? <span className="cc-unit">{unit}</span> : null}
      </div>
      <div className="cc-row">
        <span className="cc-obj">{objective}</span>
        <span className="cc-pct">{percent}</span>
      </div>
    </div>
  );
}
