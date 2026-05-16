'use client';

const firmaInputCls = "w-full [border:none] [border-top:1px_solid_#e0e0e0] px-[10px] py-[6px] text-[11px] text-[#5a5a5a] text-center bg-white focus:outline-none focus:bg-[#fff8f7] read-only:bg-[#f0f0f0] read-only:cursor-default";

export default function SeccionFirmas({ form, setField, readOnly = false }) {
  return (
    <div className="bg-white rounded-xl border border-[#e0e0e0] mb-4 overflow-hidden">
      <div className="bg-[#414243] text-white px-4 py-2 text-[11px] font-semibold tracking-[0.8px] uppercase flex items-center gap-2">
        <span className="bg-[#f5c336] text-[#414243] w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">8</span>
        Firmas y validación
      </div>
      <div className="p-4">
        <div className="grid grid-cols-3 gap-[14px]">
          <div className="border border-[#e0e0e0] rounded-[10px] overflow-hidden">
            <div className="bg-[#6b6c6d] text-white px-3 py-[7px] text-[10px] font-semibold text-center uppercase tracking-[0.6px]">
              Asesor de ventas
            </div>
            <div className="h-[70px] border-b border-[#e0e0e0] bg-[#fafbfc]"/>
            <input
              className={firmaInputCls}
              type="text"
              placeholder="Nombre completo"
              value={form.firma_asesor}
              onChange={e => setField('firma_asesor', e.target.value)}
              readOnly={readOnly}
            />
          </div>
          <div className="border border-[#e0e0e0] rounded-[10px] overflow-hidden">
            <div className="bg-[#6b6c6d] text-white px-3 py-[7px] text-[10px] font-semibold text-center uppercase tracking-[0.6px]">
              Ajustador
            </div>
            <div className="h-[70px] border-b border-[#e0e0e0] bg-[#fafbfc]"/>
            <input
              className={firmaInputCls}
              type="text"
              placeholder="Nombre completo"
              value={form.firma_ajustador}
              onChange={e => setField('firma_ajustador', e.target.value)}
              readOnly={readOnly}
            />
          </div>
          <div className="border border-[#e0e0e0] rounded-[10px] overflow-hidden">
            <div className="bg-[#cb4532] text-white px-3 py-[7px] text-[10px] font-semibold text-center uppercase tracking-[0.6px]">
              Gerente / Autorización
            </div>
            <div className="h-[70px] border-b border-[#e0e0e0] bg-[#fafbfc]"/>
            <input
              className={firmaInputCls}
              type="text"
              placeholder="Nombre completo"
              value={form.firma_gerente}
              onChange={e => setField('firma_gerente', e.target.value)}
              readOnly={readOnly}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
