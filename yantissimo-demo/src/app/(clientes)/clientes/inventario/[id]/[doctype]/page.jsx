"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
// MUI
import {
  AppBar,
  Box,
  Button,
  Divider,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import { getUserProfile } from "~/utils/session.js";
import { ThemeProvider } from "@mui/material/styles";
import { useAppTheme } from "~/theme";

import fetchAndSetOrderItems from "~/lib/fetchOrder.js";
import duplicateQuote from "./functions/duplicateQuote.js";
import SaveSelection from "~/lib/saveItemsSelection";
import PreQuote from "./Carrito/Page.jsx";
import QuotePage from "./Cotizacion/Page.jsx";
import doctypes from "./components/doctypes.js";
import { QuickQuoteProvider } from "~/lib/QuickQuoteContext.jsx";
import { clear as clearItems } from "~/lib/quickQuoteStorage.js";
import { saveNewOrder } from "./functions/saveOrder.js";

// const PRIMARY_COLOR = theme.palette.primary.main;
export const docTypes = ["cartdraft", "sentorder"];

const getLabelByKey = (key) => {
  const item = doctypes.find((i) => i.key === key);
  return item ? item.label : null;
};

export default function ProductPage() {
  const theme = useAppTheme();
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    try {
      sessionStorage.removeItem("inventario:selectedItems");
      const p = getUserProfile();
      setProfile(p || null);
    } catch (_e) {
      setProfile(null);
    }
  }, []);

  const params = useParams();
  const router = useRouter();
  const cotId = params?.id ?? "nueva";
  const doc = params?.doctype ?? "cartdraft";

  const [activeDoc, setActiveDoc] = useState(doc); // controla overlays y vista
  useEffect(() => {
    setActiveDoc(doc);
  }, [doc]);

  const goToDoc = useCallback(
    (key) => {
      if (!key || key === doc) return;
      router.push(`/clientes/inventario/${cotId}/${key}`);
    },
    [router, cotId, doc]
  );

  const [quote, setQuote] = useState([]);

  // Cargar cotización por ID y poblar carrito
  useEffect(() => {
    (async () => {
      const quote = await fetchAndSetOrderItems(cotId);
      console.debug("Fetched quote:", quote);
      // Usar objeto vacío por defecto para mantener forma consistente
      setQuote(quote || {});
    })();
  }, [cotId]);

  // Ancho dinámico del sidebar (autocolapso)
  const [sidebarWidth, setSidebarWidth] = useState(72); // colapsado
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mobileQuery = window.matchMedia("(max-width:899.95px)");
    if (mobileQuery.matches) {
      setSidebarWidth(0);
      return;
    }

    let rafId = null;
    let retries = 0;
    let observer = null;

    const startObserver = () => {
      const drawerPaper = document.querySelector(
        ".MuiDrawer-root.MuiDrawer-docked .MuiDrawer-paper"
      );

      if (!drawerPaper) {
        if (retries < 120) {
          retries += 1;
          rafId = window.requestAnimationFrame(startObserver);
        }
        return;
      }

      const updateWidth = () => {
        const next = Math.round(drawerPaper.getBoundingClientRect().width || 0);
        if (next > 0) setSidebarWidth(next);
      };

      updateWidth();
      observer = new ResizeObserver(updateWidth);
      observer.observe(drawerPaper);
    };

    startObserver();

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      if (observer) observer.disconnect();
    };
  }, []);

  function appBarLegend(text) {
    return (
      <Typography variant="h6" sx={{ mr: 2, color: "#000" }}>
        {text}
      </Typography>
    );
  }

  const handleSave = async () => {
    if (!cotId || cotId === "nueva") {
      const saved = await saveNewOrder({
        userProfile: profile,
        quoteData: quote,
      });
      setQuote((prev) => ({ ...prev, ...saved }));
      await SaveSelection(saved?.id, "/orders", { priceMode: "distContado" });
      router.push(`/clientes/inventario/${saved.id}/cartdraft`);
    } else {
      await SaveSelection(cotId, "/orders", { priceMode: "distContado" });
      window.location.reload();
    }
  };

  const handleSaveAndExit = useCallback(async () => {
    if (!cotId || cotId === "nueva") {
      // confirmar salir sin guardar
      if (
        !confirm("Su pedido no ha sido guardado. ¿Deseas salir sin guardar?")
      ) {
        return;
      }
    } else {
      await SaveSelection(cotId, "/orders", { priceMode: "distContado" });
    }
    clearItems();
    router.push("/clientes/inventario/nueva/cartdraft");
  }, [cotId, router]);

  const handleSendOrder = async () => {
    if (!confirm("Estás a punto de enviar su pedido. ¿Deseas continuar?")) {
      return;
    }
    const currentIndex = docTypes.indexOf(activeDoc);
    if (currentIndex === 0) {
      if (!cotId || cotId === "nueva") {
        const saved = await saveNewOrder({
          userProfile: profile,
          quoteData: quote,
        });
        if (!saved?.id) return;
        setQuote((prev) => ({ ...prev, ...saved }));
        await SaveSelection(saved.id, "/orders", { priceMode: "distContado" });
        router.push(`/clientes/inventario/${saved.id}/sentorder`);
        return;
      } else {
        // Save WITHOUT reloading so goToDoc can navigate to sentorder
        await SaveSelection(cotId, "/orders", { priceMode: "distContado" });
      }
    }
    if (currentIndex === docTypes.length - 1) return;
    const nextDoc = docTypes[currentIndex + 1];
    if (cotId === "nueva") return;
    goToDoc(nextDoc);
  };

  // const handleBackStep = async () => {
  //   // get activedoc index on docTypes
  //   const currentIndex = docTypes.indexOf(activeDoc);
  //   if (currentIndex === 0) return; // actualicar clausula segun se agreguen docTypes
  //   // if last, do nothing
  //   const nextDoc = docTypes[currentIndex - 1];
  //   goToDoc(nextDoc);
  // };

  return (
    <ThemeProvider theme={theme}>
      <QuickQuoteProvider>
        <Box sx={{ display: "block", width: "100%" }}>
          {/* AppBar superior opcional */}
          <AppBar
            position="fixed"
            elevation={3}
            sx={{
              bgcolor: "#fff",
              left: `${sidebarWidth}px`,
              width: `calc(100% - ${sidebarWidth}px)`,
            }}
          >
            <Toolbar
              disableGutters
              sx={{
                px: 1,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  flex: 1,
                }}
              >
                {appBarLegend(`${getLabelByKey(activeDoc)} ${cotId}`)}
                {appBarLegend(
                  `Cliente: ${profile?.company?.company || profile?.username}`
                )}
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flex: 1,
                  justifyContent: "flex-end",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                {activeDoc === "cartdraft" && (
                  <>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={handleSave}
                    >
                      Guardar Pedido
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={handleSendOrder}
                    >
                      Enviar Pedido
                    </Button>
                  </>
                )}
                <Button
                  variant="contained"
                  color="contrast"
                  size="small"
                  onClick={handleSaveAndExit}
                >
                  Nueva
                </Button>
                <Divider orientation="vertical" flexItem sx={{ ml: 2 }} />
                <IconButton
                  variant="text"
                  size="medium"
                  color="contrast"
                  onClick={() => {
                    duplicateQuote({ quote_id: quote.id });
                  }}
                >
                  <FileCopyIcon />
                </IconButton>
              </Box>
            </Toolbar>
          </AppBar>
          {/* Contenido principal */}
          {activeDoc === "cartdraft" && (
            <PreQuote
              profile={profile}
              goToDoc={goToDoc}
              clearOnMount={false}
              cotId={cotId}
              quote={quote}
              setQuote={setQuote}
            />
          )}
          {activeDoc === "sentorder" && (
            <QuotePage
              clearOnMount={false}
              cotId={cotId}
              quote={quote}
              profile={profile}
            />
          )}
        </Box>
      </QuickQuoteProvider>
    </ThemeProvider>
  );
}
