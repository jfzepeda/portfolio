import { Reveal } from "./reveal";

// Editorial section header: § N · Kicker · Display title

interface Props {
  n: string;
  kicker: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
}

export function SectionHeader({ n, kicker, title, subtitle }: Props) {
  return (
    <Reveal>
      <div style={{ marginBottom: "clamp(40px, 5vw, 64px)" }}>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 16,
            marginBottom: 18,
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--ink-3)",
          }}
        >
          <span style={{ color: "var(--accent)" }}>§ {n}</span>
          <span>{kicker}</span>
        </div>
        <h2
          className="text-display"
          style={{
            fontSize: "clamp(40px, 5.5vw, 72px)",
            margin: 0,
            color: "var(--ink)",
            maxWidth: 900,
            textWrap: "balance",
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            style={{
              marginTop: 16,
              maxWidth: 680,
              fontSize: "clamp(16px, 1.4vw, 18px)",
              lineHeight: 1.55,
              color: "var(--ink-2)",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </Reveal>
  );
}

// Striped paper-style placeholder slot — renders an image when `src` is provided,
// otherwise falls back to the striped paper fill with a label.
interface PHProps {
  label: string;
  ratio?: string;
  style?: React.CSSProperties;
  src?: string;
  fit?: "cover" | "contain";
}

export function PaperPlaceholder({
  label,
  ratio = "4/3",
  style,
  src,
  fit = "cover",
}: PHProps) {
  return (
    <div
      className="paper-placeholder"
      style={{
        aspectRatio: ratio,
        width: "100%",
        ...(src
          ? { background: "none", border: "none", borderRadius: 16 }
          : null),
        ...style,
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={label}
          loading="lazy"
          decoding="async"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: fit,
            background: fit === "contain" ? "var(--paper-2)" : undefined,
          }}
        />
      ) : (
        <span className="paper-placeholder-label">{label}</span>
      )}
    </div>
  );
}
