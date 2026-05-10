// Tech-mode-only code snippet block. Editorial framing — header with
// language tag + caption explaining the technical decision the snippet
// illustrates, then the code itself in JetBrains Mono.
//
// Not syntax-highlighted on purpose: the snippets are short and the focus
// is the decision/algorithm, not eye candy.

interface Props {
  lang: string;
  file: string;
  caption: string; // one-line: what does this snippet illustrate?
  code: string;
}

export function CodeSnippet({ lang, file, caption, code }: Props) {
  return (
    <figure
      className="only-technical"
      style={{
        margin: "clamp(20px, 2.5vw, 32px) 0",
        border: "1px solid var(--rule)",
        borderRadius: 6,
        background: "var(--paper-3)",
        overflow: "hidden",
      }}
    >
      <header
        style={{
          padding: "10px 16px",
          borderBottom: "1px solid var(--rule)",
          background: "var(--paper-2)",
          display: "flex",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--ink-2)",
          }}
        >
          <span
            aria-hidden
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: 999,
              background: "var(--accent)",
            }}
          />
          <span style={{ color: "var(--accent)" }}>{lang}</span>
          <span style={{ color: "var(--ink-3)" }}>·</span>
          <span>{file}</span>
        </div>
      </header>

      <pre
        style={{
          margin: 0,
          padding: "18px 18px",
          overflowX: "auto",
          fontFamily: "var(--font-mono)",
          fontSize: 12.5,
          lineHeight: 1.55,
          color: "var(--ink)",
          background: "transparent",
          whiteSpace: "pre",
        }}
      >
        <code>{code}</code>
      </pre>

      <figcaption
        style={{
          padding: "10px 16px",
          borderTop: "1px solid var(--rule)",
          fontSize: 12.5,
          lineHeight: 1.5,
          color: "var(--ink-2)",
          background: "var(--paper-2)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--accent)",
            marginRight: 10,
          }}
        >
          why
        </span>
        {caption}
      </figcaption>
    </figure>
  );
}
