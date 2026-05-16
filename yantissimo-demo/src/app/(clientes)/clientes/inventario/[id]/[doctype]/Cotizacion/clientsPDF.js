// quotePDF.js — PDF con imagen de fondo y texto encima
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getSuc } from "~/utils/global";
import { currencyFormatter, get6msi, get12msi } from "~/utils/formaters";

// Ruta del fondo en /public
const MAIN_BG_PATH = "/pdf_main.jpeg";
const SEC_BG_PATH = "/pdf_sec.jpeg";
const LOGO_PATH = "/logo_blanco.jpeg";

// Carga una imagen del public como HTMLImageElement
const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

// Mapea filas y calcula totales usando valores numéricos antes de formatear
const buildRows = (data) => {
  const raw = [...(data.items || []), ...(data.services || [])];

  let totalConIva = 0;
  const displayRows = [];

  const pushFormattedRow = (row, units, unitPrice, opts = {}) => {
    const precioLista = Number(row?.precioLista) || 0;
    const descuento = precioLista
      ? Math.round((1 - unitPrice / precioLista) * 100)
      : 0;

    // Mensualidades por unidad cuando existan; si no, calcular a partir del precio unitario recibido
    const seisMesesPU = get6msi(row);
    const doceMesesPU = get12msi(row);

    if (!data.sumarTotales) {
      displayRows.push({
        ...row,
        producto: opts.labelSuffix
          ? `${row.articulo} ${opts.labelSuffix}`
          : row.articulo,
        priceList: currencyFormatter(precioLista),
        desc: descuento > 0 ? `${descuento}%` : "-",
        units,
        price: currencyFormatter(unitPrice * units),
        seisMeses: currencyFormatter(unitPrice ? seisMesesPU * 4 : 0),
        doceMeses: currencyFormatter(unitPrice ? doceMesesPU * 4 : 0),
        __num: {
          units,
          precioBase: unitPrice,
          seisMesesPU,
          doceMesesPU,
          totalRow: unitPrice * units,
        },
      });
    } else {
      displayRows.push({
        ...row,
        producto: opts.labelSuffix
          ? `${row.articulo} ${opts.labelSuffix}`
          : row.articulo,
        priceList: currencyFormatter(precioLista),
        desc: descuento > 0 ? `${descuento}%` : "-",
        price: currencyFormatter(unitPrice),
        units,
        total: currencyFormatter(unitPrice * units),
        __num: {
          units,
          precioBase: unitPrice,
          seisMesesPU,
          doceMesesPU,
          totalRow: unitPrice * units,
        },
      });
    }
  };

  raw.forEach((row) => {
    const units = Number(row.units) || 0;
    const precioLista = Number(row?.precioLista) || 0;
    const precioPromo = Number(row?.precioPromo ?? 0);

    // Detecta 4x3: el precio promo equivale a 25% menos que la lista y las piezas son múltiplos de 4
    const is4x3 =
      precioLista > 0 &&
      precioLista * 0.75 === precioPromo &&
      units % 4 === 0 &&
      (row?.categoria).toLowerCase() !== "servicios";

    if (is4x3 && units > 0) {
      // Por cada bloque de 4 piezas: 3 filas a precio de lista y 1 fila a $0
      const blocks = units / 4;

      // Total a cobrar: 3 piezas por bloque a precio de lista
      totalConIva += blocks * 3 * precioLista;

      for (let b = 0; b < blocks; b++) {
        // 3 pagadas
        pushFormattedRow(row, 3, precioLista);
        // 1 gratis
        pushFormattedRow(row, 1, 0, { labelSuffix: "(4x3 gratis)" });
      }
    } else {
      // Comportamiento normal
      const precioBase = precioPromo || 0;
      const totalRow = units * precioBase;
      totalConIva += totalRow;

      const descuento = precioLista
        ? Math.round((1 - precioBase / precioLista) * 100)
        : 0;

      const seisMesesPU = get6msi(row);
      const doceMesesPU = get12msi(row);

      if (!data.sumarTotales) {
        displayRows.push({
          ...row,
          producto: row.articulo,
          priceList: currencyFormatter(precioLista),
          desc: descuento > 0 ? `${descuento}%` : "-",
          units,
          price: currencyFormatter(precioBase * units),
          seisMeses: currencyFormatter(seisMesesPU * units),
          doceMeses: currencyFormatter(doceMesesPU * units),
          __num: { units, precioBase, seisMesesPU, doceMesesPU, totalRow },
        });
      } else {
        displayRows.push({
          ...row,
          producto: row.articulo,
          priceList: currencyFormatter(precioLista),
          desc: descuento > 0 ? `${descuento}%` : "-",
          price: currencyFormatter(precioBase),
          units,
          total: currencyFormatter(totalRow),
          __num: { units, precioBase, seisMesesPU, doceMesesPU, totalRow },
        });
      }
    }
  });

  return { rows: displayRows, totalConIva };
};

const computeMonthlyTotals = (rows) => {
  return rows.reduce(
    (acc, r) => {
      const { units, precioBase, seisMesesPU, doceMesesPU } = r.__num || {};
      const seis = Number(seisMesesPU) > 0 ? seisMesesPU : precioBase / 1; // si no hay MSI, usa contado como base
      const doce = Number(doceMesesPU) > 0 ? doceMesesPU : precioBase / 1;
      acc.total6 += seis * units; // esto ya es por mes (PU), lo acumulamos mensual
      acc.total12 += doce * units; // mensual
      return acc;
    },
    { total6: 0, total12: 0 }
  );
};

const generatePDF = async (data) => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let totalsEndY = null; // para posicionar notas sin traslape

  // 0) Fondo de página
  const bg = await loadImage(MAIN_BG_PATH);
  const secBg = await loadImage(SEC_BG_PATH);

  // Suscribe para pintar el fondo secundario en cada página nueva
  doc.internal.events.subscribe("addPage", () => {
    const pW = doc.internal.pageSize.getWidth();
    const pH = doc.internal.pageSize.getHeight();
    const pageNo = doc.internal.getNumberOfPages();
    if (pageNo > 1) {
      doc.addImage(secBg, "JPEG", -10, 0, pW + 20, pH, undefined, "FAST");
    }
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
  doc.setFontSize(14);
  // color blanco para resaltar sobre el fondo oscuro
  doc.setTextColor(255, 255, 255);
  doc.text(`Sucursal - ${sucursal}`, pageWidth - 25, 14, { align: "right" });
  doc.setTextColor(0, 0, 0);
  doc.text(`Sucursal - ${sucursal}`, pageWidth - 25, 14, { align: "right" });
  doc.setTextColor(0, 0, 0);

  // 2) Barra de información (solo texto, sin cajas)
  const infoY = 60; // ajusta si tu PNG requiere otro offset
  const gap = 6;
  const today = new Date();
  const d = String(today.getDate()).padStart(2, "0");
  const m = String(today.getMonth() + 1).padStart(2, "0");
  const y = today.getFullYear();
  const fechaStr = `${d}/${m}/${y}`;

  doc.setFontSize(9);
  // Columna izquierda
  doc.setFont("helvetica", "bold");
  doc.text("Cliente", 20, infoY);
  doc.setFont("helvetica", "normal");
  doc.text(data.client_name || "", 35, infoY);

  doc.setFont("helvetica", "bold");
  doc.text("Teléfono", 20, infoY + gap);
  doc.setFont("helvetica", "normal");
  doc.text(data.phone || "", 35, infoY + gap);

  // Columna media
  doc.setFont("helvetica", "bold");
  doc.text("Vendedor", 95, infoY);
  doc.setFont("helvetica", "normal");
  const sellerShort = String(data.seller || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .join(" ");
  doc.text(sellerShort, 120, infoY);

  doc.setFont("helvetica", "bold");
  doc.text("Tipo de Venta", 95, infoY + gap);
  doc.setFont("helvetica", "normal");
  doc.text((data.client_type || "PUBLICO").toUpperCase(), 120, infoY + gap);

  // Columna derecha
  doc.setFont("helvetica", "bold");
  doc.text(`${data.id} - Cotización`, pageWidth - 15, infoY, {
    align: "right",
  });
  doc.text(`Fecha ${fechaStr}`, pageWidth - 15, infoY + gap, {
    align: "right",
  });

  // 3) Tabla de detalle
  const startY = 79.5; // ajusta según tu PNG

  let columns = [];
  const isConvenio =
    String(data.client_type || "").toUpperCase() === "CONVENIO";
  const isDist =
    String(data.client_type || "").toUpperCase() === "DISTRIBUIDOR";

  if (!data.sumarTotales) {
    columns = [
      { header: "Producto / Servicio", dataKey: "producto" },
      { header: "Pzas", dataKey: "units" },
      { header: "Precio Lista", dataKey: "priceList" },
      { header: "Dto", dataKey: "desc" },
      {
        header: isConvenio
          ? "Precio Conv"
          : isDist
          ? "Precio Dist"
          : "Precio Promo",
        dataKey: "price",
      },
      { header: "6 pagos", dataKey: "seisMeses" },
      { header: "12 pagos", dataKey: "doceMeses" },
    ];
  } else {
    columns = [
      { header: "Producto / Servicio", dataKey: "producto" },
      { header: "Pzas", dataKey: "units" },
      { header: "Precio Lista", dataKey: "priceList" },
      { header: "Dto", dataKey: "desc" },
      {
        header: isConvenio
          ? "Precio Conv"
          : isDist
          ? "Precio Dist"
          : "Precio Promo",
        dataKey: "price",
      },
      { header: "Total", dataKey: "total" },
    ];
  }

  const { rows, totalConIva } = buildRows(data);
  const { total6, total12 } = computeMonthlyTotals(rows);

  // Si la tabla supera 6 filas, continuar en segunda página con SEC_BG_PATH
  const maxRowsFirstPage = 7;
  const firstRows = rows.slice(0, maxRowsFirstPage);
  const remainingRows = rows.slice(maxRowsFirstPage);

  // Opciones base para mantener estilo
  const tableBaseOptions = {
    head: [columns.map((c) => c.header)],
    columnStyles: { 0: { cellWidth: 90 } },
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
    // Primera página: máximo 6 filas
    autoTable(doc, {
      ...tableBaseOptions,
      body: firstRows.map((r) => columns.map((c) => r[c.dataKey])),
      startY,
      margin: { top: 0, bottom: 90, horizontal: 10 },
    });

    // Segunda página con fondo alternativo y continuación de la tabla
    doc.addPage();

    autoTable(doc, {
      ...tableBaseOptions,
      body: remainingRows.map((r) => columns.map((c) => r[c.dataKey])),
      startY,
      // Mantener el mismo offset en páginas siguientes de esta segunda tabla
      margin: { top: startY, bottom: 90, horizontal: 10 },
    });

    // Totales al final de la tabla en la ÚLTIMA hoja
    if (data.sumarTotales) {
      const rightTotalsX = pageWidth - 25;
      const rightLabelsX = pageWidth - 60;
      const lineGap = 7;
      const subtotal = totalConIva / 1.16;
      const iva = totalConIva - subtotal;

      // Ir a la última página por seguridad
      const lastPage = doc.internal.getNumberOfPages();
      doc.setPage(lastPage);

      // Posicionar debajo de la última tabla
      let finalY = (doc.lastAutoTable?.finalY || startY) + 10;

      // Si no cabe, agregar una nueva página y reubicar
      const needed = lineGap * 4.2; // altura aproximada del bloque
      if (finalY + needed > pageHeight - 20) {
        doc.addPage();
        finalY = startY; // usar mismo offset de tabla
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("SUBTOTAL", rightLabelsX, finalY + lineGap);
      doc.text("IVA", rightLabelsX, finalY + lineGap * 2);
      doc.setFontSize(14);
      doc.text("TOTAL", rightLabelsX, finalY + lineGap * 3.5);
      doc.setFontSize(10);
      doc.text("6 PAGOS", rightLabelsX - 100, finalY + lineGap * 3.6);
      doc.text("12 PAGOS", rightLabelsX - 55, finalY + lineGap * 3.6);

      doc.setFont("helvetica", "bold");
      doc.text(currencyFormatter(subtotal), rightTotalsX, finalY + lineGap, {
        align: "right",
      });
      doc.text(currencyFormatter(iva), rightTotalsX, finalY + lineGap * 2, {
        align: "right",
      });
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(
        currencyFormatter(totalConIva),
        rightTotalsX,
        finalY + lineGap * 3.5,
        { align: "right" }
      );
      doc.setFontSize(10);
      doc.text(
        currencyFormatter(total6),
        rightTotalsX - 100,
        finalY + lineGap * 3.6,
        {
          align: "right",
        }
      );
      doc.text(
        currencyFormatter(total12),
        rightTotalsX - 55,
        finalY + lineGap * 3.6,
        {
          align: "right",
        }
      );

      totalsEndY = finalY + lineGap * 3.6;
    }
  }

  // 4) Totales a la derecha (cuando no hubo segunda página ya se imprimieron arriba)
  if (rows.length <= maxRowsFirstPage && data.sumarTotales) {
    const finalY = 148;
    const rightTotalsX = pageWidth - 25;
    const rightLabelsX = pageWidth - 60;
    const lineGap = 7;

    const subtotal = totalConIva / 1.16;
    const iva = totalConIva - subtotal;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("SUBTOTAL", rightLabelsX, finalY + lineGap);
    doc.text("IVA", rightLabelsX, finalY + lineGap * 2);
    doc.setFontSize(14);
    doc.text("TOTAL", rightLabelsX, finalY + lineGap * 3.5);
    doc.setFontSize(10);
    doc.text("6 PAGOS", rightLabelsX - 100, finalY + lineGap * 3.6);
    doc.text("12 PAGOS", rightLabelsX - 55, finalY + lineGap * 3.6);

    doc.setFont("helvetica", "bold");
    doc.text(currencyFormatter(subtotal), rightTotalsX, finalY + lineGap, {
      align: "right",
    });
    doc.text(currencyFormatter(iva), rightTotalsX, finalY + lineGap * 2, {
      align: "right",
    });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(
      currencyFormatter(totalConIva),
      rightTotalsX,
      finalY + lineGap * 3.5,
      { align: "right" }
    );
    doc.setFontSize(10);
    doc.text(
      currencyFormatter(total6),
      rightTotalsX - 100,
      finalY + lineGap * 3.6,
      {
        align: "right",
      }
    );
    doc.text(
      currencyFormatter(total12),
      rightTotalsX - 55,
      finalY + lineGap * 3.6,
      {
        align: "right",
      }
    );

    totalsEndY = finalY + lineGap * 3.6;
  }

  // Notas adicionales, si aplican
  if (data.additional_notes) {
    const referenceY = totalsEndY || doc.lastAutoTable?.finalY || startY;
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
  pdf.save(`${data.sucursal}-${data.id} ${data.client_name}.pdf`);
};
