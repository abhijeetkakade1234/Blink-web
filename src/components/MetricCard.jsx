export default function MetricCard({ label, value, tone = "default" }) {
  const tones = {
    default: "bg-white",
    cyan: "bg-white",
    coral: "bg-white",
  };

  return (
    <div
      className={[
        "rounded-2xl border border-slate-200 p-5 shadow-sm",
        tones[tone],
      ].join(" ")}
    >
      <div className="text-sm font-medium text-slate-500">{label}</div>
      <div className="mt-3 text-4xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}
