"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createGarantia } from "./api";
import Header from "./components/Header";
import SeccionDatosCliente from "./components/SeccionDatosCliente";
import SeccionDatosProducto from "./components/SeccionDatosProducto";
import SeccionEvidencia from "./components/SeccionEvidencia";
import SeccionDocumentacion from "./components/SeccionDocumentacion";
import SeccionDictamen from "./components/SeccionDictamen";
import SeccionAnalisis from "./components/SeccionAnalisis";
import SeccionBaseLegal from "./components/SeccionBaseLegal";
import SeccionFirmas from "./components/SeccionFirmas";
import BottomBar from "./components/BottomBar";
import ModalCorreo from "./components/ModalCorreo";

const EMPTY_PROD = {
  marca: "",
  modelo: "",
  medida: "",
  serie_dot: "",
  remanente: "",
  precio: "",
  descripcion_dano: "",
};

const INITIAL_FORM = {
  folio: "",
  no_cliente: "",
  nombre_cliente: "",
  telefono: "",
  vendedor: "",
  sucursal: "",
  no_factura: "",
  fecha_factura: "",
  precio_facturado: "",
  productos: [{ ...EMPTY_PROD }, { ...EMPTY_PROD }, { ...EMPTY_PROD }],
  llanta_fisica: "",
  llanta_fisica_obs: "",
  corte_fisico: "",
  corte_fisico_obs: "",
  foto_video: "",
  foto_video_obs: "",
  d1_procede: "",
  d1_porcentaje: "",
  d1_monto: "",
  d1_iva: "",
  d1_total: "",
  d2_procede: "",
  d2_porcentaje: "",
  d2_monto: "",
  d2_iva: "",
  d2_total: "",
  d3_procede: "",
  d3_porcentaje: "",
  d3_monto: "",
  d3_iva: "",
  d3_total: "",
  analisis: "",
  dictamen: "",
  comentario_dictamen: "",
  nombre_ajustador: "",
  lugar_fecha: "",
  firma_asesor: "",
  firma_ajustador: "",
  firma_gerente: "",
};

export default function GarantiasPage() {
  const router = useRouter();
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState(null);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function setProd(rowIdx, key, value) {
    setForm((prev) => {
      const productos = prev.productos.map((p, i) =>
        i === rowIdx ? { ...p, [key]: value } : p
      );
      return { ...prev, productos };
    });
  }

  async function handleGuardar() {
    setSaving(true);
    setError(null);
    try {
      console.log("Guardando garantía...", form);
      const data = await createGarantia(form);
      router.push(`/garantias/${data.id}`);
    } catch (err) {
      setError(err.message || "Error al guardar la garantía");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="font-[DM_Sans,sans-serif] text-[#2a2a2a] text-[13px] leading-[1.5] min-h-screen bg-transparent">
      <Header folio={form.folio} onFolioChange={(v) => setField("folio", v)} />
      <div className="max-w-[960px] mx-auto px-5 pt-6 pb-10 bg-transparent print:p-0 print:max-w-full">
        {error && (
          <div className="py-[10px] px-4 rounded-lg text-xs font-medium mb-4 flex items-center gap-2 bg-[#f9e0db] text-[#7b241c] border border-[#e8a09a]">
            ⚠ {error}
          </div>
        )}
        <SeccionDatosCliente form={form} setField={setField} />
        <SeccionDatosProducto productos={form.productos} setProd={setProd} />
        <SeccionEvidencia />
        <SeccionDocumentacion form={form} setField={setField} />
        <SeccionDictamen form={form} setField={setField} />
        <SeccionAnalisis form={form} setField={setField} />
        <SeccionBaseLegal />
        <SeccionFirmas form={form} setField={setField} />
        <BottomBar
          onEmail={() => setModalOpen(true)}
          onGuardar={handleGuardar}
          saving={saving}
        />
      </div>
      <ModalCorreo
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        form={form}
      />
    </div>
  );
}
