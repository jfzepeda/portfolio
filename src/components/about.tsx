import { profile } from "@/data/profile";

export function About() {
  return (
    <section
      id="about"
      className="py-24 lg:py-28"
      aria-labelledby="about-title"
    >
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
        <div className="grid lg:grid-cols-[1fr_400px] gap-10 lg:gap-16 items-start">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div
                className="h-[2px] w-12"
                style={{ background: "var(--fg-subtle)" }}
              />
              <span
                className="text-[11px] uppercase tracking-[0.18em]"
                style={{ color: "var(--fg-subtle)" }}
              >
                About
              </span>
            </div>
            <h2
              id="about-title"
              className="text-display"
              style={{ fontSize: "clamp(36px, 5.5vw, 64px)" }}
            >
              Leverage over surface area.
            </h2>
            <div
              className="mt-8 space-y-5 max-w-[680px] text-[16px] lg:text-[17px] leading-[1.7]"
              style={{ color: "var(--fg)" }}
            >
              {profile.bio.map((para, i) => (
                <p
                  key={i}
                  className={i === 0 ? "drop-cap" : ""}
                  style={{ color: i === 0 ? "var(--fg)" : "var(--fg-muted)" }}
                >
                  {para}
                </p>
              ))}
            </div>
          </div>

          <aside
            className="surface p-7"
            style={{ borderRadius: "var(--radius-xl)" }}
          >
            <div
              className="text-[10px] uppercase tracking-[0.18em] mb-4"
              style={{ color: "var(--fg-subtle)" }}
            >
              Contact
            </div>
            <div className="space-y-3 text-[14px]">
              <a
                href={`mailto:${profile.email}`}
                className="block transition-colors hover:text-[color:var(--accent)]"
                style={{ color: "var(--fg)" }}
              >
                <div
                  className="text-[10px] uppercase tracking-[0.14em] mb-1"
                  style={{ color: "var(--fg-subtle)" }}
                >
                  Email
                </div>
                <div className="text-mono text-[13px]">{profile.email}</div>
              </a>
              <div className="pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                <div
                  className="text-[10px] uppercase tracking-[0.14em] mb-1"
                  style={{ color: "var(--fg-subtle)" }}
                >
                  Based in
                </div>
                <div style={{ color: "var(--fg)" }}>{profile.location}</div>
                <div
                  className="text-[12px] text-mono mt-0.5"
                  style={{ color: "var(--fg-muted)" }}
                >
                  {profile.timezone}
                </div>
              </div>
              <div className="pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                <div
                  className="text-[10px] uppercase tracking-[0.14em] mb-1"
                  style={{ color: "var(--fg-subtle)" }}
                >
                  Status
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="dot"
                    aria-hidden
                    style={{ background: "#10b981" }}
                  />
                  <span style={{ color: "var(--fg)" }}>
                    Open to work &amp; contracts
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
