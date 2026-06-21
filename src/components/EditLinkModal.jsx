import { useEffect, useState } from "react";

export default function EditLinkModal({ item, open, saving, onClose, onSave }) {
  const [form, setForm] = useState({ originalUrl: "", shortCode: "" });

  useEffect(() => {
    if (item) {
      setForm({
        originalUrl: item.originalUrl ?? "",
        shortCode: item.code ?? item.shortCode ?? "",
      });
    }
  }, [item]);

  if (!open || !item) return null;

  function handleSubmit(event) {
    event.preventDefault();
    onSave(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
      <div className="w-full max-w-lg rounded-[32px] border border-white/70 bg-white p-6 shadow-panel dark:border-white/10 dark:bg-slate-900">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-ink dark:text-white">Edit link</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Update the destination URL or short code.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            Close
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">Original URL</span>
            <input
              type="url"
              value={form.originalUrl}
              onChange={(event) => setForm((current) => ({ ...current, originalUrl: event.target.value }))}
              required
              className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-cyan-950"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-300">Short code</span>
            <input
              type="text"
              value={form.shortCode}
              onChange={(event) => setForm((current) => ({ ...current, shortCode: event.target.value }))}
              required
              className="w-full rounded-[22px] border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-cyan-950"
            />
          </label>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
