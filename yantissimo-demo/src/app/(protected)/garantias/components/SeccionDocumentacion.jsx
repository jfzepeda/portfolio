'use client';

const ITEMS = [
  { key: 'llanta_fisica',  obsKey: 'llanta_fisica_obs',  label: 'Llanta física en sucursal' },
  { key: 'corte_fisico',   obsKey: 'corte_fisico_obs',   label: 'Corte físico de llanta' },
  { key: 'foto_video',     obsKey: 'foto_video_obs',     label: 'Foto / video del daño (10 seg)' },
];

export default function SeccionDocumentacion({ form, setField, readOnly = false }) {
  return (
    <div className="bg-white rounded-xl border border-[#e0e0e0] mb-4 overflow-hidden">
      <div className="bg-[#414243] text-white px-4 py-2 text-[11px] font-semibold tracking-[0.8px] uppercase flex items-center gap-2">
        <span className="bg-[#f5c336] text-[#414243] w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">4</span>
        Documentación y requisitos
      </div>
      <div className="p-4">
        {ITEMS.map(({ key, obsKey, label }) => (
          <div key={key} className="grid grid-cols-[200px_auto_1fr] items-center gap-3 px-3 py-[10px] border border-[#e0e0e0] rounded-lg mb-2 bg-[#f5f5f5]">
            <span className="text-[13px] font-medium">{label}</span>
            <div className="flex gap-3">
              <label className="flex items-center gap-[5px] text-xs text-[#5a5a5a] cursor-pointer">
                <input
                  type="radio"
                  name={key}
                  value="si"
                  checked={form[key] === 'si'}
                  onChange={() => !readOnly && setField(key, 'si')}
                  disabled={readOnly}
                  className="accent-[#cb4532] w-[14px] h-[14px]"
                />
                Sí
              </label>
              <label className="flex items-center gap-[5px] text-xs text-[#5a5a5a] cursor-pointer">
                <input
                  type="radio"
                  name={key}
                  value="no"
                  checked={form[key] === 'no'}
                  onChange={() => !readOnly && setField(key, 'no')}
                  disabled={readOnly}
                  className="accent-[#cb4532] w-[14px] h-[14px]"
                />
                No
              </label>
            </div>
            <input
              className="border border-[#e0e0e0] rounded-[7px] px-[10px] py-[7px] text-xs text-[#2a2a2a] bg-white w-full focus:outline-none focus:border-[#cb4532] read-only:bg-[#f0f0f0] read-only:cursor-default"
              placeholder="Observaciones..."
              value={form[obsKey]}
              onChange={e => setField(obsKey, e.target.value)}
              readOnly={readOnly}
            />
          </div>
        ))}
        <div className="bg-[#f9e0db] border border-[#e8a09a] border-l-[4px] border-l-[#cb4532] rounded-lg px-[14px] py-[10px] text-xs text-[#7b241c] font-medium flex items-start gap-2 mt-1">
          <span className="text-[15px] shrink-0">⚠</span>
          No se elaborará nota de crédito si no se cuentan con los cortes o llantas físicamente.
        </div>
      </div>
    </div>
  );
}
