"use client";

export default function FilterBar({ children, style }) {
  return (
    <div className="fbar" style={style}>
      {children}
    </div>
  );
}
