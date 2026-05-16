import { Box, Typography } from "@mui/material";
import { currencyFormatter } from "~/utils/formaters.js";
import { getSubtotal } from "~/lib/calcSubtotal.js";

export default function Subtotales({ items = [], sumarTotales }) {
  return (
    <Box>
      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
        <Typography variant="h6">Subtotal:&nbsp;&nbsp;</Typography>
        <Typography sx={{ fontWeight: 700 }} variant="h6">
          {currencyFormatter(getSubtotal(items) / 1.16)}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Typography variant="h6">IVA:&nbsp;&nbsp;</Typography>
        <Typography sx={{ fontWeight: 700 }} variant="h6">
          {currencyFormatter(getSubtotal(items) / 7.25)}
        </Typography>
      </Box>
      {!sumarTotales ? (
        <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end" }}>
          {/* Contado */}
          <Typography variant="h6">TOTAL:&nbsp;&nbsp;</Typography>
          <Typography sx={{ fontWeight: 700 }} variant="h6">
            {currencyFormatter(getSubtotal(items))}
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ mt: 1, display: "flex", justifyContent: "flex-end" }}>
            {/* 6 meses */}
            <Typography variant="h6">6 Pagos:&nbsp;&nbsp;</Typography>
            <Typography sx={{ fontWeight: 700, mr: 5 }} variant="h6">
              {currencyFormatter((getSubtotal(items) * 1.1375) / 6)}
            </Typography>
            {/* 12 meses */}
            <Typography variant="h6">12 Pagos:&nbsp;&nbsp;</Typography>
            <Typography sx={{ fontWeight: 700, mr: 5 }} variant="h6">
              {currencyFormatter((getSubtotal(items) * 1.21875) / 12)}
            </Typography>
            {/* Contado */}
            <Typography variant="h6">TOTAL:&nbsp;&nbsp;</Typography>
            <Typography sx={{ fontWeight: 700 }} variant="h6">
              {currencyFormatter(getSubtotal(items))}
            </Typography>
          </Box>
        </>
      )}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Typography>
          {String().toUpperCase() === "CONVENIO"
            ? "Subtotal calculado con precios de convenio"
            : "Subtotal calculado con precios de promoción"}
        </Typography>
      </Box>
    </Box>
  );
}
