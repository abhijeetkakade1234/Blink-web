export default function MetricCard({ label, value, tone = "default" }) {
  const tones = {
    default: "from-white to-slate-50 dark:from-slate-900 dark:to-slate-900",
    cyan: "from-cyan-500 to-cyan-400 text-white",
    coral: "from-rose-400 to-rose-300 text-white",
  };

  return (
    <div
      className={[
        "rounded-[28px] border border-white/70 bg-gradient-to-br p-5 shadow-panel dark:border-white/10",
        tones[tone],
      ].join(" ")}
    >
      <div className="text-sm uppercase tracking-[0.2em] text-slate-400 dark:text-slate-300">{label}</div>
      <div className="mt-4 text-3xl font-semibold">{value}</div>
    </div>
  );
}
