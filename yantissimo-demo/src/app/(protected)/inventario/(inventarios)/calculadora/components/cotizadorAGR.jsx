/**********************************************
 * src/pages/Cotizador/components/CotizadorAGR.jsx
 **********************************************/
"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Box, Typography, TextField, IconButton } from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { round10, currencyFormatter } from "~/utils/formaters";
import api from "~/lib/api";

const CotizadorAGR = ({ desgloce = false }) => {
  const [cost, setCost] = useState("");
  const [quotes, setQuotes] = useState(null);
  const [envio, setEnvio] = useState("");

  /* ============ CORE ============ */
  const calculateQuotes = useCallback(async () => {
    const envioNum = parseFloat(envio) || 0;
    const costo = parseFloat(cost) || 0;
    const prov = "yantissimo";
    try {
      const response = await api(
        `/api/calc/cai?costo=${costo}&prov=${prov}&envio=${envioNum}&agr=true`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      const quoted = Object.fromEntries(
        Object.entries(result).map(([k, v]) => [k, round10(v)])
      );
      setQuotes(quoted);
    } catch (err) {
      console.error(err);
      setQuotes(null);
    }
  }, [cost, envio]);

  /* ============ EFFECTS ============ */
  useEffect(() => {
    if (cost !== "") calculateQuotes();
    else setQuotes(null);
  }, [calculateQuotes, cost]);

  /* ============ HELPERS & RENDER ============ */
  const clearFields = () => {
    setCost("");
    setEnvio("");
    setQuotes(null);
  };

  // handle numeric input
  const HNI = (value, callback) => {
    const numericValue = value.replace(/[^0-9.]/g, "");
    callback(numericValue);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Cotizador Agricola
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label="Costo base"
          value={cost}
          onChange={(e) => HNI(e.target.value, setCost)}
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
          <li>
            <strong>Contado Dist:</strong>{" "}
            {currencyFormatter(round10(quotes.contadoDist))}{" "}
            {desgloce && quotes.formulaDistCont && (
              <em>({quotes.formulaDistCont})</em>
            )}
          </li>
          <li>
            <strong>Cont Volumen:</strong>{" "}
            {currencyFormatter(round10(quotes.volumen10))}{" "}
            {desgloce && quotes.formulaVol10 && (
              <em>({quotes.formulaVol10})</em>
            )}
          </li>
          <li>
            <strong>Cont Público:</strong>{" "}
            {currencyFormatter(round10(quotes.precioContado))}{" "}
            {desgloce && quotes.formulaContado && (
              <em>({quotes.formulaContado})</em>
            )}
          </li>
          <li>
            <strong>Crédito Dist:</strong>{" "}
            {currencyFormatter(round10(quotes.creditoDist))}{" "}
            {desgloce && quotes.formulaDistCred && (
              <em>({quotes.formulaDistCred})</em>
            )}
          </li>
          <li>
            <strong>Créd Volumen:</strong>{" "}
            {currencyFormatter(round10(quotes.volumen10Cred))}{" "}
            {desgloce && quotes.formulaVol10Cred && (
              <em>({quotes.formulaVol10Cred})</em>
            )}
          </li>
          <li>
            <strong>Créd Público:</strong>{" "}
            {currencyFormatter(round10(quotes.credito))}{" "}
            {desgloce && quotes.formulaCredito && (
              <em>({quotes.formulaCredito})</em>
            )}
          </li>
        </Box>
      )}
    </Box>
  );
};

export default CotizadorAGR;
