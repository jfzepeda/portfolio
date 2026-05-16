export const MONTAJES = {
  13: 95,
  14: 105,
  15: 110,
  16: 140,
  17: 160,
  18: 175,
  19: 190,
  20: 185,
  21: 230,
};

export function getRin(medida) {
  const match = medida.match(/[RZ](\d{2})/i);
  return match ? parseInt(match[1], 10) : null;
}

export function getMontajeValue(rim) {
  return Math.round((17 * rim - 130) / 5) * 5;
}

export function round5(value) {
  return Math.round(value / 5) * 5;
}

export function calcPrecio(costo, margin) {
  if (!costo) {
    return null;
  }

  const sinIVA = costo * (1 + margin / 100);
  const conIVA = sinIVA * 1.16;

  return {
    sinIVA,
    conIVA,
    rounded: round5(conIVA),
  };
}

export function calcPrecioPatio(costo, medida, marginPatio) {
  if (!costo) {
    return null;
  }

  const rin = getRin(medida);
  const montaje = rin && MONTAJES[rin] ? MONTAJES[rin] : 0;
  const sinIVA = costo * (1 + marginPatio / 100);
  const conIVA = (sinIVA + montaje) * 1.16;

  return {
    sinIVA,
    montaje,
    conIVA,
    rounded: round5(conIVA),
  };
}

function r16(buffer, offset) {
  return buffer[offset] | (buffer[offset + 1] << 8);
}

function r32(buffer, offset) {
  return (
    (buffer[offset] |
      (buffer[offset + 1] << 8) |
      (buffer[offset + 2] << 16) |
      (buffer[offset + 3] << 24)) >>>
    0
  );
}

function zipEntries(buffer) {
  const bytes = new Uint8Array(buffer);
  let endOfCentralDirectory = -1;

  for (let index = bytes.length - 22; index >= 0; index -= 1) {
    if (
      bytes[index] === 0x50 &&
      bytes[index + 1] === 0x4b &&
      bytes[index + 2] === 0x05 &&
      bytes[index + 3] === 0x06
    ) {
      endOfCentralDirectory = index;
      break;
    }
  }

  if (endOfCentralDirectory < 0) {
    throw new Error("ZIP inválido");
  }

  const centralDirectoryOffset = r32(bytes, endOfCentralDirectory + 16);
  const centralDirectorySize = r32(bytes, endOfCentralDirectory + 12);
  const entries = {};
  let position = centralDirectoryOffset;

  while (position < centralDirectoryOffset + centralDirectorySize) {
    if (
      bytes[position] !== 0x50 ||
      bytes[position + 1] !== 0x4b ||
      bytes[position + 2] !== 0x01 ||
      bytes[position + 3] !== 0x02
    ) {
      break;
    }

    const compression = r16(bytes, position + 10);
    const compressedSize = r32(bytes, position + 20);
    const fileNameLength = r16(bytes, position + 28);
    const extraLength = r16(bytes, position + 30);
    const commentLength = r16(bytes, position + 32);
    const localHeaderOffset = r32(bytes, position + 42);
    const name = new TextDecoder().decode(
      bytes.slice(position + 46, position + 46 + fileNameLength)
    );

    entries[name] = {
      compression,
      compressedSize,
      localHeaderOffset,
    };

    position += 46 + fileNameLength + extraLength + commentLength;
  }

  return { bytes, entries };
}

function entryBytes(bytes, entry) {
  const fileNameLength = r16(bytes, entry.localHeaderOffset + 26);
  const extraLength = r16(bytes, entry.localHeaderOffset + 28);
  const start = entry.localHeaderOffset + 30 + fileNameLength + extraLength;
  const raw = bytes.slice(start, start + entry.compressedSize);

  if (entry.compression === 0) {
    return Promise.resolve(raw);
  }

  if (entry.compression === 8) {
    const decompressionStream = new DecompressionStream("deflate-raw");
    const writer = decompressionStream.writable.getWriter();
    const reader = decompressionStream.readable.getReader();
    const chunks = [];

    writer.write(raw);
    writer.close();

    function read() {
      return reader.read().then((result) => {
        if (result.done) {
          const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
          const output = new Uint8Array(total);
          let offset = 0;

          chunks.forEach((chunk) => {
            output.set(chunk, offset);
            offset += chunk.length;
          });

          return output;
        }

        chunks.push(result.value);
        return read();
      });
    }

    return read();
  }

  return Promise.reject(
    new Error(`Compresión no soportada: ${entry.compression}`)
  );
}

function entryText(bytes, entry) {
  return entryBytes(bytes, entry).then((result) => {
    return new TextDecoder().decode(result);
  });
}

export function parseXlsx(buffer) {
  const zip = zipEntries(buffer);
  const namespace = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
  const parser = new DOMParser();

  const sharedStringsPromise = zip.entries["xl/sharedStrings.xml"]
    ? entryText(zip.bytes, zip.entries["xl/sharedStrings.xml"]).then((xml) => {
        const doc = parser.parseFromString(xml, "text/xml");
        return Array.from(doc.getElementsByTagNameNS(namespace, "si")).map(
          (stringItem) => {
            return Array.from(stringItem.getElementsByTagNameNS(namespace, "t"))
              .map((textNode) => textNode.textContent || "")
              .join("");
          }
        );
      })
    : Promise.resolve([]);

  const worksheetKey = Object.keys(zip.entries).find((key) => {
    return key === "xl/worksheets/sheet1.xml";
  });

  if (!worksheetKey) {
    return Promise.reject(new Error("No sheet1.xml"));
  }

  return Promise.all([
    sharedStringsPromise,
    entryText(zip.bytes, zip.entries[worksheetKey]),
  ]).then(([strings, worksheetXml]) => {
    const worksheetDoc = parser.parseFromString(worksheetXml, "text/xml");
    const rows = [];
    const worksheetRows = worksheetDoc.getElementsByTagNameNS(namespace, "row");

    for (let rowIndex = 0; rowIndex < worksheetRows.length; rowIndex += 1) {
      const cells = {};
      const rowCells = worksheetRows[rowIndex].getElementsByTagNameNS(
        namespace,
        "c"
      );

      for (let cellIndex = 0; cellIndex < rowCells.length; cellIndex += 1) {
        const cell = rowCells[cellIndex];
        const reference = cell.getAttribute("r") || "";
        const column = reference.replace(/\d/g, "");
        const type = cell.getAttribute("t") || "";
        const valueElement = cell.getElementsByTagNameNS(namespace, "v")[0];
        const inlineStringElement = cell.getElementsByTagNameNS(
          namespace,
          "is"
        )[0];

        if (inlineStringElement) {
          const textElement = inlineStringElement.getElementsByTagNameNS(
            namespace,
            "t"
          )[0];
          if (textElement) {
            cells[column] = textElement.textContent || "";
          }
        } else if (valueElement) {
          const raw = valueElement.textContent;
          if (type === "s") {
            cells[column] = strings[parseInt(raw, 10)] || "";
          } else if (type === "str" || type === "e") {
            cells[column] = raw;
          } else {
            const parsed = parseFloat(raw);
            cells[column] = Number.isNaN(parsed) ? raw : parsed;
          }
        }
      }

      if (Object.keys(cells).length) {
        rows.push(cells);
      }
    }

    return rows;
  });
}

export function extractInv(rows) {
  const inventory = {};

  if (!rows.length) {
    return inventory;
  }

  const firstRow = rows[0];
  const formatB =
    typeof firstRow.H === "string" &&
    firstRow.H.length > 0 &&
    (firstRow.A === "ZONA" ||
      firstRow.A === "Colima AYC" ||
      firstRow.A === "Manzanillo AYC");

  if (formatB) {
    const consigna = new Set([
      "CONSIGNA DEL LAGO",
      "CONSIGNA LLANTRAC",
      "CONSIGNA MORALES",
      "-CONSIGNA DEL LAGO",
      "-CONSIGNA LLANTRAC",
      "-CONSIGNA MORALES",
    ]);

    rows.forEach((cell) => {
      const description = typeof cell.H === "string" ? cell.H.trim() : "";
      const almacen = typeof cell.I === "string" ? cell.I.trim() : "";
      const existencia =
        typeof cell.J === "number" ? cell.J : parseFloat(cell.J);

      if (
        !description ||
        description === "DESCRIPCION" ||
        Number.isNaN(existencia) ||
        existencia <= 0 ||
        consigna.has(almacen)
      ) {
        return;
      }

      inventory[description] = (inventory[description] || 0) + existencia;
    });
  } else {
    const skip =
      /^(YANTISSIMO|Existencia|Al |Todas|Consolidado|Valuación|Artículo|Línea:)/;

    rows.forEach((cell) => {
      const description = typeof cell.A === "string" ? cell.A.trim() : "";
      const secondColumn = typeof cell.B === "string" ? cell.B.trim() : "";

      if (
        !description ||
        secondColumn ||
        skip.test(description) ||
        /^\d+ artículos/.test(description)
      ) {
        return;
      }

      if (typeof cell.L === "number" && cell.L > 0) {
        inventory[description] = cell.L;
      }
    });
  }

  return inventory;
}

export function norm(value = "") {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildBaseIndex(base) {
  const baseIndex = {};

  base.forEach((row) => {
    baseIndex[norm(row.desc)] = row.desc;
  });

  return baseIndex;
}

export function matchDesc(importedDescription, baseIndex) {
  const normalized = norm(importedDescription);

  if (baseIndex[normalized]) {
    return baseIndex[normalized];
  }

  const stripCodes = (value) => {
    return value
      .replace(/\s*\(\d+\)\s*/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  const withoutCodes = stripCodes(normalized);
  if (baseIndex[withoutCodes]) {
    return baseIndex[withoutCodes];
  }

  for (const [baseNormalized, baseDescription] of Object.entries(baseIndex)) {
    if (
      stripCodes(baseNormalized) === withoutCodes ||
      stripCodes(baseNormalized) === normalized
    ) {
      return baseDescription;
    }
  }

  const words = new Set(
    normalized.split(" ").filter((word) => word.length > 2)
  );
  const firstWord = normalized.split(" ")[0];
  let bestMatch = null;
  let bestScore = 0;

  for (const [baseNormalized, baseDescription] of Object.entries(baseIndex)) {
    if (baseNormalized.split(" ")[0] !== firstWord) {
      continue;
    }

    const baseWords = new Set(
      baseNormalized.split(" ").filter((word) => word.length > 2)
    );
    let score = 0;

    words.forEach((word) => {
      if (baseWords.has(word)) {
        score += 1;
      }
    });

    const required = Math.max(5, Math.ceil(baseWords.size * 0.75));
    if (score > bestScore && score >= required) {
      bestScore = score;
      bestMatch = baseDescription;
    }
  }

  return bestMatch;
}

function readFileAsArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.readAsArrayBuffer(file);
  });
}

export async function parseImportedInventory(file, base, baseIndex) {
  const buffer = await readFileAsArrayBuffer(file);
  const rows = await parseXlsx(buffer);
  const rawInventory = extractInv(rows);
  const matched = {};
  let matchedCount = 0;

  Object.entries(rawInventory).forEach(([description, existencia]) => {
    const normalized = norm(description);
    if (baseIndex[normalized]) {
      const baseDescription = baseIndex[normalized];
      const baseRow = base.find((row) => row.desc === baseDescription);
      const cap = baseRow
        ? Math.min(
            existencia,
            baseRow.inv_promo !== undefined ? baseRow.inv_promo : baseRow.inv
          )
        : existencia;
      matched[baseDescription] = { value: cap, exact: true };
      matchedCount += 1;
    }
  });

  Object.entries(rawInventory).forEach(([description, existencia]) => {
    const baseDescription = matchDesc(description, baseIndex);
    if (baseDescription && !matched[baseDescription]) {
      const baseRow = base.find((row) => row.desc === baseDescription);
      const cap = baseRow
        ? Math.min(
            existencia,
            baseRow.inv_promo !== undefined ? baseRow.inv_promo : baseRow.inv
          )
        : existencia;
      matched[baseDescription] = { value: cap, exact: false };
      matchedCount += 1;
    }
  });

  const inventory = {};
  Object.entries(matched).forEach(([description, entry]) => {
    inventory[description] = entry.value;
  });

  return {
    inventory,
    matchedCount,
    importDate: file.name.replace(/\.xlsx?$/i, ""),
  };
}

export function dId(description) {
  try {
    return btoa(unescape(encodeURIComponent(description)))
      .replace(/[^a-zA-Z0-9]/g, "")
      .slice(0, 20);
  } catch {
    return Math.abs(
      description.split("").reduce((sum, character) => {
        return sum + character.charCodeAt(0);
      }, 0)
    ).toString();
  }
}

export function parseBrand(description) {
  const skip = new Set([
    "R13",
    "R14",
    "R15",
    "R16",
    "R17",
    "R18",
    "R19",
    "R20",
    "R21",
    "R22",
    "LT",
    "8PR",
    "XL",
    "SL",
    "ROF",
    "ZR18",
    "ZR19",
    "ZR20",
  ]);
  const parts = description.trim().split(/\s+/);
  let index = 0;

  while (
    index < parts.length &&
    (/^\d/.test(parts[index]) ||
      parts[index].includes("/") ||
      parts[index].includes("X") ||
      skip.has(parts[index]))
  ) {
    index += 1;
  }

  if (index >= parts.length) {
    return { marca: "—", modelo: description };
  }

  return {
    marca: parts[index],
    modelo: parts
      .slice(index + 1)
      .join(" ")
      .replace(/\s*\([^)]+\)\s*/g, "")
      .trim(),
  };
}

export function fmt0(value) {
  return value.toLocaleString("es-MX", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

export function fmt2(value) {
  return value.toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function getCoverageMeta(months) {
  months = Number(months);
  const cap = Math.min(months, 48);
  const percent = Number(((cap / 48) * 100).toFixed(0));
  const color =
    months >= 24
      ? "#E24B4A"
      : months >= 12
      ? "#EF9F27"
      : months >= 6
      ? "#378ADD"
      : "#639922";
  const label = months >= 999 ? "sin ventas" : `${months.toFixed(1)} m`;

  return { percent, color, label };
}

export function getProgressMeta(sold, base) {
  if (!base) {
    return null;
  }

  const percent = Math.min(100, (sold / base) * 100);
  const color =
    percent >= 100 ? "#3B6D11" : percent >= 50 ? "#EF9F27" : "#378ADD";

  return {
    percent: Number(percent.toFixed(0)),
    color,
  };
}

export function getMarginValue(description, margins, globalMargin) {
  return margins[description] !== undefined
    ? margins[description]
    : globalMargin;
}

export function getPatioMarginValue(
  description,
  marginsPatio,
  globalMarginPatio
) {
  return marginsPatio[description] !== undefined
    ? marginsPatio[description]
    : globalMarginPatio;
}

export function getSoldPromo(row, currentInventory) {
  const current = currentInventory[row.desc];
  return current !== undefined ? Math.max(0, row.inv_promo - current) : 0;
}

export function sortRows(rows, sortCol, sortDir, currentInventory) {
  if (!sortCol) {
    return rows;
  }

  return [...rows].sort((rowA, rowB) => {
    let valueA;
    let valueB;

    if (sortCol === "curInvSort") {
      valueA =
        currentInventory[rowA.desc] !== undefined
          ? currentInventory[rowA.desc]
          : rowA.inv_promo;
      valueB =
        currentInventory[rowB.desc] !== undefined
          ? currentInventory[rowB.desc]
          : rowB.inv_promo;
    } else {
      valueA = rowA[sortCol];
      valueB = rowB[sortCol];
    }

    if (typeof valueA === "string") {
      return sortDir * valueA.localeCompare(valueB, "es", { numeric: true });
    }

    return sortDir * ((valueA || 0) - (valueB || 0));
  });
}

export function filterRows(
  base,
  {
    excludedSet,
    tab,
    currentInventory,
    hasImportedInventory,
    tierFilter,
    providerFilter,
    branchFilter,
    search,
  }
) {
  return base.filter((row) => {
    if (excludedSet.has(row.desc)) {
      return false;
    }

    if (tab === "avance") {
      if (!hasImportedInventory || getSoldPromo(row, currentInventory) === 0) {
        return false;
      }
    } else if (tab && row.nivel !== tab) {
      return false;
    }

    if (tierFilter && row.tier !== tierFilter) {
      return false;
    }

    if (providerFilter && row.prov !== providerFilter) {
      return false;
    }

    const branchHaystack = `${row.locs} · ${row.locs_consigna}`.toUpperCase();
    if (branchFilter && !branchHaystack.includes(branchFilter)) {
      return false;
    }

    if (search) {
      const terms = search
        .split(",")
        .map((term) => term.trim().toLowerCase())
        .filter(Boolean);
      const haystack = `${row.medida} ${row.desc}`.toLowerCase();

      if (!terms.some((term) => haystack.includes(term))) {
        return false;
      }
    }

    return true;
  });
}

export function isMichelin(row) {
  return row.desc.toUpperCase().includes("MICHELIN");
}

export function getMichelinDiscount(
  description,
  michelinDiscounts,
  globalMichelinDiscount
) {
  return michelinDiscounts[description] !== undefined
    ? michelinDiscounts[description]
    : globalMichelinDiscount;
}

export function calcPrecioFromLista(lista, discount) {
  if (!lista) {
    return null;
  }

  const discounted = lista * (1 - discount / 100);
  const conIVA = discounted * 1.16;

  return {
    sinIVA: discounted,
    conIVA,
    rounded: round5(conIVA),
  };
}

export function calcPatioPrecioFromLista(lista, medida, discount) {
  if (!lista) {
    return null;
  }

  const rin = getRin(medida);
  const montaje = rin && MONTAJES[rin] ? MONTAJES[rin] : 0;
  const discounted = lista * (1 - discount / 100);
  const conIVA = (discounted + montaje) * 1.16;

  return {
    sinIVA: discounted,
    montaje,
    conIVA,
    rounded: round5(conIVA),
  };
}

export function getMarginBucket(margin) {
  if (margin <= 15) {
    return "≤15%";
  }

  if (margin <= 25) {
    return "16-25%";
  }

  if (margin <= 35) {
    return "26-35%";
  }

  return "≥36%";
}
