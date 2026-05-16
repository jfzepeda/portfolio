"use client";

export default function SectionTitle({ children, className = "", style }) {
  return (
    <div className={`stit ${className}`} style={style}>
      {children}
    </div>
  );
}
