/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { useCallback, useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Database,
  FileCode,
  Filter,
  HardDrive,
  Layers,
  Loader2,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Save,
  Search,
  Table2,
  Trash2,
  X,
} from "lucide-react";
import { useDatabase } from "../../context/DatabaseContext";
import {
  createScript,
  deleteScript,
  listCollectionDocuments,
  listDatabaseCollections,
  listScripts,
  runDatabaseScript,
  updateCollectionDocument,
  updateScript,
} from "../../client";
import type { CollectionItem } from "../../client/model/database_model";
import type { ScriptItem } from "../../client/script";

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

  // Filter state
  type FilterRow = { field: string; value: string };
  const [filterRows, setFilterRows] = useState<Array<FilterRow>>([{ field: "", value: "" }]);
  const [activeFilter, setActiveFilter] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [knownFields, setKnownFields] = useState<Array<string>>([]);
  const [focusedFieldIdx, setFocusedFieldIdx] = useState<number | null>(null);
  const [highlightIdx, setHighlightIdx] = useState(-1);

  // Edit modal state
  const [editDoc, setEditDoc] = useState<Record<string, unknown> | null>(null);
  const [editJson, setEditJson] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchDocuments = useCallback(
    async (pageNum: number, filter?: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await listCollectionDocuments(
          connectionId,
          dbName,
          collectionName,
          pageNum * PAGE_SIZE,
          PAGE_SIZE,
          filter || undefined,
        );
        const docs = res.data ?? [];
        setDocuments(docs);
        setTotal(res.count ?? 0);
        setExpandedRows(new Set());

        // Collect field names from documents for the filter dropdown
        if (docs.length > 0) {
          setKnownFields((prev) => {
            const fieldSet = new Set(prev);
            docs.forEach((d) => Object.keys(d).forEach((k) => fieldSet.add(k)));
            return Array.from(fieldSet).sort();
          });
        }
      } catch (err: any) {
        setError(err?.message || "Failed to load documents");
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    },
    [connectionId, dbName, collectionName],
  );

  useEffect(() => {
    fetchDocuments(page, activeFilter);
  }, [page, fetchDocuments, activeFilter]);

  const handleApplyFilter = () => {
    const validRows = filterRows.filter((r) => r.field && r.value);
    if (validRows.length === 0) {
      setActiveFilter("");
      setPage(0);
      return;
    }
    const obj: Record<string, unknown> = {};
    for (const row of validRows) {
      // Try to parse value as JSON (number, boolean, object, array)
      try {
        obj[row.field] = JSON.parse(row.value);
      } catch {
        obj[row.field] = row.value;
      }
    }
    setActiveFilter(JSON.stringify(obj));
    setPage(0);
  };

  const handleClearFilter = () => {
    setFilterRows([{ field: "", value: "" }]);
    setActiveFilter("");
    setPage(0);
  };

  const handleEditClick = (e: React.MouseEvent, doc: Record<string, unknown>) => {
    e.stopPropagation();
    setEditDoc(doc);
    setEditJson(JSON.stringify(doc, null, 2));
    setEditError(null);
  };

  const handleSaveEdit = async () => {
    if (!editDoc) return;
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(editJson);
    } catch {
      setEditError("Invalid JSON");
      return;
    }

    const docId = String(editDoc._id ?? "");
    if (!docId) {
      setEditError("Document has no _id field");
      return;
    }

    setSaving(true);
    setEditError(null);
    try {
      await updateCollectionDocument(connectionId, dbName, collectionName, docId, parsed);
      setEditDoc(null);
      fetchDocuments(page, activeFilter);
    } catch (err: any) {
      setEditError(err?.message || "Failed to update document");
    } finally {
      setSaving(false);
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const toggleRow = (idx: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const allKeys = Array.from(
    documents.reduce<Set<string>>((keys, doc) => {
      Object.keys(doc).forEach((k) => keys.add(k));
      return keys;
    }, new Set()),
  );

  const sortedKeys = allKeys.includes("_id")
    ? ["_id", ...allKeys.filter((k) => k !== "_id")]
    : allKeys;

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

  const colCount = visibleKeys.length + 2 + (hasMoreKeys ? 1 : 0); // +2 for # and actions

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
            onClick={() => setShowFilter((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border ${
              activeFilter
                ? "border-green-500 text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400"
                : "border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-subtle)]"
            }`}
          >
            <Filter size={14} />
            Filter
          </button>
          <button
            onClick={() => fetchDocuments(page, activeFilter)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      {showFilter && (
        <div className="mb-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
              <Filter size={12} />
              <span>Filter</span>
              {activeFilter && (
                <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  Active
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {filterRows.map((row, i) => {
              const suggestions =
                focusedFieldIdx === i && row.field
                  ? knownFields.filter((f) =>
                      f.toLowerCase().includes(row.field.toLowerCase()) && f !== row.field,
                    )
                  : focusedFieldIdx === i && !row.field
                    ? knownFields
                    : [];

              return (
                <div key={i} className="flex items-center gap-2">
                  {/* Field autocomplete */}
                  <div className="relative w-48">
                    <input
                      type="text"
                      value={row.field}
                      onChange={(e) => {
                        const next = [...filterRows];
                        next[i] = { ...next[i], field: e.target.value };
                        setFilterRows(next);
                        setFocusedFieldIdx(i);
                        setHighlightIdx(-1);
                      }}
                      onFocus={() => {
                        setFocusedFieldIdx(i);
                        setHighlightIdx(-1);
                      }}
                      onBlur={() => {
                        // Delay to allow click on suggestion
                        setTimeout(() => setFocusedFieldIdx((prev) => (prev === i ? null : prev)), 150);
                      }}
                      onKeyDown={(e) => {
                        if (suggestions.length > 0) {
                          if (e.key === "ArrowDown") {
                            e.preventDefault();
                            setHighlightIdx((h) => Math.min(h + 1, suggestions.length - 1));
                          } else if (e.key === "ArrowUp") {
                            e.preventDefault();
                            setHighlightIdx((h) => Math.max(h - 1, 0));
                          } else if (e.key === "Enter" && highlightIdx >= 0) {
                            e.preventDefault();
                            const next = [...filterRows];
                            next[i] = { ...next[i], field: suggestions[highlightIdx] };
                            setFilterRows(next);
                            setFocusedFieldIdx(null);
                            setHighlightIdx(-1);
                          } else if (e.key === "Tab" && suggestions.length > 0) {
                            e.preventDefault();
                            const pick = highlightIdx >= 0 ? suggestions[highlightIdx] : suggestions[0];
                            const next = [...filterRows];
                            next[i] = { ...next[i], field: pick };
                            setFilterRows(next);
                            setFocusedFieldIdx(null);
                            setHighlightIdx(-1);
                          } else if (e.key === "Escape") {
                            setFocusedFieldIdx(null);
                          }
                        } else if (e.key === "Enter") {
                          handleApplyFilter();
                        }
                      }}
                      placeholder="Field name"
                      autoComplete="off"
                      className="w-full h-9 px-3 text-sm font-mono rounded-md border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-hidden focus:ring-3 focus:ring-brand-500/15"
                    />
                    {suggestions.length > 0 && (
                      <ul className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-md border border-[var(--border)] bg-[var(--surface)] shadow-lg">
                        {suggestions.map((s, si) => (
                          <li
                            key={s}
                            onMouseDown={() => {
                              const next = [...filterRows];
                              next[i] = { ...next[i], field: s };
                              setFilterRows(next);
                              setFocusedFieldIdx(null);
                              setHighlightIdx(-1);
                            }}
                            className={`px-3 py-1.5 text-sm font-mono cursor-pointer ${
                              si === highlightIdx
                                ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "text-[var(--text)] hover:bg-[var(--surface-subtle)]"
                            }`}
                          >
                            {row.field ? (
                              <>
                                {s.substring(0, s.toLowerCase().indexOf(row.field.toLowerCase()))}
                                <span className="font-semibold text-green-600 dark:text-green-400">
                                  {s.substring(
                                    s.toLowerCase().indexOf(row.field.toLowerCase()),
                                    s.toLowerCase().indexOf(row.field.toLowerCase()) + row.field.length,
                                  )}
                                </span>
                                {s.substring(
                                  s.toLowerCase().indexOf(row.field.toLowerCase()) + row.field.length,
                                )}
                              </>
                            ) : (
                              s
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Value input */}
                  <input
                    type="text"
                    value={row.value}
                    onChange={(e) => {
                      const next = [...filterRows];
                      next[i] = { ...next[i], value: e.target.value };
                      setFilterRows(next);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleApplyFilter();
                    }}
                    placeholder="Value"
                    className="flex-1 h-9 px-3 text-sm rounded-md border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-hidden focus:ring-3 focus:ring-brand-500/15"
                  />

                  {/* Remove row */}
                  {filterRows.length > 1 && (
                    <button
                      onClick={() => setFilterRows(filterRows.filter((_, j) => j !== i))}
                      className="flex items-center justify-center w-9 h-9 rounded-md text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Remove condition"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => setFilterRows([...filterRows, { field: "", value: "" }])}
              className="flex items-center gap-1 px-2.5 h-8 text-xs rounded-md border border-dashed border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-subtle)]"
            >
              <Plus size={12} />
              Add condition
            </button>
            <div className="flex-1" />
            {activeFilter && (
              <button
                onClick={handleClearFilter}
                className="flex items-center gap-1.5 px-3 h-8 text-xs rounded-md border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-subtle)]"
              >
                Reset
              </button>
            )}
            <button
              onClick={handleApplyFilter}
              className="flex items-center gap-1.5 px-4 h-8 text-xs font-medium rounded-md bg-green-600 text-white hover:bg-green-700"
            >
              <Search size={12} />
              Find
            </button>
          </div>
        </div>
      )}

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
                    <th className="text-center px-4 py-3 font-medium text-[var(--text-muted)] w-16">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {documents.length === 0 ? (
                    <tr>
                      <td
                        colSpan={colCount}
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
                            <td colSpan={colCount} className="px-4 py-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-[var(--text-muted)]">
                                    #{rowNum}
                                  </span>
                                  <span className="text-xs text-[var(--text-muted)]">
                                    (click to collapse)
                                  </span>
                                </div>
                                <button
                                  onClick={(e) => handleEditClick(e, doc)}
                                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                >
                                  <Pencil size={12} />
                                  Edit Document
                                </button>
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
                              <td className="px-4 py-3 text-center">
                                <button
                                  onClick={(e) => handleEditClick(e, doc)}
                                  className="inline-flex items-center justify-center w-7 h-7 rounded-md text-[var(--text-muted)] hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                  title="Edit document"
                                >
                                  <Pencil size={14} />
                                </button>
                              </td>
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

      {/* Edit Document Modal */}
      {editDoc && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
          onClick={() => !saving && setEditDoc(null)}
        >
          <div
            className="w-full max-w-2xl mx-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
              <div>
                <h2 className="text-lg font-semibold text-[var(--text)]">Edit Document</h2>
                <p className="text-xs text-[var(--text-muted)] mt-0.5 font-mono">
                  _id: {String(editDoc._id ?? "N/A")}
                </p>
              </div>
              <button
                onClick={() => !saving && setEditDoc(null)}
                className="flex items-center justify-center w-8 h-8 rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-subtle)]"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5">
              <textarea
                value={editJson}
                onChange={(e) => {
                  setEditJson(e.target.value);
                  setEditError(null);
                }}
                spellCheck={false}
                className={`w-full h-80 px-3 py-2 text-xs font-mono rounded-md border ${
                  editError
                    ? "border-red-400"
                    : "border-[var(--border)]"
                } bg-[var(--input-bg)] text-[var(--text)] focus:outline-hidden focus:ring-3 focus:ring-brand-500/15 resize-y`}
              />
              {editError && (
                <p className="mt-2 text-xs text-red-500">{editError}</p>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-[var(--border)]">
              <button
                onClick={() => setEditDoc(null)}
                disabled={saving}
                className="px-4 py-2 text-sm rounded-md border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                {saving ? "Saving..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Script Editor ───────────────────────────────────────── */

function ScriptEditor({
  connectionId,
  dbName,
  onBack,
}: {
  connectionId: string;
  dbName: string;
  onBack: () => void;
}) {
  const [scripts, setScripts] = useState<Array<ScriptItem>>([]);
  const [loading, setLoading] = useState(false);
  const [activeScript, setActiveScript] = useState<ScriptItem | null>(null);
  const [editorValue, setEditorValue] = useState("");
  const [scriptName, setScriptName] = useState("");
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState<string>("");
  const [runError, setRunError] = useState<string | null>(null);
  const [runMeta, setRunMeta] = useState<{ count?: number; message?: string } | null>(null);
  const [logs, setLogs] = useState<
    Array<{ ts: string; status: 'OK' | 'ERROR'; message: string }>
  >([]);
  const [consoleLogs, setConsoleLogs] = useState<Array<string>>([]);
  const [collections, setCollections] = useState<Array<CollectionItem>>([]);

  // Keep latest collections for Monaco completion without re-registering
  const collectionsRef = useRef<Array<CollectionItem>>([]);
  useEffect(() => {
    collectionsRef.current = collections;
  }, [collections]);

  // Fetch collections for the selected database so completion can suggest them
  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      try {
        const res = await listDatabaseCollections(connectionId, dbName);
        if (!cancelled) setCollections(res.data ?? []);
      } catch {
        if (!cancelled) setCollections([]);
      }
    };
    fetch();
    return () => {
      cancelled = true;
    };
  }, [connectionId, dbName]);

  const completionDisposable = useRef<{ dispose: () => void } | null>(null);

  const fetchScripts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listScripts(); // fetch all scripts (global)
      setScripts(res.data ?? []);
    } catch {
      setScripts([]);
    } finally {
      setLoading(false);
    }
  }, [connectionId, dbName]);

  useEffect(() => {
    fetchScripts();
  }, [fetchScripts]);

  const handleNew = () => {
    setActiveScript(null);
    setScriptName("");
    setEditorValue("");
  };

  const handleSelect = (s: ScriptItem) => {
    setActiveScript(s);
    setScriptName(s.name);
    setEditorValue(s.script);
  };

  const handleSave = async () => {
    if (!scriptName.trim()) return;
    setSaving(true);
    try {
      if (activeScript) {
        await updateScript(activeScript._id, {
          name: scriptName,
          script: editorValue,
        });
      } else {
        await createScript({
          name: scriptName,
          script: editorValue,
        });
      }
      await fetchScripts();
      if (!activeScript) {
        setScriptName("");
        setEditorValue("");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRun = async () => {
    setRunning(true);
    setRunError(null);
    setRunMeta(null);
    setConsoleLogs([]);
    try {
      const res = await runDatabaseScript(connectionId, dbName, editorValue);
      const payload: any = res.data;
      const resultValue = payload && typeof payload === "object" && "result" in payload ? payload.result : res.data;
      const pretty =
        resultValue === undefined || resultValue === null
          ? "null"
          : typeof resultValue === "string"
            ? resultValue
            : JSON.stringify(resultValue, null, 2);
      setRunResult(pretty);
      setRunMeta({ count: res.count, message: res.message });
      if (payload?.logs && Array.isArray(payload.logs)) {
        setConsoleLogs(payload.logs);
      }
      setLogs((prev) => [
        {
          ts: new Date().toLocaleTimeString(),
          status: "OK",
          message: res.message || "Executed",
        },
        ...prev.slice(0, 9),
      ]);
    } catch (err: any) {
      setRunError(err?.message || "Failed to run script");
      setRunResult("");
      setLogs((prev) => [
        {
          ts: new Date().toLocaleTimeString(),
          status: "ERROR",
          message: err?.message || "Failed to run script",
        },
        ...prev.slice(0, 9),
      ]);
    } finally {
      setRunning(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this script?")) return;
    await deleteScript(id);
    if (activeScript?._id === id) handleNew();
    await fetchScripts();
  };

  return (
    <div className="flex flex-col h-screen min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800 bg-gray-900/60">
        <button
          onClick={onBack}
          className="p-1.5 rounded hover:bg-gray-800 text-gray-400 hover:text-white"
        >
          <ArrowLeft size={18} />
        </button>
        <FileCode size={18} className="text-green-400" />
        <h2 className="text-base font-semibold">Scripts</h2>
        <span className="text-xs text-gray-500">
          {dbName}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleNew}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700"
          >
            <Plus size={14} />
            New Script
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — saved scripts */}
        <div className="w-64 border-r border-gray-800 bg-gray-900/40 flex flex-col overflow-hidden">
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-800">
            Saved Scripts ({scripts.length})
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-gray-500" size={20} />
              </div>
            ) : scripts.length === 0 ? (
              <div className="px-3 py-6 text-center text-sm text-gray-600">
                No scripts yet
              </div>
            ) : (
              scripts.map((s) => (
                <div
                  key={s._id}
                  onClick={() => handleSelect(s)}
                  className={`flex items-center justify-between px-3 py-2 cursor-pointer border-b border-gray-800/50 hover:bg-gray-800/60 ${
                    activeScript?._id === s._id
                      ? "bg-gray-800 text-white"
                      : "text-gray-400"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileCode size={14} className="shrink-0 text-green-500" />
                    <span className="truncate text-sm">{s.name}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(s._id);
                    }}
                    className="p-1 rounded hover:bg-red-900/40 text-gray-600 hover:text-red-400"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Editor area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Script name input + save */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-800 bg-gray-900/30">
            <input
              type="text"
              placeholder="Script name..."
              value={scriptName}
              onChange={(e) => setScriptName(e.target.value)}
              className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-1.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-green-500"
            />
            <button
              onClick={handleSave}
              disabled={saving || !scriptName.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Save size={14} />
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleRun}
              disabled={running || !editorValue.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed"
              title="Execute against current database"
            >
              {running ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Play size={14} />
              )}
              {running ? "Running..." : "Run"}
            </button>
          </div>

          {/* Work area: editor + result side-by-side */}
          <div className="flex flex-1 gap-4 px-4 py-3 min-h-[60vh] overflow-hidden">
            <div className="flex-1 min-w-0 rounded-md border border-gray-800 bg-gray-900/30 overflow-hidden flex flex-col">
              <Editor
                height="100%"
                defaultLanguage="javascript"
                theme="vs-dark"
                value={editorValue}
                onChange={(val) => setEditorValue(val ?? "")}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 12 },
                  quickSuggestions: { other: true, comments: false, strings: true },
                  suggestOnTriggerCharacters: true,
                }}
                onMount={(_editor, monaco) => {
                  // Clean up existing provider if component remounts
                  completionDisposable.current?.dispose();

                  const methodsProvider = monaco.languages.registerCompletionItemProvider(
                    "javascript",
                    {
                      triggerCharacters: [".", '"', "'", "$", "f", "d", "c", "a"],
                      provideCompletionItems: (model: any, position: any) => {
                        const textUntilPosition = model.getValueInRange({
                          startLineNumber: position.lineNumber,
                          startColumn: 1,
                          endLineNumber: position.lineNumber,
                          endColumn: position.column,
                        });

                        // Case 1: `db.` or `db.<prefix>` => suggest collections
                        const dbDotMatch = /db\.$/.test(textUntilPosition);
                        const dbNameMatch = textUntilPosition.match(/db\.([A-Za-z0-9_]*)$/);
                        const collectionPrefix = dbNameMatch ? dbNameMatch[1] : "";
                        const collectionRange = {
                          startLineNumber: position.lineNumber,
                          endLineNumber: position.lineNumber,
                          startColumn: position.column - collectionPrefix.length,
                          endColumn: position.column,
                        };

                        const collectionSuggestions =
                          dbDotMatch || dbNameMatch
                            ? collectionsRef.current
                                .filter((c) =>
                                  collectionPrefix
                                    ? c.name.toLowerCase().startsWith(collectionPrefix.toLowerCase())
                                    : true,
                                )
                                .map((c) => ({
                                  label: c.name,
                                  kind: monaco.languages.CompletionItemKind.Field,
                                  insertText: c.name,
                                  detail: "Collection",
                                  documentation: `${c.count?.toLocaleString?.() ?? ""} docs`,
                                  range: collectionRange,
                                }))
                            : [];

                        // Case 2: `db.<collection>.` or `db.<collection>.f` => suggest methods on that collection
                        const collectionMethodMatch =
                          textUntilPosition.match(/db\.([A-Za-z0-9_]+)\.([A-Za-z]*)$/);
                        const activeCollection = collectionMethodMatch?.[1];
                        const methodPrefix = collectionMethodMatch?.[2] ?? "";
                        const methodRange = {
                          startLineNumber: position.lineNumber,
                          endLineNumber: position.lineNumber,
                          startColumn: position.column - methodPrefix.length,
                          endColumn: position.column,
                        };

                        const methodSuggestions = activeCollection
                          ? [
                              {
                                label: "find",
                                kind: monaco.languages.CompletionItemKind.Method,
                                insertText: `find({})`,
                                detail: `Find in ${activeCollection}`,
                                documentation: "Find documents",
                                range: methodRange,
                              },
                              {
                                label: "findOne",
                                kind: monaco.languages.CompletionItemKind.Method,
                                insertText: `findOne({})`,
                                detail: `Find single in ${activeCollection}`,
                                documentation: "Find one document",
                                range: methodRange,
                              },
                              {
                                label: "findOneAndUpdate",
                                kind: monaco.languages.CompletionItemKind.Method,
                                insertText: `findOneAndUpdate({}, {$set: {}}, { returnDocument: "after" })`,
                                detail: `Find and update in ${activeCollection}`,
                                documentation: "Find one and update",
                                range: methodRange,
                              },
                              {
                                label: "findOneAndDelete",
                                kind: monaco.languages.CompletionItemKind.Method,
                                insertText: `findOneAndDelete({})`,
                                detail: `Find and delete in ${activeCollection}`,
                                documentation: "Find one and delete",
                                range: methodRange,
                              },
                              {
                                label: "insertOne",
                                kind: monaco.languages.CompletionItemKind.Method,
                                insertText: `insertOne({})`,
                                detail: `Insert into ${activeCollection}`,
                                documentation: "Insert a single document",
                                range: methodRange,
                              },
                              {
                                label: "updateOne",
                                kind: monaco.languages.CompletionItemKind.Method,
                                insertText: `updateOne({}, {})`,
                                detail: `Update one in ${activeCollection}`,
                                documentation: "Update a single document",
                                range: methodRange,
                              },
                              {
                                label: "updateMany",
                                kind: monaco.languages.CompletionItemKind.Method,
                                insertText: `updateMany({}, {})`,
                                detail: `Update many in ${activeCollection}`,
                                documentation: "Update many documents",
                                range: methodRange,
                              },
                              {
                                label: "deleteOne",
                                kind: monaco.languages.CompletionItemKind.Method,
                                insertText: `deleteOne({})`,
                                detail: `Delete one in ${activeCollection}`,
                                documentation: "Delete a single document",
                                range: methodRange,
                              },
                              {
                                label: "deleteMany",
                                kind: monaco.languages.CompletionItemKind.Method,
                                insertText: `deleteMany({})`,
                                detail: `Delete many in ${activeCollection}`,
                                documentation: "Delete many documents",
                                range: methodRange,
                              },
                              {
                                label: "countDocuments",
                                kind: monaco.languages.CompletionItemKind.Method,
                                insertText: `countDocuments({})`,
                                detail: `Count in ${activeCollection}`,
                                documentation: "Count documents",
                                range: methodRange,
                              },
                              {
                                label: "distinct",
                                kind: monaco.languages.CompletionItemKind.Method,
                                insertText: `distinct("field", {})`,
                                detail: `Distinct values`,
                                documentation: "Get distinct values",
                                range: methodRange,
                              },
                              {
                                label: "sort",
                                kind: monaco.languages.CompletionItemKind.Method,
                                insertText: `sort({ createdAt: -1 })`,
                                detail: `Sort cursor`,
                                documentation: "Sort by fields",
                                range: methodRange,
                              },
                              {
                                label: "limit",
                                kind: monaco.languages.CompletionItemKind.Method,
                                insertText: `limit(50)`,
                                detail: `Limit cursor`,
                                documentation: "Limit result size",
                                range: methodRange,
                              },
                              {
                                label: "skip",
                                kind: monaco.languages.CompletionItemKind.Method,
                                insertText: `skip(0)`,
                                detail: `Skip cursor`,
                                documentation: "Skip n results",
                                range: methodRange,
                              },
                              {
                                label: "project",
                                kind: monaco.languages.CompletionItemKind.Method,
                                insertText: `project({ _id: 0 })`,
                                detail: `Project fields`,
                                documentation: "Projection shortcut",
                                range: methodRange,
                              },
                            ].filter((s) =>
                              methodPrefix
                                ? s.label.toLowerCase().startsWith(methodPrefix.toLowerCase())
                                : true,
                            )
                          : [];

                        const word = model.getWordUntilPosition(position);
                        const range = {
                          startLineNumber: position.lineNumber,
                          endLineNumber: position.lineNumber,
                          startColumn: word.startColumn,
                          endColumn: word.endColumn,
                        };

                        const staticSuggestions = [
                          {
                            label: "db",
                            kind: monaco.languages.CompletionItemKind.Variable,
                            insertText: "db",
                            documentation: "MongoDB Database Object",
                            range,
                          },
                          {
                            label: "collection",
                            kind: monaco.languages.CompletionItemKind.Function,
                            insertText: 'collection("$1")',
                            insertTextRules:
                              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: "Access a MongoDB collection",
                            range,
                          },
                          {
                            label: "db.collection.find",
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: 'db.collection("$1").find({})',
                            insertTextRules:
                              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: "Find in a collection",
                            range,
                          },
                          {
                            label: "db.collection.findOne",
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: 'db.collection("$1").findOne({})',
                            insertTextRules:
                              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: "Find one in a collection",
                            range,
                          },
                          {
                            label: "db.collection.aggregate",
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText:
                              'db.collection("$1").aggregate([\n  { $match: {} },\n  { $project: {} }\n])',
                            insertTextRules:
                              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: "Aggregation pipeline",
                            range,
                          },
                          {
                            label: "db.collection.distinct",
                            kind: monaco.languages.CompletionItemKind.Snippet,
                            insertText: 'db.collection("$1").distinct("$2", {})',
                            insertTextRules:
                              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                            documentation: "Distinct values",
                            range,
                          },
                        ];

                        return {
                          suggestions: [
                            ...collectionSuggestions,
                            ...methodSuggestions,
                            ...staticSuggestions,
                          ],
                        };
                      },
                    },
                  );

                  // Add JSON/operator completion for Mongo operators when typing `$`
                  const jsonProvider = monaco.languages.registerCompletionItemProvider(
                    "javascript",
                    {
                      triggerCharacters: ["$"],
                      provideCompletionItems: (model: any, position: any) => {
                        const textUntilPosition = model.getValueInRange({
                          startLineNumber: position.lineNumber,
                          startColumn: 1,
                          endLineNumber: position.lineNumber,
                          endColumn: position.column,
                        });
                        if (!textUntilPosition.trim().endsWith("$")) return { suggestions: [] };

                        const word = model.getWordUntilPosition(position);
                        const range = {
                          startLineNumber: position.lineNumber,
                          endLineNumber: position.lineNumber,
                          startColumn: word.startColumn,
                          endColumn: word.endColumn,
                        };

                        const operators = [
                          { label: "$match", docs: "Aggregation filter stage" },
                          { label: "$project", docs: "Aggregation projection stage" },
                          { label: "$group", docs: "Aggregation grouping stage" },
                          { label: "$sort", docs: "Aggregation sort stage" },
                          { label: "$limit", docs: "Aggregation limit stage" },
                          { label: "$skip", docs: "Aggregation skip stage" },
                          { label: "$unwind", docs: "Deconstruct array field" },
                          { label: "$lookup", docs: "Join with other collection" },
                          { label: "$addFields", docs: "Add computed fields" },
                          { label: "$set", docs: "Add/replace fields" },
                          { label: "$unset", docs: "Remove fields" },
                          { label: "$expr", docs: "Use aggregation expressions in match" },
                          { label: "$in", docs: "Match any value in array" },
                          { label: "$nin", docs: "Not in array" },
                          { label: "$gte", docs: "Greater or equal" },
                          { label: "$gt", docs: "Greater than" },
                          { label: "$lte", docs: "Less or equal" },
                          { label: "$lt", docs: "Less than" },
                          { label: "$regex", docs: "Regex match" },
                          { label: "$exists", docs: "Field exists" },
                          { label: "$size", docs: "Array size" },
                          { label: "$elemMatch", docs: "Match array elements" },
                        ];

                        return {
                          suggestions: operators.map((op) => ({
                            label: op.label,
                            kind: monaco.languages.CompletionItemKind.Keyword,
                            insertText: `${op.label} `,
                            documentation: op.docs,
                            range,
                          })),
                        };
                      },
                    },
                  );

                  // dispose both providers on unmount or remount
                  completionDisposable.current = {
                    dispose: () => {
                      try {
                        methodsProvider.dispose();
                      } catch {}
                      try {
                        jsonProvider.dispose();
                      } catch {}
                    },
                  };
                }}
              />
            </div>

            <div className="w-[34%] min-w-[320px] flex flex-col gap-3 overflow-hidden">
              <div className="rounded-md border border-gray-800 bg-gray-900/40 p-3 text-sm text-gray-100 flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-200">Result</span>
                    {runMeta?.count !== undefined && (
                      <span className="text-xs text-gray-400">count: {runMeta.count}</span>
                    )}
                    {runMeta?.message && (
                      <span className="text-xs text-gray-400">{runMeta.message}</span>
                    )}
                  </div>
                  {runError && <span className="text-red-400 text-xs">{runError}</span>}
                  {!runError && running && (
                    <span className="flex items-center gap-1 text-xs text-amber-300">
                      <Loader2 size={12} className="animate-spin" /> Running...
                    </span>
                  )}
                </div>
                <pre className="flex-1 overflow-auto rounded-md bg-gray-950/70 border border-gray-800 p-3 text-xs whitespace-pre-wrap break-words">
{runResult || (!runError && !running ? "No output yet." : "")}
                </pre>
                {consoleLogs.length > 0 && (
                  <div className="mt-2 min-h-[90px] max-h-32 flex flex-col">
                    <div className="text-[11px] text-gray-400 mb-1">Console</div>
                    <pre className="flex-1 overflow-auto rounded-md bg-gray-950/50 border border-gray-800 p-2 text-[11px] whitespace-pre-wrap break-words">
{consoleLogs.join("\n")}
                    </pre>
                  </div>
                )}
              </div>

              <div className="rounded-md border border-gray-800 bg-gray-900/30 p-3 text-xs text-gray-300 max-h-48 overflow-auto">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-gray-200">Run Log</span>
                  <button
                    onClick={() => setLogs([])}
                    className="text-[10px] text-gray-500 hover:text-gray-200"
                  >
                    Clear
                  </button>
                </div>
                {logs.length === 0 ? (
                  <div className="text-gray-500">No runs yet.</div>
                ) : (
                  <ul className="space-y-1">
                    {logs.map((l, i) => (
                      <li key={`${l.ts}-${i}`} className="flex items-center gap-2">
                        <span className="text-gray-500">{l.ts}</span>
                        <span
                          className={
                            l.status === "OK"
                              ? "text-emerald-400 font-semibold"
                              : "text-red-400 font-semibold"
                          }
                        >
                          {l.status}
                        </span>
                        <span className="text-gray-200 truncate">{l.message}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
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
  const [searchTerm, setSearchTerm] = useState("");
  const [showScripts, setShowScripts] = useState(false);

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

  // Show script editor
  if (showScripts) {
    return (
      <ScriptEditor
        connectionId={selected.connectionId}
        dbName={selected.dbName}
        onBack={() => setShowScripts(false)}
      />
    );
  }

  const filtered = searchTerm
    ? collections.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : collections;

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
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search collections..."
              className="h-9 w-56 pl-8 pr-8 text-sm rounded-md border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-hidden focus:ring-3 focus:ring-brand-500/15"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={fetchCollections}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={() => setShowScripts(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700"
          >
            <FileCode size={14} />
            Create Script
          </button>
        </div>
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
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-[var(--text-muted)]">
                      {searchTerm
                        ? `No collections matching "${searchTerm}"`
                        : "No collections found in this database"}
                    </td>
                  </tr>
                ) : (
                  filtered.map((col) => (
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
