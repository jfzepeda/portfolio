import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import api, { post } from "~/lib/api";
import { uploadFileToBackblaze } from "~/lib/backblazeUpload";

const AGENT_URL = process.env.NEXT_PUBLIC_AGENT_URL;

const buildMessageKey = ({
  type,
  content,
  media,
  caption,
  senderId,
  fallbackSender,
}) =>
  [
    senderId || fallbackSender || "",
    type || "",
    content || "",
    media || "",
    caption || "",
  ].join("::");

export const useAgentMessages = ({
  selectedConversation,
  setConversations,
  userProfile,
}) => {
  const [messages, setMessages] = useState([]);
  const [writedMessage, setWritedMessage] = useState("");
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState(null);

  const socketRef = useRef(null);
  const pendingOutgoingRef = useRef(new Map());
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  const addPendingOutgoing = (key) => {
    const current = pendingOutgoingRef.current.get(key) || 0;
    pendingOutgoingRef.current.set(key, current + 1);
  };

  const consumePendingOutgoing = (key) => {
    const current = pendingOutgoingRef.current.get(key) || 0;
    if (current <= 0) return false;
    if (current === 1) {
      pendingOutgoingRef.current.delete(key);
    } else {
      pendingOutgoingRef.current.set(key, current - 1);
    }
    return true;
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const scrollHeight = messagesContainerRef.current.scrollHeight;
      messagesContainerRef.current.scrollTop = scrollHeight;
    }
  };

  const sendMessage = (message) => {
    if (!selectedConversation) return;

    const outgoingKey = buildMessageKey({
      senderId: selectedConversation.user_id,
      type: "ai",
      content: message,
    });

    const payload = {
      user_id: selectedConversation.user_id,
      message,
      seller_id: userProfile?.seller_id || null,
    };

    addPendingOutgoing(outgoingKey);
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        message: {
          type: "ai",
          content: message,
        },
        created_at: new Date().toISOString(),
      },
    ]);
    setWritedMessage("");
    setTimeout(scrollToBottom, 100);

    post("/api/messages/sendMessage", payload)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Error de servidor: ${response.status} ${response.statusText}`
          );
        }
        return response.text();
      })
      .then((text) => {
        try {
          JSON.parse(text);
        } catch (parseError) {
          console.error("Error analizando la respuesta JSON:", parseError);
          console.log("Texto de respuesta recibido:", text);
          window.showToast(
            "Error: La respuesta del servidor no tiene el formato esperado"
          );
        }
      })
      .catch((error) => {
        consumePendingOutgoing(outgoingKey);
        console.error("Error enviando mensaje:", error);
        window.showToast(`Error al enviar mensaje: ${error.message}`);
      });
  };

  const sendImage = (imageUrl, caption) => {
    if (!selectedConversation) return;

    const outgoingKey = buildMessageKey({
      senderId: selectedConversation.user_id,
      type: "ai",
      content: imageUrl,
      media: "image",
      caption,
    });

    const payload = {
      user_id: selectedConversation.user_id,
      imageUrl,
      caption,
      seller_id: userProfile?.seller_id || null,
    };

    addPendingOutgoing(outgoingKey);
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        message: {
          type: "ai",
          content: imageUrl,
          media: "image",
          caption,
        },
        created_at: new Date().toISOString(),
      },
    ]);
    setWritedMessage("");
    setTimeout(scrollToBottom, 100);

    post("/api/messages/sendMedia", payload)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Error de servidor: ${response.status} ${response.statusText}`
          );
        }
        return response.text();
      })
      .then((text) => {
        try {
          JSON.parse(text);
        } catch (parseError) {
          console.error("Error analizando la respuesta JSON:", parseError);
          console.log("Texto de respuesta recibido:", text);
          window.showToast(
            "Error: La respuesta del servidor no tiene el formato esperado"
          );
        }
      })
      .catch((error) => {
        consumePendingOutgoing(outgoingKey);
        console.error("Error enviando imagen:", error);
        window.showToast(`Error al enviar imagen: ${error.message}`);
      });
  };

  const sendDocument = (mediaUrl, fileName, caption) => {
    if (!selectedConversation) return;

    const outgoingKey = buildMessageKey({
      senderId: selectedConversation.user_id,
      type: "ai",
      content: mediaUrl,
      media: "document",
      caption,
    });

    const payload = {
      user_id: selectedConversation.user_id,
      mediaUrl,
      mediaType: "pdf",
      fileName,
      caption,
      seller_code: userProfile?.seller_code || null,
    };

    addPendingOutgoing(outgoingKey);
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        message: {
          type: "ai",
          content: mediaUrl,
          media: "document",
          caption,
          filename: fileName,
        },
        created_at: new Date().toISOString(),
      },
    ]);
    setWritedMessage("");
    setTimeout(scrollToBottom, 100);

    post("/api/messages/sendMedia", payload)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Error de servidor: ${response.status} ${response.statusText}`
          );
        }
        return response.text();
      })
      .then((text) => {
        try {
          JSON.parse(text);
        } catch (parseError) {
          console.error("Error analizando la respuesta JSON:", parseError);
          console.log("Texto de respuesta recibido:", text);
          window.showToast(
            "Error: La respuesta del servidor no tiene el formato esperado"
          );
        }
      })
      .catch((error) => {
        consumePendingOutgoing(outgoingKey);
        console.error("Error enviando documento:", error);
        window.showToast(`Error al enviar documento: ${error.message}`);
      });
  };

  const uploadMedia = async (file, caption) => {
    if (!selectedConversation) return;

    const isPdf = file.type === "application/pdf";
    const ext = isPdf ? ".pdf" : file.type.startsWith("image/") ? "." + file.type.split("/")[1] : "";

    try {
      const timestamp = Date.now();
      const uniqueFileName = `whatsapp-${selectedConversation.user_id}_${timestamp}${ext}`;
      const { publicUrl } = await uploadFileToBackblaze({
        file,
        fileName: uniqueFileName,
      });

      if (isPdf) {
        sendDocument(publicUrl, uniqueFileName, caption);
      } else {
        sendImage(publicUrl, caption);
      }
    } catch (error) {
      console.error("Error al subir archivo:", error);
      window.showToast("Error al subir archivo: " + error.message, "error");
    }
  };

  const clearSelectedMedia = () => {
    setPreview(null);
    setMedia(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (file) => {
    setMedia(file || null);
    if (file && file.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(file));
      return;
    }
    setPreview(null);
  };

  const handleComposerSend = ({ withMedia }) => {
    if (withMedia && media) {
      uploadMedia(media, writedMessage);
      clearSelectedMedia();
      return;
    }
    if (!withMedia && writedMessage) {
      sendMessage(writedMessage);
    }
  };

  const loadConversationMessages = async (userId) => {
    try {
      const response = await api(`/api/messages?userId=${userId}`);
      const data = await response.json();
      setMessages(data);
      setTimeout(scrollToBottom, 300);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    const connectionId = selectedConversation
      ? selectedConversation.user_id
      : "Yantissimo";

    socketRef.current = io(AGENT_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 20000,
    });

    socketRef.current.on("connect", () => {
      socketRef.current.emit("joinRoom", connectionId);
    });

    socketRef.current.on("newMessage", (data) => {
      const incomingKey = buildMessageKey({
        ...data,
        fallbackSender: selectedConversation?.user_id,
      });
      if (consumePendingOutgoing(incomingKey)) {
        return;
      }

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

      if (data.senderId) {
        setConversations((prevConversations) =>
          prevConversations.map((conv) => {
            if (conv.user_id !== data.senderId) return conv;
            const isOpen =
              selectedConversation &&
              selectedConversation.user_id === data.senderId;
            return {
              ...conv,
              hasnewmessage: isOpen ? false : true,
            };
          })
        );
      }

      setTimeout(scrollToBottom, 100);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [selectedConversation, setConversations]);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages]);

  useEffect(() => {
    if (selectedConversation) {
      setTimeout(scrollToBottom, 300);
    }
  }, [selectedConversation]);

  return {
    messages,
    setMessages,
    writedMessage,
    setWritedMessage,
    media,
    preview,
    messagesContainerRef,
    fileInputRef,
    handleFileChange,
    clearSelectedMedia,
    handleComposerSend,
    loadConversationMessages,
  };
};
