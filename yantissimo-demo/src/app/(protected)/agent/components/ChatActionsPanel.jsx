"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  Button,
  ListSubheader,
  Chip,
  CircularProgress,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import DriveFileMoveIcon from "@mui/icons-material/DriveFileMove";
import api from "~/lib/api";
import {
  deriveConversationState,
  LEAD_STAGES,
  KANBAN_STAGES,
  LEAD_STATES,
  STAGE_TRANSITIONS,
  FOLLOWUP_TEMPERATURES,
} from "../utils/stageConfig";

const ChatActionsPanel = ({ conversation, controls }) => {
  const router = useRouter();
  const [recentQuote, setRecentQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  useEffect(() => {
    if (!conversation?.user_id) return;
    const last10 = conversation.user_id.slice(-10);
    setRecentQuote(null);
    setQuoteLoading(true);
    api(`/api/quotes?sucursal=Todas&type=Todas&searchTerm=${last10}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setRecentQuote(data[0]);
        }
      })
      .catch(() => {})
      .finally(() => setQuoteLoading(false));
  }, [conversation?.user_id]);
  const {
    isSwitchOn,
    onStatusChange,
    onStageChange,
    onArchiveToggle,
    onSetFollowUp,
    onSetOpen,
    onSetClosed,
    onCreateCart,
  } = controls;

  const currentStage = conversation.stage;
  const currentState = deriveConversationState(conversation);
  const allowedTransitions = STAGE_TRANSITIONS[currentStage] || [];
  const stageReadOnly = currentState !== "open";

  return (
    <Box
      sx={{
        width: "33%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.default",
        borderLeft: "1px solid var(--app-border-subtle)",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 2,
          p: 1.5,
          backgroundColor: "background.muted",
          borderBottom: "1px solid",
          borderColor: "primary.main",
        }}
      >
        <Typography
          variant="body1"
          sx={{ fontWeight: 700 }}
          color="contrast.main"
        >
          Resumen
        </Typography>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 700 }}>
            Cotización reciente
          </Typography>
          {quoteLoading ? (
            <CircularProgress size={18} />
          ) : recentQuote ? (
            <Box sx={{}}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6">
                  <b>#</b>
                  {recentQuote.id}
                </Typography>
                <Button
                  color="primary"
                  variant="contained"
                  size="small"
                  onClick={() =>
                    router.push(`/cotizaciones/${recentQuote.id}/cotizacion`)
                  }
                  sx={{ mt: 0 }}
                >
                  <DriveFileMoveIcon />
                </Button>
              </Box>
              {recentQuote.start && (
                <Typography variant="caption" color="text.secondary">
                  {new Date(recentQuote.start).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </Typography>
              )}
              {recentQuote.seller_name && (
                <Typography variant="caption" color="text.secondary">
                  Vendedor: {recentQuote.seller_name}
                </Typography>
              )}
            </Box>
          ) : (
            <Typography variant="caption" color="text.secondary">
              Sin cotizaciones encontradas.
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 700 }}>
            Estado del Agente
          </Typography>
          <FormControlLabel
            label={isSwitchOn ? "Activo" : "Pausado"}
            labelPlacement="end"
            size="large"
            control={
              <Switch
                checked={isSwitchOn}
                color="primary"
                onChange={(event) => {
                  event.stopPropagation();
                  onStatusChange(event.target.checked);
                }}
              />
            }
          />
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 700 }}>
            Estado del lead
          </Typography>
          <Chip
            label={LEAD_STATES[currentState]?.label || currentState}
            size="small"
            sx={{
              width: "fit-content",
              backgroundColor:
                LEAD_STATES[currentState]?.color || "var(--app-status-archived)",
              color: "var(--app-text-inverse)",
              fontWeight: 600,
            }}
          />
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 700 }}>
            Etapa base
          </Typography>
          <Select
            value={currentStage}
            onChange={(e) => {
              e.stopPropagation();
              onStageChange(e.target.value);
            }}
            variant="standard"
            color="contrast"
            sx={{ minWidth: 200 }}
            disabled={stageReadOnly}
          >
            {/* Current stage (always shown) */}
            <MenuItem value={currentStage} disabled>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor:
                      LEAD_STAGES[currentStage]?.color || "var(--app-text-muted)",
                  }}
                />
                {LEAD_STAGES[currentStage]?.label || currentStage} (actual)
              </Box>
            </MenuItem>

            {/* Pipeline stages */}
            <ListSubheader>Siguientes etapas</ListSubheader>
            {KANBAN_STAGES.filter(
              (key) => key !== currentStage && allowedTransitions.includes(key)
            ).map((key) => (
              <MenuItem key={key} value={key}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      backgroundColor: LEAD_STAGES[key].color,
                    }}
                  />
                  {LEAD_STAGES[key].label}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </Box>

        {currentState === "follow_up" && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              p: 1.5,
              borderRadius: 2,
              backgroundColor: "var(--app-overlay-primary-soft)",
              border: "1px solid var(--app-primary-border)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarMonthIcon
                sx={{ fontSize: 18, color: "var(--app-status-scheduled)" }}
              />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Seguimiento Programado
              </Typography>
            </Box>
            {conversation.followup_date && (
              <Typography variant="body2" color="text.secondary">
                Fecha:{" "}
                {new Date(conversation.followup_date).toLocaleDateString(
                  "es-ES",
                  { day: "2-digit", month: "short", year: "numeric" }
                )}
              </Typography>
            )}
            {conversation.followup_temperature && (
              <Chip
                label={
                  FOLLOWUP_TEMPERATURES.find(
                    (t) => t.key === conversation.followup_temperature
                  )?.label || conversation.followup_temperature
                }
                size="small"
                sx={{
                  backgroundColor:
                    FOLLOWUP_TEMPERATURES.find(
                      (t) => t.key === conversation.followup_temperature
                    )?.color || "var(--app-text-muted)",
                  color: "var(--app-text-inverse)",
                  fontWeight: 600,
                  width: "fit-content",
                }}
              />
            )}
            {conversation.followup_previous_stage && (
              <Typography variant="caption" color="text.secondary">
                Etapa anterior:{" "}
                {LEAD_STAGES[conversation.followup_previous_stage]?.label ||
                  conversation.followup_previous_stage}
              </Typography>
            )}
          </Box>
        )}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 700 }}>
            Acciones del Chat
          </Typography>
          {currentState === "open" && (
            <>
              <Button variant="outlined" onClick={onSetFollowUp}>
                Programar seguimiento
                <CalendarMonthIcon />
              </Button>
              <Button variant="outlined" color="success" onClick={onSetClosed}>
                Marcar como cerrado
              </Button>
            </>
          )}
          {currentState === "follow_up" && (
            <Button variant="contained" color="success" onClick={onSetOpen}>
              Reactivar
            </Button>
          )}
          <Button
            variant="contained"
            color="contrast"
            onClick={onArchiveToggle}
          >
            {conversation.archived ? "Desarchivar chat" : "Archivar chat"}
            <DeleteOutlineIcon />
          </Button>
          <Button
            variant="contained"
            size="medium"
            color="primary"
            onClick={onCreateCart}
          >
            Link de pago
            <ShoppingCartIcon />
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatActionsPanel;
