"use client";
import { useState } from "react";
import Modal from "../components/Modal";

export default function ApelarModal({ open, onClose, incidencia, onSubmit }) {
  const [texto, setTexto] = useState("");
  return (
    <Modal open={open} onClose={onClose} title="Apelar incidencia" maxWidth={560}>
      <p style={{ marginBottom: 10 }}>{incidencia?.descripcion || "—"}</p>
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Explica por qué consideras que la incidencia no procede…"
        style={{
          width: "100%",
          minHeight: 140,
          padding: 10,
          borderRadius: 6,
          border: "1px solid var(--b1)",
          background: "var(--s2)",
          color: "var(--text)",
          fontSize: 12.5,
          lineHeight: 1.5,
          resize: "vertical",
          marginBottom: 10,
          boxSizing: "border-box",
        }}
      />
      <div className="modal-btns">
        <button className="modal-btn primary" onClick={() => onSubmit?.(texto)}>Enviar apelación</button>
        <button className="modal-btn ghost" onClick={onClose}>Cancelar</button>
      </div>
    </Modal>
  );
}
