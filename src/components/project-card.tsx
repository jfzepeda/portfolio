"use client";

import { useState } from "react";
import { Reveal } from "./reveal";
import { PaperPlaceholder } from "./section-header";
import type { Project } from "@/data/projects";

// Warm-paper case-study card. Striped placeholder slot + tag/metric row +
// display-font title with arrow + monospace stack chips.
// Both Executive and Technical copy rendered to HTML; CSS toggles visibility.

interface Props {
  project: Project;
  index?: number;
}

export function ProjectCard({ project, index = 0 }: Props) {
  const [hover, setHover] = useState(false);
  const metric =
    project.tier === 1
      ? "Flagship · 3 surfaces"
      : project.tier === 2
        ? "Featured · deep"
        : "Featured";

  return (
    <Reveal delay={index * 60}>
      <article
        id={project.slug}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="paper-card"
        style={{
          padding: "clamp(20px, 2vw, 28px)",
          background: hover ? "var(--paper-3)" : "var(--paper-2)",
          transform: hover ? "translateY(-2px)" : "translateY(0)",
          position: "relative",
          overflow: "hidden",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
        itemScope
        itemType="https://schema.org/CreativeWork"
      >
        {/* paper placeholder for hero image */}
        <div style={{ marginBottom: 20 }}>
          <PaperPlaceholder
            label={`${project.icon} · ${project.domain}`}
            ratio="16/10"
          />
        </div>

        {/* tag + metric row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--ink-3)",
          }}
        >
          <span>{project.capabilities[0] ?? project.domain}</span>
          <span className="only-technical" style={{ color: "var(--accent)" }}>
            {metric}
          </span>
        </div>

        {/* title with arrow */}
        <h3
          className="text-display"
          style={{
            fontSize: "clamp(22px, 2.4vw, 30px)",
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
            margin: "0 0 10px 0",
            color: "var(--ink)",
          }}
          itemProp="name"
        >
          {project.name}
          <span
            aria-hidden
            style={{
              display: "inline-block",
              marginLeft: 10,
              transform: hover ? "translateX(4px)" : "translateX(0)",
              transition: "transform 250ms",
              color: "var(--accent)",
            }}
          >
            →
          </span>
        </h3>

        {/* tagline */}
        <p
          style={{
            fontSize: 14.5,
            lineHeight: 1.55,
            color: "var(--ink-2)",
            margin: "0 0 14px 0",
            textWrap: "pretty",
          }}
          itemProp="description"
        >
          {project.tagline}
        </p>

        {/* EXECUTIVE: outcomes-focused, no engineering detail */}
        <div className="only-executive">
          <p
            style={{
              fontSize: 13.5,
              lineHeight: 1.55,
              color: "var(--ink)",
              margin: "0 0 14px 0",
            }}
          >
            {project.executive.summary}
          </p>
          {project.executive.outcomes.length > 0 && (
            <ul
              style={{
                margin: "0 0 16px 0",
                padding: 0,
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {project.executive.outcomes.slice(0, 2).map((o, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: 12.5,
                    lineHeight: 1.5,
                    color: "var(--ink-2)",
                    paddingLeft: 14,
                    position: "relative",
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 9,
                      width: 6,
                      height: 1,
                      background: "var(--accent)",
                    }}
                  />
                  {o}
                </li>
              ))}
            </ul>
          )}
          {/* high-level capability tags only — no engineering specifics */}
          <div
            style={{
              marginTop: "auto",
              paddingTop: 14,
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
            }}
          >
            {project.capabilities.slice(0, 3).map((c) => (
              <span key={c} className="tag tag-accent">
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* TECHNICAL: architecture accordion */}
        <div className="only-technical">
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              color: "var(--ink)",
              margin: "0 0 12px 0",
            }}
          >
            {project.technical.summary}
          </p>
          <details>
            <summary
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--ink-2)",
                padding: "6px 0",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span className="chevron" aria-hidden>
                ›
              </span>
              <span>Architecture</span>
            </summary>
            <p
              style={{
                marginTop: 10,
                fontSize: 13,
                lineHeight: 1.65,
                color: "var(--ink-2)",
              }}
            >
              {project.technical.architecture}
            </p>
            <ul
              style={{
                margin: "10px 0 0 0",
                padding: 0,
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: 5,
              }}
            >
              {project.technical.highlights.map((h, i) => (
                <li
                  key={i}
                  style={{
                    fontSize: 12.5,
                    lineHeight: 1.5,
                    color: "var(--ink-2)",
                    paddingLeft: 14,
                    position: "relative",
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 9,
                      width: 6,
                      height: 1,
                      background: "var(--accent)",
                    }}
                  />
                  {h}
                </li>
              ))}
            </ul>
          </details>
        </div>

        {/* stack pills — TECHNICAL ONLY */}
        <div
          className="only-technical"
          style={{
            marginTop: "auto",
            paddingTop: 14,
            display: "flex",
            flexWrap: "wrap",
            gap: 6,
          }}
        >
          {project.stack.slice(0, 8).map((s) => (
            <span
              key={s}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                padding: "3px 8px",
                color: "var(--ink-3)",
                border: "1px solid var(--rule)",
                borderRadius: 999,
              }}
            >
              {s}
            </span>
          ))}
          {project.stack.length > 8 && (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                padding: "3px 8px",
                color: "var(--ink-3)",
              }}
            >
              +{project.stack.length - 8}
            </span>
          )}
        </div>

        {/* sr-only schema.org keywords */}
        <span className="sr-only">
          {project.stack.map((s) => (
            <span key={s} itemProp="keywords">
              {s}
            </span>
          ))}
          {project.capabilities.map((c) => (
            <span key={c} itemProp="keywords">
              {c}
            </span>
          ))}
        </span>
      </article>
    </Reveal>
  );
}
