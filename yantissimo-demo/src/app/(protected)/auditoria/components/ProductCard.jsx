"use client";

export default function ProductCard({ children, style, className = "" }) {
  return (
    <div className={`prod-card ${className}`} style={style}>
      {children}
    </div>
  );
}
