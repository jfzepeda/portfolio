'use client';
import Link from 'next/link';

export default function BottomBar({ onEmail, onGuardar, saving = false, readOnly = false }) {
  return (
    <div className="bg-white border border-[#e0e0e0] [border-top:3px_solid_#f5c336] rounded-xl p-4 flex items-center justify-between gap-3 mt-2 print:hidden">
      <div className="text-[11px] text-[#5a5a5a] leading-[1.5] max-w-[500px]">
        <strong className="text-[#2a2a2a]">La garantía cubre únicamente defectos de fabricación y/o mano de obra.</strong><br/>
        YANTISSIMO S.A. DE C.V. &nbsp;•&nbsp; AV TECNOLÓGICO #3, VILLA DE ÁLVAREZ, COLIMA
      </div>
      <div className="flex gap-[10px] shrink-0">
        {readOnly && (
          <Link
            href="/garantias"
            className="bg-white text-[#5a5a5a] border border-[#e0e0e0] rounded-lg px-[18px] py-[11px] text-[13px] font-medium cursor-pointer flex items-center gap-[6px] no-underline transition-[border-color] duration-150 hover:border-[#5a5a5a]"
          >
            ← Volver
          </Link>
        )}
        <button
          className="bg-[#414243] text-white border-none rounded-lg px-[22px] py-[11px] text-sm font-semibold cursor-pointer flex items-center gap-2 whitespace-nowrap transition-colors duration-150 hover:bg-[#2a2a2a]"
          type="button"
          onClick={onEmail}
        >
          ✉ Enviar por correo
        </button>
        {!readOnly && (
          <button
            className="bg-[#1a6b3c] text-white border-none rounded-lg px-[22px] py-[11px] text-sm font-semibold cursor-pointer flex items-center gap-2 whitespace-nowrap transition-colors duration-150 hover:bg-[#155a32] disabled:opacity-60 disabled:cursor-not-allowed"
            type="button"
            onClick={onGuardar}
            disabled={saving}
          >
            {saving ? '⏳ Guardando...' : '💾 Guardar'}
          </button>
        )}
        <button
          className="bg-[#cb4532] text-white border-none rounded-lg px-7 py-[11px] text-sm font-semibold cursor-pointer flex items-center gap-2 whitespace-nowrap transition-colors duration-150 hover:bg-[#a8361f]"
          type="button"
          onClick={() => window.print()}
        >
          🖨 Imprimir / PDF
        </button>
      </div>
    </div>
  );
}
