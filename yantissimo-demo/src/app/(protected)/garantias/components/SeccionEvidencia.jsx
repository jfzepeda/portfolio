'use client';
import { useState, useRef } from 'react';

export default function SeccionEvidencia({ readOnly = false }) {
  const [imgs, setImgs] = useState([]);
  const [slots, setSlots] = useState(4);
  const fileRef = useRef(null);
  const [activeSlot, setActiveSlot] = useState(null);

  function handleFiles(e) {
    const files = Array.from(e.target.files);
    const readers = files.map(file => new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = ev => resolve({ url: ev.target.result, name: file.name });
      reader.readAsDataURL(file);
    }));
    Promise.all(readers).then(newImgs => {
      setImgs(prev => {
        const updated = [...prev];
        let slot = activeSlot ?? prev.length;
        newImgs.forEach(img => {
          if (slot < slots) updated[slot++] = img;
          else updated.push(img);
        });
        if (updated.length > slots) setSlots(updated.length);
        return updated;
      });
    });
    e.target.value = '';
    setActiveSlot(null);
  }

  function removeImg(idx) {
    setImgs(prev => prev.filter((_, i) => i !== idx));
  }

  function addSlot() { setSlots(s => s + 1); }

  function openPicker(idx) {
    setActiveSlot(idx);
    fileRef.current?.click();
  }

  const filledCount = imgs.filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl border border-[#e0e0e0] mb-4 overflow-hidden">
      <div className="bg-[#414243] text-white px-4 py-2 text-[11px] font-semibold tracking-[0.8px] uppercase flex items-center gap-2">
        <span className="bg-[#f5c336] text-[#414243] w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
        Evidencia fotográfica
      </div>
      <div className="p-4">
        <div className="grid [grid-template-columns:repeat(auto-fill,minmax(130px,1fr))] gap-[10px] mb-3">
          {Array.from({ length: Math.max(slots, imgs.length) }).map((_, idx) => {
            const img = imgs[idx];
            return (
              <div
                key={idx}
                className={`group border-2 border-dashed rounded-[10px] aspect-square flex flex-col items-center justify-center cursor-pointer transition-[border-color,background] duration-200 relative overflow-hidden bg-[#f5f5f5] hover:border-[#cb4532] hover:bg-[#fef5f3] ${img ? 'border-solid border-[#cb4532]' : 'border-[#e0e0e0]'}`}
                onClick={() => !readOnly && openPicker(idx)}
              >
                {img ? (
                  <>
                    <img src={img.url} alt={img.name} className="w-full h-full object-cover absolute inset-0 rounded-lg"/>
                    {!readOnly && (
                      <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center opacity-0 transition-opacity duration-200 rounded-lg group-hover:opacity-100 print:hidden">
                        <span className="text-[10px] text-white mb-[6px] px-2 text-center break-all">{img.name}</span>
                        <button
                          className="bg-[#cb4532] text-white border-none rounded-full w-[26px] h-[26px] cursor-pointer text-sm flex items-center justify-center font-semibold"
                          onClick={e => { e.stopPropagation(); removeImg(idx); }}
                        >✕</button>
                      </div>
                    )}
                  </>
                ) : (
                  !readOnly && (
                    <>
                      <span className="text-[22px] mb-[5px]">📎</span>
                      <span className="text-[11px] text-[#5a5a5a] text-center leading-[1.4]">Añadir foto</span>
                    </>
                  )
                )}
              </div>
            );
          })}
        </div>
        {!readOnly && (
          <div className="flex items-center gap-3">
            <button
              className="border border-[#e0e0e0] rounded-lg px-4 py-2 text-xs bg-white cursor-pointer text-[#2a2a2a] flex items-center gap-[6px] font-medium transition-[border-color,color] duration-150 hover:border-[#cb4532] hover:text-[#cb4532] print:hidden"
              onClick={addSlot}
              type="button"
            >
              <span>+</span> Agregar espacio
            </button>
            <span className="text-[11px] text-[#5a5a5a]">
              {filledCount} archivo{filledCount !== 1 ? 's' : ''} adjunto{filledCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={handleFiles}
        />
      </div>
    </div>
  );
}
