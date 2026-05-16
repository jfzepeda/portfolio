"use client";
import Modal from "../components/Modal";

export default function NuevoAnalisisModal({ open, onClose, onConfirm }) {
  return (
    <Modal open={open} onClose={onClose} title="Iniciar nuevo análisis">
      <p>Esto borrará el análisis actual. ¿Continuar?</p>
      <div className="modal-btns">
        <button className="modal-btn primary" onClick={onConfirm}>Sí, reiniciar</button>
        <button className="modal-btn ghost" onClick={onClose}>Cancelar</button>
      </div>
    </Modal>
  );
}
