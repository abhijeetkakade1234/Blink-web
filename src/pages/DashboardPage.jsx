import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteUrl, listUrls, updateUrl } from "../api/urlApi";
import EditLinkModal from "../components/EditLinkModal";
import LinkCard from "../components/LinkCard";
import MetricCard from "../components/MetricCard";
import Pagination from "../components/Pagination";
import QrModal from "../components/QrModal";
import SectionHeading from "../components/SectionHeading";
import useLocalLinks from "../hooks/useLocalLinks";
import { isLocalDevelopment } from "../utils/environment";
import { formatShortUrl } from "../utils/format";

const pageSize = 6;

export default function DashboardPage() {
  const navigate = useNavigate();
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
          if (!isLocalDevelopment()) {
            setLinks([]);
            setStatus({
              loading: false,
              note: "Could not load links from the API.",
            });
            return;
          }

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
      setLinks((current) => current.filter((item) => item.id !== id));
      setRemoteMeta((current) => ({
        ...current,
        totalItems: current.enabled ? Math.max(current.totalItems - 1, 0) : current.totalItems,
      }));
    } catch {
      if (isLocalDevelopment()) {
        // ponytail: keep local deletion even if remote delete fails so the dashboard stays usable during API bring-up.
        setLinks((current) => current.filter((item) => item.id !== id));
        setRemoteMeta((current) => ({
          ...current,
          totalItems: current.enabled ? Math.max(current.totalItems - 1, 0) : current.totalItems,
        }));
      } else {
        setStatus({
          loading: false,
          note: "Could not delete link. The API request failed.",
        });
      }
    }
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
      if (!isLocalDevelopment()) {
        setStatus({
          loading: false,
          note: "Could not save changes. The API request failed.",
        });
        setSavingEdit(false);
        return;
      }

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
      <div className="mb-8 grid gap-5 xl:grid-cols-4">
        <MetricCard label="Total Links" value={remoteMeta.enabled ? remoteMeta.totalItems : links.length} />
        <MetricCard label="Total Clicks" value={links.reduce((sum, item) => sum + (item.clicks || 0), 0)} />
        <MetricCard
          label="Active Links"
          value={links.filter((item) => !item.expiresAt).length}
        />
        <MetricCard
          label="This Week"
          value={links.slice(0, 7).reduce((sum, item) => sum + (item.clicks || 0), 0)}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.9fr_0.95fr]">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 md:flex-row md:items-center md:justify-between">
            <div className="text-2xl font-semibold text-slate-900">Recent Links</div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by URL or short code"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 sm:w-72"
              />
              <LinkCardPlaceholder />
            </div>
          </div>

          {status.note ? <p className="px-6 pt-4 text-sm text-amber-600">{status.note}</p> : null}
          {status.loading ? <p className="px-6 py-8 text-sm text-slate-500">Loading links...</p> : null}

          {!status.loading && paginatedLinks.length ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-sm text-slate-500">
                    <th className="px-6 py-4 font-medium">Original URL</th>
                    <th className="px-6 py-4 font-medium">Short URL</th>
                    <th className="px-6 py-4 font-medium">Clicks</th>
                    <th className="px-6 py-4 font-medium">Created</th>
                    <th className="px-6 py-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedLinks.map((item) => (
                    <tr key={item.id ?? item.code} className="border-b border-slate-100 align-top">
                      <td className="px-6 py-4">
                        <div className="max-w-[320px] truncate text-sm text-slate-600">{item.originalUrl}</div>
                      </td>
                      <td className="px-6 py-4">
                        <a
                          href={item.shortUrl ?? formatShortUrl(item.code)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-blue-600 hover:text-blue-500"
                        >
                          {item.shortUrl ?? formatShortUrl(item.code)}
                        </a>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900">{item.clicks ?? 0}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Intl.DateTimeFormat("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }).format(new Date(item.createdAt))}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopy(item.code)}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Copy
                          </button>
                          <button
                            type="button"
                            onClick={() => setQrItem(item)}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                          >
                            QR
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingItem(item)}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                          >
                            {deletingId === item.id ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          {!status.loading && !paginatedLinks.length ? (
            <div className="px-6 py-8 text-sm text-slate-500">No matching links. Try a different search or create a new one.</div>
          ) : null}

          <div className="px-6 py-5">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 text-2xl font-semibold text-slate-900">Analytics Overview</div>
            <div className="mb-4 text-sm text-slate-500">Total Clicks</div>
            <div className="text-4xl font-semibold text-slate-900">
              {links.reduce((sum, item) => sum + (item.clicks || 0), 0)}
            </div>
            <div className="mt-6 space-y-4">
              {links.slice(0, 5).map((item) => (
                <div key={item.code} className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-blue-600">
                      {item.shortUrl ?? formatShortUrl(item.code)}
                    </div>
                    <div className="truncate text-sm text-slate-500">{item.originalUrl}</div>
                  </div>
                  <div className="text-sm font-medium text-slate-900">{item.clicks ?? 0}</div>
                </div>
              ))}
              {!links.length ? <div className="text-sm text-slate-500">Analytics will populate as links start getting clicks.</div> : null}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 text-xl font-semibold text-slate-900">Quick Actions</div>
            <p className="mb-4 text-sm text-slate-500">Use these common shortcuts for day-to-day link management.</p>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500"
              >
                Create new link
              </button>
              <button
                type="button"
                onClick={() => setSearch("")}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Clear search
              </button>
            </div>
          </div>
        </div>
      </div>

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

function LinkCardPlaceholder() {
  return (
    <div className="text-sm text-slate-500">
      Standard link dashboard
    </div>
  );
}
