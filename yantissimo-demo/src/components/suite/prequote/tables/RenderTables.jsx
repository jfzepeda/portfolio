"use client";
import api from "~/lib/api.js";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Box } from "@mui/material";
import { keyframes } from "@emotion/react";

// Modular imports
import TableRouter from "./TableRouter.jsx";
import ItemModal from "~/components/ItemModal/Auto.jsx";
import ItemModalCAI from "~/components/ItemModal/CAI.jsx";
import ItemModalClientes from "~/components/ItemModal/AYC-clientes";
import ItemModalClientesCAI from "~/components/ItemModal/CAI-clientes";
import {
  isSelected as isItemStored,
  toggle as toggleStoredItem,
} from "~/lib/quickQuoteStorage.js";
import { ROLES } from "~/utils/session.js";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const RenderTables = ({
  searchTerm,
  profile,
  onSelectionChange,
  preselectedUnits = 1,
  priceMode = "default",
}) => {
  const curRole = profile?.role ?? null;
  const curSuc = profile?.sucursal ?? null;
  const authUser = (curRole ?? 0) >= ROLES.MYR_HELPER;
  const isClientView = (curRole ?? 0) <= ROLES.CLIENT_ADMIN;
  const showCredit = !isClientView || profile?.company?.only_ctdo === false;
  const margen = profile?.company?.margen ?? 0;
  const [rawData, setRawData] = useState([]);

  const [detailItem, setDetailItem] = useState(null);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [openDetailModalCAI, setOpenDetailModalCAI] = useState(false);
  const [openModalClientes, setOpenModalClientes] = useState(false);
  const [openModalCAIClientes, setOpenModalCAIClientes] = useState(false);

  const [sortColumn, setSortColumn] = useState("precioContado");
  const [sortOrder, setSortOrder] = useState("asc");
  const [animateResults, setAnimateResults] = useState(false);

  const triggerAnimation = useCallback(() => {
    setAnimateResults(false);
    requestAnimationFrame(() => setAnimateResults(true));
  }, []);

  const fetchQuotes = useCallback(
    async (signal, term) => {
      if (!term?.trim()) return;
      try {
        const endpoint = `/api/inv/search?searchTerm=${encodeURIComponent(
          term
        )}&sucursal=${curSuc || "todas"}`;
        const response = await api(endpoint, signal ? { signal } : undefined);

        if (!response.ok) {
          throw new Error("Error al obtener inventario");
        }
        const data = await response.json();
        // Reset the alt counts menu by default
        setRawData(data);
        triggerAnimation();
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error al cargar inventario:", error);
        }
      }
    },
    [curSuc, triggerAnimation]
  );

  useEffect(() => {
    const controller = new AbortController();
    const handler = setTimeout(() => {
      fetchQuotes(controller.signal, searchTerm);
    }, 500);
    return () => {
      clearTimeout(handler);
      controller.abort();
    };
  }, [fetchQuotes, searchTerm]);

  const handleSort = useCallback(
    (column) => {
      if (sortColumn !== column) {
        setSortColumn(column);
        setSortOrder("asc");
      } else if (sortOrder === "asc") {
        setSortOrder("desc");
      } else {
        setSortColumn("id");
        setSortOrder("asc");
      }
    },
    [sortColumn, sortOrder]
  );

  const processedData = useMemo(() => {
    const base = Array.isArray(rawData) ? rawData : [];
    const m = Number(margen) || 0;
    return base.map((item) => {
      const disponibilidadTiempo =
        item?.disponibilidad?.tiempo ??
        item?.disponibilidadTiempo ??
        item?.disponibilidad;
      const next = {
        ...item,
        "disponibilidad.tiempo": disponibilidadTiempo,
      };
      if (priceMode === "distContado") {
        next.selectionPrice = Number(
          item?.contadoDist ?? item?.contadoVenta ?? item?.precioContado ?? 0
        );
      }
      if (authUser) return next;
      return {
        ...next,
        contadoVenta: Number(item?.contadoDist ?? 0) * (1 + m / 100),
        creditoVenta: Number(item?.creditoDist ?? 0) * (1 + m / 100),
      };
    });
  }, [rawData, margen, authUser, priceMode]);

  const isCAITable = useMemo(() => {
    // Cuenta si hay más items con categoría "camion" que "auto" con defensas.
    // 1) Soporta categorías con acentos o variantes (camión/camion, auto/automóvil).
    // 2) Tolera datos vacíos o categorías faltantes.
    // 3) Evita accesos a propiedades undefined.

    if (!Array.isArray(processedData) || processedData.length === 0) {
      return false;
    }

    let camion = 0;
    let auto = 0;

    for (const item of processedData) {
      const raw = item && item.categoria ? String(item.categoria) : "";
      // Normaliza acentos: "camión" -> "camion"; también recorta y pasa a minúsculas
      const normalized = raw
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

      if (
        normalized === "camion" ||
        normalized === "camiones" ||
        normalized === "cai"
      ) {
        camion += 1;
      } else if (
        normalized === "auto" ||
        normalized === "autos" ||
        normalized === "automovil" ||
        normalized === "automoviles"
      ) {
        auto += 1;
      }
    }
    return camion > auto;
  }, [processedData]);

  const sortedItems = useMemo(() => {
    const data = Array.isArray(processedData) ? processedData : [];
    return data.slice().sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortOrder === "asc"
        ? String(aVal).localeCompare(String(bVal), undefined, { numeric: true })
        : String(bVal).localeCompare(String(aVal), undefined, {
            numeric: true,
          });
    });
  }, [processedData, sortColumn, sortOrder]);

  const handleDetailRowClick = useCallback(
    (item) => {
      setDetailItem({
        ...item,
        promo_2pz: item.promo_2pz || item.precioContado * 2,
        promo_4pz: item.promo_4pz || item.precioContado * 4,
        precioPromocion: item.precioPromocion || item.precioContado,
      });
      if (!authUser) {
        setDetailItem({
          ...item,
          contadoVenta: item.contadoDist * (1 + margen / 100),
          creditoVenta: item.creditoDist * (1 + margen / 100),
          precioPromocion: item.contadoDist * (1 + margen / 100),
        });
      }
      console.log("Detail item:", item);
      if (profile?.role >= ROLES.MYR_HELPER) {
        if (item.categoria === "camion") {
          setOpenDetailModalCAI(true);
        } else {
          setOpenDetailModal(true);
        }
      } else {
        if (item.categoria === "camion") {
          setOpenModalCAIClientes(true);
        } else {
          setOpenModalClientes(true);
        }
      }
    },
    [margen, authUser, profile]
  );

  const [_selectionVersion, setSelectionVersion] = useState(0);

  const isSelected = useCallback((id) => isItemStored(id), []);

  const handleToggleSelect = useCallback(
    (item) => {
      toggleStoredItem(item, preselectedUnits);
      setSelectionVersion((v) => v + 1);
      if (typeof onSelectionChange === "function") onSelectionChange();
    },
    [onSelectionChange, preselectedUnits]
  );
  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          animation: animateResults ? `${fadeIn} 200ms ease` : "none",
        }}
      >
        {(() => {
          const type = isCAITable ? "CAI" : authUser ? "INV" : "CLIENTES";
          return (
            <TableRouter
              type={type}
              profile={profile}
              items={sortedItems}
              onRowClick={handleDetailRowClick}
              isItemSelected={isSelected}
              onToggleSelect={handleToggleSelect}
              onSelectionChange={onSelectionChange}
              sortColumn={sortColumn}
              sortOrder={sortOrder}
              onSort={handleSort}
              headerColor={"#fff3e0"}
              priceMultiplier={preselectedUnits}
              showCredit={showCredit}
            />
          );
        })()}
      </Box>
      <ItemModal
        open={openDetailModal}
        item={detailItem}
        onClose={() => setOpenDetailModal(false)}
        curRole={curRole}
      />
      <ItemModalCAI
        open={openDetailModalCAI}
        item={detailItem}
        onClose={() => setOpenDetailModalCAI(false)}
        curRole={curRole}
      />
      <ItemModalClientes
        open={openModalClientes}
        item={detailItem}
        onClose={() => setOpenModalClientes(false)}
        curRole={curRole}
        allowCredit={showCredit}
      />
      <ItemModalClientesCAI
        open={openModalCAIClientes}
        item={detailItem}
        onClose={() => setOpenModalCAIClientes(false)}
        curRole={curRole}
        allowCredit={showCredit}
      />
    </>
  );
};

export default RenderTables;
