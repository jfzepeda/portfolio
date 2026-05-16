"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import UnoptimizedImage from "~/resources/UnoptimizedImage.jsx";
import api, { post } from "~/lib/api";
import { modelos } from "./modelos.js";

import {
  Box,
  Chip,
  IconButton,
  Stack,
  Typography,
  Tooltip,
  CircularProgress,
  TextField,
  Button,
} from "@mui/material";

import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";

const getGoogleImageSearchUrl = (articulo) =>
  `https://www.google.es/search?hl=es&tbm=isch&q=${encodeURIComponent(
    articulo
  )}`;

function extractImages(imagesObj) {
  if (!imagesObj) return [];
  const candidates =
    imagesObj.images ?? imagesObj.results ?? imagesObj.data ?? imagesObj.urls;
  if (!candidates) return [];
  if (Array.isArray(candidates)) return candidates.filter(Boolean);
  return [candidates].filter(Boolean);
}

export async function saveDefaultIMG(imageUrl, articulo) {
  const model = window.prompt(
    `Confirme el nombre del modelo para guardar esta imagen:`,
    articulo || "N/A"
  );
  if (!model || !imageUrl) return;

  const response = await post("/api/inv/save-fav-image", { imageUrl, model });
  if (!response.ok) throw new Error("Error saving favorite image");

  window.showToast?.("Imagen guardada como predeterminada exitosamente.");
}

function TinderCard({
  articulo,
  imagesObj,
  imageIdx,
  onNextImage,
  onBackImage,
  onNextModel,
  onSaveDefault,
  loading,
  manualActive,
  manualUrl,
}) {
  const images = useMemo(() => extractImages(imagesObj), [imagesObj]);
  const hasImages = images.length > 0;
  const trimmedManualUrl = manualUrl?.trim();
  const currentImage = manualActive
    ? trimmedManualUrl
    : hasImages
    ? images[imageIdx % images.length]
    : "/wheel.png";

  const source = manualActive ? "manual" : imagesObj?.source || "unknown";
  const canSave = ((source === "web" && hasImages) || manualActive) && !loading;
  const imageCountLabel = manualActive
    ? "1/1"
    : hasImages
    ? `${(imageIdx % images.length) + 1}/${images.length}`
    : "0/0";

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 480,
        mx: "auto",
      }}
    >
      <Box
        sx={{
          position: "relative",
          borderRadius: 4,
          overflow: "hidden",
          bgcolor: "#0b0f1a",
          boxShadow: "0 18px 45px rgba(0,0,0,0.28)",
          border: "1px solid rgba(255,255,255,0.10)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.06) 45%, rgba(0,0,0,0.65) 100%)",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />

        <a
          href={getGoogleImageSearchUrl(articulo) || "#"}
          target="_blank"
          rel="noreferrer"
          style={{ display: "block" }}
        >
          <Box
            sx={{
              height: 620,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              mb: 10,
            }}
          >
            {loading ? (
              <CircularProgress />
            ) : (
              <Box
                sx={{
                  height: 480,
                  width: 480,
                  border: "1px solid rgba(255, 255, 255, 0.9)",
                }}
              >
                <UnoptimizedImage
                  height={480}
                  width={480}
                  alt="Llanta ilustrativa"
                  src={currentImage}
                  style={{ objectFit: "contain" }}
                />
              </Box>
            )}
          </Box>
        </a>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ position: "absolute", top: 12, left: 12, zIndex: 2 }}
        >
          <Chip
            size="small"
            label={source}
            sx={{
              bgcolor: "rgba(255,255,255,0.14)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.18)",
            }}
          />
          <Chip
            size="small"
            label={imageCountLabel}
            sx={{
              bgcolor: "rgba(255,255,255,0.14)",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.18)",
            }}
          />
        </Stack>

        <Box
          sx={{
            position: "absolute",
            bottom: 14,
            left: 14,
            right: 14,
            zIndex: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "#fff",
              fontWeight: 700,
              textShadow: "0 2px 12px rgba(0,0,0,0.45)",
              mb: 1,
              lineHeight: 1.1,
            }}
          >
            {articulo}
          </Typography>

          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            sx={{ mt: 1 }}
          >
            <Tooltip title="← Siguiente modelo (sin guardar)">
              <span>
                <IconButton
                  onClick={onNextModel}
                  disabled={loading}
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: "rgba(255,255,255,0.10)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    backdropFilter: "blur(8px)",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.18)" },
                  }}
                >
                  <DeleteIcon sx={{ color: "#fff" }} />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Enter: Guardar como default">
              <span>
                <IconButton
                  onClick={onSaveDefault}
                  disabled={!canSave}
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: canSave
                      ? "rgba(255,255,255,0.18)"
                      : "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    backdropFilter: "blur(8px)",
                    "&:hover": {
                      bgcolor: canSave
                        ? "rgba(255,255,255,0.26)"
                        : "rgba(255,255,255,0.08)",
                    },
                  }}
                >
                  <SaveIcon sx={{ color: "#fff" }} />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="← Siguiente modelo (sin guardar)">
              <span>
                <IconButton
                  onClick={onBackImage}
                  disabled={loading || manualActive}
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: "rgba(255,255,255,0.10)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    backdropFilter: "blur(8px)",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.18)" },
                  }}
                >
                  <ArrowBackIosNewIcon sx={{ color: "#fff" }} />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="→ Siguiente imagen">
              <span>
                <IconButton
                  onClick={onNextImage}
                  disabled={loading || !hasImages || manualActive}
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: "rgba(255,255,255,0.10)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    backdropFilter: "blur(8px)",
                    "&:hover": { bgcolor: "rgba(255,255,255,0.18)" },
                  }}
                >
                  <ArrowForwardIosIcon sx={{ color: "#fff" }} />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

export default function Tinder() {
  const [modelIdx, setModelIdx] = useState(0);
  const [imageIdx, setImageIdx] = useState(0);
  const [imagesObj, setImagesObj] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jumpIdx, setJumpIdx] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const [useManual, setUseManual] = useState(false);

  const articulo = modelos[modelIdx];
  const trimmedManualUrl = manualUrl.trim();
  const manualActive = useManual && Boolean(trimmedManualUrl);

  const fetchImg = useCallback(async () => {
    setLoading(true);
    setImagesObj(null);
    try {
      const response = await api(
        `/api/images/preview-image?searchTerm=${encodeURIComponent(articulo)}`
      );
      if (!response.ok) throw new Error("Error al obtener imagen");
      const data = await response.json();
      setImagesObj(data);
      setImageIdx(0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [articulo]);

  useEffect(() => {
    fetchImg();
  }, [fetchImg]);

  useEffect(() => {
    setUseManual(false);
    setManualUrl("");
  }, [articulo]);

  const images = useMemo(() => extractImages(imagesObj), [imagesObj]);

  const nextImage = useCallback(() => {
    if (!images.length || manualActive) return;
    setImageIdx((i) => (i + 1) % images.length);
  }, [images.length, manualActive]);

  const backImage = useCallback(() => {
    if (!images.length || manualActive) return;
    setImageIdx((i) => (i - 1 + images.length) % images.length);
  }, [images.length, manualActive]);

  const nextModel = useCallback(() => {
    setModelIdx((i) => (i + 1) % modelos.length);
    // imageIdx se resetea cuando llegue fetchImg()
  }, []);

  const saveDefault = useCallback(async () => {
    const current = manualActive
      ? trimmedManualUrl
      : images.length
      ? images[imageIdx % images.length]
      : null;
    if (!current) return;
    try {
      await saveDefaultIMG(current, articulo);
    } catch (e) {
      console.error(e);
      window.showToast?.("No se pudo guardar la imagen.");
    }
  }, [images, imageIdx, articulo, manualActive, trimmedManualUrl]);

  const goToModel = useCallback(
    (rawValue) => {
      const parsed = Number.parseInt(rawValue, 10);
      if (!Number.isFinite(parsed)) return;
      const clamped =
        (((parsed - 1) % modelos.length) + modelos.length) % modelos.length;
      setModelIdx(clamped);
      setJumpIdx("");
    },
    [setModelIdx]
  );

  // Keyboard: ← modelo, → imagen, Enter guardar
  useEffect(() => {
    const onKeyDown = (e) => {
      const target = e.target;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;
      if (isTyping) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        nextImage();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        backImage();
      }
      if (e.key === "Enter") {
        e.preventDefault();
        saveDefault();
      }
      // boton de borrar del teclado
      if (e.code === "Space" || e.key === " ") {
        e.preventDefault();
        nextModel();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [nextImage, nextModel, saveDefault, backImage]);

  return (
    <Box sx={{ minHeight: "100dvh", px: 2, py: 3 }}>
      <Typography
        variant="h5"
        sx={{ textAlign: "center", fontWeight: 800, mb: 2 }}
      >
        Selector de imágenes (Tinder web)
      </Typography>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="center"
        sx={{ mb: 2 }}
      >
        <Typography
          variant="h6"
          sx={{ textAlign: "center", fontWeight: 300, mb: 2 }}
        >
          Modelo #{modelIdx + 1}
        </Typography>
        <TextField
          fullWidth
          sx={{ maxWidth: 200 }}
          size="small"
          value={jumpIdx}
          onChange={(e) => setJumpIdx(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              goToModel(jumpIdx);
            }
          }}
          placeholder={`Ir a # (1-${modelos.length})`}
        />
        <Button
          variant="contained"
          onClick={() => goToModel(jumpIdx)}
          disabled={!jumpIdx}
        >
          Ir
        </Button>
      </Stack>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="center"
        sx={{ mb: 2 }}
      >
        <TextField
          fullWidth
          size="small"
          value={manualUrl}
          onChange={(e) => setManualUrl(e.target.value)}
          placeholder="Pega URL de imagen manual"
        />
        <Button
          variant={manualActive ? "contained" : "outlined"}
          onClick={() => setUseManual(true)}
          disabled={!trimmedManualUrl}
        >
          Usar URL
        </Button>
        <Button
          variant="text"
          onClick={() => {
            setUseManual(false);
            setManualUrl("");
          }}
          disabled={!manualUrl}
        >
          Limpiar
        </Button>
      </Stack>

      <TinderCard
        articulo={articulo}
        imagesObj={imagesObj}
        imageIdx={imageIdx}
        onNextImage={nextImage}
        onBackImage={backImage}
        onNextModel={nextModel}
        onSaveDefault={saveDefault}
        loading={loading}
        manualActive={manualActive}
        manualUrl={manualUrl}
      />
    </Box>
  );
}
