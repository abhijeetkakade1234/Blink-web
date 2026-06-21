import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createShortUrl } from "../api/urlApi";
import MetricCard from "../components/MetricCard";
import SectionHeading from "../components/SectionHeading";
import useLocalLinks from "../hooks/useLocalLinks";
import { formatShortUrl } from "../utils/format";
import { buildFallbackLink } from "../utils/mockData";

export default function HomePage() {
  const navigate = useNavigate();
  const { links, setLinks } = useLocalLinks();
  const [longUrl, setLongUrl] = useState("");
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState({ loading: false, error: "" });

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus({ loading: true, error: "" });

    try {
      const data = await createShortUrl({ originalUrl: longUrl });
      const nextItem = {
        id: data.id ?? crypto.randomUUID(),
        code: data.code,
        shortUrl: data.shortUrl ?? formatShortUrl(data.code),
        originalUrl: data.originalUrl ?? longUrl,
        clicks: data.clicks ?? 0,
        createdAt: data.createdAt ?? new Date().toISOString(),
      };

      setResult(nextItem);
      setLinks((current) => [nextItem, ...current.filter((item) => item.code !== nextItem.code)]);
      setLongUrl("");
    } catch (error) {
      const nextItem = buildFallbackLink(longUrl);
      // ponytail: local fallback keeps the UI usable until the API is actually ready.
      setResult(nextItem);
      setLinks((current) => [nextItem, ...current.filter((item) => item.code !== nextItem.code)]);
      setLongUrl("");
      setStatus({
        loading: false,
        error: error?.response?.data?.message
          ? `${error.response.data.message} Showing a local preview link instead.`
          : "API unavailable. Showing a local preview link instead.",
      });
      return;
    }

    setStatus({ loading: false, error: "" });
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result.shortUrl ?? formatShortUrl(result.code));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
      <section className="rounded-[32px] border border-white/70 bg-white/85 p-6 shadow-panel backdrop-blur dark:border-white/10 dark:bg-slate-900/70 sm:p-8">
        <SectionHeading
          title="Shorten long URLs instantly"
          body="Paste your long link, create a short code, and keep everything in one clean workspace."
        />

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">Paste your long link</span>
            <input
              type="url"
              value={longUrl}
              onChange={(event) => setLongUrl(event.target.value)}
              placeholder="https://example.com/long/url"
              required
              className="w-full rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-cyan-950"
            />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={status.loading}
              className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {status.loading ? "Creating..." : "Create short link"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Open dashboard
            </button>
          </div>
          {status.error ? <p className="text-sm text-rose-600 dark:text-rose-300">{status.error}</p> : null}
        </form>

        {result ? (
          <div className="mt-8 rounded-[28px] bg-sand p-5 dark:bg-slate-950">
            <div className="mb-2 text-sm uppercase tracking-[0.2em] text-slate-500">Generated short link</div>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <a
                href={result.shortUrl ?? formatShortUrl(result.code)}
                target="_blank"
                rel="noreferrer"
                className="text-2xl font-semibold text-cyan-700 dark:text-cyan-400"
              >
                {result.shortUrl ?? formatShortUrl(result.code)}
              </a>
              <button
                type="button"
                onClick={handleCopy}
                className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-400"
              >
                Copy
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <aside className="space-y-6">
        <MetricCard label="Links created" value={links.length} />
        <MetricCard
          label="Total clicks"
          value={links.reduce((sum, item) => sum + (item.clicks || 0), 0)}
          tone="cyan"
        />
        <div className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-panel backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
          <div className="mb-3 text-sm uppercase tracking-[0.2em] text-slate-400">Recent links</div>
          <div className="space-y-4">
            {links.slice(0, 3).map((item) => (
              <div key={item.code} className="rounded-3xl bg-slate-50 px-4 py-3 dark:bg-slate-950">
                <div className="truncate text-sm text-slate-500 dark:text-slate-400">{item.originalUrl}</div>
                <div className="mt-1 font-medium text-slate-900 dark:text-white">
                  {item.shortUrl ?? formatShortUrl(item.code)}
                </div>
              </div>
            ))}
            {!links.length ? <p className="text-sm text-slate-500 dark:text-slate-400">Your created links will show up here.</p> : null}
          </div>
        </div>
      </aside>
    </div>
  );
}
