import { Link } from "react-router-dom";
import { formatDate, formatShortUrl } from "../utils/format";

export default function LinkCard({
  item,
  onCopy,
  onDelete,
  onEdit,
  onQr,
  deletingId,
}) {
  const shortUrl = item.shortUrl ?? formatShortUrl(item.code);

  return (
    <article className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-panel backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="mb-2 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">{item.originalUrl}</p>
          <a
            className="text-lg font-semibold text-cyan-600 hover:text-cyan-500"
            href={shortUrl}
            target="_blank"
            rel="noreferrer"
          >
            {shortUrl}
          </a>
        </div>
        <div className="rounded-2xl bg-slate-100 px-3 py-2 text-right dark:bg-slate-800">
          <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Clicks</div>
          <div className="text-xl font-semibold">{item.clicks ?? 0}</div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
        <span>Created {formatDate(item.createdAt)}</span>
        <span>{item.code}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onCopy(item.code)}
          className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-400"
        >
          Copy
        </button>
        <button
          type="button"
          onClick={() => onQr(item)}
          className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          QR Code
        </button>
        <button
          type="button"
          onClick={() => onEdit(item)}
          className="rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-200 dark:bg-amber-950/40 dark:text-amber-300"
        >
          Edit
        </button>
        <Link
          to={`/analytics/${item.code}`}
          className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          View Analytics
        </Link>
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          disabled={deletingId === item.id}
          className="rounded-full bg-rose-100 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-200 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-rose-950/40 dark:text-rose-300"
        >
          {deletingId === item.id ? "Deleting..." : "Delete"}
        </button>
      </div>
    </article>
  );
}
