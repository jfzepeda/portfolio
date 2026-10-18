import type { CSSProperties } from "react";

// Stagger order for `.layer` reveals (see globals.css): style={layer(2)}.
export const layer = (i: number) => ({ "--i": i }) as CSSProperties;
