// Extrae { brand, model } desde strings tipo "235/65 R17 GOODYEAR WRANGLER FORTITUDE HT 104V SL"
import { post } from "~/lib/api";

function extractTireModel(articulo) {
  if (!articulo || typeof articulo !== "string")
    return { brand: null, model: null };

  // 1) Normaliza espacios
  let s = articulo.replace(/\s+/g, " ").trim();

  // 2) Saca marca si viene al final "(OVATION)" / "(RUN-FLAT)" etc.
  //    Nota: acá asumimos que una marca es 1 palabra en MAYÚSCULAS (sin espacios).
  let brandFromParen = null;
  const parenMatches = [...s.matchAll(/\(([^)]+)\)/g)].map((m) => m[1].trim());
  for (const p of parenMatches) {
    if (/^[A-Z0-9]+$/.test(p) && p.length >= 3) {
      brandFromParen = p;
      break;
    }
  }
  // Elimina todo lo entre paréntesis (no aporta al modelo)
  s = s
    .replace(/\([^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // 3) Quita medida al inicio: "215/60 R17" (flexible con espacios)
  //    - Acepta "R17" o "R 17", y también casos con 2 o 3 dígitos en rin.
  s = s.replace(/^\s*\d{3}\/\d{2}\s*R?\s*\d{2,3}\s+/i, "").trim();

  // 4) Tokeniza
  const tokens = s.split(" ").filter(Boolean);
  if (tokens.length === 0) return { brand: brandFromParen, model: null };

  // 5) Lista (editable) de marcas comunes. Puedes agregar más.
  const BRANDS = new Set([
    "CONTINENTAL",
    "GOODYEAR",
    "MICHELIN",
    "DUNLOP",
    "BARUM",
    "BFGOODRICH",
    "OVATION",
  ]);

  // 6) Detecta marca:
  //    - Si venía entre paréntesis, úsala.
  //    - Si no, asume que la primera palabra después de la medida es la marca (y valida contra lista si quieres).
  let brand = brandFromParen;
  let brandIdx = -1;

  if (!brand) {
    // caso típico: "GOODYEAR ..."
    if (BRANDS.has(tokens[0])) {
      brand = tokens[0];
      brandIdx = 0;
    } else {
      // fallback: primera palabra como marca aunque no esté en lista
      brand = tokens[0];
      brandIdx = 0;
    }
  } else {
    // si la marca venía al final, el modelo empieza desde el principio de tokens
    brandIdx = -1;
  }

  // 7) Reglas para detectar dónde TERMINA el modelo
  const STOP_TOKENS = new Set([
    // variantes/códigos típicos que NO son modelo
    "XL",
    "SL",
    "FR",
    "FP",
    "RSC",
    "ROF",
    "SSR",
    "SSR*",
    "MO",
    "MI",
    "OWL",
    "LRE",
    "VW",
    "AO",
    "AOE",
    "*RSC",
    "RUNFLAT",
    "RUN-FLAT",
    "RUN",
    "FLAT",
  ]);

  // service description / load-speed: "96H", "111Y", "113/111Q", "110/107S"
  const isLoadSpeed = (t) => /^\d{2,3}(?:\/\d{2,3})?[A-Z]{1,2}$/.test(t);

  // LT combinado: "LT120/116Q"
  const isLTLoadSpeed = (t) => /^LT\d{2,3}\/\d{2,3}[A-Z]{1,2}$/.test(t);

  // Código puro numérico tipo "(05261)" ya se quitó por paréntesis, pero por si acaso:
  const isPureNumber = (t) => /^\d+$/.test(t);

  // 8) Construye modelo: tokens después de la marca (si marca estaba al inicio)
  const start = brandIdx >= 0 ? brandIdx + 1 : 0;
  const modelParts = [];

  for (let i = start; i < tokens.length; i++) {
    const t = tokens[i];

    // corta cuando empiezan ratings/códigos
    if (isLTLoadSpeed(t) || isLoadSpeed(t)) break;
    if (STOP_TOKENS.has(t)) break;

    // "LT" suelto normalmente marca que lo que sigue ya es rating ("LT 110/107S")
    if (t === "LT") break;

    // (casos raros) un número suelto suele ser código/sku
    if (isPureNumber(t)) break;

    modelParts.push(t);
  }

  const model = modelParts.join(" ").trim() || null;

  return { brand, model };
}

export async function saveDefaultIMG(imageUrl, articulo, procedencia = "NA") {
  const model = window.prompt(
    `Confirme el nombre del modelo para guardar esta imagen como predeterminada: ${procedencia}`,
    extractTireModel(articulo).model || "N/A"
  );
  if (!model) return;
  try {
    const response = await post("/api/inv/save-fav-image", {
      imageUrl,
      model,
    });
    if (!response.ok) {
      throw new Error("Error saving favorite image");
    }
    window.showToast("Imagen guardada como predeterminada exitosamente.");
  } catch (error) {
    console.error("Error saving favorite image:", error);
    throw error;
  }
}
