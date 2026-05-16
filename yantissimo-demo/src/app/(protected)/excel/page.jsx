"use client";
import React, { useState, useRef, useEffect } from "react";
import api from "~/lib/api";
import Header from "~/components/header";

const SERIF = "'Fraunces', Georgia, serif";
const MONO = "'JetBrains Mono', ui-monospace, monospace";

const CATALOGS = [
  { key: "reg", label: "Yantissimo" },
  { key: "ova", label: "Ovation" },
  { key: "mich", label: "Michelin" },
  { key: "ava", label: "Avante" },
  { key: "prody", label: "Prodynamics" },
  { key: "serv", label: "Servicios" },
  { key: "test", label: "no usar", warn: true },
];

const endpointMap = {
  reg: "/api/uploads/excel/reg",
  test: "/api/uploads/excel/test",
  ova: "/api/uploads/excel/ova",
  mich: "/api/uploads/excel/mich",
  ava: "/api/uploads/excel/ava",
  prody: "/api/uploads/excel/prody",
  serv: "/api/uploads/excel/serv",
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (!dateString || isNaN(date.getTime())) return null;
  return date.toLocaleDateString("es-ES", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function UploadsPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);
  const [selEndpoint, setSelEndpoint] = useState("reg");
  const [lastUpload, setLastUpload] = useState(null);
  const fileInputRef = useRef(null);

  const fetchLastUpload = async () => {
    try {
      const response = await api("/api/uploads/last");
      if (!response.ok) return;
      const data = await response.json();
      setLastUpload(data.lastUpload);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLastUpload();
  }, []);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    if (e.dataTransfer.files?.length > 0) {
      setFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (uploading) return;
    if (!file) {
      window.showToast("Selecciona un archivo.");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("excelFile", file);
    try {
      const response = await api(endpointMap[selEndpoint], {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (response.ok)
        window.showToast(data.message ?? "Archivo subido correctamente.");
      else
        window.showToast(data.error ?? "Error al subir el archivo.", "error");
    } catch (err) {
      console.error(err);
      window.showToast("Error al subir el archivo.", "error");
    } finally {
      setUploading(false);
      fetchLastUpload();
    }
  };

  const loaded = Boolean(file);

  return (
    <div className="text-[#26211d]">
      <div className="max-w-3xl mx-auto">
        <Header
          title="Subir catálogo de llantas"
          subtitle="Este archivo sobreescribirá la base de datos para uso del Agente de Inteligencia Artificial de Yantissimo."
        />
      </div>

      <div className="p-6 max-w-3xl mx-auto">
        {/* Card principal */}
        <div className="bg-white border border-[#e5dcc8] rounded-2xl p-7 shadow-[0_2px_8px_rgba(38,33,29,0.07)]">
          <h2
            className="text-[17px] font-semibold mb-5"
            style={{ fontFamily: SERIF, letterSpacing: "-0.015em" }}
          >
            Subir hoja de inventario
          </h2>

          {/* Selector de catálogo */}
          <div className="flex flex-wrap gap-2 mb-5">
            {CATALOGS.map(({ key, label, warn }) => {
              const isActive = selEndpoint === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelEndpoint(key)}
                  className={[
                    "px-3.5 py-1.5 rounded-lg border text-[12.5px] font-medium transition-all duration-150 cursor-pointer",
                    isActive && warn
                      ? "bg-[#f7e9c6] border-[#c89519] text-[#a37a10]"
                      : isActive
                      ? "bg-[#dce8ec] border-[#355d6b] text-[#355d6b]"
                      : warn
                      ? "bg-[#f3eee4] border-[#e5dcc8] text-[#8a8073] hover:border-[#c89519] hover:text-[#a37a10]"
                      : "bg-[#f3eee4] border-[#e5dcc8] text-[#5c544a] hover:bg-[#ebe4d3] hover:border-[#d4c8ad] hover:text-[#26211d]",
                  ].join(" ")}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Dropzone */}
          <form onSubmit={handleUpload}>
            <div
              className={[
                "relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer min-h-[200px] flex flex-col items-center justify-center gap-3 px-6 py-10 text-center",
                loaded
                  ? "border-[#5d7c4c] bg-[#e6efdc]"
                  : drag
                  ? "border-[#355d6b] bg-[#dce8ec]"
                  : "border-[#d4c8ad] bg-[#f3eee4] hover:border-[#355d6b] hover:bg-[#dce8ec]",
              ].join(" ")}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDrag(true);
              }}
              onDragLeave={() => setDrag(false)}
              onDrop={handleDrop}
            >
              {loaded && (
                <span className="absolute top-3 right-4 text-[#5d7c4c] text-sm font-bold">
                  ✓
                </span>
              )}

              {!loaded ? (
                <>
                  <span className="text-4xl opacity-50">📂</span>
                  <p className="text-sm text-[#5c544a]">
                    Arrastra y suelta un archivo o haz clic para seleccionar
                  </p>
                  <span
                    className="text-[11px] text-[#8a8073]"
                    style={{ fontFamily: MONO }}
                  >
                    .xlsx · .xls
                  </span>
                </>
              ) : (
                <>
                  <span className="text-4xl">📄</span>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-medium text-[#26211d]"
                      style={{ fontFamily: MONO }}
                    >
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="w-5 h-5 rounded-full bg-[#cb4532] text-white text-xs flex items-center justify-center leading-none hover:bg-[#a93820] transition-colors cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                </>
              )}

              {uploading && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl">
                  <div className="w-8 h-8 border-2 border-[#e5dcc8] border-t-[#355d6b] rounded-full animate-spin" />
                </div>
              )}

              <input
                type="file"
                accept=".xlsx,.xls"
                hidden
                ref={fileInputRef}
                onChange={handleFileChange}
                onClick={(e) => {
                  e.target.value = null;
                }}
              />
            </div>

            <button
              type="submit"
              disabled={uploading || !file}
              className="mt-4 px-6 py-2.5 rounded-lg bg-[#355d6b] text-white text-[13.5px] font-medium border-none cursor-pointer transition-all duration-150 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:not-disabled:brightness-110 hover:not-disabled:-translate-y-px"
            >
              {uploading ? "Subiendo…" : "Subir archivo"}
            </button>
          </form>
        </div>

        {/* Últimas cargas */}
        <div className="mt-6">
          <p
            className="text-[10px] font-medium tracking-widest uppercase text-[#8a8073] mb-3"
            style={{ fontFamily: MONO }}
          >
            Última carga por catálogo
          </p>
          <div className="grid grid-cols-3 gap-3">
            {CATALOGS.filter((c) => c.key !== "test").map(({ key, label }) => {
              const date = formatDate(lastUpload?.[key]);
              return (
                <div
                  key={key}
                  className="bg-white border border-[#e5dcc8] rounded-xl px-4 py-3.5 shadow-[0_1px_2px_rgba(38,33,29,0.04)]"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                        date ? "bg-[#5d7c4c]" : "bg-[#d4c8ad]"
                      }`}
                    />
                    <span
                      className="text-[9.5px] font-medium tracking-[0.08em] uppercase text-[#8a8073]"
                      style={{ fontFamily: MONO }}
                    >
                      {label}
                    </span>
                  </div>
                  {date ? (
                    <p className="text-[12px] text-[#5c544a] leading-snug capitalize">
                      {date}
                    </p>
                  ) : (
                    <p className="text-[11.5px] text-[#8a8073] italic">
                      Sin datos
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
