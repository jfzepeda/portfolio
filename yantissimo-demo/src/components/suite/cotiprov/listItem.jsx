import React from "react";
import { ListItem, ListItemText, TextField, Checkbox } from "@mui/material";

export const specialListItem = ({
  prov,
  svc,
  svcId,
  checked,
  setPriceForProviderService,
  toggleServiceForProvider,
}) => {
  return (
    <ListItem
      key={`${prov.id}-${svcId}`}
      secondaryAction={
        checked ? (
          <TextField
            label="Precio"
            size="small"
            value={prov.prices?.[svcId] || ""}
            onChange={(e) =>
              setPriceForProviderService(prov.id, svcId, e.target.value)
            }
            slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
            sx={{ width: 140 }}
          />
        ) : null
      }
    >
      <Checkbox
        edge="start"
        checked={checked}
        onChange={() => toggleServiceForProvider(prov.id, svcId)}
      />
      <ListItemText
        primary={svc.articulo}
        secondary={`Precio actual: $${Number(
          svc?.price ?? svc?.precioLista ?? 0
        ).toFixed(2)} | Origen: ${svc?.origin || svc?.proveedor || "Faltante"}`}
      />
    </ListItem>
  );
};
