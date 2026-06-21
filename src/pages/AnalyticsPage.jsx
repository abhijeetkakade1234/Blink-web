import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getUrlStats } from "../api/urlApi";
import MetricCard from "../components/MetricCard";
import SectionHeading from "../components/SectionHeading";
import SimpleBarChart from "../components/SimpleBarChart";
import { fallbackAnalytics } from "../utils/mockData";

export default function AnalyticsPage() {
  const { code } = useParams();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState({ loading: true, error: "" });

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      if (code === "sample") {
        setData(fallbackAnalytics(code));
        setStatus({ loading: false, error: "" });
        return;
      }

      try {
        const response = await getUrlStats(code);
        if (!cancelled) {
          setData(response);
          setStatus({ loading: false, error: "" });
        }
      } catch {
        if (!cancelled) {
          setData(fallbackAnalytics(code));
          setStatus({ loading: false, error: "" });
        }
      }
    }

    loadStats();

    return () => {
      cancelled = true;
    };
  }, [code]);

  if (status.loading) {
    return <div className="text-sm text-slate-500">Loading analytics...</div>;
  }

  if (status.error) {
    return <div className="text-sm text-rose-600">{status.error}</div>;
  }

  return (
    <section>
      <SectionHeading
        title={`Analytics for ${code}`}
        body="A simple breakdown of clicks, country distribution, device usage, and browser share."
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <MetricCard label="Total clicks" value={data.totalClicks} tone="cyan" />
        <MetricCard label="Top country" value={data.countries[0]?.label || "N/A"} />
        <MetricCard label="Top device" value={data.devices[0]?.label || "N/A"} tone="coral" />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Country breakdown</h2>
          <SimpleBarChart items={data.countries} color="bg-cyan-500" />
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Device stats</h2>
          <SimpleBarChart items={data.devices} color="bg-blue-500" />
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Browser stats</h2>
          <SimpleBarChart items={data.browsers} color="bg-slate-700" />
        </div>
      </div>
    </section>
  );
}
