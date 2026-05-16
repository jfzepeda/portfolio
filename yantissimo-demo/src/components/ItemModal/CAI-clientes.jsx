"use client";
import React, { useEffect, useState } from "react";
import { Box, Typography, Divider, Checkbox } from "@mui/material";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { currencyFormatter, round10, round2 } from "~/utils/formaters.js";
import UnoptimizedImage from "~/resources/UnoptimizedImage.jsx";
import api from "~/lib/api";
import { ROLES } from "~/utils/global";
import {
  BranchStocks,
  ItemModalFrame,
  ItemModalImage,
  buildBranchStocks,
  getValue,
} from "./shared.jsx";

const MAIN_PRICE_KEYS = [
  ["precioLista"],
  ["precioPromocion"],
  ["credito"],
  ["volumen10"],
  ["contadoVenta", "contadoDist"],
  ["creditoVenta", "creditoDist"],
];

// const EXTRA_PRICE_KEYS = ["vol10Cred", "contadoDist", "creditoDist"];

// const HIDE_DISC = ["promo_2pz", "promo_4pz", "contadoDist", "creditoDist"];

function HeaderSection({ item }) {
  return (
    <>
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "78%",
          height: { xs: 80, md: 90 },
          bgcolor: "#F4B400",
          clipPath: "polygon(0 0, 100% 0, 86% 100%, 0 100%)",
          opacity: 1,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          width: { xs: 190, md: 270 },
          height: { xs: 80, md: 90 },
          bgcolor: "#FFD24A",
          clipPath: "polygon(35% 0, 100% 0, 100% 100%, 0 100%)",
          opacity: 1,
        }}
      />

      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "stretch",
        }}
      >
        <Box
          sx={{
            width: { xs: 155, md: 225 },
            bgcolor: "#E6E6E6",
            borderTopLeftRadius: 3 * 8,
            borderBottomRightRadius: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            px: 2,
            py: 1,
            boxShadow: "0 10px 0 #3A3A3A",
          }}
        >
          <Typography
            sx={{
              fontWeight: 900,
              letterSpacing: 1,
              color: "#1b1b1b",
              fontSize: 28,
              lineHeight: 1.05,
              textAlign: "center",
              whiteSpace: "pre-line",
            }}
          >
            {"MEDIDA\nY MODELO"}
          </Typography>
        </Box>

        <Box
          sx={{
            flex: 1,
            position: "relative",
            ml: { xs: 1.2, md: 2 },
            bgcolor: "#E6E6E6",
            borderTopRightRadius: 3 * 8,
            borderBottomLeftRadius: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            boxShadow: "0 10px 0 #3A3A3A",
          }}
        >
          <Typography
            sx={{
              position: "relative",
              fontWeight: 900,
              color: "#1f1f1f",
              fontSize: 24,
              letterSpacing: 0.6,
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
  mainPrices,
  formatPrice,
  // pctVsListaAbs,
  paymentLogos,
  showExtra,
  onToggleExtra,
  curRole,
  allowCredit = true,
}) {
  const isPromoRole = curRole >= ROLES.MYR_HELPER;
  const showRight = isPromoRole || allowCredit;
  const leftLabel = isPromoRole ? "CRÉDITO" : "CONTADO";
  const rightLabel = isPromoRole ? "VOLUMEN 10" : "CRÉDITO";
  const leftValue = isPromoRole ? mainPrices[2] : mainPrices[4];
  const rightValue = isPromoRole ? mainPrices[3] : mainPrices[5];
  const hideCosto = item?.proveedor === "Yantissimo";

  return (
    <Box
      sx={{
        bgcolor: "#F7F7F7",
        borderRadius: 6,
        p: 3,
        boxShadow: "0 12px 28px rgba(0,0,0,0.18)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minWidth: 636,
      }}
    >
      {isPromoRole && (
        <>
          <Box sx={{ position: "relative", minHeight: { xs: 78, md: 92 } }}>
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
                  DE CONTADO
                </Typography>
              </Box>
            </Box>

            {/* <Box
              sx={{
                position: "absolute",
                top: -7,
                left: 35.4 * 8,
                width: 64,
                height: 64,
                transform: "rotate(20deg)",
              }}
            >
              <UnoptimizedImage
                src="/sale_2.png"
                alt="Descuento"
                height={90}
                width={90}
                style={{ objectFit: "contain" }}
              />
              <Typography
                sx={{
                  position: "absolute",
                  top: 2 * 8,
                  left: 2 * 8,
                  display: "flex",
                  fontWeight: 900,
                  color: "#fff",
                  fontSize: 34,
                  textShadow: "0 1px 2px rgba(0,0,0,0.55)",
                  pt: 0.4,
                }}
              >
                {pctVsListaAbs(mainPrices[1])}
              </Typography>
            </Box>

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
            </Box> */}
          </Box>

          <Box sx={{ mt: { xs: 3.2, md: 4.2 }, textAlign: "center" }}>
            <Typography
              sx={{
                fontWeight: 900,
                color: "#2a2a2a",
                fontSize: { xs: 68, md: 96 },
                lineHeight: 1,
              }}
            >
              {formatPrice(mainPrices[1])}
            </Typography>
          </Box>

          <Box
            sx={{
              mt: 1.2,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: { xs: 1.2, md: 1.6 },
              flexWrap: { xs: "wrap", md: "nowrap" },
            }}
          >
            <Typography
              sx={{
                mt: 0.6,
                fontWeight: 900,
                color: "#2a2a2a",
                letterSpacing: 1,
                fontSize: { xs: 15, md: 17 },
              }}
            >
              A CRÉDITO CON T.C.
            </Typography>
            {paymentLogos.map((l) => (
              <UnoptimizedImage
                key={l.alt}
                src={l.src}
                alt={l.alt}
                height={30}
                width={30}
                style={{ objectFit: "contain", borderRadius: 15 }}
              />
            ))}
          </Box>
        </>
      )}

      <Box
        sx={{
          mt: { xs: 2, md: 2.2 },
          display: "grid",
          gridTemplateColumns: showRight ? "1fr 1px 1fr" : "1fr",
          alignItems: "start",
          gap: { xs: 1.2, md: 2 },
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 1,
              mb: 0.6,
            }}
          >
            {isPromoRole && (
              <CalendarMonthOutlinedIcon sx={{ color: "#333" }} />
            )}
            <Typography
              sx={{
                fontWeight: 900,
                color: "#333",
                fontSize: { xs: 20, md: 22 },
              }}
            >
              {leftLabel}
            </Typography>
          </Box>

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
                fontWeight: 900,
                color: "#2a2a2a",
                fontSize: { xs: 44, md: 56 },
                lineHeight: 1,
              }}
            >
              {formatPrice(leftValue)}
            </Typography>
          </Box>
        </Box>

        {showRight && (
          <>
            <Divider
              orientation="vertical"
              flexItem
              sx={{ borderColor: "#D0D0D0" }}
            />
            <Box sx={{ textAlign: "center" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 1,
                  mb: 0.6,
                }}
              >
                {isPromoRole && (
                  <CalendarMonthOutlinedIcon sx={{ color: "#333" }} />
                )}
                <Typography
                  sx={{
                    fontWeight: 900,
                    color: "#333",
                    fontSize: { xs: 20, md: 22 },
                  }}
                >
                  {rightLabel}
                </Typography>
              </Box>

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
                    fontWeight: 900,
                    color: "#2a2a2a",
                    fontSize: { xs: 44, md: 56 },
                    lineHeight: 1,
                  }}
                >
                  {formatPrice(rightValue)}
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </Box>

      {isPromoRole && (
        <Box sx={{ mt: 4 }}>
          <Box
            sx={{
              bgcolor: "#2b2b2b",
              borderRadius: 2.2,
              display: "grid",
              gridTemplateColumns: showExtra
                ? "repeat(5, 1fr) 34px"
                : "repeat(3, 1fr) 34px",
              alignItems: "center",
              px: 1.4,
              py: 1,
            }}
          >
            {[
              "VOLUMEN 10 CRED",
              "DISTRIBUIDOR CONTADO",
              "DISTRIBUIDOR CREDITO",
              ...(showExtra ? ["COSTO", "ENVIO"] : []),
            ].map((t) => (
              <Typography
                key={t}
                sx={{
                  fontWeight: 900,
                  fontSize: 12,
                  textAlign: "center",
                  color: "#fff",
                }}
              >
                {t}
              </Typography>
            ))}
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <Checkbox
                checked={showExtra}
                onChange={onToggleExtra}
                sx={{
                  color: "#fff",
                  "&.Mui-checked": {
                    color: "#F4B400",
                  },
                  p: 0,
                }}
              />
            </Box>
          </Box>

          <Box
            sx={{
              mt: 1,
              bgcolor: "#F1F1F1",
              borderRadius: 2.2,
              px: 1.4,
              py: 1.25,
              display: "grid",
              gridTemplateColumns: showExtra
                ? "repeat(5, 1fr) 34px"
                : "repeat(3, 1fr) 34px",
              alignItems: "baseline",
            }}
          >
            {[
              { v: item?.vol10Cred || 0, format: "money" },
              { v: item?.contadoDist || 0, format: "money" },
              { v: item?.creditoDist || 0, format: "money" },
              ...(showExtra
                ? [
                    {
                      v: hideCosto ? null : item?.costo,
                      pct: "",
                      format: "money",
                    },
                    { v: item?.extras?.envio, format: "money" },
                  ]
                : []),
            ].map((c, idx) => (
              <Box key={idx} sx={{ textAlign: "center" }}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    color: "#333",
                    fontSize: 20,
                  }}
                >
                  {c.format === "money"
                    ? c.v === null || c.v === undefined
                      ? "-"
                      : currencyFormatter(c.v)
                    : c.v || "-"}
                </Typography>
              </Box>
            ))}
            <Box />
          </Box>
        </Box>
      )}
    </Box>
  );
}

function RightArea({
  item,
  formatPrice,
  listPrice,
  imagesObj,
  imageIdx,
  onNextImage,
  branchStocks,
}) {
  return (
    <Box
      sx={{
        mt: { xs: 2.2, md: 0 },
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        px: { xs: 0.5, md: 0.5 },
        width: 350,
        position: "relative",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "baseline",
          gap: 1,
          pr: 0.4,
          pt: 1,
          position: "relative",
          zIndex: 1,
        }}
      >
        <Typography sx={{ color: "#5f5f5f", fontWeight: 300, fontSize: 20 }}>
          Precio de lista
        </Typography>
        <Typography sx={{ color: "#5f5f5f", fontWeight: 900, fontSize: 28 }}>
          {formatPrice(listPrice)}
        </Typography>
      </Box>

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

const ItemModal = ({
  open,
  item,
  onClose,
  curRole = 0,
  allowCredit = true,
}) => {
  const [showExtra, setShowExtra] = useState(false);
  const [imageIdx, setImageIdx] = useState(0);
  const [imagesObj, setImagesObj] = useState("/wheel.png");

  useEffect(() => {
    if (open) {
      setShowExtra(false);
      setImageIdx(0);
      setImagesObj("/wheel.png");
    }
  }, [open]);

  useEffect(() => {
    async function fetchImg() {
      try {
        const response = await api(
          `/api/images/preview-image?articulo=${item.articulo}&marca=${item.marca}`
        );
        if (!response.ok) {
          throw new Error("Error al obtener imagen");
        }
        const data = await response.json();
        setImagesObj(data || data.imageUrl || "/wheel.png");
      } catch (error) {
        console.error("Error al obtener imagen:", error);
      }
    }
    if (item && item?.articulo) {
      fetchImg();
    }
  }, [item]);

  if (!item) return null;

  const mainPrices = MAIN_PRICE_KEYS.map((keys) => getValue(item, keys));

  const branchStocks = buildBranchStocks(item);

  const isMich = () => {
    if (
      ["michelin", "bfgoodrich"].some((brand) =>
        item.articulo.toLowerCase().includes(brand)
      )
    ) {
      return true;
    }
  };

  // const defaultCF = (value) => {
  //   if (isMich()) {
  //     return currencyFormatter(value, 2);
  //   }
  //   return currencyFormatter(value);
  // };

  const smartCF = (value) => {
    if (isMich()) {
      return currencyFormatter(value, 2);
    } else if (showExtra) {
      const diffValue = round10(value) - value;
      return currencyFormatter(value, 2) + " + " + round2(diffValue);
    }
    return currencyFormatter(value);
  };

  const pl = Number(mainPrices[0] || 0);
  const pctVsListaAbs = (precio) => {
    const p = Number(precio || 0);
    if (!pl || !p) return "";
    const pct = ((pl - p) / pl) * 100;
    return `${Math.abs(Math.round(pct))}%`;
  };

  return (
    <ItemModalFrame
      open={open}
      onClose={onClose}
      boxSx={{
        p: 3,
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <Box>
        <HeaderSection item={item} />

        <Box
          sx={{
            display: { xs: "block", md: "grid" },
            gridTemplateColumns: { md: "3fr 2fr" },
            columnGap: { md: 3 },
            pt: 1,
            minHeight: 550,
          }}
        >
          <LeftCard
            item={item}
            mainPrices={mainPrices}
            formatPrice={smartCF}
            pctVsListaAbs={pctVsListaAbs}
            paymentLogos={[
              { src: "/mc.jpeg", alt: "Mastercard" },
              { src: "/visa.jpeg", alt: "Visa" },
              { src: "/marina.jpeg", alt: "La marina" },
            ]}
            showExtra={showExtra}
            onToggleExtra={(e) => {
              e.stopPropagation();
              setShowExtra(e.target.checked);
            }}
            curRole={curRole}
            allowCredit={allowCredit}
          />

          <RightArea
            item={item}
            formatPrice={smartCF}
            listPrice={mainPrices[0]}
            imagesObj={imagesObj}
            imageIdx={imageIdx}
            onNextImage={() => setImageIdx((i) => i + 1)}
            branchStocks={branchStocks}
          />
        </Box>
      </Box>
    </ItemModalFrame>
  );
};

export default ItemModal;
