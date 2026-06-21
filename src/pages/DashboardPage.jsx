import { useEffect, useMemo, useState } from "react";
import { deleteUrl, listUrls, updateUrl } from "../api/urlApi";
import EditLinkModal from "../components/EditLinkModal";
import LinkCard from "../components/LinkCard";
import Pagination from "../components/Pagination";
import QrModal from "../components/QrModal";
import SectionHeading from "../components/SectionHeading";
import useLocalLinks from "../hooks/useLocalLinks";
import { formatShortUrl } from "../utils/format";

const pageSize = 6;

export default function DashboardPage() {
  const { links, setLinks } = useLocalLinks();
  const [deletingId, setDeletingId] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [qrItem, setQrItem] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState({ loading: true, note: "" });
  const [savingEdit, setSavingEdit] = useState(false);
  const [remoteMeta, setRemoteMeta] = useState({ enabled: false, totalPages: 1, totalItems: 0 });

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const data = await listUrls({ page, size: pageSize, query: search.trim() });
        if (cancelled) return;

        const items = Array.isArray(data) ? data : data.items ?? [];
        const normalized = items.map((item) => ({
          id: item.id,
          code: item.shortCode ?? item.code,
          shortUrl: item.shortUrl ?? formatShortUrl(item.shortCode ?? item.code),
          originalUrl: item.originalUrl,
          clicks: item.clickCount ?? item.clicks ?? 0,
          createdAt: item.createdAt,
          expiresAt: item.expiresAt ?? null,
        }));

        setLinks(normalized);
        setRemoteMeta({
          enabled: !Array.isArray(data),
          totalPages: Array.isArray(data) ? 1 : Math.max(data.totalPages ?? 1, 1),
          totalItems: Array.isArray(data) ? normalized.length : data.totalItems ?? normalized.length,
        });
        setStatus({ loading: false, note: "" });
      } catch {
        if (!cancelled) {
          setRemoteMeta({ enabled: false, totalPages: 1, totalItems: 0 });
          setStatus({
            loading: false,
            note: "Dashboard is using local data until GET /api/urls is reachable.",
          });
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [page, search, setLinks]);

  const filteredLinks = useMemo(() => {
    if (remoteMeta.enabled) return links;

    const query = search.trim().toLowerCase();
    if (!query) return links;

    return links.filter((item) =>
      [item.originalUrl, item.shortUrl, item.code]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query)),
    );
  }, [links, remoteMeta.enabled, search]);

  const totalPages = remoteMeta.enabled ? remoteMeta.totalPages : Math.max(1, Math.ceil(filteredLinks.length / pageSize));
  const paginatedLinks = remoteMeta.enabled
    ? filteredLinks
    : filteredLinks.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  async function handleCopy(code) {
    await navigator.clipboard.writeText(formatShortUrl(code));
  }

  async function handleDelete(id) {
    setDeletingId(id);
    try {
      await deleteUrl(id);
    } catch {
      // ponytail: keep local deletion even if remote delete fails so the dashboard stays usable during API bring-up.
    }
    setLinks((current) => current.filter((item) => item.id !== id));
    setRemoteMeta((current) => ({
      ...current,
      totalItems: current.enabled ? Math.max(current.totalItems - 1, 0) : current.totalItems,
    }));
    setDeletingId("");
  }

  async function handleSaveEdit(form) {
    if (!editingItem) return;

    setSavingEdit(true);
    const nextItem = {
      ...editingItem,
      originalUrl: form.originalUrl,
      code: form.shortCode,
      shortUrl: formatShortUrl(form.shortCode),
    };

    try {
      const response = await updateUrl(editingItem.id, {
        url: form.originalUrl,
        customAlias: form.shortCode,
      });

      setLinks((current) =>
        current.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                originalUrl: response.originalUrl ?? form.originalUrl,
                code: response.shortCode ?? form.shortCode,
                shortUrl: response.shortUrl ?? formatShortUrl(form.shortCode),
              }
            : item,
        ),
      );
      setStatus({ loading: false, note: "" });
    } catch {
      // ponytail: local edit preview keeps the flow moving until PATCH exists server-side.
      setLinks((current) => current.map((item) => (item.id === editingItem.id ? nextItem : item)));
      setStatus({
        loading: false,
        note: "Edit saved locally. Backend still needs PATCH /api/urls/{id}.",
      });
    }

    setSavingEdit(false);
    setEditingItem(null);
  }

  return (
    <section>
      <SectionHeading
        title="Dashboard"
        body="Manage the links you created, clean out old ones, and jump into analytics when needed."
      />
      <div className="mb-6 flex flex-col gap-3 rounded-[28px] border border-white/70 bg-white/85 p-4 shadow-panel backdrop-blur dark:border-white/10 dark:bg-slate-900/70 md:flex-row md:items-center md:justify-between">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by URL or short code"
          className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-4 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-cyan-950 md:max-w-md"
        />
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {(remoteMeta.enabled ? remoteMeta.totalItems : filteredLinks.length)} link
          {(remoteMeta.enabled ? remoteMeta.totalItems : filteredLinks.length) === 1 ? "" : "s"}
        </div>
      </div>

      {status.note ? <p className="mb-5 text-sm text-amber-600 dark:text-amber-300">{status.note}</p> : null}
      {status.loading ? (
        <div className="rounded-[32px] border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
          Loading links...
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-2">
        {paginatedLinks.map((item) => (
          <LinkCard
            key={item.code}
            item={item}
            onCopy={handleCopy}
            onDelete={handleDelete}
            onEdit={setEditingItem}
            onQr={setQrItem}
            deletingId={deletingId}
          />
        ))}
      </div>
      {!status.loading && !filteredLinks.length ? (
        <div className="rounded-[32px] border border-dashed border-slate-300 bg-white/70 p-8 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
          No matching links. Try a different search or create a new one.
        </div>
      ) : null}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <EditLinkModal
        item={editingItem}
        open={Boolean(editingItem)}
        saving={savingEdit}
        onClose={() => setEditingItem(null)}
        onSave={handleSaveEdit}
      />
      <QrModal item={qrItem} open={Boolean(qrItem)} onClose={() => setQrItem(null)} />
    </section>
  );
}
