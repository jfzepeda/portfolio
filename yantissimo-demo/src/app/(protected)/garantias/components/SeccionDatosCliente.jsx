'use client';

const SUCURSALES = [
  'Niños Héroes (Colima)',
  'Constitución (Colima)',
  'Colinas del Rey (Villa de Álvarez)',
  'Benito Juárez (Villa de Álvarez)',
  'Tecnológico (Villa de Álvarez)',
  'Blvd. (Manzanillo)',
  'CEDIS',
];

const inputCls = "w-full border border-[#e0e0e0] rounded-lg px-[11px] py-2 text-[13px] text-[#2a2a2a] bg-white transition-[border-color,box-shadow] duration-150 focus:outline-none focus:border-[#cb4532] focus:shadow-[0_0_0_3px_rgba(203,69,50,0.12)] read-only:bg-[#f0f0f0] read-only:text-[#5a5a5a] read-only:cursor-default disabled:bg-[#f0f0f0] disabled:text-[#5a5a5a] disabled:cursor-default";
const labelCls = "block text-[10px] font-semibold text-[#5a5a5a] uppercase tracking-[0.5px] mb-[5px]";

export default function SeccionDatosCliente({ form, setField, readOnly = false }) {
  return (
    <div className="bg-white rounded-xl border border-[#e0e0e0] mb-4 overflow-hidden">
      <div className="bg-[#414243] text-white px-4 py-2 text-[11px] font-semibold tracking-[0.8px] uppercase flex items-center gap-2">
        <span className="bg-[#f5c336] text-[#414243] w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
        Datos del cliente
      </div>
      <div className="p-4">
        <div className="grid grid-cols-4 gap-3 mb-3">
          <div>
            <label className={labelCls}>No. cliente</label>
            <input className={inputCls} type="text" placeholder="—" value={form.no_cliente} onChange={e => setField('no_cliente', e.target.value)} readOnly={readOnly}/>
          </div>
          <div>
            <label className={labelCls}>Nombre del cliente</label>
            <input className={inputCls} type="text" placeholder="Nombre completo" value={form.nombre_cliente} onChange={e => setField('nombre_cliente', e.target.value)} readOnly={readOnly}/>
          </div>
          <div>
            <label className={labelCls}>Teléfono</label>
            <input className={inputCls} type="tel" placeholder="+52 312 ..." value={form.telefono} onChange={e => setField('telefono', e.target.value)} readOnly={readOnly}/>
          </div>
          <div>
            <label className={labelCls}>Vendedor</label>
            <input className={inputCls} type="text" placeholder="Nombre del asesor" value={form.vendedor} onChange={e => setField('vendedor', e.target.value)} readOnly={readOnly}/>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className={labelCls}>Sucursal</label>
            <select className={inputCls} value={form.sucursal} onChange={e => setField('sucursal', e.target.value)} disabled={readOnly}>
              <option value="">— Seleccionar —</option>
              {SUCURSALES.map(suc => <option key={suc}>{suc}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>No. factura</label>
            <input className={inputCls} type="text" placeholder="13002" value={form.no_factura} onChange={e => setField('no_factura', e.target.value)} readOnly={readOnly}/>
          </div>
          <div>
            <label className={labelCls}>Fecha de factura</label>
            <input className={inputCls} type="date" value={form.fecha_factura} onChange={e => setField('fecha_factura', e.target.value)} readOnly={readOnly}/>
          </div>
          <div>
            <label className={labelCls}>Precio facturado s/IVA</label>
            <input className={inputCls} type="number" placeholder="0.00" step="0.01" value={form.precio_facturado} onChange={e => setField('precio_facturado', e.target.value)} readOnly={readOnly}/>
          </div>
        </div>
      </div>
    </div>
  );
}
