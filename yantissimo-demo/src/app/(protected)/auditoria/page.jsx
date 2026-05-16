"use client";
import { AuditoriaProvider } from "./state/AuditoriaContext";
import AuditoriaShell from "./AuditoriaShell";

export default function AuditoriaPage() {
  return (
    <AuditoriaProvider>
      <AuditoriaShell />
    </AuditoriaProvider>
  );
}
