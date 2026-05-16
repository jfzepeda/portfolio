// src/app/(protected)/inventario/tables/GenericTable.jsx
import React, { useCallback, useEffect, useState } from "react";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableContainer,
  Paper,
  TableSortLabel,
  TableCell,
  IconButton,
  Box,
  Typography,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { currencyFormatter, mustHighlight } from "~/utils/formaters";
import { APP_COLOR_VARS } from "~/theme";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {
  isSelected as isItemStored,
  toggle as toggleStoredItem,
  setUnits as setStoredUnits,
  getAll as getStoredItems,
} from "~/lib/quickQuoteStorage.js";

const StyledTableCell = styled(TableCell)(() => ({
  whiteSpace: "nowrap",
  padding: 8,
  width: 60,
}));

const IdTableCell = styled(TableCell)(() => ({
  padding: 0,
  width: 80,
  minWidth: 80,
  maxWidth: 80,
}));

// columns: [{ key, label, component?: Component, sx?: {} }]
const GenericTable = ({
  items = [],
  columns = [],
  onRowClick,
  isItemSelected,
  sortColumn,
  sortOrder,
  onSort,
  currencyKeys = [],
  priceMultiplier = 1,
  preUnits = 0,
  onSelectionChange,
}) => {
  // Local quantities per item id for items not yet added
  const [localQty, setLocalQty] = useState({});
  // Force re-render when storage changes (e.g. via +/- buttons)
  const [, setStorageTick] = useState(0);
  useEffect(() => {
    const bump = () => setStorageTick((t) => t + 1);
    window.addEventListener("yssm:quickquote:changed", bump);
    return () => window.removeEventListener("yssm:quickquote:changed", bump);
  }, []);

  const getQty = useCallback(
    (item) => {
      const id = item?.id;
      if (id == null) return Math.max(0, Math.floor(Number(preUnits) || 0));
      const stored = getStoredItems()?.find((it) => it?.id === id);
      if (stored && Number(stored.units) > 0)
        return Math.floor(Number(stored.units));
      const q = localQty[id] ?? preUnits;
      return Math.max(0, Math.floor(Number(q) || 0));
    },
    [localQty, preUnits]
  );

  const incQty = useCallback(
    (item) => {
      const id = item?.id;
      if (id == null) return;
      if (isItemStored(id)) {
        const next = getQty(item) + 1;
        setStoredUnits(id, next);
        if (typeof onSelectionChange === "function") onSelectionChange();
      } else {
        const next = (getQty(item) || 0) + 1;
        // On first increment to 1, auto-add to cart
        if (next === 1) {
          toggleStoredItem(item, next);
          if (typeof onSelectionChange === "function") onSelectionChange();
        } else {
          setLocalQty((prev) => ({ ...prev, [id]: next }));
        }
      }
    },
    [getQty, onSelectionChange]
  );

  const decQty = useCallback(
    (item) => {
      const id = item?.id;
      if (id == null) return;
      const cur = getQty(item);
      const next = Math.max(0, cur - 1);
      if (isItemStored(id)) {
        setStoredUnits(id, next);
        if (typeof onSelectionChange === "function") onSelectionChange();
      } else {
        setLocalQty((prev) => ({ ...prev, [id]: next }));
      }
    },
    [getQty, onSelectionChange]
  );

  const isSelectedComputed = useCallback(
    (item) => {
      if (!item) return false;
      if (typeof isItemSelected === "function") return isItemSelected(item.id);
      return isItemStored(item.id);
    },
    [isItemSelected]
  );

  const handleToggle = useCallback(
    (item) => {
      const units = getQty(item);
      // Toggle using storage to honor per-row units
      toggleStoredItem(item, units);
      // Do not call onToggleSelect here to avoid double-toggling upstream
      if (typeof onSelectionChange === "function") onSelectionChange();
    },
    [getQty, onSelectionChange]
  );

  if (items.length === 0) {
    return (
      <Box
        sx={{
          width: "50%",
          height: "50%",
          pt: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          mx: "auto",
          "@keyframes floatIcon": {
            "0%, 100%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(-5px)" },
          },
        }}
      >
        <Box
          sx={{
            p: 8,
            border: `2px dashed ${APP_COLOR_VARS.neutral[300]}`,
            borderRadius: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
            textAlign: "center",
            "@keyframes floatIcon": {
              "0%, 100%": { transform: "translateY(0px)" },
              "50%": { transform: "translateY(-5px)" },
            },
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 600,
              color: APP_COLOR_VARS.contrast.main,
              letterSpacing: "0.01em",
            }}
          >
            Sin resultados
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: APP_COLOR_VARS.contrast.main,
              maxWidth: 400,
              lineHeight: 1.5,
            }}
          >
            Ajusta la búsqueda o intenta con otra medida, marca o rin.
          </Typography>
          <Box
            sx={{
              animation: "floatIcon 3s ease-in-out infinite",
              mt: 2,
              opacity: 0.7,
            }}
          >
            <svg
              width="80"
              height="80"
              viewBox="0 0 52 52"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="26"
                cy="26"
                r="23"
                stroke={APP_COLOR_VARS.contrast.main}
                strokeWidth="2.5"
              />
              <circle
                cx="26"
                cy="26"
                r="10"
                stroke={APP_COLOR_VARS.contrast.main}
                strokeWidth="2"
              />
              <circle
                cx="26"
                cy="26"
                r="3.5"
                fill={APP_COLOR_VARS.contrast.main}
              />
              {[0, 60, 120, 180, 240, 300].map((deg) => {
                const rad = (deg * Math.PI) / 180;
                const x1 = 26 + 10.5 * Math.cos(rad);
                const y1 = 26 + 10.5 * Math.sin(rad);
                const x2 = 26 + 22.5 * Math.cos(rad);
                const y2 = 26 + 22.5 * Math.sin(rad);
                return (
                  <line
                    key={deg}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={APP_COLOR_VARS.neutral[300]}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                );
              })}
            </svg>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ overflow: "auto", borderRadius: 2 }}>
      <Table stickyHeader sx={{ tableLayout: "fixed", width: "100%" }}>
        <TableHead>
          <TableRow
            sx={{
              "& .MuiTableCell-root": {
                backgroundColor: APP_COLOR_VARS.contrast.main,
              },
            }}
          >
            {[...columns.slice(1)].map(
              ({
                key,
                label,
                component: Component = StyledTableCell,
                sx: cellSx,
              }) => (
                <Component
                  key={key}
                  sortDirection={sortColumn === key ? sortOrder : false}
                  sx={{ cursor: "pointer", ...cellSx }}
                >
                  <TableSortLabel
                    active={sortColumn === key}
                    direction={sortOrder}
                    onClick={() => onSort(key)}
                  >
                    {label}
                  </TableSortLabel>
                </Component>
              )
            )}
            {columns[0] &&
              (() => {
                const {
                  key,
                  label,
                  component: Component = StyledTableCell,
                  sx: cellSx,
                } = columns[0];
                return (
                  <Component
                    key={key}
                    sortDirection={sortColumn === key ? sortOrder : false}
                    sx={{ cursor: "pointer", ...cellSx }}
                  >
                    <TableSortLabel
                      active={sortColumn === key}
                      direction={sortOrder}
                      onClick={() => onSort(key)}
                    >
                      {label}
                    </TableSortLabel>
                  </Component>
                );
              })()}
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow
              key={item.id}
              hover
              sx={{ cursor: "pointer", height: "43px" }}
              onClick={() => onRowClick && onRowClick(item)}
            >
              {[...columns.slice(1)].map(
                ({
                  key,
                  component: BodyComponent = StyledTableCell,
                  sx: cellBx,
                }) => (
                  <BodyComponent
                    sx={{
                      ...cellBx,
                      backgroundColor:
                        (key === "promo_2pz" &&
                          mustHighlight(item[key], item.precioContado, 2)) ||
                        (key === "promo_4pz" &&
                          mustHighlight(item[key], item.precioContado, 4))
                          ? "#ffff00"
                          : "inherit",
                    }}
                    key={key}
                  >
                    {(() => {
                      const mult = Number(priceMultiplier) || 1;
                      if (currencyKeys.includes(key)) {
                        return currencyFormatter(
                          (Number(item[key]) || 0) * mult
                        );
                      }
                      if (key === "precioLista") {
                        return currencyFormatter(Number(item[key]) || 0, 2);
                      }
                      if (key === "costo") {
                        return currencyFormatter(
                          (Number(item[key]) || 0) * 1.16,
                          2
                        );
                      }
                      return item[key];
                    })()}
                  </BodyComponent>
                )
              )}
              <IdTableCell>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      decQty(item);
                    }}
                    aria-label="disminuir"
                  >
                    -
                  </IconButton>
                  <Typography
                    variant="body2"
                    sx={{ width: 24, textAlign: "center" }}
                  >
                    {getQty(item)}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (getQty(item) === item.exis) return;
                      incQty(item);
                    }}
                    aria-label="aumentar"
                  >
                    +
                  </IconButton>
                  {isSelectedComputed(item) && (
                    <Tooltip title="Quitar">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggle(item);
                        }}
                      >
                        <DeleteOutlineIcon color="error" fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </IdTableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default GenericTable;
