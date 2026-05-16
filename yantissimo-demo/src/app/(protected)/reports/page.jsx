"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  IconButton,
  CircularProgress,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Header from "~/components/header";

const ReportsPage = () => {
  const [ads, setAds] = useState([
    {
      id: 1,
      file: null,
      preview: null,
      title: "Anuncio 1",
      isUploading: false,
      isUploaded: false,
    },
    {
      id: 2,
      file: null,
      preview: null,
      title: "Anuncio 2",
      isUploading: false,
      isUploaded: false,
    },
  ]);

  const handleFileChange = (id, e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const preview = URL.createObjectURL(file);

      setAds(
        ads.map((ad) =>
          ad.id === id ? { ...ad, file, preview, isUploaded: false } : ad
        )
      );
    }
  };

  const handleUpload = (id) => {
    // Simular proceso de carga
    setAds(ads.map((ad) => (ad.id === id ? { ...ad, isUploading: true } : ad)));

    // Simular finalización después de 2 segundos
    setTimeout(() => {
      setAds(
        ads.map((ad) =>
          ad.id === id ? { ...ad, isUploading: false, isUploaded: true } : ad
        )
      );
    }, 2000);
  };

  const handleDelete = (id) => {
    setAds(
      ads.map((ad) =>
        ad.id === id
          ? { ...ad, file: null, preview: null, isUploaded: false }
          : ad
      )
    );
  };

  return (
    <Box>
      <Header title="Subir Anuncios" />

      <Grid container spacing={3}>
        {ads.map((ad) => (
          <Grid item xs={12} sm={6} key={ad.id}>
            <Card sx={{ height: "100%" }}>
              {ad.preview ? (
                <CardMedia
                  component="img"
                  height="200"
                  image={ad.preview}
                  alt={`Vista previa ${ad.title}`}
                  sx={{ objectFit: "contain", bgcolor: "#f5f5f5" }}
                />
              ) : (
                <Box
                  sx={{
                    height: 200,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "#f5f5f5",
                  }}
                >
                  <Typography color="text.secondary">
                    Sin imagen seleccionada
                  </Typography>
                </Box>
              )}

              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {ad.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {ad.file
                    ? `Archivo: ${ad.file.name}`
                    : "Selecciona una imagen para el anuncio"}
                </Typography>
              </CardContent>

              <CardActions>
                <Button
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  variant="outlined"
                  sx={{ mr: 1 }}
                >
                  Seleccionar
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => handleFileChange(ad.id, e)}
                  />
                </Button>

                {ad.file && !ad.isUploaded && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleUpload(ad.id)}
                    disabled={ad.isUploading}
                    startIcon={
                      ad.isUploading ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : null
                    }
                  >
                    {ad.isUploading ? "Subiendo..." : "Subir"}
                  </Button>
                )}

                {ad.isUploaded && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    disabled
                  >
                    Subido
                  </Button>
                )}

                {ad.file && (
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(ad.id)}
                    sx={{ ml: "auto" }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ReportsPage;
