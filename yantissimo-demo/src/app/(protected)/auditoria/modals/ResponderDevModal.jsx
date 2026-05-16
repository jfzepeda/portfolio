"use client";
import { useState } from "react";
import Modal from "../components/Modal";

export default function ResponderDevModal({ open, onClose, incidencia, onSubmit }) {
  const [texto, setTexto] = useState("");
  return (
    <Modal open={open} onClose={onClose} title="Responder devolución" maxWidth={560}>
      <p style={{ marginBottom: 10 }}>{incidencia?.descripcion || "—"}</p>
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Escribe tu respuesta, justificación o soporte adicional…"
        style={{
          width: "100%",
          minHeight: 120,
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
        <button className="modal-btn primary" onClick={() => onSubmit?.(texto)}>Enviar</button>
        <button className="modal-btn ghost" onClick={onClose}>Cancelar</button>
      </div>
    </Modal>
  );
}
