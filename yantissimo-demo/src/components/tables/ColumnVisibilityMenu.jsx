"use client";

import React, { useState, useCallback } from "react";
import {
  Menu,
  MenuItem,
  Checkbox,
  ListItemText,
  ListSubheader,
  Divider,
  Box,
} from "@mui/material";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";

function ColumnVisibilityMenu({
  open,
  position,
  onClose,
  availableColumns,
  hiddenByUser,
  onToggleColumn,
  onMoveColumn,
  onResetToDefaults,
}) {
  const [draggedKey, setDraggedKey] = useState(null);
  const [dragOverKey, setDragOverKey] = useState(null);

  const resetDragState = useCallback(() => {
    setDraggedKey(null);
    setDragOverKey(null);
  }, []);

  if (!position) return null;

  return (
    <Menu
      open={open}
      onClose={() => {
        resetDragState();
        onClose();
      }}
      anchorReference="anchorPosition"
      anchorPosition={position}
      slotProps={{
        paper: {
          sx: { minWidth: 260, maxHeight: 400 },
        },
      }}
    >
      <ListSubheader sx={{ lineHeight: "32px", fontWeight: 600 }}>
        Columnas visibles
      </ListSubheader>

      {availableColumns.map((col) => {
        const visible = !hiddenByUser.has(col.key);
        const isDragged = draggedKey === col.key;
        const isDropTarget = dragOverKey === col.key && draggedKey !== col.key;
        return (
          <MenuItem
            key={col.key}
            dense
            onDragOver={(e) => {
              if (!draggedKey) return;
              e.preventDefault();
              if (dragOverKey !== col.key) setDragOverKey(col.key);
            }}
            onDrop={(e) => {
              e.preventDefault();
              if (draggedKey && draggedKey !== col.key) {
                onMoveColumn?.(draggedKey, col.key);
              }
              resetDragState();
            }}
            onDragEnd={resetDragState}
            onClick={() => onToggleColumn(col.key)}
            sx={{
              opacity: isDragged ? 0.6 : 1,
              bgcolor: isDropTarget ? "action.hover" : undefined,
            }}
          >
            <Box
              component="span"
              draggable
              onClick={(e) => e.stopPropagation()}
              onDragStart={(e) => {
                e.stopPropagation();
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", col.key);
                setDraggedKey(col.key);
              }}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                mr: 1,
                color: "text.secondary",
                cursor: "grab",
              }}
            >
              <DragIndicatorIcon fontSize="small" />
            </Box>
            <Checkbox
              size="small"
              checked={visible}
              tabIndex={-1}
              disableRipple
              sx={{ p: 0, mr: 1 }}
            />
            <ListItemText primary={col.label} />
          </MenuItem>
        );
      })}

      <Divider />
      <MenuItem
        dense
        onClick={() => {
          onResetToDefaults();
          onClose();
        }}
      >
        <RestartAltIcon fontSize="small" sx={{ mr: 1, opacity: 0.6 }} />
        <ListItemText primary="Restaurar por defecto" />
      </MenuItem>
    </Menu>
  );
}

export default React.memo(ColumnVisibilityMenu);
