export default function SimpleBarChart({ items = [], valueKey = "value", labelKey = "label", color = "bg-cyan-500" }) {
  const max = Math.max(...items.map((item) => item[valueKey] || 0), 1);

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const value = item[valueKey] || 0;
        const width = `${(value / max) * 100}%`;

        return (
          <div key={item[labelKey]}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-300">{item[labelKey]}</span>
              <span className="font-medium">{value}</span>
            </div>
            <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800">
              <div className={`h-3 rounded-full ${color}`} style={{ width }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
