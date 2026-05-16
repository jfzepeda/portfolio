"use client";

export function MonoLabel({ children, ...rest }) {
  return (
    <span className="mono-label" {...rest}>
      {children}
    </span>
  );
}

export function SerifNum({ children, ...rest }) {
  return (
    <span className="serif-num" {...rest}>
      {children}
    </span>
  );
}
