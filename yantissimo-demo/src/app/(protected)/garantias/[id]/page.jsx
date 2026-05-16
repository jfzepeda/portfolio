'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getGarantia } from '../api';
import Header from '../components/Header';
import SeccionDatosCliente from '../components/SeccionDatosCliente';
import SeccionDatosProducto from '../components/SeccionDatosProducto';
import SeccionEvidencia from '../components/SeccionEvidencia';
import SeccionDocumentacion from '../components/SeccionDocumentacion';
import SeccionDictamen from '../components/SeccionDictamen';
import SeccionAnalisis from '../components/SeccionAnalisis';
import SeccionBaseLegal from '../components/SeccionBaseLegal';
import SeccionFirmas from '../components/SeccionFirmas';
import BottomBar from '../components/BottomBar';
import ModalCorreo from '../components/ModalCorreo';

const EMPTY_PROD = { marca: '', modelo: '', medida: '', serie_dot: '', remanente: '', precio: '', descripcion_dano: '' };

export default function GarantiaViewPage() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    getGarantia(id)
      .then(data => {
        const { datos = {}, ...top } = data;
        const merged = {
          folio: top.folio || '',
          no_cliente: top.no_cliente || '',
          nombre_cliente: top.nombre_cliente || '',
          sucursal: top.sucursal || '',
          no_factura: top.no_factura || '',
          fecha_factura: top.fecha_factura || '',
          dictamen: top.dictamen || '',
          nombre_ajustador: top.nombre_ajustador || '',
          // defaults for all other fields
          telefono: '', vendedor: '', precio_facturado: '',
          productos: [{ ...EMPTY_PROD }, { ...EMPTY_PROD }, { ...EMPTY_PROD }],
          llanta_fisica: '', llanta_fisica_obs: '',
          corte_fisico: '', corte_fisico_obs: '',
          foto_video: '', foto_video_obs: '',
          d1_procede: '', d1_porcentaje: '', d1_monto: '', d1_iva: '', d1_total: '',
          d2_procede: '', d2_porcentaje: '', d2_monto: '', d2_iva: '', d2_total: '',
          d3_procede: '', d3_porcentaje: '', d3_monto: '', d3_iva: '', d3_total: '',
          analisis: '', comentario_dictamen: '', lugar_fecha: '',
          firma_asesor: '', firma_ajustador: '', firma_gerente: '',
          // spread JSONB datos last so it overrides defaults
          ...datos,
          // top-level searchable fields take final precedence
          folio: top.folio || datos.folio || '',
          no_cliente: top.no_cliente || datos.no_cliente || '',
          nombre_cliente: top.nombre_cliente || datos.nombre_cliente || '',
          sucursal: top.sucursal || datos.sucursal || '',
          no_factura: top.no_factura || datos.no_factura || '',
          fecha_factura: top.fecha_factura || datos.fecha_factura || '',
          dictamen: top.dictamen || datos.dictamen || '',
          nombre_ajustador: top.nombre_ajustador || datos.nombre_ajustador || '',
        };
        setForm(merged);
      })
      .catch(err => setError(err.message || 'Error al cargar la garantía'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="font-[DM_Sans,sans-serif] text-[#2a2a2a] text-[13px] leading-[1.5] min-h-screen bg-transparent">
        <div className="max-w-[960px] mx-auto px-5 pt-6 pb-10">
          <div className="py-[10px] px-4 rounded-lg text-xs font-medium mb-4 flex items-center gap-2 bg-[#e8f4fd] text-[#1a6da3] border border-[#b3d9f5]">
            ⏳ Cargando garantía...
          </div>
        </div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="font-[DM_Sans,sans-serif] text-[#2a2a2a] text-[13px] leading-[1.5] min-h-screen bg-transparent">
        <div className="max-w-[960px] mx-auto px-5 pt-6 pb-10">
          <div className="py-[10px] px-4 rounded-lg text-xs font-medium mb-4 flex items-center gap-2 bg-[#f9e0db] text-[#7b241c] border border-[#e8a09a]">
            ⚠ {error || 'Garantía no encontrada'}
          </div>
        </div>
      </div>
    );
  }

  // noop setter — view is read-only
  const noop = () => {};

  return (
    <div className="font-[DM_Sans,sans-serif] text-[#2a2a2a] text-[13px] leading-[1.5] min-h-screen bg-transparent">
      <Header folio={form.folio} onFolioChange={noop} readOnly/>
      <div className="max-w-[960px] mx-auto px-5 pt-6 pb-10 bg-transparent print:p-0 print:max-w-full">
        <div className="py-[10px] px-4 rounded-lg text-xs font-medium mb-4 flex items-center gap-2 bg-[#e8f4fd] text-[#1a6da3] border border-[#b3d9f5]">
          👁 Modo vista — <strong>ID: {id}</strong>
          <span className="bg-[#fef8e3] border border-[#f0d060] rounded-md px-[10px] py-[3px] text-[10px] font-semibold text-[#7a6000] tracking-[0.4px] uppercase ml-2">
            {form.dictamen || 'SIN DICTAMEN'}
          </span>
        </div>
        <SeccionDatosCliente form={form} setField={noop} readOnly/>
        <SeccionDatosProducto productos={form.productos} setProd={noop} readOnly/>
        <SeccionEvidencia readOnly/>
        <SeccionDocumentacion form={form} setField={noop} readOnly/>
        <SeccionDictamen form={form} setField={noop} readOnly/>
        <SeccionAnalisis form={form} setField={noop} readOnly/>
        <SeccionBaseLegal/>
        <SeccionFirmas form={form} setField={noop} readOnly/>
        <BottomBar
          onEmail={() => setModalOpen(true)}
          readOnly
        />
      </div>
      <ModalCorreo isOpen={modalOpen} onClose={() => setModalOpen(false)} form={form}/>
    </div>
  );
}
