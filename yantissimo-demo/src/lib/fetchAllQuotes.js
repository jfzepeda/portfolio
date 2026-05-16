async function fetchQuotes(sucFilter, curSuc, filter, searchTerm, api, dayjs) {
  try {
    const response = await api(
      `/api/quotes?sucursal=${
        sucFilter || curSuc
      }&type=${filter}&searchTerm=${searchTerm}`
    );
    if (!response.ok) throw new Error("Error al obtener cotizaciones");

    const data = await response.json();
    const quotesMapped = data.map((quote) => ({
      ...quote,
      start: quote.start ? dayjs(quote.start) : null,
      end: quote.end_date ? dayjs(quote.end_date) : null,
      services:
        typeof quote.services === "string"
          ? JSON.parse(quote.services)
          : quote.services,
      items:
        typeof quote.items === "string" ? JSON.parse(quote.items) : quote.items,
    }));

    return quotesMapped;
  } catch (error) {
    console.error("Error al cargar cotizaciones:", error);
    return [];
  }
}

export default fetchQuotes;
