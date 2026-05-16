"use client";

import {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Box, MenuItem, Paper, TextField, Typography } from "@mui/material";
import api from "~/lib/api";
import { fetchPromoBase, uploadLiquidaciones } from "./actions";
import {
  BASE_DATE_LABEL,
  BASE_DATE_SHORT_LABEL,
  BRANCH_OPTIONS,
  DEFAULT_PDF_LEGEND,
  DEFAULT_PDF_TITLE,
  PROMO_TRACKER_LOGO,
  PROMO_TRACKER_STYLE,
  PROVIDER_OPTIONS,
  TIER_OPTIONS,
} from "./data";
import {
  getMontajeValue,
  calcPrecio,
  calcPrecioPatio,
  calcPrecioFromLista,
  calcPatioPrecioFromLista,
  filterRows,
  fmt0,
  fmt2,
  getCoverageMeta,
  getMarginBucket,
  getMarginValue,
  getMichelinDiscount,
  getPatioMarginValue,
  getProgressMeta,
  getSoldPromo,
  isMichelin,
  parseBrand,
  sortRows,
} from "./utils";

const MARGIN_PRESETS = [10, 15, 20, 25, 30, 40, 50];
const MICHELIN_DISCOUNT_PRESETS = [5, 10, 15, 20, 25];
const LEVEL_CLASS = { 3: "nb3", 2: "nb2", 1: "nb1" };
const REPORT_LEVEL_CLASS = { 3: "rp-n3", 2: "rp-n2", 1: "rp-n1" };
const LEVEL_LABEL = {
  3: "Liquidación",
  2: "Oferta especial",
  1: "Promover",
};
const REPORT_LEVEL_LABEL = {
  3: "N3 Liquidación",
  2: "N2 Oferta",
  1: "N1 Promover",
};
const BULK_FILTER_OPTIONS = [
  { value: "visible", label: "Visibles (filtro actual)" },
  { value: "nivel-3", label: "N3 — Liquidación" },
  { value: "nivel-2", label: "N2 — Oferta especial" },
  { value: "nivel-1", label: "N1 — Promover" },
  { value: "prov-GOODYEAR", label: "Proveedor GOODYEAR" },
  { value: "prov-TBC", label: "Proveedor TBC" },
  { value: "prov-FORTE", label: "Proveedor FORTE" },
  { value: "tier-TIERE 1", label: "Tier 1" },
  { value: "tier-TIERE 2", label: "Tier 2" },
  { value: "tier-TIERE 3", label: "Tier 3" },
];
const REPORT_BUCKET_COLORS = {
  "≤15%": "var(--app-promo-high-bar)",
  "16-25%": "var(--app-promo-medium-bar)",
  "26-35%": "var(--app-promo-low-bar)",
  "≥36%": "var(--app-promo-sold-bar)",
};
const PROMO_TRACKER_LAYOUT_FIXES = `
@media screen{
.promo-shell{height:100dvh;display:flex;flex-direction:column;overflow:hidden}
.wrap{flex:1 1 auto;min-height:0;overflow:hidden;display:flex;flex-direction:column}
.layout{grid-template-columns:286px minmax(0,1fr)!important;flex:1 1 auto;min-height:0;align-items:stretch}
.layout > div:first-child{min-height:0;overflow:auto;overscroll-behavior:contain;padding-right:2px}
.layout > div:last-child{min-width:0;min-height:0}
.panel{min-width:0}
.tracker-panel{display:flex;flex-direction:column;min-height:0;overflow:hidden}
.tbl-wrap{max-width:100%;flex:1 1 auto;min-height:0;display:flex;flex-direction:column;overflow:hidden;border:1px solid var(--brd);border-radius:10px;background:var(--surf)}
.tbl-scroll{flex:1 1 auto;min-height:0;max-width:100%;overflow-x:auto;overflow-y:hidden;overscroll-behavior-x:contain;scrollbar-gutter:stable both-edges;-webkit-overflow-scrolling:touch}
.tbl-scroll::-webkit-scrollbar{width:12px;height:12px}
.tbl-scroll::-webkit-scrollbar-corner{background:var(--app-promo-shell-strong)}
.tbl-scroll::-webkit-scrollbar-track{background:var(--app-promo-shell-strong);border-top:1px solid var(--app-promo-chip-border)}
.tbl-scroll::-webkit-scrollbar-thumb{background:var(--app-neutral-400);border-radius:999px;border:2px solid var(--app-promo-shell-strong)}
.tbl-scroll::-webkit-scrollbar-thumb:hover{background:var(--app-text-secondary)}
.tbl-wrap table{min-width:1500px}
.tbl-wrap thead th{position:sticky;top:0;z-index:2;background:var(--app-promo-shell-strong)}
}
@media (max-width:900px){
.promo-shell{height:auto;overflow:visible}
.wrap{overflow:visible}
.layout{grid-template-columns:1fr!important}
.layout > div:first-child{overflow:visible;padding-right:0}
.tbl-wrap{max-height:70vh}
}
`;

function PromoLogo({ className }) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: PROMO_TRACKER_LOGO }}
    />
  );
}

function MultilineText({ text }) {
  return text.split("\n").map((line, index) => (
    <Fragment key={`${line}-${index}`}>
      {index > 0 ? <br /> : null}
      {line}
    </Fragment>
  ));
}

const MetricCard = memo(function MetricCard({ item }) {
  const clickable = Boolean(item.onClick);

  return (
    <Paper
      variant="outlined"
      onClick={item.onClick}
      title={item.title}
      sx={{
        p: 1.25,
        borderRadius: 2,
        borderColor: "var(--brd)",
        backgroundColor: "var(--surf)",
        cursor: clickable ? "pointer" : "default",
      }}
    >
      <Typography
        sx={{
          fontSize: 10,
          color: "var(--txt3)",
          textTransform: "uppercase",
          letterSpacing: 0.4,
          mb: 0.25,
        }}
      >
        {item.label}
      </Typography>
      <Typography
        sx={{
          fontSize: 18,
          fontWeight: 700,
            color:
              item.colorClass === "g"
              ? "var(--app-promo-sold)"
              : item.colorClass === "b"
              ? "var(--n1)"
              : item.colorClass === "r"
              ? "var(--n3)"
              : item.colorClass === "a"
              ? "var(--n2)"
              : "inherit",
        }}
      >
        {item.value}
      </Typography>
    </Paper>
  );
});

const ProgressBar = memo(function ProgressBar({ sold, base }) {
  const progress = getProgressMeta(sold, base);

  if (!progress) {
    return <span>—</span>;
  }

  return (
    <div className="prog" style={{ minWidth: 86 }}>
      <div className="prog-t">
        <div
          className="prog-f"
          style={{ width: `${progress.percent}%`, background: progress.color }}
        />
      </div>
      <span className="prog-l">{progress.percent}%</span>
    </div>
  );
});

const CoverageBar = memo(function CoverageBar({ months }) {
  const coverage = getCoverageMeta(months);

  return (
    <div className="cov" style={{ minWidth: 90 }}>
      <div className="cov-t">
        <div
          className="cov-f"
          style={{ width: `${coverage.percent}%`, background: coverage.color }}
        />
      </div>
      <span className="cov-l">{coverage.label}</span>
    </div>
  );
});

const LocationChips = memo(function LocationChips({
  locations,
  consignaLocations,
}) {
  const mainLocations = locations.split(" · ").filter(Boolean);
  const consigna = consignaLocations.split(" · ").filter(Boolean);

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {mainLocations.map((location) => (
          <span key={location} className="chip">
            {location}
          </span>
        ))}
      </div>
      {consigna.length > 0 ? (
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}
        >
          {consigna.map((location) => (
            <span key={location} className="chip-consigna">
              {location}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
});

const LevelBadge = memo(function LevelBadge({ level, soldOut = false }) {
  if (soldOut) {
    return <span className="nbadge nbok">✓ Agotado</span>;
  }

  return <span className={`nbadge ${LEVEL_CLASS[level] || ""}`}>N{level}</span>;
});

const TierBadge = memo(function TierBadge({ tier }) {
  return <span className="tp">{(tier || "").replace("TIERE ", "T")}</span>;
});

const MarginInput = memo(function MarginInput({
  value,
  color,
  background,
  onChange,
}) {
  const [draftValue, setDraftValue] = useState(String(value ?? ""));

  useEffect(() => {
    setDraftValue(String(value ?? ""));
  }, [value]);

  const commitValue = useCallback(() => {
    if (String(value ?? "") === draftValue) {
      return;
    }
    onChange(draftValue);
  }, [draftValue, onChange, value]);

  return (
    <div className="mc-in">
      <input
        value={draftValue}
        onChange={(event) => setDraftValue(event.target.value)}
        onBlur={commitValue}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          }
          if (event.key === "Escape") {
            setDraftValue(String(value ?? ""));
            event.currentTarget.blur();
          }
        }}
        type="number"
        min={0}
        max={200}
        step={1}
        style={{
          borderColor: color,
          backgroundColor: background,
          color: "var(--txt)",
        }}
      />
      <span style={{ color, fontWeight: 700 }}>%</span>
    </div>
  );
});

function SortableHeader(label, active, direction) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      {label}
      <span style={{ fontSize: 11, color: "var(--txt3)" }}>
        {active ? (direction === "asc" ? "↑" : "↓") : "↕"}
      </span>
    </span>
  );
}

const TrackerTableRow = memo(function TrackerTableRow({
  row,
  hasImportedInventory,
  onExclude,
  onMarginChange,
  onMichelinDiscountChange,
}) {
  return (
    <tr className={row.soldOut ? "agotado" : undefined}>
      <td>
        <button
          type="button"
          title="Excluir de la base"
          onClick={() => onExclude(row.desc)}
          style={{
            width: 22,
            height: 22,
            borderRadius: 4,
            border: "1px solid var(--app-border-muted)",
            background: "var(--app-promo-shell)",
            color: "var(--app-text-secondary)",
            cursor: "pointer",
            lineHeight: 1,
            fontSize: 14,
          }}
        >
          ×
        </button>
      </td>
      <td>
        <LevelBadge level={row.nivel} soldOut={row.soldOut} />
      </td>
      <td>{row.medida}</td>
      <td>
        <div className="marca">{row.marca}</div>
        <div className="modelo">{row.modelo}</div>
      </td>
      <td>
        <TierBadge tier={row.tier} />
      </td>
      <td className="r">{row.inv}</td>
      <td className="r">
        <span style={{ fontWeight: 700, color: "var(--n1)" }}>
          {row.inv_promo}
        </span>
      </td>
      <td className="r">
        {row.inv_consigna > 0 ? (
          <span className="chip-consigna">{row.inv_consigna}</span>
        ) : (
          "—"
        )}
      </td>
      <td className="r">
        {hasImportedInventory ? (
          <span
            style={{
              fontWeight: 700,
              color: row.soldOut ? "var(--app-promo-sold)" : "inherit",
            }}
          >
            {row.currentInventoryValue}
          </span>
        ) : (
          "—"
        )}
      </td>
      <td className="r">
        {hasImportedInventory ? (
          row.soldPromo > 0 ? (
            <span className="pos">-{row.soldPromo}</span>
          ) : (
            "0"
          )
        ) : (
          "—"
        )}
      </td>
      <td>
        <ProgressBar sold={row.soldPromo} base={row.inv_promo} />
      </td>
      <td className="r">{row.costo ? `$${fmt2(row.costo)}` : "s/c"}</td>
      <td>
        {row.isMichelinRow ? (
          <MarginInput
            value={row.michelinDiscount}
            color="var(--app-promo-high-bar)"
            background="var(--app-error-soft)"
            onChange={(value) => onMichelinDiscountChange(row.desc, value)}
          />
        ) : (
          <MarginInput
            value={row.mayoreoMargin}
            color="var(--n1)"
            background="var(--n1bg)"
            onChange={(value) => onMarginChange(row.desc, value, "mayoreo")}
          />
        )}
      </td>
      <td>
        {row.isMichelinRow ? (
          <span style={{ fontSize: 9, color: "var(--txt3)" }}>
            desc. lista
          </span>
        ) : (
          <MarginInput
            value={row.patioMargin}
            color="var(--app-promo-sold)"
            background="var(--app-promo-sold-soft)"
            onChange={(value) => onMarginChange(row.desc, value, "patio")}
          />
        )}
      </td>
      <td className="r">
        {row.mayoreoPrice ? `$${fmt0(row.mayoreoPrice.sinIVA)}` : "s/c"}
      </td>
      <td className="r">
        {row.mayoreoPrice ? (
          <>
            <div className="piva">{`$${row.mayoreoPrice.rounded.toLocaleString(
              "es-MX"
            )}`}</div>
            {row.isMichelinRow ? (
              <div className="psub">{`−${row.michelinDiscount}% lista`}</div>
            ) : (
              <div className="psub">{`mgn ${row.mayoreoMargin}%`}</div>
            )}
          </>
        ) : (
          "s/c"
        )}
      </td>
      <td className="r">
        {row.patioPrice ? (
          <>
            <div
              style={{
                fontWeight: 700,
                fontSize: 12,
                color: "var(--app-promo-sold)",
              }}
            >
              {`$${row.patioPrice.rounded.toLocaleString("es-MX")}`}
            </div>
            {row.isMichelinRow ? (
              <div className="psub">{`−${row.michelinDiscount}% lista`}</div>
            ) : (
              <div className="psub">{`mgn ${row.patioMargin}%`}</div>
            )}
          </>
        ) : (
          "s/c"
        )}
      </td>
      <td className="r">{row.montaje ? `$${row.montaje}` : "—"}</td>
      <td className="r">
        {row.estimatedRecovery !== null ? (
          <>
            <div className="piva">{`$${fmt0(row.estimatedRecovery)}`}</div>
            <div className="psub">{`${row.currentInventoryValue} uds`}</div>
          </>
        ) : (
          "—"
        )}
      </td>
      <td className="r">
        {row.realRecovery ? (
          <>
            <div className="recup">{`$${fmt0(row.realRecovery)}`}</div>
            <div className="recup-sub">{`${row.soldPromo} vendidas`}</div>
          </>
        ) : hasImportedInventory ? (
          "$0"
        ) : (
          "—"
        )}
      </td>
      <td>
        <CoverageBar months={row.ms} />
      </td>
      <td>
        <LocationChips
          locations={row.locs}
          consignaLocations={row.locs_consigna}
        />
      </td>
      <td>{row.prov}</td>
    </tr>
  );
});

export default function PromoTrackerPage() {
  const toastTimeoutRef = useRef(null);
  const trackerRowCacheRef = useRef(new Map());
  const [globalMargin, setGlobalMargin] = useState(20);
  const [globalMarginPatio, setGlobalMarginPatio] = useState(20);
  const [margins, setMargins] = useState({});
  const [marginsPatio, setMarginsPatio] = useState({});
  const [globalMichelinDiscount, setGlobalMichelinDiscount] = useState(10);
  const [michelinDiscounts, setMichelinDiscounts] = useState({});
  const [michelinListFactor, setMichelinListFactor] = useState(1.3);
  const [currentInventory, setCurrentInventory] = useState({});
  const [inventoryIds, setInventoryIds] = useState({});
  const [importDate, setImportDate] = useState(null);
  const [syncLabel, setSyncLabel] = useState(
    "Sin actualización en tiempo real"
  );
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [providerFilter, setProviderFilter] = useState("");
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState(1);
  const [isSyncingInventory, setIsSyncingInventory] = useState(false);
  const [isUploadingLiquidaciones, setIsUploadingLiquidaciones] =
    useState(false);
  const [base, setBase] = useState([]);

  useEffect(() => {
    fetchPromoBase().then(setBase).catch(() => {});
  }, []);

  const handleToggleSort = useCallback((column) => {
    setSortCol((previousColumn) => {
      if (previousColumn === column) {
        setSortDir((previousDir) => previousDir * -1);
        return previousColumn;
      }
      setSortDir(1);
      return column;
    });
  }, []);
  const [excluded, setExcluded] = useState([]);
  const [bulkType, setBulkType] = useState("ambos");
  const [bulkFilter, setBulkFilter] = useState("visible");
  const [bulkValue, setBulkValue] = useState(20);
  const [pdfTitle, setPdfTitle] = useState(DEFAULT_PDF_TITLE);
  const [pdfLegend, setPdfLegend] = useState(DEFAULT_PDF_LEGEND);
  const [pdfPriceMode, setPdfPriceMode] = useState("ambos");
  const [isPreparingPricePdf, setIsPreparingPricePdf] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const showToast = useCallback((message) => {
    setToastMessage(message);
    setToastVisible(true);
    window.clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastVisible(false);
    }, 3200);
  }, []);

  useEffect(() => {
    return () => {
      window.clearTimeout(toastTimeoutRef.current);
      document.body.classList.remove(
        "pdf-mode",
        "pdf-solo-mayoreo",
        "report-mode"
      );
    };
  }, []);

  const hasImportedInventory = Object.keys(currentInventory).length > 0;
  const excludedSet = useMemo(() => new Set(excluded), [excluded]);
  const headerSubtext = importDate
    ? `Base: ${BASE_DATE_SHORT_LABEL} · Actualizado: ${importDate}`
    : `Base: ${BASE_DATE_LABEL} · Sin sincronización en tiempo real`;

  const filteredRows = useMemo(() => {
    return filterRows(base, {
      excludedSet,
      tab,
      currentInventory,
      hasImportedInventory,
      tierFilter,
      providerFilter,
      branchFilter,
      search,
    });
  }, [
    base,
    excludedSet,
    tab,
    currentInventory,
    hasImportedInventory,
    tierFilter,
    providerFilter,
    branchFilter,
    search,
  ]);

  const levelCounts = useMemo(() => {
    return {
      1: base.filter((row) => row.nivel === 1).length,
      2: base.filter((row) => row.nivel === 2).length,
      3: base.filter((row) => row.nivel === 3).length,
    };
  }, [base]);

  const salesCountInScope = useMemo(() => {
    if (!hasImportedInventory) {
      return 0;
    }

    return filteredRows.filter((row) => getSoldPromo(row, currentInventory) > 0)
      .length;
  }, [filteredRows, hasImportedInventory, currentInventory]);

  const metrics = useMemo(() => {
    const totalBase = base.reduce((sum, row) => sum + row.inv, 0);
    const filteredBase = filteredRows.reduce((sum, row) => sum + row.inv, 0);

    let totalSold = 0;
    let soldOut = 0;
    if (hasImportedInventory) {
      totalSold = base.reduce((sum, row) => {
        return sum + getSoldPromo(row, currentInventory);
      }, 0);
      soldOut = base.filter((row) => {
        return (
          currentInventory[row.desc] !== undefined &&
          currentInventory[row.desc] <= 0
        );
      }).length;
    }

    let estimatedRecovery = 0;
    let realRecovery = 0;
    let inventoryCost = 0;

    filteredRows.forEach((row) => {
      const mayoreoMargin = getMarginValue(row.desc, margins, globalMargin);
      const price = calcPrecio(row.costo, mayoreoMargin);
      const current = hasImportedInventory
        ? currentInventory[row.desc] !== undefined
          ? currentInventory[row.desc]
          : row.inv
        : row.inv;
      const sold = hasImportedInventory
        ? Math.max(0, row.inv_promo - current)
        : 0;

      if (price) {
        estimatedRecovery += price.rounded * current;
        realRecovery += price.rounded * sold;
      }

      if (row.costo) {
        inventoryCost += row.costo * row.inv;
      }
    });

    return [
      { label: "SKUs visibles", value: filteredRows.length },
      {
        label: "Uds. base (filtro)",
        value: filteredBase.toLocaleString("es-MX"),
      },
      {
        label: "Vendidas (total)",
        value: hasImportedInventory ? totalSold.toLocaleString("es-MX") : "—",
        colorClass: hasImportedInventory ? "g" : "",
      },
      {
        label: "% avance global",
        value:
          hasImportedInventory && totalBase > 0
            ? `${((totalSold / totalBase) * 100).toFixed(1)}%`
            : "—",
        colorClass: hasImportedInventory ? "b" : "",
        onClick: hasImportedInventory
          ? () => {
              setTab("avance");
              window.scrollTo({ top: 300, behavior: "smooth" });
            }
          : undefined,
        title: hasImportedInventory ? "Ver SKUs con ventas" : undefined,
      },
      {
        label: "SKUs agotados",
        value: hasImportedInventory ? soldOut : "—",
        colorClass: hasImportedInventory && soldOut > 0 ? "g" : "",
        onClick: hasImportedInventory
          ? () => {
              setTab("avance");
              window.scrollTo({ top: 300, behavior: "smooth" });
            }
          : undefined,
        title: hasImportedInventory ? "Ver SKUs con ventas" : undefined,
      },
      {
        label: "Costo inv. (filtro)",
        value: `$${Math.round(inventoryCost / 1000)}k`,
      },
      {
        label: "Recup. estimada",
        value: `$${Math.round(estimatedRecovery / 1000)}k`,
        colorClass: "b",
      },
      {
        label: "Recup. real vendido",
        value:
          hasImportedInventory && realRecovery > 0
            ? `$${Math.round(realRecovery / 1000)}k`
            : "—",
        colorClass: hasImportedInventory && realRecovery > 0 ? "g" : "",
      },
    ];
  }, [
    base,
    filteredRows,
    hasImportedInventory,
    currentInventory,
    margins,
    globalMargin,
  ]);

  const trackerTableRows = useMemo(() => {
    const nextCache = new Map();

    const nextRows = filteredRows.map((row) => {
      const isMichelinRow = isMichelin(row);
      const mayoreoMargin = getMarginValue(row.desc, margins, globalMargin);
      const patioMargin = getPatioMarginValue(
        row.desc,
        marginsPatio,
        globalMarginPatio
      );
      const michelinDiscount = getMichelinDiscount(
        row.desc,
        michelinDiscounts,
        globalMichelinDiscount
      );
      const lista = isMichelinRow ? row.costo * michelinListFactor : null;
      const mayoreoPrice = isMichelinRow
        ? calcPrecioFromLista(lista, michelinDiscount)
        : calcPrecio(row.costo, mayoreoMargin);
      const patioPrice = isMichelinRow
        ? calcPatioPrecioFromLista(lista, row.medida, michelinDiscount)
        : calcPrecioPatio(row.costo, row.medida, patioMargin);
      const current = hasImportedInventory
        ? currentInventory[row.desc] !== undefined
          ? currentInventory[row.desc]
          : row.inv
        : row.inv;
      const sold = hasImportedInventory
        ? Math.max(0, row.inv_promo - current)
        : 0;
      const soldOut = hasImportedInventory && current <= 0;
      const { marca, modelo } = parseBrand(row.desc);
      const estimatedRecovery = mayoreoPrice
        ? mayoreoPrice.rounded * current
        : null;
      const realRecovery =
        mayoreoPrice && sold > 0 ? mayoreoPrice.rounded * sold : null;
      const montaje = getMontajeValue(row.medida);
      const previousRow = trackerRowCacheRef.current.get(row.desc);

      const inventoryId = inventoryIds[row.desc];

      const canReusePrevious =
        previousRow &&
        previousRow.__baseRow === row &&
        previousRow.marca === marca &&
        previousRow.modelo === modelo &&
        previousRow.mayoreoMargin === mayoreoMargin &&
        previousRow.patioMargin === patioMargin &&
        previousRow.michelinDiscount === michelinDiscount &&
        previousRow.lista === lista &&
        previousRow.currentInventoryValue === current &&
        previousRow.curInvSort === current &&
        previousRow.soldPromo === sold &&
        previousRow.soldOut === soldOut &&
        previousRow.estimatedRecovery === estimatedRecovery &&
        previousRow.realRecovery === realRecovery &&
        previousRow.montaje === montaje &&
        previousRow.inventoryId === inventoryId &&
        previousRow.mayoreoPrice?.sinIVA === mayoreoPrice?.sinIVA &&
        previousRow.mayoreoPrice?.rounded === mayoreoPrice?.rounded &&
        previousRow.patioPrice?.sinIVA === patioPrice?.sinIVA &&
        previousRow.patioPrice?.rounded === patioPrice?.rounded;

      if (canReusePrevious) {
        nextCache.set(row.desc, previousRow);
        return previousRow;
      }

      const nextRow = {
        ...row,
        __baseRow: row,
        marca,
        modelo,
        isMichelinRow,
        mayoreoMargin,
        patioMargin,
        michelinDiscount,
        lista,
        mayoreoPrice,
        patioPrice,
        currentInventoryValue: current,
        curInvSort: current,
        soldPromo: sold,
        soldOut,
        estimatedRecovery,
        realRecovery,
        montaje,
        inventoryId,
      };

      nextCache.set(row.desc, nextRow);
      return nextRow;
    });

    trackerRowCacheRef.current = nextCache;

    return nextRows;
  }, [
    filteredRows,
    margins,
    globalMargin,
    marginsPatio,
    globalMarginPatio,
    globalMichelinDiscount,
    michelinDiscounts,
    michelinListFactor,
    hasImportedInventory,
    currentInventory,
    inventoryIds,
  ]);

  const sortedTrackerRows = useMemo(
    () => sortRows(trackerTableRows, sortCol, sortDir, currentInventory),
    [trackerTableRows, sortCol, sortDir, currentInventory]
  );

  const tableTotals = useMemo(() => {
    const totalInventory = filteredRows.reduce((sum, row) => sum + row.inv, 0);
    const totalSold = hasImportedInventory
      ? filteredRows.reduce(
          (sum, row) => sum + getSoldPromo(row, currentInventory),
          0
        )
      : 0;
    let estimatedRecovery = 0;
    let realRecovery = 0;
    let totalCost = 0;

    filteredRows.forEach((row) => {
      const mayoreoMargin = getMarginValue(row.desc, margins, globalMargin);
      const price = calcPrecio(row.costo, mayoreoMargin);
      const current =
        currentInventory[row.desc] !== undefined
          ? currentInventory[row.desc]
          : row.inv;
      const sold = Math.max(0, row.inv - current);

      if (price) {
        estimatedRecovery += price.rounded * current;
        realRecovery += price.rounded * sold;
      }

      if (row.costo) {
        totalCost += row.costo * row.inv;
      }
    });

    return {
      rowCount: filteredRows.length,
      totalInventory,
      promoInventory: filteredRows.reduce((sum, row) => sum + row.inv_promo, 0),
      consignaInventory: filteredRows.reduce(
        (sum, row) => sum + row.inv_consigna,
        0
      ),
      currentInventory:
        hasImportedInventory && totalSold > 0
          ? (totalInventory - totalSold).toLocaleString("es-MX")
          : "—",
      totalSoldDisplay:
        hasImportedInventory && totalSold > 0
          ? totalSold.toLocaleString("es-MX")
          : "—",
      totalCost,
      estimatedRecovery,
      realRecovery,
    };
  }, [
    filteredRows,
    hasImportedInventory,
    currentInventory,
    margins,
    globalMargin,
  ]);

  const reportBar = useMemo(() => {
    if (tab !== "avance" || !hasImportedInventory) {
      return null;
    }

    const totalSold = filteredRows.reduce((sum, row) => {
      return sum + getSoldPromo(row, currentInventory);
    }, 0);

    const totalRemaining = filteredRows.reduce((sum, row) => {
      const current =
        currentInventory[row.desc] !== undefined
          ? currentInventory[row.desc]
          : row.inv_promo;
      return sum + current;
    }, 0);

    let recovered = 0;
    const marginBuckets = {};

    filteredRows.forEach((row) => {
      const mayoreoMargin = getMarginValue(row.desc, margins, globalMargin);
      const price = calcPrecio(row.costo, mayoreoMargin);
      const sold = getSoldPromo(row, currentInventory);

      if (price) {
        recovered += price.rounded * sold;
      }

      const bucket = getMarginBucket(mayoreoMargin);
      marginBuckets[bucket] = (marginBuckets[bucket] || 0) + sold;
    });

    const topBucket = Object.entries(marginBuckets).sort(
      (a, b) => b[1] - a[1]
    )[0];

    return {
      totalSold,
      totalRemaining,
      recovered,
      topBucket,
    };
  }, [
    tab,
    hasImportedInventory,
    filteredRows,
    currentInventory,
    margins,
    globalMargin,
  ]);

  const reportRows = useMemo(() => {
    if (!hasImportedInventory) {
      return [];
    }

    return [...filteredRows]
      .filter((row) => getSoldPromo(row, currentInventory) > 0)
      .sort((rowA, rowB) => {
        const soldA = getSoldPromo(rowA, currentInventory);
        const soldB = getSoldPromo(rowB, currentInventory);
        return rowB.nivel - rowA.nivel || soldB - soldA;
      });
  }, [filteredRows, hasImportedInventory, currentInventory]);

  const reportSummary = useMemo(() => {
    if (!hasImportedInventory) {
      return null;
    }

    let totalSold = 0;
    let totalBase = 0;
    let totalRemaining = 0;
    let recovered = 0;
    let potential = 0;
    const marginBuckets = {};

    reportRows.forEach((row) => {
      const current =
        currentInventory[row.desc] !== undefined
          ? currentInventory[row.desc]
          : row.inv_promo;
      const sold =
        currentInventory[row.desc] !== undefined
          ? Math.max(0, row.inv_promo - currentInventory[row.desc])
          : 0;
      const mayoreoMargin = getMarginValue(row.desc, margins, globalMargin);
      const price = calcPrecio(row.costo, mayoreoMargin);

      totalSold += sold;
      totalBase += row.inv_promo;
      totalRemaining += current;

      if (price) {
        recovered += price.rounded * sold;
        potential += price.rounded * current;
      }

      const bucket = getMarginBucket(mayoreoMargin);
      if (!marginBuckets[bucket]) {
        marginBuckets[bucket] = { sold: 0, skus: 0 };
      }
      marginBuckets[bucket].sold += sold;
      marginBuckets[bucket].skus += 1;
    });

    const progressPercentage =
      totalBase > 0 ? ((totalSold / totalBase) * 100).toFixed(1) : 0;
    const maxSold = Math.max(
      ...Object.values(marginBuckets).map((bucket) => bucket.sold),
      1
    );
    const generatedDate = new Date().toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return {
      totalSold,
      totalBase,
      totalRemaining,
      recovered,
      potential,
      progressPercentage,
      generatedDate,
      breakdown: Object.entries(marginBuckets)
        .sort((a, b) => b[1].sold - a[1].sold)
        .map(([bucket, data]) => ({
          bucket,
          sold: data.sold,
          skus: data.skus,
          width: `${((data.sold / maxSold) * 100).toFixed(0)}%`,
          color: REPORT_BUCKET_COLORS[bucket] || "var(--app-text-muted)",
        })),
    };
  }, [
    reportRows,
    hasImportedInventory,
    currentInventory,
    margins,
    globalMargin,
  ]);

  const pdfSummary = useMemo(() => {
    const unitsAvailable = filteredRows.reduce((sum, row) => {
      const current = hasImportedInventory
        ? currentInventory[row.desc] !== undefined
          ? currentInventory[row.desc]
          : row.inv
        : row.inv;
      return sum + current;
    }, 0);

    return {
      skuCount: filteredRows.length,
      unitsAvailable,
      exportDate: new Date().toLocaleDateString("es-MX", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };
  }, [filteredRows, hasImportedInventory, currentInventory]);

  const handleRealtimeSync = useCallback(async () => {
    const targetRows = Array.from(
      new Map(filteredRows.map((row) => [row.desc, row])).values()
    );

    const rowsWithId = targetRows.filter((row) => row.inventoryId);

    if (!rowsWithId.length) {
      showToast("No hay SKUs visibles para actualizar");
      return;
    }

    setIsSyncingInventory(true);
    setSyncLabel(`⏳ Actualizando ${rowsWithId.length} SKUs...`);

    try {
      const ids = rowsWithId.map((row) => row.inventoryId).join(",");
      const response = await api(`/api/liquidaciones/exis?ids=${ids}`);

      if (!response.ok) {
        throw new Error("Error al obtener existencias");
      }

      const items = await response.json();
      const byId = Object.fromEntries(items.map((item) => [item.id, item]));

      const inventoryUpdates = {};
      const inventoryIdsUpdates = {};
      let matchedCount = 0;

      rowsWithId.forEach((row) => {
        const item = byId[row.inventoryId];
        if (!item) return;
        const value = Number(item.exis);
        if (!Number.isFinite(value)) return;
        inventoryUpdates[row.desc] = Math.max(0, value);
        inventoryIdsUpdates[row.desc] = item.id;
        matchedCount += 1;
      });

      if (!matchedCount) {
        setSyncLabel("⚠ Sin coincidencias en tiempo real");
        showToast("No hubo coincidencias entre API y promo tracker");
        return;
      }

      setCurrentInventory((previous) => ({ ...previous, ...inventoryUpdates }));
      setInventoryIds((previous) => ({ ...previous, ...inventoryIdsUpdates }));

      const syncTimestamp = new Date().toLocaleString("es-MX", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      setImportDate(syncTimestamp);
      setSyncLabel(`✓ ${matchedCount}/${rowsWithId.length} SKUs actualizados`);
      showToast(`Actualizados: ${matchedCount} SKUs`);
    } catch {
      setSyncLabel("⚠ Error al actualizar");
      showToast("No se pudieron consultar existencias en este momento");
    } finally {
      setIsSyncingInventory(false);
    }
  }, [filteredRows, showToast]);

  const resetInventory = () => {
    setCurrentInventory({});
    setInventoryIds({});
    setImportDate(null);
    setSyncLabel("Sin actualización en tiempo real");
    showToast("Comparativo limpiado");
  };

  const resetMargins = () => {
    setMargins({});
    setMarginsPatio({});
    showToast("Márgenes individuales restaurados al global");
  };

  const handleMichelinDiscountChange = useCallback((description, value) => {
    if (value === "") {
      return;
    }
    const parsed = parseFloat(value);
    if (Number.isNaN(parsed) || parsed < 0) {
      return;
    }
    setMichelinDiscounts((previous) => ({
      ...previous,
      [description]: parsed,
    }));
  }, []);

  const resetMichelinDiscounts = () => {
    setMichelinDiscounts({});
    showToast("Descuentos Michelin individuales restaurados al global");
  };

  const handleUploadLiquidaciones = useCallback(async () => {
    setIsUploadingLiquidaciones(true);
    try {
      const result = await uploadLiquidaciones(trackerTableRows);
      if (result.empty) {
        showToast("No hay SKUs con precio para subir");
        return;
      }
      showToast(`${result.count} descuentos subidos correctamente`);
    } catch {
      showToast("Error al subir descuentos. Intenta de nuevo.");
    } finally {
      setIsUploadingLiquidaciones(false);
    }
  }, [trackerTableRows, showToast]);

  const handleMarginChange = useCallback((description, value, type) => {
    if (value === "") {
      return;
    }

    const parsed = parseFloat(value);
    if (Number.isNaN(parsed) || parsed < 0) {
      return;
    }

    if (type === "patio") {
      setMarginsPatio((previous) => ({
        ...previous,
        [description]: parsed,
      }));
    } else {
      setMargins((previous) => ({
        ...previous,
        [description]: parsed,
      }));
    }
  }, []);

  const handleBulkApply = () => {
    const margin = parseFloat(bulkValue);
    if (Number.isNaN(margin)) {
      return;
    }

    let targets;
    if (bulkFilter === "visible") {
      targets = filteredRows.map((row) => row.desc);
    } else {
      const [filterType, ...rest] = bulkFilter.split("-");
      const filterKey = rest.join("-");
      targets = base.filter((row) => {
        if (filterType === "nivel") {
          return row.nivel === parseInt(filterKey, 10);
        }
        if (filterType === "prov") {
          return row.prov === filterKey;
        }
        if (filterType === "tier") {
          return row.tier === filterKey;
        }
        return false;
      }).map((row) => row.desc);
    }

    const updates = Object.fromEntries(
      targets.map((description) => [description, margin])
    );

    if (bulkType === "mayoreo" || bulkType === "ambos") {
      setMargins((previous) => ({
        ...previous,
        ...updates,
      }));
    }

    if (bulkType === "patio" || bulkType === "ambos") {
      setMarginsPatio((previous) => ({
        ...previous,
        ...updates,
      }));
    }

    const bulkTypeLabel =
      bulkType === "ambos"
        ? "Ambos precios"
        : bulkType === "mayoreo"
        ? "Solo Mayoreo"
        : "Solo Patio";
    showToast(
      `Margen ${margin}% (${bulkTypeLabel}) aplicado a ${targets.length} SKUs`
    );
  };

  const handleExclude = useCallback(
    (description) => {
      setExcluded((previous) => {
        if (previous.includes(description)) {
          return previous;
        }
        return [...previous, description];
      });
      showToast(
        "SKU excluido de la base. Puedes restaurarlo en el panel izquierdo."
      );
    },
    [showToast]
  );

  const handleRestore = (description) => {
    setExcluded((previous) => previous.filter((item) => item !== description));
  };

  const handleRestoreAll = () => {
    setExcluded([]);
    showToast("Todos los SKUs restaurados");
  };

  const exportPricePdf = () => {
    setIsPreparingPricePdf(true);
    document.body.classList.add("pdf-mode");
    if (pdfPriceMode === "mayoreo") {
      document.body.classList.add("pdf-solo-mayoreo");
    }

    window.setTimeout(() => {
      window.print();
      window.setTimeout(() => {
        setIsPreparingPricePdf(false);
        document.body.classList.remove("pdf-mode", "pdf-solo-mayoreo");
      }, 800);
    }, 150);
  };

  const exportReport = () => {
    if (!hasImportedInventory) {
      showToast("Actualiza existencias primero");
      return;
    }

    if (!reportRows.length) {
      showToast("No hay SKUs con ventas para reportar");
      return;
    }

    document.body.classList.add("report-mode");
    window.setTimeout(() => {
      window.print();
      window.setTimeout(() => {
        document.body.classList.remove("report-mode");
      }, 600);
    }, 200);
  };

  return (
    <>
      <style jsx global>
        {PROMO_TRACKER_STYLE}
      </style>
      <style jsx global>
        {PROMO_TRACKER_LAYOUT_FIXES}
      </style>

      <div className="promo-shell">
        <header>
          <h1>
            Yantissimo S.A. de C.V. — Tracker Promoción · Inventario Atorado
          </h1>
          <div className="sub">{headerSubtext}</div>
        </header>

        <div>
          <div id="pdf-header">
            <PromoLogo className="pdf-logo" />
            <div className="pdf-promo-block">
              <div className="pdf-promo-title" id="pdf-titulo">
                {pdfTitle}
              </div>
              <div className="pdf-promo-sub" id="pdf-leyenda">
                <MultilineText text={pdfLegend} />
              </div>
              <div className="pdf-date" id="pdf-fecha">
                {`Fecha: ${pdfSummary.exportDate} · Precios sujetos a cambios sin previo aviso`}
              </div>
            </div>
          </div>

          <div id="pdf-resumen" className={isPreparingPricePdf ? "show" : ""}>
            <div className="pr-item">
              <div className="pr-l">Medidas disponibles</div>
              <div className="pr-v" id="pr-skus">
                {pdfSummary.skuCount}
              </div>
            </div>
            <div className="pr-item">
              <div className="pr-l">Piezas disponibles</div>
              <div className="pr-v" id="pr-uds">
                {`${pdfSummary.unitsAvailable.toLocaleString("es-MX")} pzas`}
              </div>
            </div>
            <div className="pr-item">
              <div className="pr-l">Vigencia</div>
              <div className="pr-v" style={{ fontSize: 11 }} id="pr-vig">
                Sujeto a existencias
              </div>
            </div>
            <div className="pr-item">
              <div className="pr-l">Precios incluyen IVA</div>
              <div className="pr-v" style={{ fontSize: 11 }}>
                16%
              </div>
            </div>
          </div>

          <div className="metrics" id="metrics">
            {metrics.map((item) => (
              <MetricCard key={item.label} item={item} />
            ))}
          </div>

          <div className="layout">
            <div
              style={{
                overflowY: "auto",
                overscrollBehavior: "contain",
                maxHeight: "calc(100dvh - 160px)",
              }}
            >
              <div className="panel">
                <div className="ptitle">Comparativo en tiempo real</div>
                <div className="infobox">
                  <b>¿Cómo funciona?</b>
                  <br />
                  Consulta la API de existencias solo para los SKUs visibles con
                  los filtros actuales. El tracker actualiza el comparativo y
                  calcula cuántas piezas se han vendido desde la base del 16 de
                  abril.
                </div>
                <div className="infobox" style={{ marginTop: -2 }}>
                  <b>Estado:</b>
                  <br />
                  {syncLabel}
                </div>
                <button className="btn" type="button" onClick={resetInventory}>
                  ↺ Limpiar comparativo
                </button>
                <button
                  className="btn dark"
                  type="button"
                  onClick={handleUploadLiquidaciones}
                  disabled={isUploadingLiquidaciones}
                  style={{
                    opacity: isUploadingLiquidaciones ? 0.75 : 1,
                    cursor: isUploadingLiquidaciones ? "wait" : "pointer",
                  }}
                >
                  {isUploadingLiquidaciones
                    ? "⏳ Subiendo..."
                    : `⬆ Subir descuentos (${trackerTableRows.filter((r) => r.mayoreoPrice).length} SKUs)`}
                </button>
              </div>

              <div
                className="panel"
                id="excl-panel"
                style={{ display: excluded.length ? "block" : "none" }}
              >
                <div className="ptitle" style={{ color: "var(--app-promo-high)" }}>
                  ⚠ SKUs excluidos de la base
                </div>
                <div className="infobox" style={{ marginBottom: 8 }}>
                  Estos SKUs están ocultos en toda la herramienta y en el PDF.
                  Restáuralos aquí cuando quieras.
                </div>
                <div id="excl-pills" style={{ marginBottom: 8, lineHeight: 2 }}>
                  {excluded.map((description) => {
                    const { marca, modelo } = parseBrand(description);
                    return (
                      <span key={description} className="excl-pill">
                        <span>{`${marca} ${modelo.slice(0, 25)}`}</span>
                        <button
                          type="button"
                          title="Restaurar"
                          onClick={() => handleRestore(description)}
                        >
                          ✕
                        </button>
                      </span>
                    );
                  })}
                </div>
                <button
                  className="btn"
                  type="button"
                  onClick={handleRestoreAll}
                >
                  ↺ Restaurar todos
                </button>
              </div>

              <div className="panel">
                <div className="ptitle">Margen global</div>
                <div className="slider-row">
                  <input
                    id="gm"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={globalMargin}
                    onChange={(event) =>
                      setGlobalMargin(parseInt(event.target.value, 10))
                    }
                  />
                  <span className="sval" id="gmv">
                    {globalMargin}%
                  </span>
                </div>
                <div className="presets" id="presets">
                  {MARGIN_PRESETS.map((preset) => (
                    <button
                      key={`mayoreo-${preset}`}
                      className={`pre ${globalMargin === preset ? "on" : ""}`}
                      type="button"
                      onClick={() => setGlobalMargin(preset)}
                    >
                      {preset}%
                    </button>
                  ))}
                </div>

                <div className="ptitle" style={{ marginTop: 12 }}>
                  Margen Precio Patio
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--txt2)",
                    marginBottom: 5,
                  }}
                >
                  Precio patio = (Costo × margen + Montaje) × 1.16
                </div>
                <div className="slider-row">
                  <input
                    id="gmp"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={globalMarginPatio}
                    onChange={(event) =>
                      setGlobalMarginPatio(parseInt(event.target.value, 10))
                    }
                  />
                  <span className="sval" id="gmpv">
                    {globalMarginPatio}%
                  </span>
                </div>
                <div className="presets">
                  {MARGIN_PRESETS.map((preset) => (
                    <button
                      key={`patio-${preset}`}
                      id={preset === 20 ? "pre-patio-20" : undefined}
                      className={`pre ${
                        globalMarginPatio === preset ? "on" : ""
                      }`}
                      type="button"
                      onClick={() => setGlobalMarginPatio(preset)}
                    >
                      {preset}%
                    </button>
                  ))}
                </div>

                <div className="ptitle">Margen masivo por grupo</div>
                <div className="bulk-box">
                  <p>Asigna un margen de golpe a un grupo completo.</p>
                  <div className="bulk-row" style={{ marginBottom: 6 }}>
                    <select
                      value={bulkType}
                      onChange={(event) => setBulkType(event.target.value)}
                    >
                      <option value="ambos">Ambos precios</option>
                      <option value="mayoreo">Solo Mayoreo</option>
                      <option value="patio">Solo Patio</option>
                    </select>
                  </div>
                  <div className="bulk-row">
                    <select
                      id="bulk-f"
                      value={bulkFilter}
                      onChange={(event) => setBulkFilter(event.target.value)}
                    >
                      {BULK_FILTER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <input
                      id="bulk-v"
                      type="number"
                      value={bulkValue}
                      min="0"
                      max="200"
                      step="1"
                      onChange={(event) => setBulkValue(event.target.value)}
                    />
                    <button
                      className="bulk-btn"
                      type="button"
                      onClick={handleBulkApply}
                    >
                      Aplicar
                    </button>
                  </div>
                </div>

                <div
                  className="ptitle"
                  style={{ marginTop: 4, color: "var(--app-promo-high-bar)" }}
                >
                  Michelin — Desc. lista
                </div>
                <div className="infobox">
                  <b>Precio = Lista × (1 − desc%) × 1.16</b>
                  <br />
                  Lista = Costo × factor. Ajusta el factor según el PVPR
                  Michelin que manejes.
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <label
                    style={{
                      fontSize: 11,
                      color: "var(--txt2)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Factor lista
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="3"
                    step="0.05"
                    value={michelinListFactor}
                    onChange={(event) => {
                      const v = parseFloat(event.target.value);
                      if (!Number.isNaN(v) && v >= 1) {
                        setMichelinListFactor(v);
                      }
                    }}
                    style={{
                      width: 64,
                      padding: "3px 6px",
                      border: "1px solid var(--brd)",
                      borderRadius: 5,
                      fontSize: 12,
                      background: "var(--surf)",
                      color: "var(--txt)",
                      outline: "none",
                    }}
                  />
                  <span style={{ fontSize: 10, color: "var(--txt3)" }}>
                    ×costo
                  </span>
                </div>
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--txt2)",
                    marginBottom: 5,
                  }}
                >
                  Descuento global Michelin
                </div>
                <div className="slider-row">
                  <input
                    type="range"
                    min="0"
                    max="40"
                    step="1"
                    value={globalMichelinDiscount}
                    onChange={(event) =>
                      setGlobalMichelinDiscount(
                        parseInt(event.target.value, 10)
                      )
                    }
                    style={{ accentColor: "var(--app-promo-high-bar)" }}
                  />
                  <span className="sval" style={{ color: "var(--app-promo-high-bar)" }}>
                    {globalMichelinDiscount}%
                  </span>
                </div>
                <div className="presets" style={{ marginBottom: 10 }}>
                  {MICHELIN_DISCOUNT_PRESETS.map((preset) => (
                    <button
                      key={`mich-${preset}`}
                      className={`pre ${
                        globalMichelinDiscount === preset ? "on" : ""
                      }`}
                      type="button"
                      onClick={() => setGlobalMichelinDiscount(preset)}
                      style={
                        globalMichelinDiscount === preset
                          ? {
                              background: "var(--app-promo-high-bar)",
                              borderColor: "var(--app-promo-high-bar)",
                            }
                          : undefined
                      }
                    >
                      {preset}%
                    </button>
                  ))}
                </div>
                <button
                  className="btn"
                  type="button"
                  onClick={resetMichelinDiscounts}
                >
                  ↺ Quitar descuentos individuales Michelin
                </button>

                <div className="ptitle">Lista de precios PDF</div>
                <div className="infobox">
                  <b>Leyenda comercial personalizable</b>
                  <br />
                  Edita el título y texto antes de exportar.
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label
                    style={{
                      fontSize: 11,
                      color: "var(--txt2)",
                      display: "block",
                      marginBottom: 3,
                    }}
                  >
                    Título del PDF
                  </label>
                  <input
                    type="text"
                    value={pdfTitle}
                    onChange={(event) => setPdfTitle(event.target.value)}
                    style={{
                      width: "100%",
                      padding: "5px 8px",
                      border: "1px solid var(--brd)",
                      borderRadius: 5,
                      fontSize: 11,
                      background: "var(--surf)",
                      color: "var(--txt)",
                      outline: "none",
                    }}
                  />
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label
                    style={{
                      fontSize: 11,
                      color: "var(--txt2)",
                      display: "block",
                      marginBottom: 3,
                    }}
                  >
                    Leyenda comercial
                  </label>
                  <textarea
                    rows="3"
                    value={pdfLegend}
                    onChange={(event) => setPdfLegend(event.target.value)}
                    style={{
                      width: "100%",
                      padding: "5px 8px",
                      border: "1px solid var(--brd)",
                      borderRadius: 5,
                      fontSize: 11,
                      background: "var(--surf)",
                      color: "var(--txt)",
                      outline: "none",
                      resize: "vertical",
                    }}
                  />
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label
                    style={{
                      fontSize: 11,
                      color: "var(--txt2)",
                      display: "block",
                      marginBottom: 5,
                      fontWeight: 700,
                    }}
                  >
                    ¿Qué precios incluir en el PDF?
                  </label>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="pdf-price-mode"
                        value="mayoreo"
                        checked={pdfPriceMode === "mayoreo"}
                        onChange={(event) =>
                          setPdfPriceMode(event.target.value)
                        }
                        style={{ accentColor: "var(--app-promo-low)" }}
                      />
                      <span style={{ color: "var(--n1)", fontWeight: 700 }}>
                        Solo Mayoreo
                      </span>
                    </label>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="pdf-price-mode"
                        value="ambos"
                        checked={pdfPriceMode === "ambos"}
                        onChange={(event) =>
                          setPdfPriceMode(event.target.value)
                        }
                        style={{ accentColor: "var(--app-promo-sold)" }}
                      />
                      <span
                        style={{ color: "var(--app-promo-sold)", fontWeight: 700 }}
                      >
                        Mayoreo + Patio
                      </span>
                    </label>
                  </div>
                </div>
                <button
                  className="btn red"
                  type="button"
                  onClick={exportPricePdf}
                >
                  📄 Exportar lista de precios PDF
                </button>

                <div className="ptitle" style={{ marginTop: 4 }}>
                  Opciones
                </div>
                <div className="infobox">
                  <b>Precio promo = Costo × (1 + margen%) × 1.16</b>
                  <br />
                  Con IVA, redondeado al múltiplo de $5 más cercano.
                  <br />
                  <br />
                  N3 Liquidación → 10–20% &nbsp;|&nbsp; N2 Oferta → 20–30%
                  &nbsp;|&nbsp; N1 Promover → 30–50%
                </div>
                <button className="btn" type="button" onClick={resetMargins}>
                  ↺ Quitar márgenes individuales
                </button>
                <button
                  className="btn dark"
                  type="button"
                  onClick={() => window.print()}
                >
                  🖨 Imprimir pantalla completa
                </button>
              </div>
            </div>

            <Box
              className="panel tracker-panel"
              sx={{
                maxHeight: "83vh",
                overflowY: "auto",
                overscrollBehavior: "contain",
              }}
            >
              <div className="ptitle">
                Seguimiento — 203 SKUs · Base 16 abril 2026
              </div>

              {!hasImportedInventory ? (
                <div
                  id="import-banner"
                  style={{
                    background: "var(--app-warning-soft)",
                    border: "1px solid var(--app-warning-main)",
                    borderRadius: 7,
                    padding: "10px 14px",
                    marginBottom: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 20 }}>📂</span>
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--app-warning-dark)",
                      }}
                    >
                      Actualiza existencias para ver el avance
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--app-warning-dark)",
                        marginTop: 2,
                      }}
                    >
                      Ejecuta la consulta en tiempo real para activar las
                      columnas <b>Actual</b>, <b>Vendidas</b> y <b>Avance</b>.
                      &nbsp;
                      <button
                        type="button"
                        onClick={handleRealtimeSync}
                        style={{
                          color: "var(--app-warning-dark)",
                          fontWeight: 700,
                          textDecoration: "underline",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                        }}
                      >
                        Actualizar ahora →
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="sleg">
                <div className="sl">
                  <div
                    className="sl-dot"
                    style={{ background: "var(--n3bar)" }}
                  />
                  N3 Liquidación
                </div>
                <div className="sl">
                  <div
                    className="sl-dot"
                    style={{ background: "var(--n2bar)" }}
                  />
                  N2 Oferta especial
                </div>
                <div className="sl">
                  <div
                    className="sl-dot"
                    style={{ background: "var(--n1bar)" }}
                  />
                  N1 Promover
                </div>
                <div className="sl">
                  <div
                    className="sl-dot"
                    style={{ background: "var(--app-promo-sold)" }}
                  />
                  Agotado en promo
                </div>
              </div>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                  mb: 1.25,
                }}
              >
                <div className="tabs" id="tabs" style={{ marginBottom: 0 }}>
                  <button
                    className={`tab ${tab === 0 ? "on" : ""}`}
                    type="button"
                    onClick={() => setTab(0)}
                  >
                    Todos ({base.length})
                  </button>
                  {[3, 2, 1].map((level) => (
                    <button
                      key={level}
                      className={`tab ${tab === level ? "on" : ""}`}
                      type="button"
                      onClick={() => setTab(level)}
                    >
                      <span
                        className={`nbadge ${LEVEL_CLASS[level]}`}
                        style={{ marginRight: 3 }}
                      >
                        N{level}
                      </span>
                      {`${LEVEL_LABEL[level]} (${levelCounts[level]})`}
                    </button>
                  ))}
                  {hasImportedInventory ? (
                    <button
                      className={`tab ${tab === "avance" ? "on" : ""}`}
                      type="button"
                      onClick={() => setTab("avance")}
                      style={
                        tab === "avance"
                          ? { background: "var(--app-promo-sold)" }
                          : undefined
                      }
                    >
                      📈 Con ventas ({salesCountInScope})
                    </button>
                  ) : (
                    <button
                      className="tab"
                      type="button"
                      style={{ opacity: 0.4, cursor: "not-allowed" }}
                      title="Actualiza existencias para ver avance"
                    >
                      📈 Con ventas
                    </button>
                  )}
                </div>

                <button
                  className="btn dark"
                  type="button"
                  onClick={handleRealtimeSync}
                  disabled={isSyncingInventory}
                  style={{
                    width: "auto",
                    marginBottom: 0,
                    paddingInline: 14,
                    opacity: isSyncingInventory ? 0.75 : 1,
                    cursor: isSyncingInventory ? "wait" : "pointer",
                  }}
                >
                  {isSyncingInventory
                    ? "⏳ Actualizando..."
                    : "↻ Actualizar existencias"}
                </button>
              </Box>

              <div
                className={`report-bar ${reportBar ? "show" : ""}`}
                id="report-bar"
              >
                <div
                  style={{
                    display: "flex",
                    gap: 20,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <div className="rb-stat">
                    <div className="rb-l">Llantas vendidas</div>
                    <div className="rb-v g" id="rb-sold">
                      {reportBar
                        ? reportBar.totalSold.toLocaleString("es-MX")
                        : "—"}
                    </div>
                  </div>
                  <div className="rb-sep" />
                  <div className="rb-stat">
                    <div className="rb-l">Por vender</div>
                    <div className="rb-v" id="rb-remaining">
                      {reportBar
                        ? reportBar.totalRemaining.toLocaleString("es-MX")
                        : "—"}
                    </div>
                  </div>
                  <div className="rb-sep" />
                  <div className="rb-stat">
                    <div className="rb-l">$ Recuperado</div>
                    <div className="rb-v y" id="rb-recovered">
                      {reportBar
                        ? `$${Math.round(
                            reportBar.recovered / 1000
                          ).toLocaleString("es-MX")}k`
                        : "—"}
                    </div>
                  </div>
                  <div className="rb-sep" />
                  <div className="rb-stat">
                    <div className="rb-l">Margen más vendido</div>
                    <div className="rb-v" id="rb-top-margin">
                      {reportBar?.topBucket
                        ? `${reportBar.topBucket[0]} (${reportBar.topBucket[1]} pzas)`
                        : "—"}
                    </div>
                  </div>
                </div>
                <button
                  className="btn-report"
                  type="button"
                  onClick={exportReport}
                >
                  📊 Exportar reporte PDF
                </button>
              </div>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "minmax(260px,1fr) repeat(3,minmax(180px,220px))",
                  },
                  gap: 1,
                  mb: 1.5,
                }}
              >
                <TextField
                  id="srch"
                  size="small"
                  placeholder="Buscar: OVATION,NEXEN o 195/65,MICHELIN..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <TextField
                  select
                  id="sfil"
                  size="small"
                  label="Sucursal"
                  value={branchFilter}
                  onChange={(event) => setBranchFilter(event.target.value)}
                >
                  <MenuItem value="">Todas las sucursales</MenuItem>
                  {BRANCH_OPTIONS.map((branch) => (
                    <MenuItem key={branch.value} value={branch.value}>
                      {branch.code
                        ? `${branch.code} · ${branch.value}`
                        : branch.value}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  id="tfil"
                  size="small"
                  label="Tier"
                  value={tierFilter}
                  onChange={(event) => setTierFilter(event.target.value)}
                >
                  <MenuItem value="">Todos los tiers</MenuItem>
                  {TIER_OPTIONS.map((tier) => (
                    <MenuItem key={tier} value={tier}>
                      {tier.replace("TIERE ", "Tier ")}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  id="pfil"
                  size="small"
                  label="Proveedor"
                  value={providerFilter}
                  onChange={(event) => setProviderFilter(event.target.value)}
                >
                  <MenuItem value="">Todos los proveedores</MenuItem>
                  {PROVIDER_OPTIONS.map((provider) => (
                    <MenuItem key={provider} value={provider}>
                      {provider}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Box className="tbl-wrap" sx={{ mt: 0.5, overflowX: "hidden" }}>
                <Box
                  className="tbl-scroll"
                  sx={{
                    overflowX: "auto",
                    overflowY: "hidden",
                    overscrollBehaviorX: "contain",

                    maxWidth: "calc(100vw - 400px)",
                    minHeight: 200,
                  }}
                >
                  <table id="promo-tracker-main">
                    <thead>
                      <tr>
                        <th aria-label="Acciones" />
                        <th>Niv.</th>
                        <th>
                          <button
                            type="button"
                            onClick={() => handleToggleSort("medida")}
                            style={{ all: "unset", cursor: "pointer" }}
                          >
                            {SortableHeader(
                              "Medida",
                              sortCol === "medida",
                              sortDir === 1 ? "asc" : "desc"
                            )}
                          </button>
                        </th>
                        <th>Marca / Modelo</th>
                        <th>Tier</th>
                        <th className="r">Total</th>
                        <th className="r">
                          <button
                            type="button"
                            onClick={() => handleToggleSort("inv_promo")}
                            style={{ all: "unset", cursor: "pointer" }}
                          >
                            {SortableHeader(
                              "En promo",
                              sortCol === "inv_promo",
                              sortDir === 1 ? "asc" : "desc"
                            )}
                          </button>
                        </th>
                        <th className="r">Consigna</th>
                        <th className="r">
                          <button
                            type="button"
                            onClick={() => handleToggleSort("curInvSort")}
                            style={{ all: "unset", cursor: "pointer" }}
                          >
                            {SortableHeader(
                              "Actual 📥",
                              sortCol === "curInvSort",
                              sortDir === 1 ? "asc" : "desc"
                            )}
                          </button>
                        </th>
                        <th className="r">Vendidas</th>
                        <th>% Avance</th>
                        <th className="r">Costo unit.</th>
                        <th>Mg. May.</th>
                        <th>Mg. Pat.</th>
                        <th className="r">Sin IVA</th>
                        <th className="r">Mayoreo c/IVA</th>
                        <th className="r">Patio c/IVA</th>
                        <th className="r">Montaje</th>
                        <th className="r">Recup. est.</th>
                        <th className="r">Recup. vendido</th>
                        <th>Cobertura</th>
                        <th>Ubicaciones</th>
                        <th>Prov.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedTrackerRows.map((row) => (
                        <TrackerTableRow
                          key={row.desc}
                          row={row}
                          hasImportedInventory={hasImportedInventory}
                          onExclude={handleExclude}
                          onMarginChange={handleMarginChange}
                          onMichelinDiscountChange={handleMichelinDiscountChange}
                        />
                      ))}
                    </tbody>
                  </table>
                </Box>
              </Box>

              <Paper
                variant="outlined"
                sx={{
                  mt: 1,
                  p: 1.25,
                  borderRadius: 2,
                  backgroundColor: "var(--app-promo-shell-tint)",
                  display: "grid",
                  gap: 1,
                  gridTemplateColumns: {
                    xs: "repeat(2, minmax(0, 1fr))",
                    md: "repeat(5, minmax(0, 1fr))",
                  },
                }}
              >
                {[
                  ["SKUs", tableTotals.rowCount, undefined],
                  [
                    "Inventario total",
                    tableTotals.totalInventory.toLocaleString("es-MX"),
                    undefined,
                  ],
                  [
                    "Inventario promo",
                    tableTotals.promoInventory.toLocaleString("es-MX"),
                    "var(--n1)",
                  ],
                  [
                    "Consigna",
                    tableTotals.consignaInventory > 0
                      ? tableTotals.consignaInventory
                      : "—",
                    "var(--n2)",
                  ],
                  ["Vendidas", tableTotals.totalSoldDisplay, "var(--app-promo-sold)"],
                  [
                    "Inventario actual",
                    tableTotals.currentInventory,
                    undefined,
                  ],
                  [
                    "Costo inv.",
                    tableTotals.totalCost > 0
                      ? `$${fmt0(tableTotals.totalCost)}`
                      : "—",
                    undefined,
                  ],
                  [
                    "Recuperación estimada",
                    `$${fmt0(tableTotals.estimatedRecovery)}`,
                    "var(--n1)",
                  ],
                  [
                    "Recuperación vendida",
                    tableTotals.realRecovery > 0
                      ? `$${fmt0(tableTotals.realRecovery)}`
                      : "—",
                    "var(--app-promo-sold)",
                  ],
                ].map(([label, value, color]) => (
                  <Box key={label}>
                    <Typography variant="caption" color="text.secondary">
                      {label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color }}>
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Paper>
            </Box>
          </div>
        </div>
      </div>

      <div id="report-pdf">
        <div className="rp-header">
          <div className="rp-logo-row">
            <PromoLogo className="rp-logo" />
            <div className="rp-title-block">
              <div className="rp-title">
                REPORTE DE AVANCE — PROMOCIÓN INVENTARIO ATORADO
              </div>
              <div className="rp-sub" id="rp-sub-date">
                {reportSummary
                  ? `Corte al ${reportSummary.generatedDate} · Base: ${BASE_DATE_LABEL} · ${reportRows.length} SKUs con venta`
                  : `Corte al — · Base: ${BASE_DATE_LABEL}`}
              </div>
            </div>
          </div>
          <div className="rp-kpis">
            <div className="rp-kpi">
              <div className="rp-kpi-l">Llantas vendidas</div>
              <div className="rp-kpi-v" id="rp-sold">
                {reportSummary
                  ? reportSummary.totalSold.toLocaleString("es-MX")
                  : "—"}
              </div>
              <div className="rp-kpi-sub" id="rp-sold-sub">
                {reportSummary
                  ? `de ${reportSummary.totalBase.toLocaleString(
                      "es-MX"
                    )} totales (${reportSummary.progressPercentage}% avance)`
                  : ""}
              </div>
            </div>
            <div className="rp-kpi">
              <div className="rp-kpi-l">Por vender</div>
              <div className="rp-kpi-v" id="rp-remaining">
                {reportSummary
                  ? reportSummary.totalRemaining.toLocaleString("es-MX")
                  : "—"}
              </div>
              <div className="rp-kpi-sub" id="rp-rem-sub">
                unidades aún disponibles
              </div>
            </div>
            <div className="rp-kpi">
              <div className="rp-kpi-l">$ Recuperado</div>
              <div className="rp-kpi-v" id="rp-recovered">
                {reportSummary
                  ? `$${Math.round(reportSummary.recovered).toLocaleString(
                      "es-MX"
                    )}`
                  : "—"}
              </div>
              <div className="rp-kpi-sub" id="rp-rec-sub">
                con IVA incluido
              </div>
            </div>
            <div className="rp-kpi">
              <div className="rp-kpi-l">Recuperación potencial restante</div>
              <div className="rp-kpi-v" id="rp-potential">
                {reportSummary
                  ? `$${Math.round(reportSummary.potential).toLocaleString(
                      "es-MX"
                    )}`
                  : "—"}
              </div>
              <div className="rp-kpi-sub" id="rp-pot-sub">
                recuperación potencial restante
              </div>
            </div>
          </div>
          <div className="rp-descuento-bar">
            <h3>Escala de margen más efectiva (por unidades vendidas)</h3>
            <div id="rp-descuento-content">
              {reportSummary?.breakdown.map((item) => (
                <div key={item.bucket} className="rp-d-row">
                  <span className="rp-d-label">{item.bucket}</span>
                  <div className="rp-d-bar-wrap">
                    <div
                      className="rp-d-bar-fill"
                      style={{ width: item.width, background: item.color }}
                    />
                  </div>
                  <span className="rp-d-val">{`${item.sold} pzas · ${item.skus} SKUs`}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <table className="rp-table">
          <thead>
            <tr>
              <th>Niv.</th>
              <th>Medida</th>
              <th>Marca / Modelo</th>
              <th>Tier</th>
              <th className="r">Base</th>
              <th className="r">Vendidas</th>
              <th className="r">% Avance</th>
              <th className="r">Mayoreo</th>
              <th className="r">Patio</th>
              <th className="r">Margen %</th>
              <th className="r">$ Recuperado</th>
              <th className="r">Por vender</th>
              <th>Ubicaciones</th>
            </tr>
          </thead>
          <tbody id="rp-tbody">
            {reportRows.map((row) => {
              const sold = getSoldPromo(row, currentInventory);
              const current =
                currentInventory[row.desc] !== undefined
                  ? currentInventory[row.desc]
                  : row.inv_promo;
              const mayoreoMargin = getMarginValue(
                row.desc,
                margins,
                globalMargin
              );
              const patioMargin = getPatioMarginValue(
                row.desc,
                marginsPatio,
                globalMarginPatio
              );
              const mayoreoPrice = calcPrecio(row.costo, mayoreoMargin);
              const patioPrice = calcPrecioPatio(
                row.costo,
                row.medida,
                patioMargin
              );
              const progress =
                row.inv_promo > 0
                  ? ((sold / row.inv_promo) * 100).toFixed(0)
                  : 0;
              const recovered = mayoreoPrice
                ? mayoreoPrice.rounded * sold
                : null;
              const { marca, modelo } = parseBrand(row.desc);

              return (
                <tr key={`report-${row.desc}`}>
                  <td>
                    <span className={REPORT_LEVEL_CLASS[row.nivel]}>
                      {REPORT_LEVEL_LABEL[row.nivel] || `N${row.nivel}`}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>{row.medida}</td>
                  <td>
                    <b>{marca}</b>
                    <br />
                    <span style={{ fontSize: 8, color: "var(--app-text-secondary)" }}>
                      {modelo}
                    </span>
                  </td>
                  <td style={{ fontSize: 8 }}>
                    {(row.tier || "").replace("TIERE ", "T")}
                  </td>
                  <td className="r">{row.inv_promo}</td>
                  <td
                    className="r"
                    style={{ fontWeight: 700, color: "var(--app-promo-sold)" }}
                  >
                    -{sold}
                  </td>
                  <td className="r">{progress}%</td>
                  <td className="r">
                    {mayoreoPrice
                      ? `$${mayoreoPrice.rounded.toLocaleString("es-MX")}`
                      : "—"}
                  </td>
                  <td className="r">
                    {patioPrice
                      ? `$${patioPrice.rounded.toLocaleString("es-MX")}`
                      : "—"}
                  </td>
                  <td className="r">{`${mayoreoMargin}% / ${patioMargin}%`}</td>
                  <td className="r" style={{ color: "var(--app-promo-sold)" }}>
                    {recovered ? `$${fmt0(recovered)}` : "—"}
                  </td>
                  <td className="r">{current}</td>
                  <td style={{ fontSize: 7.5 }}>
                    {row.locs.split(" · ").map((location, index, locations) => (
                      <Fragment key={`${row.desc}-${location}`}>
                        {location}
                        {index < locations.length - 1 ? <br /> : null}
                      </Fragment>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: "var(--app-promo-shell-tint)", fontWeight: 700 }}>
              <td
                colSpan="4"
                style={{ fontSize: 9, color: "var(--app-text-muted)" }}
                id="rp-tfoot-label"
              >
                {`${reportRows.length} SKUs con venta`}
              </td>
              <td className="r" id="rp-tf-base">
                {reportSummary
                  ? reportSummary.totalBase.toLocaleString("es-MX")
                  : ""}
              </td>
              <td
                className="r"
                style={{ color: "var(--app-promo-sold)" }}
                id="rp-tf-sold"
              >
                {reportSummary
                  ? reportSummary.totalSold.toLocaleString("es-MX")
                  : ""}
              </td>
              <td className="r" id="rp-tf-pct">
                {reportSummary ? `${reportSummary.progressPercentage}%` : ""}
              </td>
              <td className="r" />
              <td className="r" />
              <td
                className="r"
                style={{ color: "var(--app-promo-sold)" }}
                id="rp-tf-rec"
              >
                {reportSummary ? `$${fmt0(reportSummary.recovered)}` : ""}
              </td>
              <td className="r" id="rp-tf-rem">
                {reportSummary
                  ? reportSummary.totalRemaining.toLocaleString("es-MX")
                  : ""}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>

        <div className="rp-footer" id="rp-footer">
          {reportSummary
            ? `Yantissimo S.A. de C.V. · Reporte generado el ${reportSummary.generatedDate} · Uso interno · Precios con IVA incluido`
            : ""}
        </div>
      </div>

      <div className={`toast ${toastVisible ? "show" : ""}`} id="toast">
        {toastMessage}
      </div>
    </>
  );
}
