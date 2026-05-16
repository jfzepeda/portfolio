"use client";
import Modal from "../components/Modal";

export default function GerenteModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="Gerentes por sucursal">
      <p>Asignación de gerentes por sucursal. Puerto pendiente.</p>
      <div className="modal-btns">
        <button className="modal-btn ghost" onClick={onClose}>Cerrar</button>
      </div>
    </Modal>
  );
}
