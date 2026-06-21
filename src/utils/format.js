export function getPublicBaseUrl() {
  const configured = import.meta.env.VITE_PUBLIC_BASE_URL?.trim();
  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, "");
  }

  return "";
}

export function formatShortUrl(code) {
  const baseUrl = getPublicBaseUrl();
  return baseUrl ? `${baseUrl}/${code}` : `/${code}`;
}

export function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
