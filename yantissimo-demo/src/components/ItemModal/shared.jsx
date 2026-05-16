"use client";
import React from "react";
import { Modal, Box, Typography, IconButton } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SaveIcon from "@mui/icons-material/Save";
import { BRANCH_LABELS } from "~/utils/global.js";
import UnoptimizedImage from "~/resources/UnoptimizedImage.jsx";
import { saveDefaultIMG } from "./saveDefaultIMG.js";
import { currencyFormatter, round10, round2 } from "~/utils/formaters.js";

export const getValue = (item, keys) => {
  for (const k of keys) {
    const v = item[k];
    if (v !== undefined && v !== null) return v;
  }
  return null;
};

const labelForBranch = (key) => BRANCH_LABELS[key] || String(key).toUpperCase();

const getAlmacenesFromItem = (it) => {
  if (it && typeof it.almacenes === "object" && it.almacenes !== null) {
    return it.almacenes;
  }
  const acc = {};
  Object.keys(BRANCH_LABELS).forEach((k) => {
    if (typeof it?.[k] === "number") acc[k] = it[k];
  });
  return acc;
};

export const buildBranchStocks = (item) =>
  Object.entries(getAlmacenesFromItem(item))
    .filter(([, val]) => typeof val === "number" && val > 0)
    .map(([key, val]) => [labelForBranch(key), val]);

export const ItemModalFrame = ({ open, onClose, boxSx, children }) => (
  <Modal open={open} onClose={onClose}>
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        bgcolor: "background.paper",
        p: 0,
        borderRadius: 2,
        overflow: "hidden",
        ...boxSx,
      }}
    >
      {children}
    </Box>
  </Modal>
);

export const ItemModalHeader = ({ item, showExtra, onToggleExtra }) => (
  <Box
    sx={{
      bgcolor: "#FFC107",
      px: { xs: 2, md: 4 },
      py: { xs: 1.2, md: 1.4 },
      textAlign: "center",
    }}
  >
    <Typography
      variant="h6"
      sx={{
        fontWeight: 800,
        letterSpacing: 1,
        color: "#1f1f1f",
        textTransform: "uppercase",
      }}
    >
      {item?.articulo || item?.nombre}
    </Typography>
    {(item?.proveedor || item?.disponibilidad?.tiempo) && (
      <Typography
        variant="body2"
        sx={{ mt: 0.5, color: "#333", fontWeight: 500 }}
      >
        {item?.proveedor}
        {item?.disponibilidad?.tiempo
          ? ` · Entrega: ${String(item?.disponibilidad?.tiempo)}`
          : ""}
      </Typography>
    )}
    <IconButton
      size="small"
      onClick={onToggleExtra}
      sx={{ position: "absolute", right: 24, top: 24 }}
    >
      <ExpandMoreIcon
        sx={{
          transform: showExtra ? "rotate(0deg)" : "rotate(90deg)",
        }}
      />
    </IconButton>
  </Box>
);

export const BranchStocks = ({ branchStocks }) => {
  if (!branchStocks.length) return null;
  return (
    <Box sx={{ display: "flex", justifyContent: "flex-end", pr: 0.4, gap: 1 }}>
      {branchStocks.map(([label, val]) => (
        <Typography
          key={label}
          sx={{ color: "#777", fontWeight: 900, fontSize: 16 }}
        >
          {label}: {val}
        </Typography>
      ))}
    </Box>
  );
};

const getGoogleImageSearchUrl = (articulo) =>
  `https://www.google.es/search?hl=es&tbm=isch&q=${encodeURIComponent(
    articulo
  )}`;

export const ItemModalImage = ({
  articulo,
  imagesObj,
  imageIdx = 0,
  onNextImage,
}) => {
  const imagesArray = imagesObj?.images;
  const imageToShow = Array.isArray(imagesArray)
    ? imagesArray[imageIdx % imagesArray.length]
    : imagesArray;
  return (
    <Box
      sx={{
        position: "relative",
        left: 0,
        right: 0,
        top: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // pointerEvents: "none",
      }}
    >
      <a href={getGoogleImageSearchUrl(articulo) || "#"}>
        <UnoptimizedImage
          height={400}
          width={300}
          alt="Llanta"
          src={imageToShow || "/wheel.png"}
          style={{ objectFit: "cover" }}
        />
        {onNextImage && (
          <IconButton
            size="small"
            sx={{
              position: "absolute",
              bottom: 220,
              right: 0,
              color: "rgba(255, 255, 255, 0.7)",
              ":hover": { color: "#555" },
              borderRadius: "50%",
              transform: "rotate(-90deg)",
            }}
            onClick={(e) => {
              e.preventDefault();
              onNextImage();
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
        )}
        <SaveIcon
          size="small"
          sx={{
            position: "absolute",
            p: 0.5,
            bottom: 180,
            right: 0,
            color: "rgba(255, 255, 255, 0.7)",
            ":hover": { color: "#555" },
            borderRadius: "50%",
          }}
          onClick={(e) => {
            e.preventDefault();
            saveDefaultIMG(imageToShow, articulo);
          }}
        >
          <ExpandMoreIcon />
        </SaveIcon>
      </a>
    </Box>
  );
};

export const PricePillGrid = ({
  labels,
  values,
  columns,
  barSx,
  labelSx,
  highlightSx,
  valuesSx,
}) => {
  const colCount = columns || labels.length;
  return (
    <>
      <Box
        sx={{
          mt: 4,
          bgcolor: "#2B2B2B",
          borderRadius: 999,
          display: "grid",
          gridTemplateColumns: `repeat(${colCount}, 1fr)`,
          px: 2,
          py: 1,
          gap: 2,
          ...barSx,
        }}
      >
        {labels.map((label, idx) => (
          <Typography
            key={`${label.text}-${idx}`}
            sx={{
              color: "#fff",
              fontWeight: 900,
              textAlign: "center",
              ...labelSx,
              ...(label.isHighlight ? highlightSx : {}),
            }}
          >
            {label.isHighlight && label.highlightText
              ? label.highlightText
              : label.text}
          </Typography>
        ))}
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${colCount}, 1fr)`,
          gap: 2,
          mt: 1.2,
          ml: 1.2,
          alignItems: "end",
          ...valuesSx,
        }}
      >
        {values.map((node, idx) => (
          <Box key={`value-${idx}`}>{node}</Box>
        ))}
      </Box>
    </>
  );
};

export const isMich = (item) => {
  const brand = String(item?.marca || "").toUpperCase();
  const isMich = ["MICHELIN", "BFGOODRICH"].includes(brand);
  if (!isMich) return false;
  const nombreArticulo = String(item?.articulo || "").toUpperCase();
  if (nombreArticulo.includes("ADV")) {
    return false;
  }
  return isMich;
};

export const smartCF = (value, item, unRound = false, showDetail = false) => {
  // console.log("smartCF", value, unRound);
  if (isMich(item) || unRound) {
    return currencyFormatter(value, 2);
  } else if (showDetail) {
    const diffValue = round10(value) - value;
    return currencyFormatter(value, 2) + "+" + round2(diffValue);
  }
  return currencyFormatter(value);
};

export const calcDescuento = (
  precio,
  item,
  number = false,
  showDetail = false
) => {
  if (isNaN(precio) || precio === 0) return "";
  const precioLista = item?.precioLista;
  if (!precioLista || precioLista === 0) return 0;

  let res = round2(((precioLista - precio) / precioLista) * 100);
  if (!showDetail) {
    res = Math.round(res);
  }

  if (number) return res;
  return `${res}%`;
};
