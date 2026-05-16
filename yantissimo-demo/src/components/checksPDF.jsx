// checksPDF.jsx
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "~/lib/api";

// Esta función genera un PDF usando los datos del check de vehículo
// Los datos deben tener la siguiente estructura:
// {
//   radioState: { item1: 'OK' | 'Preventivo' | 'Cambio', ... },
//   noteState: { item1: 'nota...', ... },
//   tireRadioState: { tire1: 'OK' | 'Preventivo' | 'Cambio', ..., tire5: 'OK' | 'Preventivo' | 'Cambio' },
//   tireDataState: {
//      // Para llantas tire1 a tire4:
//      tire1_llegar: 'valor', tire1_entregar: 'valor', tire1_dot: 'valor', ...
//      // Para llanta tire5:
//      tire5_marca: 'valor', tire5_modelo: 'valor', tire5_medida: 'valor'
//   }
// }

const checksPDF = (data) => {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();

  // Encabezado
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Reporte de Revisión de Vehículo", pageWidth / 2, 15, {
    align: "center",
  });

  doc.setFontSize(10);
  const today = new Date();
  const formattedDate = today.toLocaleDateString();
  doc.text(`Fecha: ${formattedDate}`, pageWidth - 10, 15, { align: "right" });

  // Línea divisoria
  doc.line(10, 20, pageWidth - 10, 20);

  // -------------------------
  // 1. Sección: Revisión General
  // -------------------------
  let currentY = 30;
  doc.setFont("helvetica", "bold");
  doc.text("Revisión General", 10, currentY);

  const generalColumns = ["Elemento", "Estado", "Nota"];
  const generalRows = [];
  const labelMap = {
    item1: "ACEITE Y FILTRO DE MOTOR",
    item2: "ANTICONGELANTE",
    item3: "LÍQUIDO LIMPIABRIZAS",
    item4: "PLUMAS LIMPIABRIZAS",
    item5: "LÍQUIDO DE FRENOS",
    item6: "BASES DE AMORTIGUADOR",
    item7: "HULES DE REBOTE",
    item8: "AMORTIGUADORES DELANTEROS",
    item9: "AMORTIGUADORES TRASEROS",
    item10: "TERMINALES",
    item11: "RÓTULAS",
    item12: "BUES DE HORQUILLA",
    item13: "BUES DE TIRANTES",
    item14: "BIELETAS",
    item15: "TORNILLO ESTABILIZADOR",
    item16: "BARRA CENTRAL/CREMALLERA",
    item17: "HULES DE BARRA",
    item18: "CUBRE POLVO RUEDA DEL IZQ.",
    item19: "CUBRE POLVO RUEDA DEL DER.",
    item20: "PUNTA DE FLECHA HOMOCINÉTICA",
    item21: "BRAZO AUXILIAR",
    item22: "BRAZO PITMAN",
    item23: "SOPORTES DE MOTOR",
    item24: "BALERO RUEDA DELANTERA IZQ.",
    item25: "BALERO RUEDA DELANTERA DER.",
    item26: "BALERO RUEDA TRASERA IZQ.",
    item27: "BALERO RUEDA TRASERA DER.",
    item28: "BALATAS DELANTERAS",
    item29: "BALATAS TRASERAS",
    item30: "ALINEACIÓN",
  };

  Object.keys(data.radioState).forEach((key) => {
    generalRows.push([
      labelMap[key] || key,
      data.radioState[key],
      data.noteState[key] || "",
    ]);
  });

  currentY += 5;
  autoTable(doc, {
    head: [generalColumns],
    body: generalRows,
    startY: currentY,
    theme: "grid",
    headStyles: { fillColor: [255, 198, 0] },
    columnStyles: {
      0: { cellWidth: 70 }, // Ancho de la primera columna
      1: { cellWidth: 30 }, // Ancho de la segunda columna
      // La tercera columna no se define, se ajusta automáticamente
    },
  });

  const finalYGeneral = doc.lastAutoTable.finalY || currentY + 20;
  currentY = finalYGeneral + 10;

  // -------------------------
  // 2. Sección: Revisión de Llantas
  // -------------------------
  doc.setFont("helvetica", "bold");
  doc.text("Revisión de Llantas", 10, currentY);

  const tireColumns = ["Tire", "Estado", "Datos"];
  const tireRows = [];
  const tireLabelMap = {
    tire1: "DELANTERA IZQUIERDA",
    tire2: "DELANTERA DERECHA",
    tire3: "TRASERA IZQUIERDA",
    tire4: "TRASERA DERECHA",
  };
  Object.keys(data.tireRadioState)
    .filter((key) => key !== "tire5")
    .forEach((key) => {
      tireRows.push([
        tireLabelMap[key] || key,
        data.tireRadioState[key],
        `Presión al llegar: ${
          data.tireDataState[`${key}_llegar`] || ""
        }, DOT: ${data.tireDataState[`${key}_dot`] || ""}`,
      ]);
    });

  currentY += 5;
  autoTable(doc, {
    head: [tireColumns],
    body: tireRows,
    startY: currentY,
    theme: "grid",
    headStyles: { fillColor: [255, 198, 0] },
  });

  return doc;
};

export const downloadPDF = (data) => {
  const pdf = checksPDF(data);
  pdf.save("reporte_revision.pdf");
};

export const sendPDF = (data) => {
  const pdf = checksPDF(data);
  const dataURI = pdf.output("datauristring");

  // Función para convertir Data URI a Blob
  const dataURItoBlob = (dataURI) => {
    const byteString = atob(dataURI.split(",")[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], { type: "application/pdf" });
  };

  const pdfBlob = dataURItoBlob(dataURI);
  const formData = new FormData();
  // Se pueden ajustar los valores según se disponga
  formData.append("name", data.client_name || "Vehículo");
  formData.append("client_type", data.client_type || "");
  formData.append("pdf", pdfBlob, "reporte_revision.pdf");

  api(process.env.NEXT_PUBLIC_API_URL + "/send-client_type", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((result) => {
      console.log("Correo enviado:", result);
    })
    .catch((error) => {
      console.error("Error al enviar el correo:", error);
    });
};
