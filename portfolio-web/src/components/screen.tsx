"use client";

import { useEffect, useRef, useState } from "react";

// One full-viewport screen. Flips data-in="1" the first time it is on screen so
// children marked .layer fade in one after another (see globals.css).
export function Screen({
  id,
  className = "",
  label,
  children,
}: {
  id: string;
  className?: string;
  label?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      id={id}
      ref={ref}
      data-in={seen ? "1" : "0"}
      aria-label={label}
      className={`screen ${className}`}
    >
      {children}
    </section>
  );
}
