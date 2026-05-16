'use client';

const inputCls = "w-full border border-[#e0e0e0] rounded-lg px-[11px] py-2 text-[13px] text-[#2a2a2a] bg-white transition-[border-color,box-shadow] duration-150 focus:outline-none focus:border-[#cb4532] focus:shadow-[0_0_0_3px_rgba(203,69,50,0.12)] read-only:bg-[#f0f0f0] read-only:text-[#5a5a5a] read-only:cursor-default disabled:bg-[#f0f0f0] disabled:text-[#5a5a5a] disabled:cursor-default";
const labelCls = "block text-[10px] font-semibold text-[#5a5a5a] uppercase tracking-[0.5px] mb-[5px]";

export default function SeccionAnalisis({ form, setField, readOnly = false }) {
  return (
    <div className="bg-white rounded-xl border border-[#e0e0e0] mb-4 overflow-hidden">
      <div className="bg-[#414243] text-white px-4 py-2 text-[11px] font-semibold tracking-[0.8px] uppercase flex items-center gap-2">
        <span className="bg-[#f5c336] text-[#414243] w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">6</span>
        Análisis y dictamen narrativo
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className={labelCls}>Del análisis / causas probables</label>
            <textarea
              className={`${inputCls} resize-y min-h-[72px]`}
              placeholder="Describir el análisis técnico y causas probables del daño..."
              value={form.analisis}
              onChange={e => setField('analisis', e.target.value)}
              readOnly={readOnly}
            />
          </div>
          <div>
            <label className={labelCls}>Dictamen</label>
            <select
              className={`${inputCls} mb-2`}
              value={form.dictamen}
              onChange={e => setField('dictamen', e.target.value)}
              disabled={readOnly}
            >
              <option value="">— Seleccionar dictamen —</option>
              <option>PROCEDE</option>
              <option>IMPROCEDENTE</option>
              <option>PROCEDE PARCIALMENTE</option>
            </select>
            <textarea
              className={`${inputCls} resize-y min-h-[72px]`}
              placeholder="Comentario del ajustador..."
              value={form.comentario_dictamen}
              onChange={e => setField('comentario_dictamen', e.target.value)}
              readOnly={readOnly}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Nombre del ajustador</label>
            <input
              className={inputCls}
              type="text"
              placeholder="Samuel A. Contreras Duarte"
              value={form.nombre_ajustador}
              onChange={e => setField('nombre_ajustador', e.target.value)}
              readOnly={readOnly}
            />
          </div>
          <div>
            <label className={labelCls}>Lugar y fecha de expedición</label>
            <input
              className={inputCls}
              type="text"
              placeholder="Colima, Colima"
              value={form.lugar_fecha}
              onChange={e => setField('lugar_fecha', e.target.value)}
              readOnly={readOnly}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
