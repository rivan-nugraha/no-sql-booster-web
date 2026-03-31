import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Database,
  HardDrive,
  Layers,
  Loader2,
  RefreshCw,
  Table2,
} from "lucide-react";
import { useDatabase } from "../../context/DatabaseContext";
import { listCollectionDocuments, listDatabaseCollections } from "../../client";
import type { CollectionItem } from "../../client/model/database_model";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

const PAGE_SIZE = 50;

/* ── Document Viewer ─────────────────────────────────────── */

function DocumentViewer({
  connectionId,
  dbName,
  collectionName,
  onBack,
}: {
  connectionId: string;
  dbName: string;
  collectionName: string;
  onBack: () => void;
}) {
  const [documents, setDocuments] = useState<Array<Record<string, unknown>>>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const fetchDocuments = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await listCollectionDocuments(
        connectionId,
        dbName,
        collectionName,
        pageNum * PAGE_SIZE,
        PAGE_SIZE,
      );
      setDocuments(res.data ?? []);
      setTotal(res.count ?? 0);
      setExpandedRows(new Set());
    } catch (err: any) {
      setError(err?.message || "Failed to load documents");
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [connectionId, dbName, collectionName]);

  useEffect(() => {
    fetchDocuments(page);
  }, [page, fetchDocuments]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const toggleRow = (idx: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  // Collect all unique keys from documents for column headers
  const allKeys = Array.from(
    documents.reduce<Set<string>>((keys, doc) => {
      Object.keys(doc).forEach((k) => keys.add(k));
      return keys;
    }, new Set()),
  );

  // Put _id first if present
  const sortedKeys = allKeys.includes("_id")
    ? ["_id", ...allKeys.filter((k) => k !== "_id")]
    : allKeys;

  // Limit visible columns to keep the table manageable
  const MAX_COLUMNS = 8;
  const visibleKeys = sortedKeys.slice(0, MAX_COLUMNS);
  const hasMoreKeys = sortedKeys.length > MAX_COLUMNS;

  const renderCellValue = (val: unknown): string => {
    if (val === null || val === undefined) return "null";
    if (typeof val === "object") return JSON.stringify(val);
    return String(val);
  };

  const truncate = (s: string, max = 80) =>
    s.length > max ? s.slice(0, max) + "…" : s;

  return (
    <div className="pt-2 mt-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-8 h-8 rounded-md border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-subtle)]"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-0.5">
              <span>{dbName}</span>
              <span>/</span>
              <span className="font-medium text-[var(--text)]">{collectionName}</span>
            </div>
            <h1 className="text-xl font-semibold text-[var(--text)]">Documents</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-[var(--text-muted)]">
            {total.toLocaleString()} document{total !== 1 ? "s" : ""}
          </span>
          <button
            onClick={() => fetchDocuments(page)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-[var(--text-muted)]">
          <Loader2 size={24} className="animate-spin mr-2" />
          <span>Loading documents...</span>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="rounded-lg border border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20 p-4 text-sm text-red-600 dark:text-red-400 mb-4">
          {error}
        </div>
      )}

      {/* Documents Table */}
      {!loading && !error && (
        <>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--surface-subtle)]">
                    <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)] w-10">#</th>
                    {visibleKeys.map((key) => (
                      <th
                        key={key}
                        className="text-left px-4 py-3 font-medium text-[var(--text-muted)] max-w-[200px]"
                      >
                        {key}
                      </th>
                    ))}
                    {hasMoreKeys && (
                      <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">
                        ...
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {documents.length === 0 ? (
                    <tr>
                      <td
                        colSpan={visibleKeys.length + 1 + (hasMoreKeys ? 1 : 0)}
                        className="text-center py-8 text-[var(--text-muted)]"
                      >
                        No documents found
                      </td>
                    </tr>
                  ) : (
                    documents.map((doc, idx) => {
                      const rowNum = page * PAGE_SIZE + idx + 1;
                      const isExpanded = expandedRows.has(idx);
                      return (
                        <tr
                          key={idx}
                          className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
                          onClick={() => toggleRow(idx)}
                        >
                          {isExpanded ? (
                            <td
                              colSpan={visibleKeys.length + 1 + (hasMoreKeys ? 1 : 0)}
                              className="px-4 py-3"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-medium text-[var(--text-muted)]">#{rowNum}</span>
                                <span className="text-xs text-[var(--text-muted)]">
                                  (click to collapse)
                                </span>
                              </div>
                              <pre className="text-xs text-[var(--text)] bg-[var(--surface-subtle)] border border-[var(--border)] rounded-md p-3 overflow-x-auto whitespace-pre-wrap break-all max-h-[400px] overflow-y-auto">
                                {JSON.stringify(doc, null, 2)}
                              </pre>
                            </td>
                          ) : (
                            <>
                              <td className="px-4 py-3 text-[var(--text-muted)] tabular-nums">
                                {rowNum}
                              </td>
                              {visibleKeys.map((key) => (
                                <td
                                  key={key}
                                  className="px-4 py-3 text-[var(--text)] max-w-[200px] truncate"
                                  title={renderCellValue(doc[key])}
                                >
                                  <span className="font-mono text-xs">
                                    {truncate(renderCellValue(doc[key]))}
                                  </span>
                                </td>
                              ))}
                              {hasMoreKeys && (
                                <td className="px-4 py-3 text-[var(--text-muted)] text-xs">
                                  +{sortedKeys.length - MAX_COLUMNS} fields
                                </td>
                              )}
                            </>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-[var(--text-muted)]">
                Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of{" "}
                {total.toLocaleString()}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="flex items-center justify-center w-8 h-8 rounded-md border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] disabled:opacity-30"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-sm text-[var(--text)]">
                  {page + 1} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="flex items-center justify-center w-8 h-8 rounded-md border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] disabled:opacity-30"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── Main Dashboard ──────────────────────────────────────── */

export default function Dashboard() {
  const { selected } = useDatabase();
  const [collections, setCollections] = useState<Array<CollectionItem>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCollection, setActiveCollection] = useState<string | null>(null);

  const fetchCollections = async () => {
    if (!selected) return;
    setLoading(true);
    setError(null);
    try {
      const res = await listDatabaseCollections(selected.connectionId, selected.dbName);
      setCollections(res.data ?? []);
    } catch (err: any) {
      setError(err?.message || "Failed to load collections");
      setCollections([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setActiveCollection(null);
    fetchCollections();
  }, [selected?.connectionId, selected?.dbName]);

  if (!selected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-[var(--text-muted)]">
        <Database size={48} className="opacity-30 mb-4" />
        <p className="text-lg font-medium">No database selected</p>
        <p className="text-sm mt-1 opacity-70">
          Click a database from the sidebar to view its collections
        </p>
      </div>
    );
  }

  // Show document viewer when a collection is selected
  if (activeCollection) {
    return (
      <DocumentViewer
        connectionId={selected.connectionId}
        dbName={selected.dbName}
        collectionName={activeCollection}
        onBack={() => setActiveCollection(null)}
      />
    );
  }

  const totalDocs = collections.reduce((s, c) => s + c.count, 0);
  const totalSize = collections.reduce((s, c) => s + c.size, 0);
  const totalStorageSize = collections.reduce((s, c) => s + c.storageSize, 0);
  const totalIndexSize = collections.reduce((s, c) => s + c.indexSize, 0);

  return (
    <div className="pt-2 mt-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-1">
            <span>{selected.connectionName}</span>
            <span>/</span>
            <span className="font-medium text-[var(--text)]">{selected.dbName}</span>
          </div>
          <h1 className="text-xl font-semibold text-[var(--text)]">Collections</h1>
        </div>
        <button
          onClick={fetchCollections}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
            <Table2 size={14} />
            <span className="text-xs">Collections</span>
          </div>
          <p className="text-2xl font-semibold text-[var(--text)]">{collections.length}</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
            <Layers size={14} />
            <span className="text-xs">Documents</span>
          </div>
          <p className="text-2xl font-semibold text-[var(--text)]">{totalDocs.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
            <HardDrive size={14} />
            <span className="text-xs">Data Size</span>
          </div>
          <p className="text-2xl font-semibold text-[var(--text)]">{formatBytes(totalSize)}</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex items-center gap-2 text-[var(--text-muted)] mb-1">
            <Database size={14} />
            <span className="text-xs">Storage + Index</span>
          </div>
          <p className="text-2xl font-semibold text-[var(--text)]">
            {formatBytes(totalStorageSize + totalIndexSize)}
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-[var(--text-muted)]">
          <Loader2 size={24} className="animate-spin mr-2" />
          <span>Loading collections...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="rounded-lg border border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20 p-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Collections Table */}
      {!loading && !error && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-subtle)]">
                  <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">Type</th>
                  <th className="text-right px-4 py-3 font-medium text-[var(--text-muted)]">Documents</th>
                  <th className="text-right px-4 py-3 font-medium text-[var(--text-muted)]">Avg Doc Size</th>
                  <th className="text-right px-4 py-3 font-medium text-[var(--text-muted)]">Data Size</th>
                  <th className="text-right px-4 py-3 font-medium text-[var(--text-muted)]">Storage</th>
                  <th className="text-right px-4 py-3 font-medium text-[var(--text-muted)]">Indexes</th>
                  <th className="text-right px-4 py-3 font-medium text-[var(--text-muted)]">Index Size</th>
                </tr>
              </thead>
              <tbody>
                {collections.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-[var(--text-muted)]">
                      No collections found in this database
                    </td>
                  </tr>
                ) : (
                  collections.map((col) => (
                    <tr
                      key={col.name}
                      onClick={() => setActiveCollection(col.name)}
                      className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--surface-subtle)] transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Table2 size={14} className="text-[var(--text-muted)] shrink-0" />
                          <span className="font-medium text-[var(--text)]">{col.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--text-muted)]">
                        <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-[var(--surface-subtle)] border border-[var(--border)]">
                          {col.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-[var(--text)] tabular-nums">
                        {col.count.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-[var(--text-muted)] tabular-nums">
                        {formatBytes(col.avgObjSize)}
                      </td>
                      <td className="px-4 py-3 text-right text-[var(--text)] tabular-nums">
                        {formatBytes(col.size)}
                      </td>
                      <td className="px-4 py-3 text-right text-[var(--text-muted)] tabular-nums">
                        {formatBytes(col.storageSize)}
                      </td>
                      <td className="px-4 py-3 text-right text-[var(--text)] tabular-nums">
                        {col.indexes}
                      </td>
                      <td className="px-4 py-3 text-right text-[var(--text-muted)] tabular-nums">
                        {formatBytes(col.indexSize)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}