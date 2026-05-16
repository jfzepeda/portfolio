// src/components/ItemsSection.jsx
import React from "react";
import {
  Box,
  Button,
  Select,
  MenuItem,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  IconButton,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Autocomplete from "@mui/material/Autocomplete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { round10 } from "../utils/formaters";

// Claves ↔ etiquetas para cada tipo de precio/promoción.
// Esto evita “strings mágicos” dispersos y facilita cambios futuros.
const PROMO_LABELS = {
  precioContado: "Contado",
  seisMeses: "6 MSI",
  doceMeses: "12 MSI",
  promo_2pz: "2 pz",
  promo_4pz: "4 pz",
  precioconvenio: "Convenio",
  contadoDist: "Contado dist.",
  creditoDist: "Crédito dist.",
};

const PROMO_OPTIONS = [
  "precioContado",
  "seisMeses",
  "doceMeses",
  "promo_2pz",
  "promo_4pz",
  "precioconvenio",
  "contadoDist",
  "creditoDist",
];

/**
 * Sección genérica para manejar “services” o “items”.
 *
 * @param {string}  title        – Título visible de la sección.
 * @param {string}  entryKey     – Clave del campo principal ("service" o "article").
 * @param {Array}   entries      – Arreglo con los objetos (services / items).
 * @param {Function} setEntries  – Setter que actualiza el arreglo en el componente padre.
 * @param {Array}   autoOptions  – Opciones para el Autocomplete.
 * @param {boolean} missingFields– Marca campos requeridos.
 * @param {boolean} showPromo    – Muestra el campo “promo” (solo para items).
 * @param {Function} onSelect    – Callback opcional que se dispara al elegir del Autocomplete.
 */

const ItemsSection = ({
  title,
  entryKey,
  entries,
  setEntries,
  autoOptions = [],
  missingFields = false,
  _showPromo = true,
  _onSelect,
}) => {
  // console.debug("ItemsSection render", entries);
  /* ---------- helpers genéricos ---------- */
  const updateEntry = (index, field, value) => {
    const newArr = entries.map((el, i) =>
      i === index ? { ...el, [field]: value } : el
    );
    setEntries(newArr);
  };

  const handleNumeric = (index, field) => (e) => {
    let v = e.target.value.replace(/[^0-9.]/g, "");
    const parts = v.split(".");
    if (parts.length > 2) v = parts[0] + "." + parts.slice(1).join("");
    updateEntry(index, field, v);
  };

  const addEmpty = () => {
    const base = {
      [entryKey]: "",
      units: "",
      cost: "",
      descuento: "0",
      promo: "",
    };
    setEntries([...entries, base]);
  };

  const remove = (index) => setEntries(entries.filter((_, i) => i !== index));

  // Duplicar exactamente igual igual el campo de articulo y servicio
  const duplicate = (index) => {
    const newEntry = { ...entries[index] };
    setEntries([...entries, newEntry]);
  };

  /* ---------- UI ---------- */
  return (
    <Box pb={2}>
      <Typography variant="subtitle1" gutterBottom>
        {title}
      </Typography>

      {entries.map((row, idx) => (
        <Box
          key={idx}
          sx={{
            display: "flex",
            gap: 2,
            mb: 2,
            alignItems: "center",
          }}
        >
          {/* Autocomplete se lleva 2 “partes” */}
          <Autocomplete
            freeSolo
            options={autoOptions}
            value={row[entryKey] + ""}
            onChange={(_e, newValue) =>
              updateEntry(idx, entryKey, newValue ?? "")
            }
            // Captura el blur del input interno
            renderInput={(params) => (
              <TextField
                {...params}
                label={entryKey === "service" ? "Servicio" : "Artículo"}
                required
                error={missingFields && !row[entryKey]}
                fullWidth
                onBlur={(e) =>
                  // guarda lo que haya en el input si olvidaron dar enter
                  updateEntry(idx, entryKey, e.target.value)
                }
              />
            )}
            sx={{ flex: 3, minWidth: 200 }}
          />
          {/* Cada TextField y Select se lleva 1 “parte” */}
          <TextField
            label="Unidades"
            value={row.units}
            onChange={handleNumeric(idx, "units")}
            required
            error={missingFields && !row.units}
            sx={{ flex: 1, minWidth: 80 }}
          />
          <TextField
            label={entryKey !== "service" ? "Precio lista" : "Precio"}
            value={row.cost}
            onChange={handleNumeric(idx, "cost")}
            required
            error={missingFields && !row.cost}
            sx={{ flex: 1, minWidth: 80 }}
          />
          {entryKey !== "service" ? (
            <FormControl sx={{ flex: 1, minWidth: 80 }}>
              <InputLabel>Pago</InputLabel>
              <Select
                value={row.promo || ""}
                onChange={(e) => {
                  const promoKey = e.target.value;
                  const precioLista = parseFloat(row.cost);
                  const precioSelec =
                    Number(row.precios?.[promoKey]) ?? precioLista;
                  // console.debug("Precio seleccionado:", precioSelec);
                  // console.debug("Precio lista:", precioLista);
                  const desc =
                    precioSelec && precioSelec
                      ? (
                          ((precioLista - precioSelec) / precioLista) *
                          100
                        ).toFixed(2)
                      : 0;
                  const piezas =
                    promoKey === "promo_2pz"
                      ? 2
                      : promoKey === "promo_4pz"
                      ? 4
                      : row.units;
                  setEntries(
                    entries.map((el, i) =>
                      i === idx
                        ? {
                            ...el,
                            promo: promoKey,
                            descuento: desc,
                            units: piezas,
                          }
                        : el
                    )
                  );
                }}
              >
                {PROMO_OPTIONS.map((prom) => (
                  <MenuItem key={prom} value={prom}>
                    {PROMO_LABELS[prom] +
                      " ( $" +
                      (row.precios?.[prom] ?? "N/A") +
                      " )"}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <TextField
              disabled
              label="Pago"
              value={"Contado"}
              required
              sx={{ flex: 1, minWidth: 80 }}
            />
          )}
          <TextField
            label="Descuento (%)"
            value={row.descuento}
            onChange={handleNumeric(idx, "descuento")}
            required
            error={row.descuento < 0 || row.descuento > 100}
            sx={{ flex: 1, minWidth: 80 }}
          />
          <TextField
            // label="Total"
            value={round10(row.units * row.cost * (1 - row.descuento / 100))}
            disabled
            sx={{ flex: 1, minWidth: 80 }}
          />
          <IconButton color="error" onClick={() => remove(idx)}>
            <DeleteOutlineIcon />
          </IconButton>
          <IconButton color="bleus" onClick={() => duplicate(idx)}>
            <ContentCopyIcon />
          </IconButton>
        </Box>
      ))}

      <Button variant="outlined" onClick={addEmpty}>
        Agregar {title.slice(0, -1)}
      </Button>
    </Box>
  );
};

export default ItemsSection;
