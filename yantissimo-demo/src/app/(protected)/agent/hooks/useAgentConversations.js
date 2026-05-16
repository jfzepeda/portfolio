import { useEffect, useState } from "react";
import api, { put } from "~/lib/api";
import { createCartByPhone } from "~/lib/yaolApi";
import {
  deriveConversationState,
  normalizeStageKey,
} from "../utils/stageConfig";

const copyToClipboard = async (text) => {
  if (!text) return false;

  try {
    if (navigator?.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn("clipboard.writeText failed:", err);
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "-1000px";
    textarea.style.left = "-1000px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch (err) {
    console.warn("execCommand('copy') failed:", err);
    return false;
  }
};

export const useAgentConversations = ({
  fixedSucursal = null,
  restrictedUserId = null,
} = {}) => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const [viewState, setViewState] = useState("open");
  const [viewAgent, setViewAgent] = useState(null);
  const [viewSucursal, setViewSucursal] = useState(null);
  const [viewStage, setViewStage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [cartLinksOpen, setCartLinksOpen] = useState(false);
  const [cartLinks, setCartLinks] = useState({
    paymentUrl: "",
    selfServiceUrl: "",
  });

  const readConversation = async (userId) => {
    try {
      const response = await put(`/api/conversations/read`, { userId });

      if (!response.ok) {
        throw new Error("Error al leer la conversación");
      }

      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.user_id === userId ? { ...conv, hasnewmessage: false } : conv
        )
      );
    } catch (error) {
      console.error("Error al leer la conversación:", error);
    }
  };

  const selectConversation = async (conversation, loadMessages) => {
    setIsSwitchOn(
      conversation.status === true || conversation.status === "true"
    );
    setSelectedConversation(conversation);

    setConversations((prevConversations) =>
      prevConversations.map((conv) =>
        conv.user_id === conversation.user_id
          ? { ...conv, hasnewmessage: false }
          : conv
      )
    );

    await readConversation(conversation.user_id);
    await loadMessages(conversation.user_id);
  };

  const handleStatus = async (setStatus) => {
    if (!selectedConversation) return;

    const payload = {
      user_id: selectedConversation.user_id,
      status: setStatus ? "true" : "false",
    };

    const response = await put(`/api/agent/status`, payload);

    if (response.status === 200) {
      window.showToast(setStatus ? "Agente activado" : "Agente desactivado");
      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.user_id === selectedConversation.user_id
            ? { ...conv, status: setStatus }
            : conv
        )
      );
      return;
    }

    window.showToast("Error al pausar el agente", "error");
    setIsSwitchOn(!setStatus);
  };

  const archiveChat = async (conversation, archiveReason) => {
    try {
      const response = await put(`/api/conversations/stage`, {
        userId: conversation.user_id,
        stage: "archived",
        archive_reason: archiveReason || null,
      });
      if (!response.ok) {
        throw new Error("Error al archivar chat");
      }

      const updatedConversation = {
        ...conversation,
        archived: true,
        state: "archived",
        archive_reason: archiveReason || null,
        followup_date: null,
        followup_temperature: null,
        followup_previous_stage: null,
      };
      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.user_id === updatedConversation.user_id
            ? updatedConversation
            : conv
        )
      );
      setSelectedConversation((prev) =>
        prev?.user_id === conversation.user_id ? null : prev
      );
      window.showToast("Chat archivado");
    } catch (error) {
      console.error("Error al archivar chat:", error);
      window.showToast("Error al archivar chat", "error");
    }
  };

  const unarchiveChat = async (conversation) => {
    try {
      const response = await put(`/api/conversations/stage`, {
        userId: conversation.user_id,
        stage: "open",
      });
      if (!response.ok) {
        throw new Error("Error al desarchivar chat");
      }

      const updatedConversation = {
        ...conversation,
        archived: false,
        state: "open",
      };
      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.user_id === updatedConversation.user_id
            ? updatedConversation
            : conv
        )
      );
    } catch (error) {
      console.error("Error al desarchivar chat:", error);
    }
  };

  const setState = async (conversation, state, extraData = {}) => {
    try {
      const payload = {
        userId: conversation.user_id,
        state,
        ...extraData,
      };

      const response = await put(`/api/conversations/state`, payload);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al actualizar el estado");
      }

      const updatedConversation = {
        ...conversation,
        state,
        archived: false,
        ...(state === "follow_up"
          ? {
              followup_date: extraData.followup_date,
              followup_temperature: extraData.followup_temperature,
              followup_reason: extraData.followup_reason,
            }
          : {
              followup_date: null,
              followup_temperature: null,
              followup_reason: null,
            }),
      };

      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.user_id === updatedConversation.user_id
            ? updatedConversation
            : conv
        )
      );

      setSelectedConversation((prev) => {
        if (!prev) return prev;
        return prev.user_id === conversation.user_id
          ? updatedConversation
          : prev;
      });
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      window.showToast(error.message || "Error al cambiar estado", "error");
    }
  };

  const setStage = async (
    conversation,
    stage,
    extraData = {},
    { preserveSelection = false } = {}
  ) => {
    try {
      const payload = {
        userId: conversation.user_id,
        stage,
        state:
          stage === "cerrado"
            ? "closed"
            : stage === "seguimiento"
            ? "follow_up"
            : "open",
        ...extraData,
      };

      let response;
      if (stage === "seguimiento" || stage === "cerrado") {
        response = await put(`/api/conversations/state`, payload);
      } else {
        response = await put(`/api/conversations/stage`, payload);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Error al establecer la etapa");
      }

      const updatedConversation = {
        ...conversation,
        stage,
        state: payload.state,
        archived: false,
        stage_changed_at: new Date().toISOString(),
        ...(stage === "seguimiento"
          ? {
              followup_date: extraData.followup_date,
              followup_temperature: extraData.followup_temperature,
              followup_previous_stage: extraData.followup_previous_stage,
            }
          : {
              followup_date: null,
              followup_temperature: null,
              followup_previous_stage: null,
            }),
      };

      setConversations((prevConversations) =>
        prevConversations.map((conv) =>
          conv.user_id === updatedConversation.user_id
            ? updatedConversation
            : conv
        )
      );

      setSelectedConversation((prev) => {
        if (preserveSelection) {
          if (!prev) return prev;
          return prev.user_id === conversation.user_id
            ? updatedConversation
            : prev;
        }
        return updatedConversation;
      });
    } catch (error) {
      console.error("Error al establecer la etapa:", error);
      window.showToast(error.message || "Error al cambiar etapa", "error");
    }
  };

  const handleCreateCart = async () => {
    if (!selectedConversation) return;

    try {
      const { paymentUrl, scheduleUrl } = await createCartByPhone({
        phone: selectedConversation.user_id,
      });

      if (!paymentUrl) {
        window.showToast("No se pudo generar el enlace del carrito", "error");
        return;
      }
      if (!scheduleUrl) {
        window.showToast(
          "No se pudo generar el enlace de autogestión",
          "error"
        );
        return;
      }

      setCartLinks({ paymentUrl, selfServiceUrl: scheduleUrl });
      setCartLinksOpen(true);
    } catch (err) {
      console.error("createCart failed:", err);
      window.showToast("Error al crear el carrito", "error");
    }
  };

  const handleCloseCartLinks = () => setCartLinksOpen(false);

  const handleCopyCartUrl = async (type) => {
    const isPayment = type === "payment";
    const url = isPayment ? cartLinks.paymentUrl : cartLinks.selfServiceUrl;
    const label = isPayment ? "solo pago" : "agendar y pago";

    const copied = await copyToClipboard(url);
    if (copied) {
      window.showToast(`Enlace "${label}" copiado al portapapeles`);
      return;
    }

    window.showToast(`No se pudo copiar "${label}", copialo manualmente`);
    window.prompt(`Copia el enlace "${label}":`, url);
  };

  useEffect(() => {
    const fetchConversations = () => {
      const params = new URLSearchParams();

      if (searchTerm.trim()) {
        params.append("search", searchTerm.trim());
      }

      if (viewState !== null) {
        params.append("state", viewState);
      }

      if (viewAgent !== null) {
        params.append("agent_status", viewAgent ? "true" : "false");
      }

      if (viewStage) {
        params.append("stage", viewStage);
      }

      const activeSucursal = fixedSucursal || viewSucursal;
      if (activeSucursal) {
        params.append("sucursal", activeSucursal);
      }
      if (restrictedUserId != null) {
        params.append("userId", String(restrictedUserId));
      }

      const queryString = params.toString();
      const url = `/api/conversations/get${
        queryString ? `?${queryString}` : ""
      }`;

      api(url)
        .then((response) => response.json())
        .then((data) => {
          const conv = Array.isArray(data) ? data : data.conversations || [];

          setConversations((prevConversations) => {
            return conv.map((newConv) => {
              const normalizedConv = {
                ...newConv,
                stage: normalizeStageKey(newConv.stage),
              };
              normalizedConv.state = deriveConversationState(normalizedConv);
              const existingConv = prevConversations.find(
                (prev) => prev.user_id === normalizedConv.user_id
              );

              if (existingConv) {
                const prevTs = existingConv.lastmessage?.tsmp;
                const newTs = normalizedConv.lastmessage?.tsmp;
                const backendFlag = normalizedConv.hasnewmessage;

                const changed = prevTs && newTs ? newTs !== prevTs : false;

                let hasnewmessage = existingConv.hasnewmessage ?? false;
                if (changed) hasnewmessage = true;

                if (typeof backendFlag === "boolean") {
                  hasnewmessage = backendFlag || hasnewmessage;
                }

                return {
                  ...normalizedConv,
                  hasnewmessage,
                };
              }

              return {
                ...normalizedConv,
                hasnewmessage:
                  typeof normalizedConv.hasnewmessage === "boolean"
                    ? normalizedConv.hasnewmessage
                    : true,
              };
            });
          });
        })
        .catch((error) =>
          console.error("Error fetching conversations:", error)
        );
    };

    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [
    searchTerm,
    viewState,
    viewAgent,
    viewSucursal,
    viewStage,
    fixedSucursal,
    restrictedUserId,
  ]);

  return {
    conversations,
    setConversations,
    selectedConversation,
    setSelectedConversation,
    isSwitchOn,
    setIsSwitchOn,
    viewState,
    setViewState,
    viewAgent,
    setViewAgent,
    viewSucursal,
    setViewSucursal,
    viewStage,
    setViewStage,
    searchTerm,
    setSearchTerm,
    cartLinksOpen,
    handleCloseCartLinks,
    handleCopyCartUrl,
    selectConversation,
    handleStatus,
    setState,
    setStage,
    archiveChat,
    unarchiveChat,
    handleCreateCart,
  };
};
