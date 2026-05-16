import { resolveMock } from "~/mocks";

function buildUrl(path, params) {
  if (!params || Object.keys(params).length === 0) return path;
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    sp.append(key, String(value));
  });
  const qs = sp.toString();
  return qs ? `${path}?${qs}` : path;
}

function mockResponse(data, status = 200) {
  const body = JSON.stringify(data);
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    headers: {
      get(name) {
        return name.toLowerCase() === "content-type" ? "application/json" : null;
      },
    },
    json: async () => data,
    text: async () => body,
    clone() {
      return mockResponse(data, status);
    },
  };
}

export function normalizeError(err) {
  if (err?.status !== undefined) return err;
  return { status: 0, message: err?.message || "Network error" };
}

export async function getJson(path, params = {}, _init = {}) {
  return resolveMock(buildUrl(path, params), "GET");
}

export async function postJson(path, _body, _init = {}) {
  return resolveMock(path, "POST");
}

export async function putJson(path, _body, _init = {}) {
  return resolveMock(path, "PUT");
}

export function rawPost(url, _body, _init = {}) {
  return mockResponse(resolveMock(url, "POST"));
}

export function post(path, _body, _init = {}) {
  return mockResponse(resolveMock(path, "POST"));
}

export function del(path, _init = {}) {
  return mockResponse(resolveMock(path, "DELETE"));
}

export function put(path, _body, _init = {}) {
  return mockResponse(resolveMock(path, "PUT"));
}

async function api(path, init = {}) {
  const method = (init.method || "GET").toUpperCase();
  return mockResponse(resolveMock(path, method));
}

export default api;
