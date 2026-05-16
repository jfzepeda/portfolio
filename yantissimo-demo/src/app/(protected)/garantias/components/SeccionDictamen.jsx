'use client';

const ROWS = [
  { n: 1, label: 'Ajustable 100% – valor factura por daño en almacenaje o similar', pctPlaceholder: '100%' },
  { n: 2, label: 'Ajustable parcial – defecto de fabricación confirmado', pctPlaceholder: '0%' },
  { n: 3, label: 'Improcedente – daño externo / instalación / manejo', pctPlaceholder: '—' },
];

const editableCellInput = "border border-[#e0e0e0] rounded-md px-2 py-[5px] text-xs font-[DM_Mono,monospace] w-full text-center bg-white focus:outline-none focus:border-[#cb4532]";
const autoCellInput = "bg-[#f0f0f0] font-[DM_Mono,monospace] text-xs text-[#5a5a5a] font-medium rounded-md px-2 py-[5px] border border-[#e0e0e0] w-full text-center";

export default function SeccionDictamen({ form, setField, readOnly = false }) {
  function calcRow(n, monto) {
    const val = parseFloat(monto) || 0;
    setField(`d${n}_monto`, monto);
    setField(`d${n}_iva`, `$${(val * 0.16).toFixed(2)}`);
    setField(`d${n}_total`, `$${(val * 1.16).toFixed(2)}`);
  }

  return (
    <div className="bg-white rounded-xl border border-[#e0e0e0] mb-4 overflow-hidden">
      <div className="bg-[#414243] text-white px-4 py-2 text-[11px] font-semibold tracking-[0.8px] uppercase flex items-center gap-2">
        <span className="bg-[#f5c336] text-[#414243] w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">5</span>
        Resultado del dictamen
        <span className="font-normal opacity-70 text-[10px] ml-[6px]">— llenado por el ajustador</span>
      </div>
      <div>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="bg-[#414243] text-white px-[10px] py-2 text-[10px] font-semibold tracking-[0.4px] uppercase text-left pl-[14px] rounded-tl-lg" style={{ width: '40%' }}>Descripción</th>
              <th className="bg-[#414243] text-white px-[10px] py-2 text-[10px] font-semibold tracking-[0.4px] uppercase text-center" style={{ width: '8%' }}>Procede SÍ</th>
              <th className="bg-[#414243] text-white px-[10px] py-2 text-[10px] font-semibold tracking-[0.4px] uppercase text-center" style={{ width: '8%' }}>Procede NO</th>
              <th className="bg-[#414243] text-white px-[10px] py-2 text-[10px] font-semibold tracking-[0.4px] uppercase text-center" style={{ width: '12%' }}>% a acreditar</th>
              <th className="bg-[#414243] text-white px-[10px] py-2 text-[10px] font-semibold tracking-[0.4px] uppercase text-center" style={{ width: '14%' }}>$ a acreditar</th>
              <th className="bg-[#414243] text-white px-[10px] py-2 text-[10px] font-semibold tracking-[0.4px] uppercase text-center" style={{ width: '9%' }}>IVA (16%)</th>
              <th className="bg-[#414243] text-white px-[10px] py-2 text-[10px] font-semibold tracking-[0.4px] uppercase text-center rounded-tr-lg" style={{ width: '11%' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map(({ n, label, pctPlaceholder }, idx) => {
              const monto = form[`d${n}_monto`] || '';
              const val = parseFloat(monto) || 0;
              const iva = `$${(val * 0.16).toFixed(2)}`;
              const total = `$${(val * 1.16).toFixed(2)}`;
              const evenBg = idx % 2 === 1 ? 'bg-[#fafbfc]' : '';

              return (
                <tr key={n}>
                  <td className={`border border-[#e0e0e0] px-[10px] py-2 align-middle text-left text-xs text-[#5a5a5a] pl-[14px] ${evenBg}`}>{label}</td>
                  <td className={`border border-[#e0e0e0] px-[10px] py-2 align-middle text-center ${evenBg}`}>
                    <input
                      type="radio"
                      name={`d${n}`}
                      value="si"
                      checked={form[`d${n}_procede`] === 'si'}
                      onChange={() => !readOnly && setField(`d${n}_procede`, 'si')}
                      disabled={readOnly}
                      className="accent-[#cb4532] w-[15px] h-[15px]"
                    />
                  </td>
                  <td className={`border border-[#e0e0e0] px-[10px] py-2 align-middle text-center ${evenBg}`}>
                    <input
                      type="radio"
                      name={`d${n}`}
                      value="no"
                      checked={form[`d${n}_procede`] === 'no'}
                      onChange={() => !readOnly && setField(`d${n}_procede`, 'no')}
                      disabled={readOnly}
                      className="accent-[#cb4532] w-[15px] h-[15px]"
                    />
                  </td>
                  <td className={`border border-[#e0e0e0] px-[10px] py-2 align-middle text-center ${evenBg}`}>
                    <input
                      type="text"
                      placeholder={pctPlaceholder}
                      value={form[`d${n}_porcentaje`] || ''}
                      onChange={e => !readOnly && setField(`d${n}_porcentaje`, e.target.value)}
                      readOnly={readOnly}
                      className={editableCellInput}
                    />
                  </td>
                  <td className={`border border-[#e0e0e0] px-[10px] py-2 align-middle text-center ${evenBg}`}>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={monto}
                      onChange={e => !readOnly && calcRow(n, e.target.value)}
                      readOnly={readOnly}
                      className={editableCellInput}
                    />
                  </td>
                  <td className={`border border-[#e0e0e0] px-[10px] py-2 align-middle text-center ${evenBg}`}>
                    <input className={autoCellInput} readOnly value={form[`d${n}_iva`] || iva}/>
                  </td>
                  <td className={`border border-[#e0e0e0] px-[10px] py-2 align-middle text-center ${evenBg}`}>
                    <input className={autoCellInput} readOnly value={form[`d${n}_total`] || total}/>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
