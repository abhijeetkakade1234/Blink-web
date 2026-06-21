import axios from "axios";

export function getApiBaseUrl() {
  return (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/+$/, "");
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 2000,
});

export async function createShortUrl(payload) {
  const { data } = await api.post("/api/urls", {
    url: payload.url ?? payload.originalUrl,
    customAlias: payload.customAlias,
    expiresAt: payload.expiresAt,
  });
  return data;
}

export async function getUrlStats(code) {
  const { data } = await api.get(`/api/urls/${code}/stats`);
  return data;
}

export async function listUrls(params = {}) {
  const { data } = await api.get("/api/urls", { params });
  return data;
}

export async function deleteUrl(id) {
  const { data } = await api.delete(`/api/urls/${id}`);
  return data;
}

export async function updateUrl(id, payload) {
  const { data } = await api.patch(`/api/urls/${id}`, payload);
  return data;
}

export default api;
