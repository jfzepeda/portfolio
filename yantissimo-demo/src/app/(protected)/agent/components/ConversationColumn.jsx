"use client";
import { useState } from "react";
import { Box, Typography, List } from "@mui/material";
import DraggableListItem from "./DraggableListItem";

const ConversationColumn = ({
  title,
  stage,
  color,
  items,
  selectedConversationId,
  dnd,
  readOnly = false,
}) => {
  const {
    onDrop,
    onDragOver,
    draggedConversationId,
    onConversationClick,
    onDragStart,
    onDragEnd,
  } = dnd;

  const [isOver, setIsOver] = useState(false);

  const handleDragEnter = (e) => {
    if (readOnly) return;
    e.preventDefault();
    if (draggedConversationId) setIsOver(true);
  };

  const handleDragLeave = (e) => {
    if (readOnly) return;
    e.preventDefault();
    setIsOver(false);
  };

  const handleDropInternal = (e) => {
    if (readOnly) return;
    setIsOver(false);
    onDrop(e, stage);
  };

  return (
    <Box
      sx={{
        width: selectedConversationId ? "22vw" : "19.5%",
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        backgroundColor: isOver ? "#eef2ff" : "#f7fafc",
        border: "1px solid var(--app-border-muted)",
        transition: "background-color 0.2s ease, border 0.2s ease",
      }}
      onDragOver={readOnly ? undefined : onDragOver}
      onDragEnter={readOnly ? undefined : handleDragEnter}
      onDragLeave={readOnly ? undefined : handleDragLeave}
      onDrop={readOnly ? undefined : handleDropInternal}
    >
      <Box
        sx={{
          p: 2,
          pb: 1,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        {color && (
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              backgroundColor: color,
              flexShrink: 0,
            }}
          />
        )}
        <Typography
          variant="body1"
          sx={{ fontWeight: "700", color: "contrast.main" }}
        >
          {title} ({items.length})
        </Typography>
      </Box>
      <Box
        sx={{
          borderBottom: "3px solid",
          width: "100%",
          borderColor: color || "primary.main",
        }}
      />

      <Box sx={{ overflowY: "auto", flex: 1 }}>
        <List disablePadding>
          {items.map((conversation) => (
            <DraggableListItem
              key={conversation.user_id}
              conversation={conversation}
              isSelected={selectedConversationId === conversation.user_id}
              isBeingDragged={draggedConversationId === conversation.user_id}
              onClick={() => onConversationClick(conversation)}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              isDraggable={!readOnly}
            />
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default ConversationColumn;
