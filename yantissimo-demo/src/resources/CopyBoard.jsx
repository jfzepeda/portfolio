"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  IconButton,
  Typography,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { ThemeProvider } from "@mui/material/styles";
import { useAppTheme } from "~/theme";

const initialState = {
  open: false,
  title: "",
  subtitle: "",
  content: "",
  language: "md",
};

export function CopyBoardProvider({ children }) {
  const theme = useAppTheme();
  const [state, setState] = useState(initialState);
  const [copied, setCopied] = useState(false);

  const openCopyBoard = useCallback((payload = {}) => {
    const {
      title = "",
      subtitle = "",
      content = "",
      language = "md",
    } = payload;

    setState({
      open: true,
      title,
      subtitle,
      content,
      language,
    });
  }, []);

  const closeCopyBoard = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
    setCopied(false);
  }, []);

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(state.content || "");
      setCopied(true);

      if (
        typeof window !== "undefined" &&
        typeof window.showToast === "function"
      ) {
        window.showToast("Contenido copiado al portapapeles", "success");
      }

      setTimeout(() => setCopied(false), 1800);
    } catch (error) {
      if (
        typeof window !== "undefined" &&
        typeof window.showToast === "function"
      ) {
        window.showToast("No se pudo copiar el contenido", "error");
      }

      console.error("copyboard clipboard error:", error);
    }
  }, [state.content]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const api = (payload) => openCopyBoard(payload);
    api.close = closeCopyBoard;

    window.copyboard = api;

    return () => {
      delete window.copyboard;
    };
  }, [openCopyBoard, closeCopyBoard]);

  useEffect(() => {
    if (!state.open) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeCopyBoard();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [state.open, closeCopyBoard]);

  return (
    <ThemeProvider theme={theme}>
      {children}

      <Dialog
        open={state.open}
        onClose={closeCopyBoard}
        fullWidth
        maxWidth={false}
        PaperProps={{
          sx: {
            width: "100%",
            maxWidth: "820px",
            maxHeight: "85vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderRadius: "14px",
            border: "1px solid #e5e7eb",
            backgroundColor: "#ffffff",
            color: "#111827",
            boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
            margin: 0,
          },
        }}
        BackdropProps={{
          sx: {
            backgroundColor: "rgba(0,0,0,0.25)",
          },
        }}
        sx={{
          "& .MuiDialog-container": {
            padding: "20px",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            padding: "16px 20px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <Box>
            <Typography
              variant="h5"
              sx={{
                margin: 0,
                color: "#111827",
              }}
            >
              {state.title}
            </Typography>

            <Typography
              variant="subtitle1"
              sx={{
                margin: "6px 0 0",
                color: "#8b949e",
              }}
            >
              {state.subtitle}
            </Typography>
          </Box>

          <IconButton
            onClick={closeCopyBoard}
            aria-label="Cerrar"
            sx={{
              color: "#6b7280",
              padding: 0,
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <DialogContent
          sx={{
            padding: "16px 20px",
            overflow: "auto",
            backgroundColor: "#ffffff",
            "&.MuiDialogContent-root": {
              paddingTop: "16px",
            },
          }}
        >
          <Box
            component="pre"
            sx={{
              margin: 0,
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              backgroundColor: "#f9fafb",
              color: "#111827",
              fontSize: "14px",
              lineHeight: 1.6,
              overflowX: "auto",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box component="code" sx={{ flex: 1 }}>
              {state.content}
            </Box>

            <IconButton
              onClick={copyToClipboard}
              color="contrast"
              sx={{
                alignSelf: "flex-start",
              }}
            >
              {copied ? <CheckIcon /> : <ContentCopyIcon />}
            </IconButton>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            padding: "16px 20px",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "flex-end",
            backgroundColor: "#ffffff",
          }}
        >
          <Button
            onClick={closeCopyBoard}
            variant="contained"
            color="primary"
            // sx={{
            //   border: "1px solid #d1d5db",
            //   backgroundColor: "#f9fafb",
            //   color: "#111827",
            //   borderRadius: "8px",
            //   padding: "10px 14px",
            //   fontWeight: 600,
            //   textTransform: "none",
            //   "&:hover": {
            //     borderColor: "#9ca3af",
            //     backgroundColor: "#f3f4f6",
            //   },
            // }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
