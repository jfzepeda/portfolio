"use client";

export default function Header({ folio, onFolioChange, readOnly = false }) {
  const today = new Date();
  const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];
  const fechaDisplay = `${today.getDate()} de ${meses[today.getMonth()]} de ${today.getFullYear()}`;

  return (
    <div className="bg-[#414243] text-white flex flex-col [print-color-adjust:exact] [-webkit-print-color-adjust:exact]">
      <div className="flex items-center justify-between min-h-[72px] py-0 pr-8 pl-16 gap-6 max-[899px]:min-h-[76px] max-[899px]:p-5 max-[899px]:items-start max-[899px]:flex-col max-[899px]:gap-[10px]">
        <div className="flex flex-col justify-center min-h-[44px] leading-[1.45]">
          <strong className="mb-[2px] text-[13px] leading-[1.2]">Solicitud de Garantía</strong>
          <span className="text-white/[.86] leading-[1.35]">
            AV TECNOLÓGICO #3 &nbsp;•&nbsp; CP 28978 &nbsp;•&nbsp; VILLA DE ÁLVAREZ, COLIMA
          </span>
        </div>

        <div className="text-right text-[11px] text-white/70 max-[899px]:text-left">
          <div>{fechaDisplay}</div>
          <div className="flex items-center gap-2 mt-[6px]">
            <label className="text-[11px] text-white/80 whitespace-nowrap">FOLIO:</label>
            <input
              type="text"
              placeholder="Ej. CEDIS-0059"
              value={folio}
              onChange={(e) => onFolioChange(e.target.value)}
              readOnly={readOnly}
              className="bg-white/[.12] border border-white/30 rounded-md px-[10px] py-1 text-white text-xs font-[DM_Mono,monospace] w-[150px] font-medium placeholder:text-white/40 focus:outline-none"
            />
          </div>
        </div>
      </div>
      <div className="h-1 bg-[linear-gradient(90deg,#cb4532_0%,#cb4532_50%,#f5c336_50%,#f5c336_100%)]" />
    </div>
  );
}
