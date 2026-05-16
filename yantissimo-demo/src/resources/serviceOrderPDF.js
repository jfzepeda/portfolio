// serviceOrderPDF.js — Orden de servicio sin importes
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getSuc } from "~/utils/global";

// Ruta del fondo en /public
const BG_PATH = "/pdf_sec.jpeg";
const LOGO_PATH = "/logo_blanco.jpeg";

// Carga una imagen del public como HTMLImageElement
const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

const getFirstText = (...values) => {
  for (const value of values) {
    if (value === null || value === undefined) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return "";
};

const normalizeVehicle = (vehicle) => {
  if (Array.isArray(vehicle)) return normalizeVehicle(vehicle[0] || {});
  if (!vehicle || typeof vehicle !== "object") return {};

  const values = Object.values(vehicle).filter(
    (value) => value && typeof value === "object" && !Array.isArray(value)
  );

  if (
    values.length > 0 &&
    !("model" in vehicle || "year" in vehicle || "plate" in vehicle)
  ) {
    return normalizeVehicle(values[0]);
  }

  return vehicle;
};

const buildRows = (data) => {
  const raw = [...(data.items || []), ...(data.services || [])];

  return raw.map((row) => ({
    ...row,
    producto: getFirstText(
      row?.articulo,
      row?.article,
      row?.servicio,
      row?.service,
      row?.producto,
      row?.name
    ),
    units: Number(row?.units) || 0,
  }));
};

const generatePDF = async (data) => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const vehicle = normalizeVehicle(data?.vehicle);
  const vehicleModel = getFirstText(
    vehicle?.model,
    vehicle?.vehicle_model,
    data?.vehicle_model,
    data?.car_model
  );
  const vehicleYear = getFirstText(
    vehicle?.year,
    vehicle?.vehicle_year,
    data?.vehicle_year,
    data?.year
  );
  const vehiclePlate = getFirstText(
    vehicle?.plate,
    vehicle?.vehicle_plate,
    data?.vehicle_plate,
    data?.plate,
    data?.check_in?.plate,
    data?.checkIn?.plate
  );
  const technicianName = getFirstText(
    data?.technician,
    data?.technician_name,
    data?.check_in?.technician,
    data?.checkIn?.technician
  );
  const vehicleLabel = [vehicleModel, vehicleYear].filter(Boolean).join(" ");

  // 0) Fondo de página
  const bg = await loadImage(BG_PATH);

  // Suscribe para pintar el mismo fondo secundario en cada página nueva.
  doc.internal.events.subscribe("addPage", () => {
    const pW = doc.internal.pageSize.getWidth();
    const pH = doc.internal.pageSize.getHeight();
    doc.addImage(bg, "JPEG", -10, 0, pW + 20, pH, undefined, "FAST");
  });

  // doc.addImage(bg, "PNG", 0 - 10, 0, pageWidth + 20, pageHeight);
  // Nota: pasar undefined como alias y usar 'FAST' como compresión para evitar reutilizar la misma imagen por alias
  doc.addImage(
    bg,
    "JPEG",
    0 - 10,
    0,
    pageWidth + 20,
    pageHeight,
    undefined,
    "FAST"
  );

  // Añadir logo en la esquina superior izquierda
  const logoImg = await loadImage(LOGO_PATH);
  const logoWidthMM = 60; // ancho deseado en mm
  const logoHeightMM = (logoImg.height / logoImg.width) * logoWidthMM; // mantener proporción
  doc.addImage(logoImg, "JPEG", 10, 10, logoWidthMM, logoHeightMM);

  // 1) Texto dinámico en el header del fondo
  const sucursal = getSuc(data.sucursal)?.[0] || "";
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text(`Sucursal - ${sucursal}`, pageWidth - 25, 14, { align: "right" });
  doc.setFontSize(12);
  doc.text(`Orden de Servicio ${data.id}`, pageWidth - 25, 19, {
    align: "right",
  });

  // 2) Barra de información (solo texto, sin cajas)
  const infoY = 60; // ajusta si tu PNG requiere otro offset
  const gap = 6;
  const today = new Date();
  const d = String(today.getDate()).padStart(2, "0");
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const y = today.getFullYear();
  const fechaStr = `${d}/${m}/${y}`;
  const sellerShort = String(data.seller || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .join(" ");

  // Informacion del vendedor
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);

  doc.setFontSize(9);
  const coordXL = 20;
  const coordXM = 90;
  const coordXR = 160;
  // Fila Super
  doc.setFont("helvetica", "bold");
  doc.text("Cliente", coordXL, infoY);
  doc.text("Venta a", coordXM, infoY);
  doc.text(`Asesor: ${sellerShort}`, coordXR, infoY);

  doc.setFont("helvetica", "normal");
  doc.text(data.client_name || "", coordXL + 12, infoY);
  doc.text(data.client_type || "PUBLICO", coordXM + 13, infoY);

  // Fila Media
  doc.setFont("helvetica", "bold");
  doc.text("Teléfono", coordXL, infoY + gap);
  doc.text("Técnico", coordXM, infoY + gap);
  doc.text(`Telefono: ${data?.seller_phone}`, coordXR, infoY + gap);

  doc.setFont("helvetica", "normal");
  doc.text(data.phone || "", coordXL + 15, infoY + gap);
  doc.text(technicianName, coordXM + 17, infoY + gap);

  // Fila Inferior
  doc.setFont("helvetica", "bold");
  doc.text("Auto", coordXL, infoY + gap * 2);
  doc.text("Placas", coordXM, infoY + gap * 2);
  doc.text(fechaStr || "", coordXR, infoY + gap * 2);

  doc.setFont("helvetica", "normal");
  doc.text(vehicleLabel, coordXL + 10, infoY + gap * 2);
  doc.text(vehiclePlate, coordXM + 15, infoY + gap * 2);

  // 3) Tabla de detalle
  const startY = 79.5; // ajusta según tu PNG

  const columns = [
    { header: "Producto / Servicio", dataKey: "producto" },
    { header: "Pzas", dataKey: "units" },
  ];

  const rows = buildRows(data);

  // Si la tabla supera 7 filas, continuar en otra página con el mismo fondo.
  const maxRowsFirstPage = 7;
  const firstRows = rows.slice(0, maxRowsFirstPage);
  const remainingRows = rows.slice(maxRowsFirstPage);

  // Opciones base para mantener estilo
  const tableBaseOptions = {
    head: [columns.map((c) => c.header)],
    columnStyles: {
      0: { cellWidth: 155 },
      1: { cellWidth: 18, halign: "center" },
    },
    headStyles: {
      fillColor: null,
      textColor: [0, 0, 0],
      fontSize: 8,
    },
    bodyStyles: { fontSize: 8 },
    styles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], lineWidth: 0 },
    alternateRowStyles: { fillColor: [245, 245, 245], textColor: [0, 0, 0] },
    theme: "plain",
  };

  if (rows.length <= maxRowsFirstPage) {
    autoTable(doc, {
      ...tableBaseOptions,
      body: rows.map((r) => columns.map((c) => r[c.dataKey])),
      startY,
      margin: { top: 0, bottom: 90, horizontal: 10 },
    });
  } else {
    // Primera página: máximo 7 filas
    autoTable(doc, {
      ...tableBaseOptions,
      body: firstRows.map((r) => columns.map((c) => r[c.dataKey])),
      startY,
      margin: { top: 0, bottom: 90, horizontal: 10 },
    });

    // Segunda página con continuación de la tabla
    doc.addPage();

    autoTable(doc, {
      ...tableBaseOptions,
      body: remainingRows.map((r) => columns.map((c) => r[c.dataKey])),
      startY,
      // Mantener el mismo offset en páginas siguientes de esta segunda tabla
      margin: { top: startY, bottom: 90, horizontal: 10 },
    });
  }

  // Notas adicionales, si aplican
  if (data.additional_notes) {
    const referenceY = doc.lastAutoTable?.finalY || startY;
    const baseY = referenceY + 30;
    doc.setFont("helvetica", "bold");
    doc.text("Notas adicionales", 15, baseY);
    doc.setFont("helvetica", "normal");
    doc.text(String(data.additional_notes), 15, baseY + 6);
  }

  // Añadir numeración de página en la esquina inferior derecha, texto blanco, fuente helvetica, tamaño 8
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(`Pág ${i} de ${pageCount}`, pageWidth - 15, pageHeight - 8, {
      align: "right",
    });
  }
  return doc;
};

export const downloadPDF = async (data) => {
  const pdf = await generatePDF(data);
  pdf.save(
    `${data.sucursal}-${data.id} orden de servicio ${data.client_name}.pdf`
  );
};
