'use client';

export default function SeccionDatosProducto({ productos, setProd, readOnly = false }) {
  const COLS = ['Marca', 'Modelo', 'Medida', '# Serie / DOT', 'Remanente', 'Precio s/IVA', 'Descripción del daño'];
  const KEYS = ['marca', 'modelo', 'medida', 'serie_dot', 'remanente', 'precio', 'descripcion_dano'];
  const WIDTHS = ['13%', '13%', '13%', '20%', '10%', '13%', undefined];

  return (
    <div className="bg-white rounded-xl border border-[#e0e0e0] mb-4 overflow-hidden">
      <div className="bg-[#414243] text-white px-4 py-2 text-[11px] font-semibold tracking-[0.8px] uppercase flex items-center gap-2">
        <span className="bg-[#f5c336] text-[#414243] w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
        Datos del producto
      </div>
      <div>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              {COLS.map((col, i) => (
                <th
                  key={col}
                  style={WIDTHS[i] ? { width: WIDTHS[i] } : undefined}
                  className={`bg-[#cb4532] text-white px-[10px] py-2 text-left text-[10px] font-semibold tracking-[0.5px] uppercase ${i === 0 ? 'rounded-tl-lg' : ''} ${i === COLS.length - 1 ? 'rounded-tr-lg' : ''}`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {productos.map((prod, ri) => (
              <tr key={ri}>
                {KEYS.map((key) => (
                  <td
                    key={key}
                    className={`p-0.5 ${ri < productos.length - 1 ? 'border-b border-[#e0e0e0]' : ''} ${ri % 2 === 1 ? 'bg-[#fafbfc]' : ''}`}
                  >
                    <input
                      type={key === 'precio' ? 'number' : 'text'}
                      step={key === 'precio' ? '0.01' : undefined}
                      placeholder={key === 'precio' ? '0.00' : key === 'marca' && ri === 0 ? 'OVATION' : key === 'medida' && ri === 0 ? '185/65R14' : ''}
                      value={prod[key]}
                      onChange={e => setProd(ri, key, e.target.value)}
                      readOnly={readOnly}
                      className={`border-none bg-transparent w-full px-[10px] py-[7px] text-xs text-[#2a2a2a] focus:[outline:2px_solid_#cb4532] focus:rounded-md focus:bg-[#fef5f3] read-only:bg-[#f0f0f0] read-only:text-[#5a5a5a] read-only:cursor-default${key === 'serie_dot' ? ' font-[DM_Mono,monospace] text-[11px]' : ''}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
