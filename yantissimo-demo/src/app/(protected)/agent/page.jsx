"use client";

import { Box, Typography } from "@mui/material";
import Header from "~/components/header";

export default function AgentPage() {
  return (
    <Box sx={{ padding: 0 }}>
      <Header title="Chats con clientes" />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          textAlign: "center",
          gap: 2,
          padding: 4,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Agent inbox — disponible solo en producción
        </Typography>
        <Typography variant="body1" sx={{ maxWidth: 560, color: "text.secondary" }}>
          Este módulo se conecta en vivo al gateway de WhatsApp y al agente AI
          vía Socket.io. En el demo público no se monta para evitar exponer
          conversaciones reales o consumir la API.
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 560 }}>
          En producción incluye Kanban con drag-and-drop por etapa del lead,
          chat embebido con composer multimedia, follow-ups programados,
          archivado con razón, filtros por sucursal/agente, y analytics.
        </Typography>
      </Box>
    </Box>
  );
}
