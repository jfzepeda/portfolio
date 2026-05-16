export const stageLabels = {
  nuevo: "Nuevo",
  segmentado: "Segmentado",
  cotizando: "Cotizando",
  convertido: "Coti Aprobada",
  agendado: "Agendado",
  seguimiento: "Seg. Programado",
  cerrado: "Cerrado",
};

export const formatPhoneNumber = (userId) => {
  if (!userId) return "";
  if (userId.length === 10) {
    return "T-" + userId;
  }
  const ultimos10 = userId.slice(-10);
  return `${ultimos10.slice(0, 3)} ${ultimos10.slice(3, 6)} ${ultimos10.slice(
    6
  )}`;
};

export const formatHiddenNumber = (userId) => {
  if (userId.length === 10) return "T-" + userId;
  const ultimos10 = userId.slice(-10);
  return `${ultimos10.slice(0, 3)} *** ${ultimos10.slice(6)}`;
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const dateOptions = { day: "2-digit", month: "2-digit", year: "2-digit" };
  const formattedDate = date.toLocaleDateString("es-ES", dateOptions);
  const timeOptions = { hour: "2-digit", minute: "2-digit" };
  const formattedTime = date.toLocaleTimeString("es-ES", timeOptions);
  return `${formattedTime} ${formattedDate.slice(0, 5)} `;
};

export const getConversationsByStage = (conversations, stage) => {
  return conversations
    .filter((c) => !stage || c.stage === stage)
    .sort((a, b) => {
      const dateA = new Date(a.lastmessage ? a.lastmessage.tsmp : 0);
      const dateB = new Date(b.lastmessage ? b.lastmessage.tsmp : 0);
      return dateB - dateA;
    });
};

export const formatTime = (dateString) => {
  const date = new Date(dateString);
  const timeOptions = { hour: "2-digit", minute: "2-digit" };
  return date.toLocaleTimeString("es-ES", timeOptions);
};
