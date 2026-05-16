import api, { del, post, put } from "~/lib/api";

const IMAGES_ENDPOINT = "/api/images";
const MISSING_IMAGES_ENDPOINT = "/api/images/missing";

const readJsonSafe = async (response) => {
  try {
    return await response.json();
  } catch (_err) {
    return null;
  }
};

const throwIfNotOk = async (response, fallbackMessage) => {
  if (response.ok) return null;
  const data = await readJsonSafe(response);
  throw new Error(data?.error || fallbackMessage);
};

export const getImages = async ({
  signal,
  query,
  proveedor,
  limit,
  offset,
}) => {
  const params = new URLSearchParams();
  if (query?.trim()) params.set("model", query.trim());
  if (proveedor) params.set("proveedor", proveedor);
  params.set("limit", String(limit));
  params.set("offset", String(offset));

  const url = params.toString()
    ? `${IMAGES_ENDPOINT}?${params.toString()}`
    : IMAGES_ENDPOINT;

  const response = await api(url, signal ? { signal } : undefined);
  await throwIfNotOk(response, "No se pudieron cargar las imagenes.");
  return readJsonSafe(response);
};

export const getProveedores = async ({ signal } = {}) => {
  const response = await api(
    `${IMAGES_ENDPOINT}/proveedores`,
    signal ? { signal } : undefined
  );
  await throwIfNotOk(response, "No se pudieron cargar los proveedores.");
  return readJsonSafe(response);
};

export const getMissingImages = async ({
  signal,
  limit,
  offset,
  search,
  marca,
  includeSummary = true,
  includeMarcas = true,
}) => {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  params.set("offset", String(offset));
  if (includeSummary) params.set("include_summary", "true");
  if (includeMarcas) params.set("include_marcas", "true");
  if (search?.trim()) params.set("search", search.trim());
  if (marca) params.set("marca", marca);

  const response = await api(
    `${MISSING_IMAGES_ENDPOINT}?${params.toString()}`,
    signal ? { signal } : undefined
  );
  await throwIfNotOk(response, "No se pudieron cargar los modelos sin imagen.");
  return readJsonSafe(response);
};

export const createImage = async (payload) => {
  const response = await post(IMAGES_ENDPOINT, payload);
  await throwIfNotOk(response, "No se pudo guardar la imagen.");
  return readJsonSafe(response);
};

export const updateImage = async (id, payload) => {
  const response = await put(`${IMAGES_ENDPOINT}/${id}`, payload);
  await throwIfNotOk(response, "No se pudo actualizar la imagen.");
  return readJsonSafe(response);
};

export const refreshImages = async ({
  marca = null,
  clearAll = false,
} = {}) => {
  const response = await post(`${IMAGES_ENDPOINT}/refresh`, {
    marca,
    clearAll,
  });
  await throwIfNotOk(response, "No se pudo completar la transferencia.");
  return readJsonSafe(response);
};

export const removeImage = async (id) => {
  const response = await del(`${IMAGES_ENDPOINT}/${id}`);
  if (!response.ok && response.status !== 204) {
    const data = await readJsonSafe(response);
    throw new Error(data?.error || "No se pudo eliminar la imagen.");
  }
};
