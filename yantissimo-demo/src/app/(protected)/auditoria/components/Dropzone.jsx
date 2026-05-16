"use client";
import { useRef, useState } from "react";

export default function Dropzone({
  icon,
  title,
  description,
  fileName,
  optional = false,
  wide = false,
  accept = ".xlsx,.xls",
  onFile,
}) {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);
  const loaded = Boolean(fileName);

  const handleFiles = (files) => {
    if (!files || files.length === 0) return;
    onFile?.(files[0]);
  };

  return (
    <div
      className={`uzone ${wide ? "uzone-wide" : ""} ${drag ? "drag" : ""} ${loaded ? "loaded" : ""}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        handleFiles(e.dataTransfer.files);
      }}
    >
      <div className="ck">✓</div>
      <span className="zi">{icon}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      {fileName ? <div className="fn">{fileName}</div> : null}
      {optional ? <div className="opt-tag">Opcional</div> : null}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
