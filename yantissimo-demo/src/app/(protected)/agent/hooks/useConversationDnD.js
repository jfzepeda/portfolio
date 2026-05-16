import { useRef, useState } from "react";
import { formatPhoneNumber } from "../utils/formatters";
import {
  deriveConversationState,
  validateStageTransition,
} from "../utils/stageConfig";

export const useConversationDnD = ({
  selectedConversation,
  conversations,
  setStage,
  onRequiresForm,
  disabled = false,
}) => {
  const [draggedConversationId, setDraggedConversationId] = useState(null);
  const dragImageRef = useRef(null);

  const cleanDragState = () => {
    setDraggedConversationId(null);
  };

  const handleDragStart = (event, conversation) => {
    if (selectedConversation || disabled) {
      event.preventDefault();
      return;
    }

    if (deriveConversationState(conversation) !== "open") {
      event.preventDefault();
      return;
    }

    setDraggedConversationId(conversation.user_id);
    event.dataTransfer.setData("text/plain", conversation.user_id);
    event.dataTransfer.effectAllowed = "move";

    try {
      if (
        event.dataTransfer &&
        typeof event.dataTransfer.setDragImage === "function"
      ) {
        if (dragImageRef.current) {
          dragImageRef.current.remove();
          dragImageRef.current = null;
        }

        const container = document.createElement("div");
        container.style.position = "fixed";
        container.style.top = "-1000px";
        container.style.left = "-1000px";
        container.style.zIndex = "99999";
        container.style.pointerEvents = "none";
        container.style.background = "#ffffff";
        container.style.border = "1px solid #E6EAF0";
        container.style.borderRadius = "10px";
        container.style.boxShadow = "0 8px 20px rgba(0,0,0,0.15)";
        container.style.padding = "10px";
        container.style.width = "220px";
        container.style.fontFamily =
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji'";

        const row = document.createElement("div");
        row.style.display = "flex";
        row.style.alignItems = "center";
        row.style.gap = "10px";

        const avatar = document.createElement("div");
        avatar.style.width = "32px";
        avatar.style.height = "32px";
        avatar.style.borderRadius = "50%";
        avatar.style.background = "#E0E0E0";
        avatar.style.flex = "0 0 auto";

        const text = document.createElement("div");
        text.style.display = "flex";
        text.style.flexDirection = "column";
        text.style.overflow = "hidden";

        const name = document.createElement("div");
        name.textContent =
          conversation.nombre || formatPhoneNumber(conversation.user_id);
        name.style.fontSize = "14px";
        name.style.fontWeight = "600";
        name.style.color = "#111";
        name.style.whiteSpace = "nowrap";
        name.style.textOverflow = "ellipsis";
        name.style.overflow = "hidden";

        const subtitle = document.createElement("div");
        subtitle.textContent = conversation.lastmessage?.msg || "";
        subtitle.style.fontSize = "12px";
        subtitle.style.color = "#555";
        subtitle.style.whiteSpace = "nowrap";
        subtitle.style.textOverflow = "ellipsis";
        subtitle.style.overflow = "hidden";

        text.appendChild(name);
        text.appendChild(subtitle);
        row.appendChild(avatar);
        row.appendChild(text);
        container.appendChild(row);
        document.body.appendChild(container);

        dragImageRef.current = container;
        event.dataTransfer.setDragImage(container, 20, 20);
      }
    } catch {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;
        event.dataTransfer.setDragImage(canvas, 0, 0);
      } catch {}
    }
  };

  const handleDragOver = (event) => {
    if (disabled) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (event, targetStage) => {
    if (disabled) return;
    event.preventDefault();

    const userId = event.dataTransfer.getData("text/plain");
    const conv = conversations.find((c) => c.user_id === userId);

    if (!conv || conv.stage === targetStage) {
      cleanDragState();
      return;
    }

    if (deriveConversationState(conv) !== "open") {
      cleanDragState();
      return;
    }

    // Validate transition
    const validation = validateStageTransition(conv, targetStage);

    if (!validation.valid) {
      validation.errors.forEach((err) => window.showToast(err, "error"));
      cleanDragState();
      return;
    }

    // If transition requires a form (e.g. seguimiento), signal parent
    if (validation.requiresForm) {
      onRequiresForm?.(conv, validation.requiresForm);
      cleanDragState();
      return;
    }

    setStage(conv, targetStage, {}, { preserveSelection: true });
    cleanDragState();
  };

  const handleDragEnd = () => {
    if (dragImageRef.current) {
      dragImageRef.current.remove();
      dragImageRef.current = null;
    }
    cleanDragState();
  };

  return {
    draggedConversationId,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
  };
};
