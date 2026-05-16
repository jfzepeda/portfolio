"use client";

import { useState, useEffect } from "react";
import { Box, Typography, TextField, Button, IconButton } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import Markdown from "markdown-to-jsx";
import Image from "next/image";
import UnoptimizedImage from "~/resources/UnoptimizedImage";
import { post } from "~/lib/api";
import {
  formatTime,
  formatDate,
  formatPhoneNumber,
  formatHiddenNumber,
} from "../utils/formatters";

const ChatConversationPanel = ({ conversation, chat }) => {
  const [phoneVisible, setPhoneVisible] = useState(false);

  useEffect(() => {
    setPhoneVisible(false);
  }, [conversation?.user_id]);

  const handleRevealPhone = async () => {
    setPhoneVisible(true);
    try {
      await post("/api/conversations/taken-out", {
        user_id: conversation.user_id,
      });
    } catch (e) {
      console.error("Error registering phone view", e);
    }
  };
  const {
    messages,
    messagesContainerRef,
    preview,
    media,
    writedMessage,
    onMessageChange,
    onFileChange,
    onClearMedia,
    onSend,
    fileInputRef,
  } = chat;

  const handleSend = () => {
    if (media) {
      onSend({ withMedia: true });
      return;
    }
    if (writedMessage) {
      onSend({ withMedia: false });
    }
  };

  return (
    <Box
      sx={{
        width: "67%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.default",
        borderRight: "1px solid var(--app-border-subtle)",
        overflow: "hidden",
      }}
    >
      {conversation && (
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography
              variant="body1"
              sx={{ fontWeight: 700 }}
              color="contrast.main"
            >
              Conversacion con{" "}
              {phoneVisible
                ? formatPhoneNumber(conversation.user_id)
                : formatHiddenNumber(conversation.user_id)}
            </Typography>
            <IconButton
              size="small"
              onClick={
                phoneVisible ? () => setPhoneVisible(false) : handleRevealPhone
              }
              sx={{ color: "contrast.main" }}
            >
              {phoneVisible ? (
                <VisibilityOffIcon fontSize="small" />
              ) : (
                <VisibilityIcon fontSize="small" />
              )}
            </IconButton>
          </Box>
        </Box>
      )}

      <Box
        ref={messagesContainerRef}
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
          scrollBehavior: "smooth",
          backgroundColor: "background.default",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        {conversation && messages.length > 0
          ? messages.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  backgroundColor:
                    msg.message.type === "human"
                      ? "background.paper"
                      : "var(--app-overlay-primary-soft)",
                  border: "1px solid var(--app-border-subtle)",
                  borderLeft:
                    msg.message.type === "human"
                      ? "1px solid var(--app-border-subtle)"
                      : msg.message.type === "ai"
                      ? "1px solid var(--app-status-scheduled)"
                      : "3px solid var(--app-success-main)",
                  padding: msg.message.media === "image" ? 0 : 2,
                  borderRadius: 3,
                  boxShadow: 0.5,
                  maxWidth: "75%",
                  width: "fit-content",
                  marginLeft: msg.message.type === "human" ? 0 : "auto",
                  marginRight: msg.message.type === "human" ? "auto" : 0,
                  display: "flex",
                  flexDirection: "column",
                  // gap: 0.5,
                }}
              >
                {msg.message.media === "image" ? (
                  <>
                    <Box
                      sx={{
                        position: "relative",
                        width: 300,
                        height: 400,
                      }}
                    >
                      <UnoptimizedImage
                        src={msg.message.content}
                        alt="Imagen"
                        width={300}
                        height={400}
                        style={{
                          width: 300,
                          height: 400,
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                      {/* Triángulo degradado (30-60-90) en la esquina inferior derecha */}
                      <Box
                        sx={{
                          position: "absolute",
                          right: 0,
                          bottom: 0,
                          width: 90, // Un poco más pequeño para que no invada toda la imagen
                          height: 40,
                          borderBottomRightRadius: 8,
                          // Eliminamos el clipPath para evitar bordes duros y feos
                          background: `linear-gradient(
                            to top left,
                            var(--app-overlay-scrim) 0%,
                            var(--app-overlay-medium) 25%,
                            transparent 50%
                          )`,
                          pointerEvents: "none",
                        }}
                      />

                      <Typography
                        variant="body2"
                        sx={{
                          position: "absolute",
                          right: 8,
                          bottom: 6,
                          fontSize: 11,
                          color: "var(--app-text-inverse)",
                          fontWeight: 500,
                          lineHeight: 1.2,
                          textShadow: "0 1px 3px var(--app-overlay-scrim)",
                          pointerEvents: "none",
                          zIndex: 1,
                        }}
                      >
                        {formatTime(msg.created_at)}
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {msg.message.caption}
                    </Typography>
                  </>
                ) : msg.message.media === "document" ? (
                  <Box
                    sx={{
                      p: 2,
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.5,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2" sx={{ fontSize: 20 }}>
                        📄
                      </Typography>
                      <Typography
                        component="a"
                        href={msg.message.content}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: "primary.main",
                          wordBreak: "break-all",
                        }}
                      >
                        {msg.message.filename || "documento.pdf"}
                      </Typography>
                    </Box>
                    {msg.message.caption && (
                      <Typography variant="body2" color="text.secondary">
                        {msg.message.caption}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Markdown
                    options={{
                      forceBlock: true,
                      overrides: {
                        p: {
                          component: Typography,
                          props: {
                            variant: "body1",
                            sx: {
                              whiteSpace: "pre-wrap",
                              m: 0,
                              fontSize: 14,
                            },
                          },
                        },
                      },
                    }}
                  >
                    {msg.message.content}
                  </Markdown>
                )}
                {msg.message.media === "image" ||
                msg.message.media === "document" ? null : (
                  <Typography
                    variant="body2"
                    sx={{
                      alignSelf: "end",
                      pr: 0,
                      py: 0,
                      fontSize: 11,
                      color: "text.secondary",
                    }}
                  >
                    {formatDate(msg.created_at)}
                  </Typography>
                )}
              </Box>
            ))
          : conversation && (
              <Typography variant="body1">
                No hay mensajes en esta conversación.
              </Typography>
            )}
      </Box>

      <Box
        sx={{
          borderTop: "1px solid var(--app-border-subtle)",
          p: 1.5,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "background.paper",
        }}
      >
        {preview && (
          <Box sx={{ display: "flex", justifyContent: "start", mb: 1 }}>
            <Image
              src={preview}
              alt="Preview"
              width={300}
              height={150}
              style={{
                maxWidth: "100%",
                maxHeight: "150px",
                width: "auto",
                height: "auto",
                borderRadius: 8,
              }}
            />
            <Button
              variant="text"
              onClick={onClearMedia}
              sx={{ ml: 1, fontSize: 20, height: 40 }}
            >
              <CloseIcon />
            </Button>
          </Box>
        )}

        <Box sx={{ display: "flex", flexDirection: "row" }}>
          <TextField
            fullWidth
            placeholder="Escribir..."
            variant="outlined"
            size="small"
            value={writedMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                handleSend();
              }
            }}
            sx={{
              mb: 0,
              "& .MuiOutlinedInput-root": {
                borderRadius: 999,
                backgroundColor: "background.muted",
                "& fieldset": { border: "none" },
              },
            }}
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => onFileChange(e.target.files?.[0])}
            style={{ display: "none" }}
          />
          <Button
            variant="text"
            onClick={() => fileInputRef.current?.click()}
            sx={{ ml: 1, fontSize: 20, height: 40 }}
          >
            <AttachFileIcon />
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{
              ml: 1,
              fontSize: 20,
              height: 40,
              width: 40,
              minWidth: 40,
              borderRadius: "50%",
            }}
            onClick={handleSend}
          >
            <SendIcon />
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatConversationPanel;
