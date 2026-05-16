"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Box, Typography, Checkbox } from "@mui/material";
import { currencyFormatter } from "~/utils/formaters.js";
import api from "~/lib/api";
import {
  ItemModalFrame,
  buildBranchStocks,
  BranchStocks,
  ItemModalImage,
  isMich,
} from "./shared.jsx";
import { LegendBox } from "./legend.jsx";

const alcance_barras = 850;
const alcance_doble = 80;
const gap_barras = 49;

function HeaderSection({ item }) {
  return (
    <>
      {/* ---------- FONDO AMARILLO SUPERIOR (como la referencia) ---------- */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          height: 90,
          bgcolor: "#F4B400",
          borderBottomRightRadius: 4 * 12,
          width: { xs: "88%", md: alcance_barras + gap_barras },
          opacity: 1,
          display: { xs: "none", md: "block" },
        }}
      />
      <Box
        sx={{
          bgcolor: "#F4B400",
          position: "absolute",
          top: 0,
          left: { xs: "83%", md: alcance_barras },
          width: 60,
          height: 70,
          transform: "skewX(-30deg)",
          display: { xs: "none", md: "block" },
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: { xs: 24, md: alcance_doble },
          height: 90,
          bgcolor: "#FFD24A",
          borderBottomRightRadius: 4 * 12,
          width: { xs: "88%", md: alcance_barras + gap_barras },
          opacity: 1,
          zIndex: -1,
          display: { xs: "none", md: "block" },
        }}
      />
      <Box
        sx={{
          bgcolor: "#FFD24A",
          position: "absolute",
          top: 0,
          left: { xs: "88%", md: alcance_barras + alcance_doble },
          width: 60,
          height: 70,
          transform: "skewX(-30deg)",
          zIndex: -1,
          display: { xs: "none", md: "block" },
        }}
      />

      {/* --------------------- HEADER --------------------- */}
      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "stretch",
        }}
      >
        {/* MEDIDA Y MODELO */}
        <Box
          sx={{
            width: "100%",
            maxWidth: 800,
            minHeight: { xs: 52, md: 58 },
            bgcolor: "#E6E6E6",
            borderTopLeftRadius: { xs: 12, md: 3 * 8 },
            borderBottomRightRadius: { xs: 24, md: 60 },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: { xs: "0 6px 0 #3A3A3A", md: "0 10px 0 #3A3A3A" },
            px: { xs: 1.5, md: 2 },
            py: { xs: 0.8, md: 1 },
          }}
        >
          <Typography
            sx={{
              position: "relative",
              fontWeight: 900,
              color: "#1f1f1f",
              fontSize: "clamp(0.95rem, 1.9vw, 1.5rem)",
              letterSpacing: { xs: 0.2, md: 0.6 },
              textTransform: "uppercase",
              textAlign: "center",
              width: "100%",
            }}
          >
            {item?.articulo || item?.nombre}
          </Typography>
        </Box>
      </Box>
    </>
  );
}

function LeftCard({
  item,
  money0,
  pctVsListaAbs,
  showExtra,
  onToggleExtra,
  isMichItem,
  allowCredit,
}) {
  const precioContado = Number(
    item?.contadoVenta || item?.precioPromocion || 0
  );
  const precioCredito = Number(
    item?.creditoVenta || item?.precioPromocion || 0
  );
  return (
    <Box
      sx={{
        bgcolor: "#F7F7F7",
        borderRadius: 6,
        p: { xs: 1.5, sm: 2, md: 3 },
        width: "100%",
        boxShadow: "0 12px 28px rgba(0,0,0,0.18)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
      }}
    >
      {/* Precio de lista */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "baseline",
          gap: 1,
        }}
      >
        <Typography
          sx={{
            color: "#2a2a2a",
            fontWeight: 400,
            fontSize: "clamp(1rem, 2.4vw, 1.875rem)",
          }}
        >
          Precio de lista
        </Typography>
        <Typography
          sx={{
            color: "#2a2a2a",
            fontWeight: 700,
            fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
            textDecoration: "line-through",
          }}
        >
          {money0(item?.precioLista || 0)}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          mt: 2,
          justifyContent: "space-between",
          flexDirection: "column",
          alignItems: "center",
          gap: { xs: 1.5, lg: 0 },
        }}
      >
        {/* CABECERA "PRECIO ESPECIAL" */}
        <Box
          sx={{
            position: "relative",
            minHeight: 92,
            mt: 1,
            transform: "scale(0.8)",
            transformOrigin: "top left",
          }}
        >
          <Box
            sx={{
              position: "relative",
              display: "inline-block",
              left: -24,
            }}
          >
            <Box
              sx={{
                bgcolor: "#F4B400",
                px: 8,
                pt: 0.55,
                pb: 1,
                borderBottomRightRadius: 4 * 8,
              }}
            >
              <Typography
                sx={{
                  fontWeight: 900,
                  fontStyle: "italic",
                  fontSize: { xs: 38, md: 46 },
                  letterSpacing: 1,
                  color: "#2b2b2b",
                  lineHeight: 1,
                }}
              >
                PRECIO
              </Typography>
            </Box>
            {/* triangulo amarillo al revez */}
            <Box
              sx={{
                bgcolor: "#F4B400",
                position: "absolute",
                top: 0,
                right: -8,
                width: 40,
                height: "75%",
                transform: "skewX(-30deg)",
              }}
            />

            <Box
              sx={{
                position: "absolute",
                left: 14,
                bottom: -24,
                bgcolor: "#2b2b2b",
                px: 3,
                py: 0.55,
                borderRadius: 2.2,
              }}
            >
              <Typography
                sx={{
                  fontWeight: 900,
                  fontStyle: "italic",
                  fontSize: { xs: 20, md: 24 },
                  letterSpacing: 2,
                  color: "#fff",
                  lineHeight: 1,
                }}
              >
                ESPECIAL
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 35.4 * 8,
              width: 80,
              height: 80,
              transform: "rotate(20deg)",
            }}
          >
            <Image
              src="/sale_2.png"
              alt="Descuento"
              height={90}
              width={90}
              style={{ objectFit: "contain" }}
            />
            <Typography
              sx={{
                position: "absolute",
                top: 12,
                left: 2 * 8,
                display: "flex",
                fontWeight: 900,
                color: "#fff",
                fontSize: 34,
                textShadow: "0 1px 2px rgba(0,0,0,0.55)",
                pt: 0.4,
              }}
            >
              {pctVsListaAbs(item?.precioPromocion)}
            </Typography>
          </Box>

          {/* “hilo” negro (curva) + etiqueta de % */}
          <Box
            sx={{
              position: "absolute",
              top: -20,
              left: 30 * 8,
              width: 120,
              height: 70,
              pointerEvents: "none",
            }}
          >
            <Box
              component="svg"
              viewBox="0 0 120 70"
              sx={{ width: "100%", height: "100%" }}
            >
              <path
                d="
                      M20,20
                      C 0,0  0,55  50,50
                    "
                stroke="#111"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Box>
          </Box>
        </Box>

        {/* PRECIO PRINCIPAL */}
        <Box
          sx={{
            textAlign: { xs: "center", md: "right" },
            pr: 2,
          }}
        >
          <Typography
            sx={{
              fontWeight: 900,
              color: "#2a2a2a",
              fontSize: isMichItem
                ? "clamp(4.8rem, 6vw, 4.5rem)"
                : "clamp(5.8rem, 7.4vw, 6rem)",
              lineHeight: 1,
            }}
          >
            {showExtra || !allowCredit
              ? money0(precioContado)
              : money0(precioCredito)}
          </Typography>
          <Typography
            sx={{
              color: "#2a2a2a",
              fontSize: "clamp(0.95rem, 2.1vw, 1.5rem)",
              lineHeight: 1,
            }}
          >
            DE CONTADO
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "end" }}>
        <Checkbox
          checked={showExtra}
          onChange={onToggleExtra}
          sx={{
            color: "#2b2b2b",
            "&.Mui-checked": {
              color: "#F4B400",
            },
            p: 0,
          }}
        />
      </Box>
    </Box>
  );
}

function RightArea({ item, imagesObj, imageIdx, onNextImage, branchStocks }) {
  return (
    <Box
      sx={{
        mt: { xs: -2, md: 0 },
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        px: { xs: 0.5, md: 0.5 },
        width: { xs: "100%", md: 350 },
        maxWidth: { xs: "100%", md: 350 },
        position: "relative",
      }}
    >
      {/* Llanta */}
      <ItemModalImage
        articulo={item?.articulo}
        imagesObj={imagesObj}
        imageIdx={imageIdx}
        onNextImage={onNextImage}
      />

      <Box sx={{ position: "relative", zIndex: 1 }}>
        <BranchStocks branchStocks={branchStocks} />
      </Box>
    </Box>
  );
}

export default function ItemModal({
  open,
  item,
  onClose,
  curRole = 0,
  allowCredit = true,
}) {
  const [imageIdx, setImageIdx] = useState(0);
  const [imagesObj, setImagesObj] = useState();
  const [showExtra, setShowExtra] = useState(false);

  useEffect(() => {
    if (open) {
      setImageIdx(0);
      setImagesObj();
      setShowExtra(false); // <- agrega esto
    }
  }, [open]);

  useEffect(() => {
    async function fetchImg() {
      try {
        const response = await api(
          `/api/images/preview-image?articulo=${item.articulo}&marca=${item.marca}`
        );
        if (!response.ok) throw new Error("Error al obtener imagen");
        const data = await response.json();
        setImagesObj(data);
      } catch (error) {
        console.error("Error al obtener imagen:", error);
      }
    }
    if (item && item?.articulo && !item.img) fetchImg();
  }, [item]);

  if (!item) return null;

  const branchStocks = buildBranchStocks(item);

  const isMichItem = isMich(item);
  const pl = Number(item?.precioLista || 0);
  const money0 = (v) => currencyFormatter(Number(v || 0), isMichItem ? 2 : 0);

  // % vs lista como positivo (sin signo)
  const pctVsListaAbs = (precio) => {
    const p = Number(precio || 0);
    if (!pl || !p) return "";
    const pct = ((pl - p) / pl) * 100;
    return `${Math.abs(Math.round(pct))}%`;
  };

  // % vs lista como firmado (+ cuando está arriba de lista)
  const pctVsListaSigned = (precio) => {
    const p = Number(precio || 0);
    if (!pl || !p) return "";
    const pct = ((pl - p) / pl) * 100;
    const n = Math.round(pct);
    if (n < 0) return `+${Math.abs(n)}%`;
    return `${Math.abs(n)}%`;
  };

  // const imagesArray = imagesObj?.images;
  // const imageToShow = Array.isArray(imagesArray)
  //   ? imagesArray[imageIdx % imagesArray.length]
  //   : imagesArray;

  const paymentLogos = [
    { src: "/mc.jpeg", alt: "Mastercard" },
    { src: "/visa.jpeg", alt: "Visa" },
    { src: "/marina.jpeg", alt: "La marina" },
    // { src: "/afirme.jpeg", alt: "Afirme" },
    // { src: "/bbva.jpeg", alt: "BBVA" },
    // { src: "/banamex.jpeg", alt: "Banamex" },
  ];

  return (
    <ItemModalFrame
      open={open}
      onClose={onClose}
      boxSx={{
        p: { xs: 1.5, sm: 2, md: 3 },
        borderRadius: { xs: 3, md: 8 },
        overflow: "hidden",
        width: {
          xs: "calc(100vw - 16px)",
          sm: "calc(100vw - 32px)",
          md: "95vw",
        },
        maxWidth: 1180,
        maxHeight: { xs: "100vh", sm: "calc(100vh - 32px)" },
        overflowY: "auto",
      }}
    >
      <Box sx={{ width: "100%" }}>
        <HeaderSection item={item} />

        {/* --------------------- CUERPO --------------------- */}
        <Box
          sx={{
            display: { xs: "block", md: "grid" },
            gridTemplateColumns: { lg: "3fr 2fr" },
            gridTemplateColumns: { md: "2fr 1fr" },
            columnGap: { md: 3 },
            rowGap: { xs: 2, md: 0 },
            pt: { xs: 0.8, md: 1 },
            minHeight: { xs: "auto", md: 530 },
          }}
        >
          {/* ----------- CARD IZQUIERDA (blanca) ----------- */}
          <LeftCard
            item={item}
            money0={money0}
            pctVsListaAbs={pctVsListaAbs}
            pctVsListaSigned={pctVsListaSigned}
            paymentLogos={paymentLogos}
            showExtra={showExtra}
            onToggleExtra={(e) => {
              e.stopPropagation();
              setShowExtra(e.target.checked);
            }}
            curRole={curRole}
            isMichItem={isMichItem}
            allowCredit={allowCredit}
          />

          {/* ----------- ÁREA DERECHA (sin “card”, como la referencia) ----------- */}
          <RightArea
            item={item}
            money0={money0}
            imagesObj={imagesObj}
            imageIdx={imageIdx}
            onNextImage={() => setImageIdx((i) => i + 1)}
            branchStocks={branchStocks}
          />
        </Box>
      </Box>
      <LegendBox item={item} />
    </ItemModalFrame>
  );
}
