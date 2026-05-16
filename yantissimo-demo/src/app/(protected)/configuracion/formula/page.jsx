"use client";
import React, { Suspense, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ButtonGroup,
  Button,
  Box,
  IconButton,
} from "@mui/material";
import {
  catalogs,
  RangosTab,
  RangosCaiTab,
  MontajeTab,
  PromosTab,
  PromosSkuTab,
  IncrementosTab,
} from "./components";
import { getUserProfile, ROLES } from "~/utils/session";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Header from "~/components/header";

const FormulaPage = () => {
  const [profile, setProfile] = useState(null);

  React.useEffect(() => {
    try {
      const p = getUserProfile();
      setProfile(p || null);
    } catch (_e) {
      setProfile(null);
    }
  }, []);

  const curRole = profile?.role ?? null;

  return (
    <Box>
      <Header
        title="Fórmulas de precios"
        startIcon={
          <IconButton
            variant="outlined"
            color="error"
            onClick={() => (window.location.href = "/configuracion")}
          >
            <ArrowBackIcon />
          </IconButton>
        }
      />
      <Box sx={{ borderBottom: 1, borderColor: "#FFC600", mb: 2 }} />
      {curRole >= ROLES.MARKETING && (
        <Suspense fallback={null}>
          <FormulaTabs />
        </Suspense>
      )}
    </Box>
  );
};

export default FormulaPage;

// Evita intentos de prerender/SSG que causan bailouts por hooks de cliente
export const dynamic = "force-dynamic";

// Subcomponente que maneja tabs + search params dentro de un Suspense boundary
const FormulaTabs = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const validKeys = useMemo(() => new Set(catalogs.map((c) => c.key)), []);
  const initialTab = useMemo(() => {
    const q = searchParams?.get("tab");
    return q && validKeys.has(q) ? q : catalogs[0].key;
  }, [searchParams, validKeys]);

  const [tabKey, setTabKey] = useState(initialTab);

  const TabComponents = {
    rangos: RangosTab,
    "rangos-cai": RangosCaiTab,
    montaje: MontajeTab,
    promos: PromosTab,
    promos2: PromosSkuTab,
    incrementos: IncrementosTab,
  };
  const TabContent = TabComponents[tabKey];

  React.useEffect(() => {
    const q = searchParams?.get("tab");
    if (q && validKeys.has(q) && q !== tabKey) {
      setTabKey(q);
      return;
    }
    if (q && !validKeys.has(q)) {
      const params = new URLSearchParams(searchParams?.toString());
      params.set("tab", tabKey);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      return;
    }
    if (!q) {
      const params = new URLSearchParams(searchParams?.toString());
      params.set("tab", tabKey);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, validKeys]);

  const selectTab = (key) => {
    setTabKey(key);
    const params = new URLSearchParams(searchParams?.toString());
    params.set("tab", key);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <ButtonGroup sx={{ mb: 2 }}>
        {catalogs.map((c) => (
          <Button
            key={c.key}
            variant={c.key === tabKey ? "contained" : "outlined"}
            onClick={() => selectTab(c.key)}
          >
            {c.label}
          </Button>
        ))}
      </ButtonGroup>
      <TabContent />
    </>
  );
};
