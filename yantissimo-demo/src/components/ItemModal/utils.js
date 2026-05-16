export const getRinDiscount = (item) => {
  const brand = item?.marca?.toLowerCase() || "";
  const articulo = item?.articulo?.toLowerCase() || "";

  // Extract rim size from articulo (e.g., "R17", "R18", etc.)
  const rinMatch = articulo.match(/r(\d{2})/i);
  const rin = rinMatch ? parseInt(rinMatch[1]) : null;
  // console.debug("Calculating RIN discount for brand:", brand, "rin:", rin);

  if (brand === "michelin") {
    switch (rin) {
      case 17:
        return 5;
      case 18:
        return 7;
      case 19:
        return 4;
      case 20:
        return 4;
      case 21:
        return 3;
      case 22:
        return 3;
      case 23:
        return 3;
      default:
        return 0;
    }
  } else if (brand === "bfgoodrich") {
    switch (rin) {
      case 15:
        return 3;
      case 16:
        return 3;
      case 17:
        return 4;
      case 18:
        return 6;
      case 19:
        return 3;
      case 20:
        return 3;
      case 21:
        return 0;
      case 22:
        return 8;
      default:
        return 0;
    }
  }

  return 0;
};
