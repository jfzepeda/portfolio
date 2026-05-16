/**
 * Demo branch entrypoint helper — call this once on container boot so a
 * visitor always lands on a usable LaTeX project. Idempotent: if the seed
 * project already exists, this is a no-op.
 *
 * Wire it into the Railway/Fly.io start command, e.g.:
 *   tsx scripts/seed-demo.ts && tsx server.ts
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { homedir } from "node:os";

const DEMO_PROJECT_ID = "demo-welcome";
const DEMO_PROJECT_NAME = "Welcome to Overtree";

const STORAGE_ROOT =
  process.env.OVERTREE_ROOT ??
  path.join(homedir(), "Documents", "Overtree", "projects");

const MAIN_TEX = String.raw`\documentclass{article}
\usepackage[utf8]{inputenc}
\usepackage{lmodern}
\usepackage{microtype}
\usepackage{geometry}
\geometry{margin=1.1in}
\title{Welcome to Overtree --- live demo}
\author{Juan Felipe Zepeda}
\date{\today}

\begin{document}
\maketitle

\section*{What you're looking at}

This is a public, no-login demo of \emph{Overtree} --- a collaborative
LaTeX editor with a Tectonic compile backend, Yjs-based real-time
collaboration, and an MCP server interface.

\section*{Try it}

\begin{itemize}
  \item Edit this file in the CodeMirror panel on the left.
  \item Press \texttt{Compile} to see the PDF re-render.
  \item Open another tab on this same URL to see a second cursor
        sharing your edits live.
\end{itemize}

\section*{Demo guardrails}

This deploy runs in demo mode, so:
\begin{itemize}
  \item Compiles time out after 30~seconds.
  \item A small set of LaTeX commands that can read arbitrary files
        or escape the sandbox is rejected before compilation.
  \item Anyone who lands on the URL becomes a "Demo Visitor" --- no
        accounts, no login.
\end{itemize}

The full unrestricted version ships as an Electron app for local use.

\end{document}
`;

const META_JSON = JSON.stringify(
  {
    id: DEMO_PROJECT_ID,
    name: DEMO_PROJECT_NAME,
    private: false,
    mainFile: "main.tex",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  null,
  2,
);

async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.stat(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const projectDir = path.join(STORAGE_ROOT, DEMO_PROJECT_ID);
  if (await pathExists(path.join(projectDir, "main.tex"))) {
    console.log(`[seed-demo] ${DEMO_PROJECT_ID} already exists at ${projectDir}`);
    return;
  }

  await fs.mkdir(projectDir, { recursive: true });
  await fs.writeFile(path.join(projectDir, "main.tex"), MAIN_TEX, "utf8");
  await fs.writeFile(path.join(projectDir, "meta.json"), META_JSON, "utf8");
  await fs.mkdir(path.join(projectDir, ".overtree", "yjs"), { recursive: true });
  await fs.mkdir(path.join(projectDir, "output"), { recursive: true });

  console.log(`[seed-demo] wrote ${DEMO_PROJECT_ID} at ${projectDir}`);
}

main().catch((err) => {
  console.error("[seed-demo] failed:", err);
  process.exit(1);
});
