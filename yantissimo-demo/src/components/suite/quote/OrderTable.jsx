"use client";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { currencyFormatter } from "~/utils/formaters.js";
import Subtotales from "~/components/suite/quote/Subtotales.jsx";

export default function OrderTable({
  quote,
  items,
  ActionsComponent,
  refreshItems,
}) {
  return (
    <Box sx={{ color: "text.primary" }}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography variant="h5" gutterBottom>
          Resumen de pedido enviado
        </Typography>
        {ActionsComponent && (
          <ActionsComponent quote={quote} items={items} refreshItems={refreshItems} />
        )}
      </Box>
      {!items?.length > 0 ? (
        <Box
          display="flex"
          alignItems="center"
          flexDirection={"column"}
          justifyContent="center"
          sx={{ mt: 2 }}
        >
          {quote.type !== "prequote" ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Sin articulos. Agrega llantas o servicios.
            </Typography>
          ) : (
            <>
              <Typography variant="h4" color="text.secondary" sx={{ mt: 2 }}>
                Pre-cotización Incompleta.
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                Completa las cotizaciones a proveedores y/o añade por lo menos
                un articulo
              </Typography>
            </>
          )}
        </Box>
      ) : (
        <>
          <Box
            sx={{ color: "text.primary", maxHeight: "60vh", overflowY: "auto" }}
          >
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: "primary.main" }}>
                  <TableCell>Artículo</TableCell>
                  <TableCell>Categoría</TableCell>
                  <TableCell>Precio Lista</TableCell>
                  <TableCell>Pzas.</TableCell>
                  <TableCell>Entrega</TableCell>
                  <TableCell>
                    {String(quote.client_type).toUpperCase() === "PUBLICO"
                      ? "Promoción"
                      : quote.client_type}
                  </TableCell>
                  {/* <TableCell>Vol 10</TableCell>
              <TableCell>Credito</TableCell> */}
                </TableRow>
              </TableHead>
              <TableBody>
                {items?.map((it, index) => {
                  const promo = it.precioPromo;
                  return (
                    <TableRow
                      key={it.id ?? `${it.inventory_id}-${index}`}
                      sx={{
                        backgroundColor: index % 2 === 0 ? "grey.50" : "white",
                      }}
                    >
                      <TableCell>{it.articulo}</TableCell>
                      <TableCell>
                        {String(it.categoria || "").toUpperCase()}
                      </TableCell>
                      <TableCell>{currencyFormatter(it.precioLista)}</TableCell>
                      <TableCell>
                        {it.og_units ? (
                          <Box
                            component="span"
                            sx={{
                              display: "inline-flex",
                              alignItems: "baseline",
                              columnGap: 1,
                            }}
                          >
                            <Box
                              component="span"
                              sx={{
                                color: "text.disabled",
                              }}
                            >
                              {String(it.og_units)}
                            </Box>
                            <Box component="span" sx={{ color: "error.main" }}>
                              ({it.units})
                            </Box>
                          </Box>
                        ) : (
                          it.units
                        )}
                      </TableCell>
                      <TableCell>{it?.disponibilidad?.tiempo}</TableCell>
                      <TableCell>{currencyFormatter(promo)}</TableCell>
                      {/* <TableCell>{currencyFormatter(it.volumen10)}</TableCell>
                <TableCell>{currencyFormatter(it.credito)}</TableCell> */}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
          <Subtotales items={items} quote={quote} />
        </>
      )}
    </Box>
  );
}
