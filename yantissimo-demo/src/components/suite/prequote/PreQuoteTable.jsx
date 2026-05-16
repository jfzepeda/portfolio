"use client";
import {
  Box,
  Button,
  IconButton,
  Typography,
  Tooltip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  ButtonGroup,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { clear as clearSelected } from "~/lib/quickQuoteStorage.js";
import { currencyFormatter } from "~/utils/formaters.js";
import { useQuickQuote } from "~/lib/QuickQuoteContext.jsx";
import { getSubtotal } from "~/lib/calcSubtotal.js";

export default function PreQuoteTable({
  items,
  clientType = "PUBLICO",
  priceMode = "default",
  paso = "llantas",
  onToggleTables,
  showServiceToggle = true,
  availabilityLabel = "Procedencia",
  availabilityValue,
}) {
  const { removeById, setUnits } = useQuickQuote();
  const canToggle = showServiceToggle && typeof onToggleTables === "function";

  const pickDisplayPrice = (it) => {
    if (priceMode === "distContado") {
      return (
        Number(it?.contadoDist) ||
        Number(it?.contadoVenta) ||
        Number(it?.precioContado) ||
        Number(it?.preciocontado) ||
        Number(it?.price) ||
        0
      );
    }

    const base = Number(it?.price) || 0;
    if (String(clientType).toUpperCase() === "CONVENIO") {
      const conv =
        Number(it?.precioConvenio) ||
        Number(it?.precioconvenio) ||
        Number(it?.preciocontado) ||
        Number(it?.precioContado) ||
        base;
      return conv || 0;
    }
    // PUBLICO u otros
    return (
      Number(it?.precioContado) ||
      Number(it?.preciocontado) ||
      Number(it?.price) ||
      0
    );
  };

  const getAvailability =
    availabilityValue || ((it) => it?.origin || "desconocido");

  const subtotal =
    priceMode === "distContado"
      ? (items || []).reduce((acc, it) => {
          const units = Math.max(1, Number(it?.units) || 1);
          return acc + units * pickDisplayPrice(it);
        }, 0)
      : getSubtotal(items, clientType);

  return (
    <Box
      sx={{
        p: 2,
        color: "text.primary",
        maxHeight: "70vh",
        overflowY: "auto",
      }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Typography variant="h6" gutterBottom>
          RESUMEN DE ARTICULOS
        </Typography>
        <Tooltip title="Limpiar selección">
          <IconButton
            size="large"
            color="error"
            onClick={() => {
              clearSelected();
              if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("yssm:quickquote:cleared"));
              }
            }}
            aria-label="Limpiar selección"
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
          {canToggle && (
            <ButtonGroup
              color="contrast"
              variant="outlined"
              size="small"
              sx={{ ml: 2 }}
            >
              <Button
                variant={paso === "llantas" ? "contained" : "outlined"}
                onClick={() => onToggleTables("llantas")}
              >
                Llantas
              </Button>
              <Button
                variant={paso === "servicios" ? "contained" : "outlined"}
                onClick={() => onToggleTables("servicios")}
              >
                Servicios
              </Button>
            </ButtonGroup>
          )}
        </Tooltip>
      </Box>
      {items?.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Sin articulos. Agrega llantas o servicios.
        </Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "primary.main" }}>
              <TableCell>Artículo</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell>{availabilityLabel}</TableCell>
              <TableCell>Unidades</TableCell>
              <TableCell>Eliminar</TableCell>
              {/* <TableCell>Id-inventario</TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {items
              // ordenar primero las llantas y luego los servicios

              .sort((a, b) => {
                if (a.categoria !== "servicios" && b.categoria === "servicios")
                  return -1;
                else return 1;
                return 0;
              })
              .map((it, index) => (
                <TableRow
                  key={it.id}
                  sx={{
                    backgroundColor: index % 2 === 0 ? "grey.50" : "white",
                  }}
                >
                  <TableCell>{it.articulo}</TableCell>
                  <TableCell>
                    {String(it.categoria || "").toUpperCase()}
                  </TableCell>
                  <TableCell>${pickDisplayPrice(it).toFixed(2)}</TableCell>
                  <TableCell>
                    {String(getAvailability(it) || "desconocido").toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <IconButton
                        size="small"
                        aria-label="Disminuir"
                        onClick={() =>
                          setUnits(
                            it.id,
                            Math.max(1, (Number(it.units) || 1) - 1)
                          )
                        }
                      >
                        <RemoveIcon fontSize="inherit" />
                      </IconButton>
                      <Typography variant="body2" sx={{ mx: 1 }}>
                        {Number(it.units) || 1}
                      </Typography>
                      <IconButton
                        size="small"
                        aria-label="Aumentar"
                        onClick={() =>
                          setUnits(it.id, (Number(it.units) || 1) + 1)
                        }
                      >
                        <AddIcon fontSize="inherit" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      aria-label="Eliminar"
                      onClick={() => removeById(it.id)}
                      sx={{ color: "error.main" }}
                    >
                      <CloseRoundedIcon fontSize="inherit" />
                    </IconButton>
                  </TableCell>
                  {/* <TableCell>{Number(it.inventory_id ?? 0)}</TableCell> */}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      )}
      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
        <Typography sx={{ fontWeight: 700 }} variant="h6">
          Subtotal:&nbsp;&nbsp;
        </Typography>
        <Typography variant="h6">
          {currencyFormatter(subtotal)}
        </Typography>
      </Box>
      <Box sx={{ mt: 0, display: "flex", justifyContent: "flex-end" }}>
        <Typography>Subtotal calculado con precios de lista</Typography>
      </Box>
    </Box>
  );
}
