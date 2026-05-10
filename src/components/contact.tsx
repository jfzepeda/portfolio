"use client";

import { useState } from "react";
import { Reveal } from "./reveal";
import { SectionHeader } from "./section-header";
import { profile } from "@/data/profile";

interface FormState {
  name: string;
  email: string;
  message: string;
}
type Errors = Partial<Record<keyof FormState, string>>;
type Status = "idle" | "sending" | "sent";

const LINKS: [string, string, string][] = [
  ["Email", profile.email, `mailto:${profile.email}`],
  ["GitHub", "github.com/juanfelipe", profile.social.github],
  ["LinkedIn", "linkedin.com/in/juanfelipe", profile.social.linkedin],
];

export function Contact() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Errors = {};
    if (!form.name.trim()) next.name = "required";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "valid email please";
    if (form.message.trim().length < 8) next.message = "say a bit more";
    setErrors(next);
    if (Object.keys(next).length) return;
    setStatus("sending");
    setTimeout(() => setStatus("sent"), 900);
  }

  return (
    <section
      id="contact"
      style={{
        padding: "var(--section-y) clamp(20px, 4vw, 40px)",
        maxWidth: 1400,
        margin: "0 auto",
      }}
    >
      <SectionHeader
        n="07"
        kicker="Contact"
        title={
          <>
            Let&rsquo;s <em>build</em> something.
          </>
        }
      />

      <div
        className="collapse-mobile"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.2fr)",
          gap: "clamp(32px, 5vw, 80px)",
          alignItems: "start",
        }}
      >
        <Reveal>
          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <p
              style={{
                fontFamily: "var(--font-display)",
                fontStyle: "var(--display-italic)",
                fontWeight: "var(--display-weight)" as unknown as number,
                fontSize: "clamp(22px, 2.4vw, 28px)",
                lineHeight: 1.35,
                color: "var(--ink)",
                margin: 0,
              }}
            >
              Hiring, collaborating, or just curious? I read everything.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {LINKS.map(([k, v, href]) => (
                <a
                  key={k}
                  href={href}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "90px 1fr auto",
                    gap: 16,
                    padding: "14px 0",
                    borderBottom: "1px solid var(--rule)",
                    color: "var(--ink)",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: 11,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "var(--ink-3)",
                    }}
                  >
                    {k}
                  </span>
                  <span style={{ fontSize: 16 }}>{v}</span>
                  <span aria-hidden style={{ color: "var(--accent)", fontSize: 16 }}>
                    ↗
                  </span>
                </a>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <form
            onSubmit={submit}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 24,
              padding: "clamp(24px, 3vw, 36px)",
              border: "1px solid var(--rule)",
              borderRadius: 6,
              background: "var(--paper-2)",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 24,
              }}
            >
              <Field
                k="name"
                label="Name"
                form={form}
                setForm={setForm}
                errors={errors}
              />
              <Field
                k="email"
                label="Email"
                type="email"
                form={form}
                setForm={setForm}
                errors={errors}
              />
            </div>
            <Field
              k="message"
              label="Message"
              multi
              form={form}
              setForm={setForm}
              errors={errors}
            />

            <button
              type="submit"
              disabled={status === "sending"}
              style={{
                appearance: "none",
                border: "1px solid var(--ink)",
                background: status === "sent" ? "var(--accent)" : "var(--ink)",
                color: "var(--paper)",
                padding: "16px 24px",
                fontFamily: "var(--font-mono)",
                fontSize: 12,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                cursor: status === "sending" ? "wait" : "pointer",
                transition: "background 200ms, transform 120ms",
                alignSelf: "flex-start",
              }}
            >
              {status === "idle" && "Send message →"}
              {status === "sending" && "Sending…"}
              {status === "sent" && "Sent ✓ I'll be in touch"}
            </button>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

interface FieldProps {
  k: keyof FormState;
  label: string;
  type?: string;
  multi?: boolean;
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  errors: Errors;
}
function Field({
  k,
  label,
  type = "text",
  multi = false,
  form,
  setForm,
  errors,
}: FieldProps) {
  const Tag = multi ? "textarea" : "input";
  const err = errors[k];
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: err ? "var(--accent)" : "var(--ink-3)",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>{label}</span>
        {err && <span>↳ {err}</span>}
      </span>
      <Tag
        type={multi ? undefined : type}
        rows={multi ? 5 : undefined}
        value={form[k]}
        onChange={(e) =>
          setForm((f) => ({ ...f, [k]: (e.target as HTMLInputElement).value }))
        }
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 16,
          background: "transparent",
          border: "none",
          borderBottom: `1px solid ${err ? "var(--accent)" : "var(--rule-strong)"}`,
          padding: "10px 0",
          color: "var(--ink)",
          outline: "none",
          resize: multi ? "vertical" : "none",
          transition: "border-color 200ms",
        }}
      />
    </label>
  );
}
