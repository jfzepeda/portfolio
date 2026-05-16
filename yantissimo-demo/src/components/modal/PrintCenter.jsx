import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Modal,
  Checkbox,
  Typography,
  FormControlLabel,
  FormGroup,
  Divider,
} from "@mui/material";

const PrintCenter = ({ open, onClose, downloadPDF, quoteData }) => {
  const [sumarTotales, setSumarTotales] = useState(false);
  const [ordenServicio, setOrdenServicio] = useState(false);
  // const [datosEntrada, setDatosEntrada] = useState(false);
  const [desgloceIva, setDesgloceIva] = useState(false);
  useEffect(() => {
    if (!open) {
      setSumarTotales(false);
      setOrdenServicio(false);
      // setDatosEntrada(false);
      setDesgloceIva(false);
    }
  }, [open]);

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 500,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
          pt: 2,
        }}
      >
        <Typography variant="h6" component="h2" gutterBottom>
          Centro de Impresión
        </Typography>
        <Divider sx={{ my: 1.5 }} />
        <FormGroup sx={{ display: "flex", flexDirection: "row" }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={sumarTotales}
                onChange={(e) => setSumarTotales(e.target.checked)}
              />
            }
            label="Sumar totales"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={desgloceIva}
                onChange={(e) => setDesgloceIva(e.target.checked)}
              />
            }
            label="Desgloce IVA"
          />
        </FormGroup>
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={() => {
            downloadPDF({
              ...quoteData,
              sumarTotales,
              desgloceIva,
              ordenServicio,
            });
            onClose();
          }}
        >
          Descargar PDF
        </Button>
      </Box>
    </Modal>
  );
};

export default PrintCenter;
