"use client";
import { useState, useCallback } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
} from "@mui/material";
import { currencyFormatter, get6msi, get12msi } from "~/utils/formaters.js";
import Subtotales from "~/components/suite/quote/Subtotales.jsx";
import SettingsIcon from "@mui/icons-material/Settings";
import { ROLES } from "~/utils/session";

export default function QuoteTable({
  cotId,
  quote,
  profile,
  items,
  setItems,
  refreshItems,
  overwriteDiscount,
  ActionsComponent,
  actionsProps,
  enableClubYantissimo = false,
  clubYantissimo,
  setClubYantissimo,
  title = "COTIZACIÓN",
  isDistribuidor = false,
}) {
  const [sumarTotales, setSumarTotales] = useState(false);

  const calcDescuento = useCallback((item) => {
    const lista = Number(item?.precioLista) || 0;
    const promo = item?.precioPromo || item?.precioContado || 0;
    if (lista <= 0) return 0;
    const descuento = ((lista - promo) / lista) * 100;
    return Math.round(descuento * 100) / 100; // dos decimales
  }, []);

  // -----------------
  // Handlers
  // -----------------

  return (
    <Box sx={{ color: "text.primary" }}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
        {ActionsComponent && (
          <ActionsComponent
            quote={quote}
            items={items}
            profile={profile}
            sumarTotales={sumarTotales}
            setSumarTotales={setSumarTotales}
            {...(enableClubYantissimo
              ? { clubYantissimo, setClubYantissimo }
              : {})}
            refreshItems={refreshItems}
            {...actionsProps}
          />
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
                  <TableCell>Origen</TableCell>
                  <TableCell>
                    {String(quote.client_type).toUpperCase() === "PUBLICO"
                      ? "Promoción"
                      : quote.client_type}
                  </TableCell>
                  {!isDistribuidor && (
                    <>
                      <TableCell>6 Pagos</TableCell>
                      <TableCell>12 Pagos</TableCell>
                    </>
                  )}
                  <TableCell></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items?.map((it, index) => {
                  const promo = it.precioPromo;
                  const units = Number(it.units) || 1;
                  const seis = get6msi(it) * units;
                  const doce = get12msi(it) * units;
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
                      <TableCell>{it.origin}</TableCell>
                      <TableCell>{currencyFormatter(promo)}</TableCell>
                      {!isDistribuidor && (
                        <>
                          <TableCell>
                            {!sumarTotales ? currencyFormatter(seis) : ""}
                          </TableCell>
                          <TableCell>
                            {!sumarTotales ? currencyFormatter(doce) : ""}
                          </TableCell>
                        </>
                      )}
                      <TableCell>
                        {profile?.role >= ROLES.MARKETING && (
                          <IconButton
                            variant="outlined"
                            color="contrast"
                            size="small"
                            onClick={async () => {
                              if (typeof overwriteDiscount !== "function")
                                return;
                              const newDiscount = window.prompt(
                                `Descuento actual: ${
                                  calcDescuento(it) || 0
                                }%\nIngresa el nuevo descuento para: \n ${
                                  it.articulo
                                }:`,
                                String(it.descuento || 0)
                              );
                              if (newDiscount === null) return; // cancelado
                              const numericDiscount = Number(newDiscount);
                              if (
                                isNaN(numericDiscount) ||
                                numericDiscount < 0 ||
                                numericDiscount > 100
                              ) {
                                window.showToast(
                                  "Descuento inválido. Debe ser un número entre 0 y 100.",
                                  "error"
                                );
                                return;
                              }
                              const res = await overwriteDiscount({
                                quote_id: cotId,
                                itemName: it.articulo,
                                discountHard: numericDiscount,
                              });
                              if (res?.ok) {
                                if (typeof refreshItems === "function") {
                                  await refreshItems();
                                  return;
                                }
                                setItems((prevItems) =>
                                  prevItems.map((item) =>
                                    item.id === it.id
                                      ? { ...item, descuento: numericDiscount }
                                      : item
                                  )
                                );
                              } else {
                                window.showToast(
                                  "No se pudo actualizar el descuento.",
                                  "error"
                                );
                              }
                            }}
                          >
                            <SettingsIcon />
                          </IconButton>
                        )}
                      </TableCell>

                      {/* <TableCell>{currencyFormatter(it.volumen10)}</TableCell>
                <TableCell>{currencyFormatter(it.credito)}</TableCell> */}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
          <Subtotales items={items} quote={quote} sumarTotales={sumarTotales} />
        </>
      )}
    </Box>
  );
}
