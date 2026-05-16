/***************************************
 * src/pages/CotizadorEXT/components/cotizador.jsx
 ***************************************/
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, TextField, IconButton } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { round10, calcDescuento } from "~/utils/formaters";
import api from "~/lib/api";

const CotizadorEXT = ({ desgloce = false, proveedor = "yantissimo" }) => {
  const [cost, setCost] = useState("");
  const [rinInput, setRinInput] = useState("");
  const [envio, setEnvio] = useState("");

  const [quotes, setQuotes] = useState(null);

  /* ==================== CORE ==================== */
  const calculateQuotes = useCallback(async () => {
    const costo = parseFloat(cost) || 0;
    const rin = rinInput.trim();
    const prov = proveedor;
    try {
      const url = `/api/calc/ext?costo=${costo}&rin=${rin}&prov=${prov}&envio=${
        envio || 0
      }`;
      const response = await api(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      // Mantén el mismo redondeo que antes
      const quoted = Object.fromEntries(
        Object.entries(result).map(([k, v]) => [k, round10(v)])
      );
      setQuotes(quoted);
    } catch (err) {
      console.error(err);
      setQuotes(null);
    }
  }, [cost, rinInput, envio, proveedor]);

  /* ==================== EFFECTS ==================== */
  useEffect(() => {
    if (cost !== "" && rinInput.trim() !== "") {
      calculateQuotes();
    } else {
      setQuotes(null);
    }
  }, [calculateQuotes, cost, rinInput]);

  // handle numeric input
  const HNI = (value, callback) => {
    const numericValue = value.replace(/[^0-9.]/g, "");
    callback(numericValue);
  };

  /* ==================== HELPERS & RENDER ==================== */
  const clearFields = () => {
    setCost("");
    setEnvio("");
    setRinInput("");
    setQuotes(null);
  };

  const quoteItems = [
    {
      key: "precioLista",
      label: "Precio de Lista",
      formulaKey: "formulaLista",
      hasDiscount: false,
    },
    {
      key: "precioContado",
      label: "De contado",
      formulaKey: "formulaContado",
      hasDiscount: true,
    },
    {
      key: "seisMeses",
      label: "6 Meses",
      formulaKey: "formula6",
      hasDiscount: true,
    },
    {
      key: "doceMeses",
      label: "12 Meses",
      formulaKey: "formula12",
      hasDiscount: true,
    },
    {
      key: "precioConvenio",
      label: "Convenio",
      formulaKey: "formulaConvenio",
      hasDiscount: true,
    },
    {
      key: "contadoDist",
      label: "Distribuidor Contado",
      formulaKey: "formulaDistCont",
      hasDiscount: true,
    },
    {
      key: "creditoDist",
      label: "Distribuidor Crédito",
      formulaKey: "formulaDistCred",
      hasDiscount: true,
    },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Cotizador EXT
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label="Costo base"
          value={cost}
          onChange={(e) => HNI(e.target.value, setCost)}
          error={cost === "" && rinInput.trim() !== ""}
          variant="outlined"
          size="small"
        />
        <TextField
          label="Rin"
          value={rinInput}
          onChange={(e) => HNI(e.target.value, setRinInput)}
          error={rinInput.trim() === "" && cost !== ""}
          placeholder="ej. 15"
          variant="outlined"
          size="small"
        />
        <TextField
          label="Envio"
          value={envio}
          onChange={(e) => HNI(e.target.value, setEnvio)}
          placeholder="ej. 15"
          variant="outlined"
          size="small"
        />
        <IconButton color="error" onClick={clearFields}>
          <ClearIcon />
        </IconButton>
      </Box>

      {quotes && (
        <Box component="ul" sx={{ listStyle: "none", pl: 0 }}>
          {quoteItems.map(({ key, label, formulaKey, hasDiscount }) => (
            <li key={key}>
              <strong>{label}:</strong> {round10(quotes[key])}
              {hasDiscount && (
                <>
                  {" "}
                  <span style={{ color: "red" }}>
                    {calcDescuento(quotes[key], quotes.precioLista)}%
                  </span>
                </>
              )}
              {desgloce && quotes[formulaKey] && (
                <>
                  {" "}
                  <em>({quotes[formulaKey]})</em>
                </>
              )}
            </li>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default CotizadorEXT;
