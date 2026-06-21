function qrUrl(shortUrl) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(shortUrl)}`;
}

export default function QrModal({ item, open, onClose }) {
  if (!open || !item) return null;
  const shortUrl = item.shortUrl || item.code;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
      <div className="w-full max-w-md rounded-[32px] border border-white/70 bg-white p-6 shadow-panel dark:border-white/10 dark:bg-slate-900">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-ink dark:text-white">QR code</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Scan or download this code for {shortUrl}.
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

        <div className="rounded-[28px] bg-slate-50 p-6 text-center dark:bg-slate-950">
          <img
            src={qrUrl(shortUrl)}
            alt={`QR code for ${shortUrl}`}
            className="mx-auto h-60 w-60 rounded-2xl bg-white p-3"
          />
          <a
            href={qrUrl(shortUrl)}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex rounded-full bg-cyan-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-400"
          >
            Open QR image
          </a>
        </div>
      </div>
    </div>
  );
}
