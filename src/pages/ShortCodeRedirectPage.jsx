import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getApiBaseUrl } from "../api/urlApi";

const maxAttempts = 15;
const retryDelayMs = 2000;

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export default function ShortCodeRedirectPage() {
  const { code } = useParams();
  const [status, setStatus] = useState("booting");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function waitForBackendAndRedirect() {
      if (!code) {
        setStatus("not-found");
        return;
      }

      const apiBaseUrl = getApiBaseUrl();

      for (let currentAttempt = 1; currentAttempt <= maxAttempts; currentAttempt += 1) {
        if (cancelled) return;

        setAttempt(currentAttempt);
        setStatus("booting");

        try {
          const healthResponse = await fetch(`${apiBaseUrl}/actuator/health`, {
            headers: { Accept: "application/json" },
          });

          if (healthResponse.ok) {
            const statsResponse = await fetch(`${apiBaseUrl}/api/urls/${code}/stats`, {
              headers: { Accept: "application/json" },
            });

            if (statsResponse.ok) {
              window.location.replace(`${apiBaseUrl}/${code}`);
              return;
            }

            if (statsResponse.status === 404) {
              setStatus("not-found");
              return;
            }
          }
        } catch {
          // ponytail: backend is probably cold-starting; keep the user on our loader instead of Render's wake page.
        }

        if (currentAttempt < maxAttempts) {
          await sleep(retryDelayMs);
        }
      }

      if (!cancelled) {
        setStatus("unavailable");
      }
    }

    waitForBackendAndRedirect();

    return () => {
      cancelled = true;
    };
  }, [code]);

  const copy = {
    booting: {
      title: "Starting Blink...",
      body: `Waking the link service and preparing your redirect${attempt ? ` (${attempt}/${maxAttempts})` : ""}.`,
    },
    unavailable: {
      title: "Backend still starting",
      body: "The link service took too long to respond. Please retry in a few seconds.",
    },
    "not-found": {
      title: "Short link not found",
      body: "This short code does not exist or is no longer available.",
    },
  }[status];

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f7fb] px-6">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        {status === "booting" ? (
          <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
        ) : (
          <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl font-semibold text-slate-700">
            !
          </div>
        )}
        <div className="text-3xl font-semibold tracking-tight text-slate-900">{copy.title}</div>
        <p className="mt-3 text-base text-slate-500">{copy.body}</p>
      </div>
    </div>
  );
}
