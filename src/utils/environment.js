export function isLocalDevelopment() {
  if (import.meta.env.DEV) return true;

  if (typeof window === "undefined") return false;

  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
}
