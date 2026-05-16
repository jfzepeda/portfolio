"use client";
import Modal from "../components/Modal";

export default function TerminarDiaModal({ open, onClose, onSave, onExport, onSend }) {
  return (
    <Modal open={open} onClose={onClose} title="Terminar día">
      <p>Guarda el día, descarga el PDF y envía por correo.</p>
      <div className="modal-btns">
        <button className="modal-btn primary" onClick={onSend}>Guardar + enviar</button>
        <button className="modal-btn ghost" onClick={onExport}>Solo exportar PDF</button>
        <button className="modal-btn ghost" onClick={onSave}>Solo guardar</button>
        <button className="modal-btn ghost" onClick={onClose}>Cancelar</button>
      </div>
    </Modal>
  );
}
