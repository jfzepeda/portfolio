"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
// MUI
import {
  AppBar,
  Box,
  ButtonGroup,
  Button,
  Divider,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import FileCopyIcon from "@mui/icons-material/FileCopy";

import { getUserProfile } from "~/utils/session.js";
import { useNavBack2 } from "~/utils/navigator";
import { ThemeProvider } from "@mui/material/styles";
import { useAppTheme } from "~/theme";
import EditQuoteDialog from "./components/EditQuoteDialog.jsx";

import fetchAndSetOrderItems from "~/lib/fetchOrder.js";
import duplicateQuote from "./functions/duplicateQuote.js";
import SaveSelection from "~/lib/saveItemsSelection";
import { updateStatus } from "~/lib/ordersApi.js";
import PreQuote from "./PreOrden/Page.jsx";
import CotiProvPage from "~/components/suite/cotiprov/CotiProvPage.jsx";
import QuotePage from "./Pedido/Page.jsx";
import InvoicePage from "./IFactura/Page.jsx";
import PagosPage from "./IPagos/Page.jsx";
import doctypes from "./components/doctypes.js";
import { QuickQuoteProvider } from "~/lib/QuickQuoteContext.jsx";
import DocSidebar from "~/components/suite/sidebar/DocSidebar.jsx";

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
  const doc = params?.doctype ?? "pre";

  const [activeDoc, setActiveDoc] = useState(doc); // controla overlays y vista
  useEffect(() => {
    setActiveDoc(doc);
  }, [doc]);

  const goToDoc = useCallback(
    (key) => {
      if (!key || key === doc) return;
      router.push(`/myr/pedidos/${cotId}/${key}`);
    },
    [router, cotId, doc]
  );

  const [quote, setOrder] = useState([]);
  const [editOpen, setEditOpen] = useState(false);

  // Cargar cotización por ID y poblar carrito
  useEffect(() => {
    (async () => {
      const quote = await fetchAndSetOrderItems(cotId);
      console.debug("Fetched order:", quote);
      setOrder(quote || []);
    })();
  }, [cotId]);

  const handleNavBack = useNavBack2();

  // Ancho dinámico del sidebar (autocolapso)
  // const [sidebarWidth, setSidebarWidth] = useState(220);
  const [sidebarWidth, setSidebarWidth] = useState(72); // colapsado
  useEffect(() => {
    const handler = (e) => {
      const w = e?.detail?.width;
      if (typeof w === "number") setSidebarWidth(w);
    };
    if (typeof window !== "undefined") {
      window.addEventListener("yssm:sidebar:width", handler);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("yssm:sidebar:width", handler);
      }
    };
  }, []);

  function appBarLegend(text) {
    return (
      <Typography variant="h6" sx={{ mr: 2 }}>
        {text}
      </Typography>
    );
  }

  const handleSave = useCallback(async () => {
    await SaveSelection(cotId, "/orders", {
      priceMode: "byClientType",
      clientType: quote?.client_type || "PUBLICO",
    });
    if (
      activeDoc === "preorder" &&
      String(quote?.type || "").toLowerCase() === "sentorder"
    ) {
      const nextType = await updateStatus({
        order_id: quote?.id,
        newType: "counteroffer",
      });
      if (nextType) {
        setOrder((prev) => ({ ...prev, type: nextType }));
      }
    }
  }, [cotId, quote, activeDoc]);

  const handleNextStep = async () => {
    const currentIndex = doctypes.findIndex((doc) => doc.key === activeDoc);
    if (currentIndex === 0) {
      handleSave();
    }
    if (currentIndex === doctypes.length - 1) return;
    const nextDoc = doctypes[currentIndex + 1]?.key;
    goToDoc(nextDoc);
  };

  const handleBackStep = async () => {
    const currentIndex = doctypes.findIndex((doc) => doc.key === activeDoc);
    if (currentIndex === 0) return;
    const nextDoc = doctypes[currentIndex - 1]?.key;
    goToDoc(nextDoc);
  };

  return (
    <ThemeProvider theme={theme}>
      <QuickQuoteProvider>
        <Box sx={{ display: "flex" }}>
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
                  flex: 2,
                }}
              >
                {appBarLegend(`${getLabelByKey(activeDoc)} ${cotId}`)}
                {appBarLegend(`Cliente: ${quote.client_name}`)}
                <IconButton
                  variant="outlined"
                  color="contrast"
                  size="small"
                  sx={{ mb: 0.3 }}
                  onClick={() => setEditOpen(true)}
                >
                  <ModeEditIcon />
                </IconButton>
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
                {/* Solo permitir cuando ya llegó a cotización */}
                <ButtonGroup>
                  <Button
                    variant="contained"
                    color="secondary"
                    size="small"
                    onClick={handleBackStep}
                  >
                    Atras
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={handleNextStep}
                  >
                    Siguiente
                  </Button>
                </ButtonGroup>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={handleSave}
                >
                  Guardar
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
          {activeDoc === "preorder" && (
            <PreQuote
              profile={profile}
              goToDoc={goToDoc}
              clearOnMount={false}
              cotId={cotId}
              quote={quote}
              setOrder={setOrder}
            />
          )}
          {activeDoc === "prov" && (
            <CotiProvPage
              cotId={cotId}
              quote={quote}
              saveSelectionPath="/orders"
            />
          )}
          {activeDoc === "sentorder" && (
            <QuotePage
              clearOnMount={false}
              cotId={cotId}
              quote={quote}
              profile={profile}
              setOrder={setOrder}
            />
          )}
          {activeDoc === "invoiced" && (
            <InvoicePage cotId={cotId} quote={quote} />
          )}
          {activeDoc === "payments" && (
            <PagosPage cotId={cotId} quote={quote} />
          )}
        </Box>
        {/* Sidebar verde */}
        <DocSidebar
          sx={{ flexGrow: 1 }}
          active={activeDoc}
          onSelect={goToDoc}
          handleNavBack={handleNavBack}
          doctypes={doctypes}
        />
        <EditQuoteDialog
          open={editOpen}
          onClose={() => setEditOpen(false)}
          initialData={quote}
          profile={profile}
          cotId={cotId}
          onUpdated={(updated) => setOrder((prev) => ({ ...prev, ...updated }))}
        />
      </QuickQuoteProvider>
    </ThemeProvider>
  );
}
