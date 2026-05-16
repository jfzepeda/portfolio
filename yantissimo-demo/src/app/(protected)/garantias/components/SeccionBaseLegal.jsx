export default function SeccionBaseLegal() {
  return (
    <div className="bg-white rounded-xl border border-[#e0e0e0] mb-4 overflow-hidden">
      <div className="bg-[#414243] text-white px-4 py-2 text-[11px] font-semibold tracking-[0.8px] uppercase flex items-center gap-2">
        <span className="bg-[#f5c336] text-[#414243] w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">7</span>
        Base legal
      </div>
      <div className="p-4">
        <ul className="list-none">
          <li className="px-3 py-2 border-l-[3px] border-l-[#f5c336] mb-[6px] bg-[#fef8e3] rounded-r-lg text-xs text-[#5a5a5a]">
            <strong className="text-[#2a2a2a]">I.</strong>&nbsp; Arts. 32, 33 y 34 – Ley Federal de Protección al Consumidor
          </li>
          <li className="px-3 py-2 border-l-[3px] border-l-[#f5c336] mb-[6px] bg-[#fef8e3] rounded-r-lg text-xs text-[#5a5a5a]">
            <strong className="text-[#2a2a2a]">II.</strong>&nbsp; Art. IV – Acuerdo sobre Bases Mínimas de Pólizas de Garantía (D.O.F. mayo 4, 1976)
          </li>
          <li className="px-3 py-2 border-l-[3px] border-l-[#f5c336] mb-[6px] bg-[#fef8e3] rounded-r-lg text-xs text-[#5a5a5a]">
            <strong className="text-[#2a2a2a]">III.</strong> Garantía del Fabricante
          </li>
        </ul>
      </div>
    </div>
  );
}
