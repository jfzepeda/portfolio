"use client";

import { useState, useCallback } from "react";

/**
 * Hook that manages click-based column header menus.
 *
 * Clicking a header cell opens the filter/sort menu for that column.
 * Clicking the same header again, or clicking outside, closes it.
 */
export default function useColumnHover() {
  const [openColumn, setOpenColumn] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  /** Attach to each header <TableCell> via onClick. */
  const onHeaderClick = useCallback(
    (colKey, event) => {
      if (openColumn === colKey) {
        setOpenColumn(null);
        setAnchorEl(null);
      } else {
        setOpenColumn(colKey);
        setAnchorEl(event.currentTarget);
      }
    },
    [openColumn],
  );

  /** Close the menu imperatively (e.g. after selecting a filter or clicking away). */
  const closeMenu = useCallback(() => {
    setOpenColumn(null);
    setAnchorEl(null);
  }, []);

  return {
    openColumn,
    anchorEl,
    isMenuOpen: openColumn != null,
    onHeaderClick,
    closeMenu,
  };
}
