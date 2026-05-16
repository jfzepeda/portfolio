"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from "@mui/material";

const CartLinksDialog = ({ open, onClose, onCopy }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Enlaces del carrito</DialogTitle>
      <DialogContent>
        <Typography variant="body2">Elige que enlace quieres copiar:</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="contained" color="primary" onClick={() => onCopy("payment")}>
          solo pago
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => onCopy("selfService")}
        >
          agendar y pago
        </Button>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CartLinksDialog;
