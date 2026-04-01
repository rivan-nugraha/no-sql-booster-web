/* eslint-disable @typescript-eslint/no-unnecessary-condition */
 
import { useEffect, useState } from "react";
import {
  Activity,
  ChevronDown,
  ChevronRight,
  Cloud,
  Cpu,
  Database,
  Folder,
  GitBranch,
  Globe,
  HardDrive,
  Layers,
  Loader2,
  Network,
  Plug,
  Plus,
  Server,
} from "lucide-react";
import { useSidebar } from "../context/SidebarContext";
import { useToast } from "../context/ToastContext";
import { useDatabase } from "../context/DatabaseContext";
import { createDatabase, listDatabaseCatalog, listDatabases, testDatabaseConnection } from "../client";
import type { CatalogItem, CreateDatabasePayload, DatabaseItem } from "../client/model/database_model";



const iconOptions = [
  { key: "database", label: "Database", icon: Database },
  { key: "server", label: "Server", icon: Server },
  { key: "cloud", label: "Cloud", icon: Cloud },
  { key: "globe", label: "Globe", icon: Globe },
  { key: "plug", label: "Plug", icon: Plug },
  { key: "drive", label: "Drive", icon: HardDrive },
  { key: "network", label: "Network", icon: Network },
  { key: "layers", label: "Layers", icon: Layers },
  { key: "git", label: "Git Branch", icon: GitBranch },
  { key: "cpu", label: "CPU", icon: Cpu },
  { key: "activity", label: "Activity", icon: Activity },
  { key: "folder", label: "Folder", icon: Folder },
];

const iconByKey: Record<string, React.ComponentType<{ size?: number }>> =
  iconOptions.reduce((acc, it) => {
    acc[it.key] = it.icon;
    return acc;
  }, {} as Record<string, React.ComponentType<{ size?: number }>>);

const renderIcon = (key: string | undefined, size = 16) => {
  const Icon = key ? (iconByKey[key] ?? Database) : Database;
  return <Icon size={size} />;
};

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const [active, setActive] = useState<string | null>(null);
  const isCollapsed = !(isExpanded || isHovered || isMobileOpen);
  const { showToast } = useToast();
  const { selected, selectDatabase } = useDatabase();
  const [showModal, setShowModal] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connections, setConnections] = useState<Array<DatabaseItem>>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [catalogs, setCatalogs] = useState<Record<string, Array<CatalogItem>>>({});
  const [loadingCatalog, setLoadingCatalog] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState<CreateDatabasePayload>({
    name: "",
    uri: "",
    description: "",
    icon: "database",
  });

  const fetchConnections = async () => {
    try {
      const res = await listDatabases();
      setConnections(res.data ?? []);
    } catch {
      // silent fail — list stays empty
    }
  };

  const toggleExpand = async (conn: DatabaseItem) => {
    const id = conn._id;
    const isOpen = expanded[id];

    if (isOpen) {
      setExpanded((prev) => ({ ...prev, [id]: false }));
      return;
    }

    setExpanded((prev) => ({ ...prev, [id]: true }));
    setActive(id);

    if (catalogs[id]) return;

    setLoadingCatalog((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await listDatabaseCatalog(id);
      setCatalogs((prev) => ({ ...prev, [id]: res.data ?? [] }));
    } catch {
      showToast("Failed to load", `Could not list databases for ${conn.name}`, "error");
      setExpanded((prev) => ({ ...prev, [id]: false }));
    } finally {
      setLoadingCatalog((prev) => ({ ...prev, [id]: false }));
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  useEffect(() => {
    if (!isExpanded) setIsHovered(false);
  }, [isExpanded, setIsHovered]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDatabase(form);
      showToast("Connection added", form.name, "success");
      setShowModal(false);
      setForm({ name: "", uri: "", description: "", icon: "database" });
      fetchConnections();
    } catch (err: any) {
      showToast("Failed to add", err?.message || "Error", "error");
    }
  };

  const handleTest = async () => {
    try {
      setTesting(true);
      await testDatabaseConnection(form.uri);
      showToast("Connection OK", form.uri, "success");
    } catch (err: any) {
      showToast("Connection failed", err?.message || "Error", "error");
    } finally {
      setTesting(false);
    }
  };

  return (
    <>
    <aside
      className={`fixed mt-16 lg:mt-0 top-0 left-0 h-screen border-r border-[var(--border)] sidebar-bg text-[var(--text)] transition-all duration-300 ease-in-out z-[40] px-3 pt-6
        overflow-y-scroll
        ${
          isExpanded || isMobileOpen
            ? "w-[280px]"
            : isHovered
            ? "w-[280px]"
            : "w-[72px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] mb-4 ${isCollapsed ? "text-center" : ""}`}>
        {isCollapsed ? "" : "Connections"}
      </div>
      <div className="mb-3">
        <button
          onClick={() => setShowModal(true)}
          className="w-full flex items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--text)] text-sm py-2 hover:border-[var(--color-brand-500)]"
          title="New Connection"
        >
          <Plus size={16} /> {!isCollapsed && "New Connection"}
        </button>
      </div>
      <div className="custom-scrollbar pr-1" style={{ maxHeight: "calc(100vh - 120px)" }}>
        <ul className="space-y-1">
          {connections.map((item) => {
            const isOpen = expanded[item._id];
            const isLoading = loadingCatalog[item._id];
            const dbList = catalogs[item._id];

            return (
              <li key={item._id}>
                <button
                  onClick={() => toggleExpand(item)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                    active === item._id
                      ? "bg-[var(--surface-subtle)] text-[var(--text)]"
                      : "text-[var(--text-muted)] hover:bg-[var(--surface-subtle)]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {!isCollapsed && (
                      <span className="text-[var(--text-muted)] shrink-0">
                        {isLoading ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : isOpen ? (
                          <ChevronDown size={14} />
                        ) : (
                          <ChevronRight size={14} />
                        )}
                      </span>
                    )}
                    <span className="text-[var(--text-muted)] shrink-0">
                      {renderIcon(item.icon, 16)}
                    </span>
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </div>
                </button>

                {!isCollapsed && isOpen && dbList && (
                  <ul className="ml-5 mt-1 space-y-0.5 border-l border-[var(--border)] pl-3">
                    {dbList.length === 0 ? (
                      <li className="text-xs text-[var(--text-muted)] italic py-1">No databases</li>
                    ) : (
                      dbList.map((db) => (
                        <li key={db.name}>
                          <button
                            onClick={() => selectDatabase(item._id, item.name, db.name)}
                            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors ${
                              selected?.connectionId === item._id && selected?.dbName === db.name
                                ? "bg-[var(--color-brand-500)]/10 text-[var(--color-brand-600)]"
                                : "text-[var(--text-muted)] hover:bg-[var(--surface-subtle)]"
                            }`}
                          >
                            <Database size={13} className="shrink-0 opacity-60" />
                            <span className="truncate text-left">{db.name}</span>
                            {db.sizeOnDisk != null && (
                              <span className="ml-auto text-[10px] opacity-50 shrink-0">
                                {formatSize(db.sizeOnDisk)}
                              </span>
                            )}
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
    {showModal && (
      <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-[var(--text)]">New Connection</h3>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="text-sm text-[var(--text-muted)]">Name</label>
                <input
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--text)]"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
            <div className="space-y-1">
              <label className="text-sm text-[var(--text-muted)]">URI</label>
              <div className="flex gap-2">
                <input
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--text)]"
                  value={form.uri}
                  onChange={(e) => setForm({ ...form, uri: e.target.value })}
                  placeholder="mongodb+srv://user:pass@host/db"
                  required
                />
                <button
                  type="button"
                  onClick={handleTest}
                  className="shrink-0 px-3 py-2 rounded-md border border-[var(--color-brand-500)] text-sm text-[var(--color-brand-500)] hover:bg-[var(--surface-subtle)]"
                  disabled={testing}
                >
                  {testing ? "Testing..." : "Test"}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[var(--text-muted)]">Icon</label>
              <div className="relative">
                <select
                  className="w-full rounded-md border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--text)] appearance-none pr-10"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                >
                  {iconOptions.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                  {renderIcon(form.icon, 16)}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-3 py-2 rounded-md border border-[var(--border)] text-sm text-[var(--text-muted)] hover:bg-[var(--surface-subtle)]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-2 rounded-md bg-[var(--color-brand-600)] text-white text-sm hover:bg-[var(--color-brand-500)]"
              >
                Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )
    }
    </>
  );
};

export default AppSidebar;
