// Panel Pre-Cotización (overlay derecha ~1/3)
"use client";
import { useMemo } from "react";
import { Box, IconButton, Stack, Typography, Tooltip } from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useQuickQuote } from "~/lib/QuickQuoteContext.jsx";
import { currencyFormatter } from "~/utils/formaters.js";

export default function PreCotizacionPanel() {
  const { items, removeById, setUnits, clear } = useQuickQuote();
  const subtotal = useMemo(
    () =>
      items?.reduce((acc, it) => {
        const units = Number(it.units) || 1;
        const price = Number(it.price) || 0;
        return acc + units * price;
      }, 0),
    [items]
  );

  return (
    <Box
      sx={{
        width: "20rem",
        p: 2,
        color: "text.primary",
        borderColor: "divider",
        boxShadow: "-6px 6px 10px -4px rgba(0,0,0,0.25)",
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h6" gutterBottom>
          Pre-cotización
        </Typography>
        <Tooltip title="Limpiar selección">
          <IconButton
            size="small"
            onClick={() => clear()}
            aria-label="Limpiar selección"
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
      <Stack spacing={1} sx={{ mt: 2, maxHeight: "40rem", overflowY: "auto" }}>
        {items?.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Sin articulos. Agrega llantas o servicios.
          </Typography>
        )}
        {items?.map((it) => (
          <Box key={it.id} sx={{ p: 1.5 }}>
            <Box display={"flex"} alignItems="center" spacing={1}>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="subtitle2">{it.articulo}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {String(it.categoria || "").toUpperCase()} • $
                  {(Number(it.price) || 0).toFixed(2)}
                </Typography>
              </Box>
              <Stack
                direction="column"
                alignItems="center"
                spacing={0}
                sx={{ m: 0, p: 0 }}
              >
                <IconButton
                  size="large"
                  onClick={() => removeById(it.id)}
                  aria-label="Eliminar"
                  sx={{ color: "error.main", m: 0, p: 0 }}
                >
                  <CloseRoundedIcon fontSize="inherit" />
                </IconButton>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  sx={{ m: 0, p: 0 }}
                >
                  <IconButton
                    onClick={() =>
                      setUnits(it.id, Math.max(1, (Number(it.units) || 1) - 1))
                    }
                    size="small"
                    sx={{ m: 0, p: 0 }}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <Typography variant="body2" sx={{ m: 0, p: 0 }}>
                    {Number(it.units) || 1}
                  </Typography>
                  <IconButton
                    onClick={() => setUnits(it.id, (Number(it.units) || 1) + 1)}
                    size="small"
                    sx={{ m: 0, p: 0 }}
                  >
                    <AddIcon />
                  </IconButton>
                </Box>
              </Stack>
            </Box>
          </Box>
        ))}
      </Stack>
      <Stack direction="row" justifyContent="space-between" sx={{ mt: 3 }}>
        <Typography variant="subtitle2">Subtotal</Typography>
        <Typography variant="subtitle2">
          {currencyFormatter(subtotal)}
        </Typography>
      </Stack>
    </Box>
  );
}
