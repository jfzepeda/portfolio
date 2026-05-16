import api from "~/lib/api";

const DEFAULT_BUCKET_NAME = "Images-yssm";
const DEFAULT_UPLOAD_ENDPOINT = "/api/backblaze";
const DEFAULT_PUBLIC_BASE_URL =
  process.env.NEXT_PUBLIC_BACKBLAZE_PUBLIC_BASE_URL ||
  "https://f004.backblazeb2.com/file";

const normalizeCredentials = (data) => ({
  uploadUrl: data?.uploadUrl || data?.uploadurlAPI || "",
  authorizationToken: data?.authorizationToken || "",
});

export async function getBackblazeUploadCredentials(uploadEndpoint) {
  const response = await api(DEFAULT_UPLOAD_ENDPOINT + uploadEndpoint);
  if (!response.ok) {
    throw new Error("No se pudo obtener URL de carga para Backblaze");
  }
  const data = await response.json();
  const credentials = normalizeCredentials(data);
  if (!credentials.uploadUrl || !credentials.authorizationToken) {
    throw new Error("Respuesta inválida al obtener credenciales de Backblaze");
  }
  return credentials;
}

export function getBackblazePublicUrl({
  fileName,
  bucketName = DEFAULT_BUCKET_NAME,
  publicBaseUrl = DEFAULT_PUBLIC_BASE_URL,
}) {
  return `${publicBaseUrl}/${bucketName}/${encodeURIComponent(fileName)}`;
}

export async function uploadFileToBackblaze({
  file,
  fileName,
  bucketName = DEFAULT_BUCKET_NAME,
  uploadEndpoint = "/conversations",
  publicBaseUrl = DEFAULT_PUBLIC_BASE_URL,
}) {
  if (!file) {
    throw new Error("Archivo requerido para subir a Backblaze");
  }
  if (!fileName) {
    throw new Error("Nombre de archivo requerido para subir a Backblaze");
  }

  const { uploadUrl, authorizationToken } = await getBackblazeUploadCredentials(
    uploadEndpoint
  );

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: authorizationToken,
      "X-Bz-File-Name": encodeURIComponent(fileName),
      "Content-Type": file.type || "application/octet-stream",
      "X-Bz-Content-Sha1": "do_not_verify",
    },
    body: file,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error ${response.status}: ${errorText}`);
  }

  const uploadResponse = await response.json();
  const publicUrl = getBackblazePublicUrl({
    fileName,
    bucketName,
    publicBaseUrl,
  });

  return { publicUrl, uploadResponse };
}
