import { formatShortUrl } from "./format";

export function fallbackAnalytics(code) {
  return {
    code,
    totalClicks: 184,
    countries: [
      { label: "India", value: 74 },
      { label: "United States", value: 51 },
      { label: "Germany", value: 32 },
      { label: "Brazil", value: 27 },
    ],
    devices: [
      { label: "Mobile", value: 99 },
      { label: "Desktop", value: 63 },
      { label: "Tablet", value: 22 },
    ],
    browsers: [
      { label: "Chrome", value: 91 },
      { label: "Safari", value: 48 },
      { label: "Edge", value: 28 },
      { label: "Firefox", value: 17 },
    ],
  };
}

export function buildFallbackLink(originalUrl) {
  const code = Math.random().toString(36).slice(2, 7);

  return {
    id: crypto.randomUUID(),
    code,
    shortUrl: formatShortUrl(code),
    originalUrl,
    clicks: 0,
    createdAt: new Date().toISOString(),
  };
}
