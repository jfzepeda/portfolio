import React from "react";
import { Box, Typography } from "@mui/material";
import { isMich, smartCF, calcDescuento } from "./shared.jsx";
import { getRinDiscount } from "./utils.js";

export const LegendBox = ({ item }) => {
  // console.debug("Rendering LegendBox with item:", item);
  return null;
  let showLegend =
    isMich(item) &&
    ["yantissimo", "dlago"].includes(item?.proveedor?.toLowerCase());

  if (!showLegend) return null;

  const rinDiscount = getRinDiscount(item) / 100;
  const notaCreditoPrecio = (item?.precioLista || 0) * rinDiscount;
  const facturarPrecio = item?.precioContado + notaCreditoPrecio;
  const descContado = calcDescuento(facturarPrecio, item, true);
  const desc6msi = calcDescuento(item?.seisMeses, item, true);

  // console.debug("LegendBox showLegend:", showLegend, {
  //   rinDiscount,
  //   notaCreditoPrecio,
  //   descContado,
  //   facturarPrecio,
  //   desc6msi,
  // });

  showLegend = showLegend && descContado >= 25;
  if (!showLegend) return null;

  return (
    <Box sx={{ pt: 2 }}>
      <Typography sx={{ fontSize: 14, color: "#444" }}>
        Contado: facturar PL -{descContado}% : {smartCF(facturarPrecio, item)} y{" "}
        {smartCF(notaCreditoPrecio, item)} en nota de credito
      </Typography>
      <Typography sx={{ fontSize: 14, color: "#444" }}>
        6 meses: facturar PL -{desc6msi}% : {smartCF(item?.seisMeses, item)}
      </Typography>
    </Box>
  );
};
