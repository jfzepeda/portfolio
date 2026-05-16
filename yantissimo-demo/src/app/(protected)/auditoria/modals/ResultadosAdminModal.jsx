"use client";
import Modal from "../components/Modal";

export default function ResultadosAdminModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="Resultados de Administración" maxWidth={680}>
      <p>Incidencias importadas del JSON de administración. Puerto pendiente.</p>
      <div className="modal-btns">
        <button className="modal-btn ghost" onClick={onClose}>Cerrar</button>
      </div>
    </Modal>
  );
}
