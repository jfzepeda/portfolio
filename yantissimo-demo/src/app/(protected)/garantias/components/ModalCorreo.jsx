'use client';
import { useState } from 'react';

export default function ModalCorreo({ isOpen, onClose, form, imgs = [] }) {
  const [remitente, setRemitente] = useState('');

  function enviar() {
    const folio = String(form.folio ?? '').trim() || 'SIN FOLIO';
    const today = new Date();
    const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    const fecha = `${today.getDate()} de ${meses[today.getMonth()]} de ${today.getFullYear()}`;

    const filasProd = form.productos
      .map((p, i) => {
        const vals = [p.marca, p.modelo, p.medida, p.serie_dot, p.remanente, p.precio, p.descripcion_dano].filter(Boolean);
        return vals.length ? `  Llanta ${i + 1}: ${vals.join(' | ')}` : null;
      })
      .filter(Boolean);

    const d = (n) => {
      const monto = parseFloat(form[`d${n}_monto`]) || 0;
      return { procede: form[`d${n}_procede`]?.toUpperCase() || '—', total: `$${(monto * 1.16).toFixed(2)}` };
    };

    const cuerpo = `SOLICITUD DE GARANTÍA — YANTISSIMO S.A. DE C.V.
${'='.repeat(50)}
Folio: ${folio}
Fecha: ${fecha}
Enviado por: ${remitente || '—'}

DATOS DEL CLIENTE
─────────────────────────────────────────────
No. Cliente : ${form.no_cliente || '—'}
Nombre      : ${form.nombre_cliente || '—'}
Teléfono    : ${form.telefono || '—'}
Vendedor    : ${form.vendedor || '—'}
Sucursal    : ${form.sucursal || '—'}
No. Factura : ${form.no_factura || '—'}
Fecha Fact. : ${form.fecha_factura || '—'}
Precio s/IVA: ${form.precio_facturado || '—'}

PRODUCTO(S)
─────────────────────────────────────────────
${filasProd.length ? filasProd.join('\n') : '  (sin datos de producto)'}

DOCUMENTACIÓN
─────────────────────────────────────────────
Llanta física   : ${form.llanta_fisica?.toUpperCase() || 'No indicado'}
Corte físico    : ${form.corte_fisico?.toUpperCase() || 'No indicado'}
Foto/Video daño : ${form.foto_video?.toUpperCase() || 'No indicado'}

DICTAMEN
─────────────────────────────────────────────
Ajustable 100%   : ${d(1).procede}  Total: ${d(1).total}
Ajustable parcial: ${d(2).procede}  Total: ${d(2).total}
Improcedente     : ${d(3).procede}  Total: ${d(3).total}

EVIDENCIA FOTOGRÁFICA
─────────────────────────────────────────────
Archivos adjuntos: ${imgs.length} foto(s)
${imgs.map((img, i) => `  • Foto ${i + 1}: ${img.name}`).join('\n') || '  (ninguna)'}
⚠ Adjunta las imágenes manualmente a este correo.

─────────────────────────────────────────────
YANTISSIMO S.A. DE C.V.
AV TECNOLÓGICO #3 • CP 28978 • VILLA DE ÁLVAREZ, COLIMA`;

    const asunto = encodeURIComponent(`Garantía ${folio} — ${form.nombre_cliente || 'Cliente'}`);
    const body = encodeURIComponent(cuerpo);
    window.location.href = `mailto:asesor.yantissimo@gmail.com?subject=${asunto}&body=${body}`;
    setTimeout(onClose, 800);
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/45 z-[999] flex items-center justify-center"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-[14px] px-7 py-6 w-[440px] max-w-[95vw] shadow-[0_20px_60px_rgba(0,0,0,0.25)] relative">
        <button
          className="absolute top-[14px] right-4 bg-transparent border-none text-lg cursor-pointer text-[#5a5a5a] leading-none"
          onClick={onClose}
          type="button"
        >✕</button>

        <div className="text-[15px] font-semibold mb-1">✉ Enviar solicitud por correo</div>
        <div className="text-xs text-[#5a5a5a] mb-[18px]">
          Se abrirá tu cliente de correo con el resumen de la garantía listo para enviar.
        </div>

        <label className="block text-[11px] font-semibold text-[#5a5a5a] uppercase tracking-[0.5px] mb-[5px]">
          Tu nombre / Sucursal
        </label>
        <input
          className="w-full border border-[#e0e0e0] rounded-lg px-3 py-[9px] text-[13px] text-[#2a2a2a] mb-[14px] focus:outline-none focus:border-[#cb4532] focus:shadow-[0_0_0_3px_rgba(203,69,50,0.12)]"
          type="text"
          placeholder="Ej. María G. — Sucursal Tecnológico"
          value={remitente}
          onChange={e => setRemitente(e.target.value)}
        />

        <label className="block text-[11px] font-semibold text-[#5a5a5a] uppercase tracking-[0.5px] mb-[5px]">
          Destinatario
        </label>
        <div className="bg-[#f0f0f0] rounded-lg px-3 py-[9px] text-xs text-[#5a5a5a] mb-[18px] flex items-center gap-2">
          <span>📧</span>
          <span><strong className="text-[#2a2a2a]">asesor.yantissimo@gmail.com</strong></span>
        </div>

        <div className="bg-[#fef8e3] border border-[#f0d060] rounded-lg px-3 py-[9px] text-[11px] text-[#7a6000] mb-[18px] leading-[1.5]">
          ⚠ Las fotos adjuntas <strong>no se pueden incluir automáticamente</strong> por correo.
          Después de enviar el resumen, adjunta las imágenes de evidencia manualmente desde tu cliente de correo.
        </div>

        <div className="flex gap-[10px] justify-end">
          <button
            className="border border-[#e0e0e0] bg-white rounded-lg px-[18px] py-[9px] text-[13px] cursor-pointer text-[#5a5a5a]"
            onClick={onClose}
            type="button"
          >Cancelar</button>
          <button
            className="bg-[#cb4532] text-white border-none rounded-lg px-[22px] py-[9px] text-[13px] font-semibold cursor-pointer transition-colors duration-150 hover:bg-[#a8361f] flex items-center gap-[7px]"
            onClick={enviar}
            type="button"
          >✉ Abrir correo</button>
        </div>
      </div>
    </div>
  );
}
