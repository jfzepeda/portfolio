import { Fraunces, Inter_Tight, JetBrains_Mono } from "next/font/google";

export const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--app-font-fraunces",
  display: "swap",
});

export const interTight = Inter_Tight({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--app-font-inter-tight",
  display: "swap",
});

export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--app-font-jetbrains-mono",
  display: "swap",
});

export const auditoriaFontsClass = `${fraunces.variable} ${interTight.variable} ${jetbrainsMono.variable}`;
