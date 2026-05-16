"use client";
import React, { useState } from "react";
import { Box, ButtonGroup, Button } from "@mui/material";
import { TestBadge } from "~/resources/badges";
import CotizadorEXT from "./components/cotizadorEXT";
import CotizadorCAI from "./components/cotizadorCAI";
import CotizadorAGR from "./components/cotizadorAGR";
import Header from "~/components/header";

export const CotizadorContent = ({ showHeader = true }) => {
  const [proveedor, setProveedor] = useState("local");

  return (
    <Box>
      {showHeader && (
        <Header
          title={
            <>
              Cotizador
              <TestBadge />
            </>
          }
        />
      )}
      <Box>
        <ButtonGroup variant="contained" sx={{ mb: 2, ml: 2 }}>
          <Button
            onClick={() => setProveedor("local")}
            color={proveedor === "local" ? "primary" : "secondary"}
          >
            Local
          </Button>
          <Button
            onClick={() => setProveedor("foreign")}
            color={proveedor === "foreign" ? "primary" : "secondary"}
          >
            Foráneo
          </Button>
        </ButtonGroup>
        <CotizadorEXT desgloce={true} proveedor={proveedor} />
        <CotizadorCAI desgloce={true} proveedor={proveedor} />
        <CotizadorAGR desgloce={true} proveedor={proveedor} />
      </Box>
    </Box>
  );
};

const CotizadorPage = () => {
  return <CotizadorContent showHeader />;
};

export default CotizadorPage;
