"use client";
import { generateAnticipo } from "~/lib/anticipoApi.js";
import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Divider,
  Typography,
  Toolbar,
  TextField,
  MenuItem,
  Stack,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { currencyFormatter, formatFolioMicrosip } from "~/utils/formaters.js";
import { getSubtotal } from "~/lib/calcSubtotal.js";

const PAYMENT_METHODS = [
  { value: "efectivo", label: "Efectivo" },
  { value: "mercado_pago", label: "Mercado Pago" },
  { value: "afirme", label: "Afirme" },
  { value: "bbva", label: "BBVA" },
  { value: "santander", label: "Santander" },
  { value: "spei", label: "SPEI" },
];

const toNumber = (value) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(String(value).replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
};

// Página simple para crear un anticipo: { importe, método de pago, folio opcional }
export default function AnticipoPage({ cotId, quote }) {
  const muiTheme = useTheme();
  const PRIMARY_COLOR = muiTheme.palette.primary.main;
  const [importe, setImporte] = useState("");
  const [payMethod, setPayMethod] = useState("");
  const [folioMS, setFolioMS] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const minimumImporte = useMemo(() => {
    const directTotal = toNumber(quote?.total ?? quote?.importe_total);
    const itemsTotal = getSubtotal(
      Array.isArray(quote?.items) ? quote.items : []
    );
    const quoteTotal = directTotal > 0 ? directTotal : itemsTotal;

    return quoteTotal > 0 ? quoteTotal * 0.2 : 0;
  }, [quote?.importe_total, quote?.items, quote?.total]);
  const importeHelperText =
    minimumImporte > 0
      ? `Min. ${currencyFormatter(minimumImporte, 2)} (20% del importe total)`
      : "Min. 20% del importe total";

  const handleSubmit = async (e) => {
    e.preventDefault();
    const monto = parseFloat(String(importe).replace(/,/g, "."));

    if (!cotId) {
      window.showToast("Falta id de cotización", "error");
      return;
    }
    if (!Number.isFinite(monto) || monto <= 0) {
      window.showToast("Importe inválido", "error");
      return;
    }
    if (!payMethod) {
      window.showToast("Selecciona método de pago", "error");
      return;
    }
    if (!folioMS.trim()) {
      window.showToast("Folio Microsip obligatorio", "error");
      return;
    }

    setSubmitting(true);
    const ok = await generateAnticipo({
      cotId,
      importe: monto,
      pay_method: payMethod,
      folio_ms: folioMS,
    });
    setSubmitting(false);

    if (ok) {
      setImporte("");
      setPayMethod("");
      setFolioMS("");
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 2 }}>
      <Toolbar />
      <Box>
        <Typography variant="h5" gutterBottom>
          ANTICIPOS
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Crea un anticipo para esta cotización.
        </Typography>
        <Divider color={PRIMARY_COLOR} sx={{ mb: 2 }} />
        {quote.pay_status === 0 ? (
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2} sx={{ maxWidth: 420 }}>
              <TextField
                label="Importe"
                helperText={importeHelperText}
                value={importe}
                onChange={(e) =>
                  setImporte(e.target.value.replace(/[^0-9.,]/g, ""))
                }
                required
                error={
                  importe !== "" &&
                  (!Number.isFinite(toNumber(importe)) ||
                    toNumber(importe) < minimumImporte)
                }
                fullWidth
              />

              <TextField
                label="Método de pago"
                select
                value={payMethod}
                onChange={(e) => setPayMethod(e.target.value)}
                required
                fullWidth
              >
                {PAYMENT_METHODS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Folio Microsip (obligatorio)"
                value={folioMS}
                onChange={(e) =>
                  setFolioMS(formatFolioMicrosip(e.target.value))
                }
                fullWidth
              />

              <Button type="submit" variant="contained" disabled={submitting}>
                {submitting ? "Guardando..." : "Agregar anticipo"}
              </Button>
            </Stack>
          </Box>
        ) : (
          <>
            <Typography variant="h5" gutterBottom>
              ANTICIPO GENERADO ✅
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Aún no esta disponible la información detallada de anticipos. Por
              favor revisa en Microsip.
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
}
