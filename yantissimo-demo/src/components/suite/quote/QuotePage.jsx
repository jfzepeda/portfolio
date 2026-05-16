// QuotePage.jsx — data layer + layout
"use client";
import { useEffect, useMemo, useState } from "react";
import { Box, Toolbar } from "@mui/material";
import { clear as clearSelected } from "~/lib/quickQuoteStorage.js";
import { useQuoteItems } from "./useQuoteItems.js";

export default function QuotePage({
  clearOnMount = true,
  cotId,
  quote,
  profile,
  TableComponent,
  tableProps = {},
  // data-fetching config — provided by thin wrappers
  fetchItems,
  onPrequoteUpgrade,
  upgradeTypes,
  enableClubYantissimo = false,
}) {
  // -----------------
  // Estado
  // -----------------
  const [clubYantissimo, setClubYantissimo] = useState(false);
  const { items, setItems, refreshItems } = useQuoteItems({
    cotId,
    quoteType: quote?.type,
    fetchItems,
    onPrequoteUpgrade,
    upgradeTypes,
    clubYantissimo,
  });

  // -----------------
  // Efectos
  // -----------------
  useEffect(() => {
    if (clearOnMount) {
      clearSelected();
    }
  }, [clearOnMount]);

  // -----------------
  // Render helpers
  // -----------------

  const Results = useMemo(() => {
    if (!TableComponent) return null;
    return (
      <TableComponent
        cotId={cotId}
        quote={quote}
        profile={profile}
        items={items}
        setItems={setItems}
        enableClubYantissimo={enableClubYantissimo}
        clubYantissimo={clubYantissimo}
        setClubYantissimo={setClubYantissimo}
        refreshItems={refreshItems}
        {...tableProps}
      />
    );
  }, [
    TableComponent,
    quote,
    cotId,
    profile,
    items,
    setItems,
    enableClubYantissimo,
    clubYantissimo,
    refreshItems,
    tableProps,
  ]);

  // -----------------
  // Render principal
  // -----------------
  return (
    <Box sx={{ p: 2, flexGrow: 1 }}>
      <Toolbar />

      {/* Resultados o tabla de pre-cotización según el estado */}
      {Results}
    </Box>
  );
}
