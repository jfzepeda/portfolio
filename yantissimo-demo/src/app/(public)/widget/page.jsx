"use client";
import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { Box, Typography, Divider, TextField, Button } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import CloseIcon from "@mui/icons-material/Close";
import Markdown from "markdown-to-jsx";
import Image from "next/image";
import api from "~/lib/api";

const urlAPI = process.env.NEXT_PUBLIC_API_URL;
const AGENT_URL = process.env.NEXT_PUBLIC_AGENT_URL;
const BUCKET_NAME = "Images-yssm";
// const urla = 'https://yssm-ai-agent-production.up.railway.app/'; // URL del socket server

const defaultMessages = [
  {
    message: {
      type: "ai",
      content:
        "¡Hola! Soy Yancarlo, el asistente virtual de Yantissimo. Estoy para cotizaciones, agendar citas o resolver cualquiera de tus dudas. ¿En qué te puedo ayudar hoy? 😊",
    },
    created_at: new Date().toISOString(),
  },
];

const Widget = () => {
  // Generar un ID random de 6 dígitos para el socket (solo en el cliente)
  const [userId, setUserId] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return; // evita ejecutar en SSR/prerender
    try {
      const saved = window.localStorage.getItem("chat_user_id");
      if (saved) {
        setUserId(saved);
      } else {
        const id = Math.floor(Math.random() * 1e6)
          .toString()
          .padStart(6, "0");
        window.localStorage.setItem("chat_user_id", id);
        setUserId(id);
      }
    } catch {
      // Si localStorage no está disponible, genera un id volátil
      const id = Math.floor(Math.random() * 1e6)
        .toString()
        .padStart(6, "0");
      setUserId(id);
    }
  }, []);

  const [messages, setMessages] = useState(defaultMessages);
  const [writedMessage, setWritedMessage] = useState("");
  const socketRef = useRef(null);
  const messagesContainerRef = useRef(null); // Ref for the messages container
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  // -------------------------------------------------
  // Conexión a Socket.IO
  // -------------------------------------------------
  useEffect(() => {
    // Esperar a tener userId para unirse a la sala correcta
    if (!userId) return;

    // Crea una única conexión durable
    socketRef.current = io(AGENT_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 20000,
    });

    socketRef.current.on("connect", () => {
      console.log("Socket conectado:", socketRef.current.id, userId);
      socketRef.current.emit("joinRoom", userId);
    });
    socketRef.current.on("disconnect", (reason) =>
      console.warn("⨯ Socket desconectado:", reason)
    );
    socketRef.current.on("reconnect_attempt", (attempt) =>
      console.warn("↻ Reintentando conexión, intento", attempt)
    );
    socketRef.current.on("reconnect", (attempt) =>
      console.log("✅ Reconectado en el intento", attempt)
    );

    socketRef.current.on("messageProcessed", ({ ok }) => console.log("⚡", ok));
    socketRef.current.on("messageError", ({ error }) =>
      console.error("❌", error)
    );

    socketRef.current.on("newMessage", (data) => {
      console.log("Nuevo mensaje socket:", data);
      setMessages((prev) => [
        ...prev,
        {
          message: {
            type: data.type,
            content: data.content,
            media: data.media,
            caption: data.caption,
          },
          created_at: data.timestamp || new Date().toISOString(),
        },
      ]);
      setTimeout(scrollToBottom, 100);
    });

    // Limpieza al desmontar o al cambiar userId
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [userId]);

  // ------------------------------------------------------------------------------
  // Funciones para manejar la selección de conversaciones y el envío de mensajes
  // ------------------------------------------------------------------------------

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    // fecha en formato dd/mm
    const dateOptions = { day: "2-digit", month: "2-digit", year: "2-digit" };
    const formattedDate = date.toLocaleDateString("es-ES", dateOptions);
    const timeOptions = { hour: "2-digit", minute: "2-digit" };
    const formattedTime = date.toLocaleTimeString("es-ES", timeOptions);
    return `${formattedTime} ${formattedDate.slice(0, 5)} `;
  };

  const sendMessage = (message) => {
    if (!userId) return; // aún no inicializado en cliente
    const payload = {
      user_id: userId,
      messageText: message,
    };

    // Primero, añadamos el mensaje del usuario a la lista localmente
    const userMessage = {
      message: {
        type: "human",
        content: message,
      },
      created_at: new Date().toISOString(),
    };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setWritedMessage(""); // Limpiar el campo de texto después de enviarlo
    setTimeout(scrollToBottom, 100);
    if (socketRef.current) {
      socketRef.current.emit("receiveMessage", payload);
    } else {
      console.error("Socket no está conectado");
    }
  };

  const sendImage = (imageurlAPI) => {
    if (!userId) return; // aún no inicializado en cliente
    const payload = {
      user_id: userId,
      imageUrl: imageurlAPI,
      caption: writedMessage,
    };

    // Primero, añadamos el mensaje del usuario a la lista localmente
    const image = {
      message: {
        type: "ai",
        content: imageurlAPI,
        media: "image",
        caption: writedMessage,
      },
      created_at: new Date().toISOString(),
    };
    // const caption = {
    //   message: {
    //     type: 'ai',
    //     content: writedMessage
    //   },
    //   created_at: new Date().toISOString(),
    // };
    setMessages((prevMessages) => [...prevMessages, image]);
    setWritedMessage(""); // Limpiar el campo de texto después de enviarlo
    setTimeout(scrollToBottom, 100);

    fetch(`${AGENT_URL}/sendMedia`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Error de servidor: ${response.status} ${response.statusText}`
          );
        }
        return response.text(); // Primero obtenemos el texto de la respuesta
      })
      .then((text) => {
        // Intentamos analizar el texto como JSON, capturando errores
        try {
          // const data = JSON.parse(text);
          // Añadimos la respuesta del agente a la lista de mensajes
          // setMessages(prevMessages => [...prevMessages, data]);
        } catch (parseError) {
          console.error("Error analizando la respuesta JSON:", parseError);
          console.log("Texto de respuesta recibido:", text);
          // Mostrar error al usuario
          window.showToast(
            "Error: La respuesta del servidor no tiene el formato esperado"
          );
        }
      })
      .catch((error) => {
        console.error("Error enviando imagen:", error);
        window.showToast(`Error al enviar imagen: ${error.message}`);
      });
  };

  async function geturlAPI() {
    try {
      // Peticion GET al backend
      const response = await api(`${urlAPI}/get/backblazeUrlAPI`);
      if (!response.ok) {
        throw new Error("Error al obtener urlAPI para subir imagenes");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error al obtener uploadurlAPI", error);
    }
  }

  const uploadMedia = async (media) => {
    try {
      // Regenerar la urlAPI justo antes de cada subida
      const timestamp = Date.now(); // Añadir un timestamp para evitar colisiones
      const uniqueFileName = `whatsapp-${userId}_${timestamp}`;

      const uploadurlAPIResponse = await geturlAPI();
      console.log("Respuesta completa del servidor:", uploadurlAPIResponse);

      const { uploadurlAPI, authorizationToken } = uploadurlAPIResponse;

      // Intentar la subida con headers exactos según la documentación de B2
      const response = await api(uploadurlAPI, {
        method: "POST",
        headers: {
          Authorization: authorizationToken,
          "X-Bz-File-Name": encodeURIComponent(uniqueFileName),
          "Content-Type": media.type || "application/octet-stream",
          "X-Bz-Content-Sha1": "do_not_verify",
          // No añadir headers extras que no sean requeridos por B2
        },
        body: media,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Detalles completos del error:", {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
          body: errorText,
        });
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      // Obtener la respuesta para usar el fileId devuelto por B2
      const responseData = await response.json();
      console.log("Respuesta exitosa de B2:", responseData);

      // Usar la urlAPI devuelta por B2 o construirla según tu configuración
      const imageurlAPI = `https://f004.backblazeb2.com/file/${BUCKET_NAME}/${encodeURIComponent(
        uniqueFileName
      )}`;
      sendImage(imageurlAPI);
    } catch (error) {
      console.error("Error completo:", error);
      window.showToast("Error al subir imagen: " + error.message, "error");
    }
  };

  // ------------------------------
  // Function to scroll to bottom
  // ------------------------------
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const scrollHeight = messagesContainerRef.current.scrollHeight;
      messagesContainerRef.current.scrollTop = scrollHeight;
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages]);

  return (
    <Box sx={{ padding: 0 }}>
      <Box
        sx={{
          borderRadius: 2,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#fcfcfc",
          width: "25rem",
          height: "40rem",
          boxShadow: 1,
        }}
      >
        {/* Encabezado del chat */}
        <Box sx={{ position: "sticky", top: 0, zIndex: 1, p: 2 }}>
          <Typography variant="h6" gutterBottom color="contrast.main">
            Hola, Soy Yancarlo!
          </Typography>
          <Divider sx={{ my: 1, borderColor: "contrast.main" }} />
        </Box>

        {/* Área de mensajes */}
        <Box
          ref={messagesContainerRef}
          sx={{ flex: 1, overflowY: "auto", p: 2, scrollBehavior: "smooth" }}
        >
          {messages.length > 0 ? (
            messages.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  mb: 1,
                  backgroundColor:
                    msg.message.type === "ai" ? "#FFC60056" : "#f3f3f3",
                  padding: 2,
                  borderRadius: 2,
                  boxShadow: 1,
                  maxWidth: "80%",
                  width: "fit-content",
                  marginRight: msg.message.type === "ai" ? "auto" : 0,
                  marginLeft: msg.message.type === "ai" ? 0 : "auto",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {msg.message.media === "image" ? (
                  <>
                    <Image
                      src={msg.message.content}
                      alt="Imagen"
                      width={300}
                      height={300}
                      style={{
                        width: "30vh",
                        height: "auto",
                        borderRadius: 8,
                        marginBottom: 8,
                      }}
                    />
                    <Typography variant="body1">
                      {msg.message.caption}
                    </Typography>
                  </>
                ) : (
                  <Markdown
                    options={{
                      forceBlock: true,
                      overrides: {
                        p: {
                          component: Typography,
                          props: {
                            variant: "body1",
                            sx: { whiteSpace: "pre-wrap", m: 0 },
                          },
                        },
                      },
                    }}
                  >
                    {msg.message.content}
                  </Markdown>
                )}
                <Typography variant="body2" sx={{ alignSelf: "end" }}>
                  {formatDate(msg.created_at)}
                </Typography>
              </Box>
            ))
          ) : (
            <Typography variant="body1">En que puedo ayudarte?</Typography>
          )}
        </Box>

        {/* Cuadro de texto para escribir nuevo mensaje */}
        <Box
          sx={{
            borderTop: "1px solid #ccc",
            p: 2,
            display: "flex",
            flexDirection: "column",
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
                onClick={() => {
                  setPreview(null);
                  setMedia(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ""; // Esta es la línea clave que resetea el input
                  }
                }}
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
              onChange={(e) => setWritedMessage(e.target.value)}
              onKeyUp={(e) => {
                if (e.key === "Enter") {
                  if (media) {
                    uploadMedia(media);
                    setMedia(null);
                    setPreview(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ""; // Resetear el input después de subir
                    }
                  } else if (writedMessage) {
                    sendMessage(writedMessage);
                  }
                }
              }}
              sx={{ mb: 1 }}
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files[0];
                setMedia(file);
                if (file && file.type.startsWith("image/")) {
                  setPreview(URL.createObjectURL(file));
                } else {
                  setPreview(null);
                }
              }}
              style={{ display: "none" }}
              id="upload-media-input"
            />
            <Button
              variant="text"
              onClick={() =>
                document.getElementById("upload-media-input").click()
              }
              sx={{ ml: 1, fontSize: 20, height: 40 }}
            >
              <AttachFileIcon />
            </Button>
            <Button
              variant="contained"
              color="primary"
              sx={{ ml: 1, fontSize: 20, height: 40, width: 40 }}
              onClick={() => {
                if (media) {
                  uploadMedia(media);
                  setMedia(null);
                  setPreview(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ""; // Resetear el input después de subir
                  }
                } else if (writedMessage) {
                  sendMessage(writedMessage);
                }
              }}
            >
              <SendIcon />
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Widget;
