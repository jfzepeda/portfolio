"use client";
import {
  Box,
  Typography,
  ListItemText,
  ListItemButton,
  Badge,
} from "@mui/material";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import HandymanIcon from "@mui/icons-material/Handyman";
import ReportIcon from "@mui/icons-material/Report";
import WarningIcon from "@mui/icons-material/Warning";
import Image from "next/image";
import { FOLLOWUP_TEMPERATURES } from "../utils/stageConfig";
import { formatHiddenNumber } from "../utils/formatters";

const unreadBackground = "var(--app-primary-soft)";
const STAGNATION_HOURS = 48;

const isStagnant = (stageChangedAt) => {
  if (!stageChangedAt) return false;
  const diff = Date.now() - new Date(stageChangedAt).getTime();
  return diff > STAGNATION_HOURS * 60 * 60 * 1000;
};

const minutesElapsed = (isoString) => {
  const diff = Date.now() - new Date(isoString).getTime();
  return Math.floor(diff / 1000 / 60);
};

const DraggableListItem = ({
  conversation,
  isSelected,
  onClick,
  onDragStart,
  onDragEnd,
  isBeingDragged,
  isDraggable = true,
}) => {
  const stagnant = isStagnant(conversation.stage_changed_at);
  const isSeguimiento =
    conversation.state === "follow_up" || conversation.stage === "seguimiento";
  const isCotizandoServicio = conversation.is_service;
  const isStatusOn =
    conversation.status === true || conversation.status === "true";
  const isStatusOff =
    conversation.status === false || conversation.status === "false";
  const elapsedMinutes = conversation.lastmessage?.tsmp
    ? minutesElapsed(conversation.lastmessage.tsmp)
    : 0;
  const tempInfo = isSeguimiento
    ? FOLLOWUP_TEMPERATURES.find(
        (t) => t.key === conversation.followup_temperature
      )
    : null;

  const sxStyles = {
    backgroundColor:
      // minutesElapsed(conversation.lastmessage.tsmp) > 60
      // ? urgentBackground :
      conversation.hasnewmessage ? unreadBackground : "transparent",
    opacity: isBeingDragged ? 0.4 : 1,
    transition: "all 0.2s ease",
    cursor: isDraggable ? "grab" : "default",
    "&:active": { cursor: isDraggable ? "grabbing" : "default" },
    "&:hover": {
      backgroundColor: conversation.hasnewmessage
        ? unreadBackground
        : "var(--app-overlay-primary-soft)",
    },
    borderLeft: stagnant
      ? "3px solid var(--app-warning-main)"
      : isSelected
      ? "3px solid var(--app-status-scheduled)"
      : "3px solid transparent",
    borderBottom: "1px solid var(--app-primary-border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: "70px",
    borderRadius: 0,
    px: 1.5,
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const timeOptions = { hour: "2-digit", minute: "2-digit" };
    return date.toLocaleTimeString("es-ES", timeOptions);
  };

  return (
    <ListItemButton
      onClick={(e) => onClick(e, conversation)}
      draggable={isDraggable}
      onDragStart={
        isDraggable && onDragStart
          ? (e) => onDragStart(e, conversation)
          : undefined
      }
      onDragEnd={isDraggable ? onDragEnd : undefined}
      sx={sxStyles}
    >
      <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: "top", horizontal: "left" }}
          color="error"
          badgeContent={
            conversation.hasnewmessage ? conversation.unreadCount ?? 1 : 0
          }
          sx={{
            mr: 2,
            "& .MuiBadge-badge": { fontSize: 10, height: 18, minWidth: 18 },
          }}
        >
          <Box
            sx={{
              position: "relative",
              width: 36,
              height: 36,
              borderRadius: "50%",
              backgroundColor: "var(--app-neutral-200)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isStatusOn ? (
              <SmartToyIcon
                sx={{
                  width: "80%",
                  height: "80%",
                  color: "var(--app-status-scheduled)",
                }}
              />
            ) : (
              <AccountCircleIcon
                sx={{
                  width: "110%",
                  height: "110%",
                  color: isStatusOff
                    ? "var(--app-warning-main)"
                    : "var(--app-neutral-400)",
                }}
              />
            )}
            <Box
              sx={{
                position: "absolute",
                bottom: -4,
                right: -2,
                width: 16,
                height: 16,
              }}
            >
              <Image
                src="/whatsapp_logo.png"
                alt="WhatsApp"
                width={18}
                height={18}
              />
            </Box>
          </Box>
        </Badge>

        <Box sx={{ flex: 1, overflow: "hidden" }}>
          <ListItemText
            primary={
              <Typography
                variant="body1"
                sx={{ fontWeight: 600, fontSize: 14, color: "text.primary" }}
                noWrap
              >
                {conversation.nombre ||
                  formatHiddenNumber(conversation.user_id)}
              </Typography>
            }
            secondary={
              <Typography
                variant="body2"
                sx={{ fontSize: 12, color: "text.secondary" }}
                noWrap
              >
                {conversation.lastmessage ? conversation.lastmessage.msg : ""}
              </Typography>
            }
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            ml: 1,
            minWidth: 48,
            gap: 0.3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {conversation.state === "open" && elapsedMinutes >= 60 && (
              <ReportIcon sx={{ fontSize: 20, color: "var(--app-error-main)" }} />
            )}
            {conversation.state === "open" &&
              elapsedMinutes >= 30 &&
              elapsedMinutes < 60 && (
                <WarningIcon
                  sx={{ fontSize: 20, color: "var(--app-warning-main)" }}
                />
              )}
            {isSeguimiento && (
              <CalendarMonthIcon
                sx={{
                  fontSize: 20,
                  color: tempInfo?.color || "var(--app-status-scheduled)",
                }}
              />
            )}
            {isCotizandoServicio && (
              <HandymanIcon
                sx={{ fontSize: 20, color: "var(--app-status-scheduled)" }}
              />
            )}
          </Box>
          {conversation.lastmessage && (
            <Typography variant="body2" sx={{ color: "text.secondary", fontSize: 11 }}>
              {formatDate(conversation.lastmessage.tsmp)}
            </Typography>
          )}
          {conversation.sucursal && (
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                fontSize: 10,
                textTransform: "uppercase",
              }}
            >
              {conversation.sucursal}
            </Typography>
          )}
        </Box>
      </Box>
    </ListItemButton>
  );
};

export default DraggableListItem;
