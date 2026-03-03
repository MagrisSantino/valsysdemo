// @ts-nocheck
"use client";

import { useState, useMemo, useEffect, useCallback } from "react";

interface SkuRow {
  id: string;
  sku: string;
  classification: string;
  inStock: string;
  syncRate: number;
  syncBarVariant: "full" | "dim"; // full = bg-blue-500, dim = bg-blue-500/60
  lastTransferred: string;
  dotColor: "blue" | "blue-dim"; // blue-500 or blue-400/50
}

const LAST_TRANSFERRED_OPTIONS = ["0.1s ago", "0.2s ago", "0.4s ago", "0.8s ago", "1.2s ago", "2.1s ago", "3.5s ago", "4.8s ago", "7.2s ago", "12.4s ago"];

const INITIAL_SKU_ROWS: SkuRow[] = [
  { id: "1", sku: "SKU-9402-B", classification: "High Frequency", inStock: "4,280", syncRate: 98, syncBarVariant: "full", lastTransferred: "0.4s ago", dotColor: "blue" },
  { id: "2", sku: "SKU-1029-A", classification: "Electronics", inStock: "1,120", syncRate: 100, syncBarVariant: "full", lastTransferred: "1.2s ago", dotColor: "blue" },
  { id: "3", sku: "SKU-7734-C", classification: "Apparel", inStock: "842", syncRate: 85, syncBarVariant: "dim", lastTransferred: "4.8s ago", dotColor: "blue-dim" },
  { id: "4", sku: "SKU-2291-K", classification: "Luxury Goods", inStock: "12,045", syncRate: 99, syncBarVariant: "full", lastTransferred: "0.1s ago", dotColor: "blue" },
  { id: "5", sku: "SKU-5512-M", classification: "Electronics", inStock: "2,100", syncRate: 92, syncBarVariant: "full", lastTransferred: "1.8s ago", dotColor: "blue" },
  { id: "6", sku: "SKU-8831-P", classification: "High Frequency", inStock: "6,400", syncRate: 100, syncBarVariant: "full", lastTransferred: "0.3s ago", dotColor: "blue" },
  { id: "7", sku: "SKU-1204-R", classification: "Apparel", inStock: "320", syncRate: 78, syncBarVariant: "dim", lastTransferred: "5.2s ago", dotColor: "blue-dim" },
];

const CLASSIFICATIONS = ["All", "High Frequency", "Electronics", "Apparel", "Luxury Goods"];

const DEMO_NODES = [
  { id: "frankfurt", name: "Frankfurt Hub-01", status: "Synced", count: "420 SKUs" },
  { id: "tokyo", name: "Tokyo Central", status: "Cooldown", count: "phase" },
  { id: "lax", name: "LAX Logistics", status: "Re-indexing", count: "DB" },
];

const DEMO_NOTIFICATIONS = [
  { id: "1", title: "Sync completed", body: "Frankfurt Hub-01 · 420 SKUs", time: "Just now", unread: true },
  { id: "2", title: "Latency spike", body: "Tokyo Central · resolved in 2m", time: "12m ago", unread: true },
  { id: "3", title: "Roster updated", body: "Inventory Real-time Flow", time: "1h ago", unread: false },
];

const DEMO_LOG_LINES = [
  "[14:02:01] SYNC Frankfurt Hub-01 → 420 SKUs OK",
  "[14:01:58] TX SKU-2291-K 99% → cloud",
  "[14:01:55] TX SKU-9402-B 98% → cloud",
  "[14:01:52] Node Tokyo Central cooldown start",
  "[14:01:48] SYNC LAX Logistics re-index started",
  "[14:01:45] TX SKU-1029-A 100% → cloud",
  "[14:01:42] Health check all nodes nominal",
  "[14:01:38] TX SKU-7734-C 85% → cloud",
  "[14:01:35] Cache flush Frankfurt complete",
];

export default function OmnistockPage() {
  const [skuRows, setSkuRows] = useState<SkuRow[]>(() => INITIAL_SKU_ROWS.map((r) => ({ ...r })));
  const [searchQuery, setSearchQuery] = useState("");
  const [chartMode, setChartMode] = useState<"live" | "history">("live");
  const [sidebarActive, setSidebarActive] = useState("dashboard");
  const [classificationFilter, setClassificationFilter] = useState("All");
  const [exportToast, setExportToast] = useState<"idle" | "exporting" | "done">("idle");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [openRowMenuId, setOpenRowMenuId] = useState<string | null>(null);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);
  const [logLines, setLogLines] = useState<string[]>(DEMO_LOG_LINES);
  const [stats, setStats] = useState({ totalSkus: 12842, activeSyncs: 48, latency: 14, syncIntegrity: 99.98, lastCheck: "2m ago" });
  const [nodeTimes, setNodeTimes] = useState<Record<string, string>>({ frankfurt: "Just now", tokyo: "2m ago", lax: "15m ago" });
  const [activeNodeIndex, setActiveNodeIndex] = useState(0);

  const filteredRows = useMemo(() => {
    let rows = skuRows;
    if (classificationFilter !== "All") {
      rows = rows.filter((r) => r.classification === classificationFilter);
    }
    if (!searchQuery.trim()) return rows;
    const q = searchQuery.trim().toLowerCase();
    return rows.filter(
      (r) =>
        r.sku.toLowerCase().includes(q) ||
        r.classification.toLowerCase().includes(q) ||
        r.inStock.replace(/,/g, "").includes(q)
    );
  }, [skuRows, searchQuery, classificationFilter]);

  const tickLastTransferred = useCallback(() => {
    setSkuRows((prev) => {
      const next = prev.map((r) => ({ ...r }));
      const indices = new Set<number>();
      while (indices.size < Math.min(3, next.length)) {
        indices.add(Math.floor(Math.random() * next.length));
      }
      indices.forEach((i) => {
        next[i].lastTransferred = LAST_TRANSFERRED_OPTIONS[Math.floor(Math.random() * LAST_TRANSFERRED_OPTIONS.length)];
      });
      return next;
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(tickLastTransferred, 4000);
    return () => clearInterval(interval);
  }, [tickLastTransferred]);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats((s) => ({
        ...s,
        totalSkus: Math.max(12800, Math.min(12900, s.totalSkus + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 4))),
        activeSyncs: Math.max(46, Math.min(50, s.activeSyncs + (Math.random() > 0.6 ? 1 : -1))),
        latency: Math.max(12, Math.min(18, s.latency + (Math.random() > 0.5 ? 1 : -1))),
        lastCheck: ["Just now", "30s ago", "1m ago", "2m ago"][Math.floor(Math.random() * 4)],
      }));
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNodeIndex((i) => (i + 1) % DEMO_NODES.length);
      setNodeTimes((t) => ({
        ...t,
        frankfurt: ["Just now", "15s ago", "1m ago"][Math.floor(Math.random() * 3)],
        tokyo: ["1m ago", "2m ago", "3m ago"][Math.floor(Math.random() * 3)],
        lax: ["12m ago", "15m ago", "18m ago"][Math.floor(Math.random() * 3)],
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!logsOpen) return;
    const id = setInterval(() => {
      const now = new Date();
      const ts = now.toTimeString().slice(0, 8);
      const lines = ["SYNC", "TX", "Health", "Cache", "Node"];
      const line = `[${ts}] ${lines[Math.floor(Math.random() * lines.length)]} ${Math.random().toString(36).slice(2, 8)}`;
      setLogLines((prev) => [line, ...prev].slice(0, 24));
    }, 2000);
    return () => clearInterval(id);
  }, [logsOpen]);

  const handleExport = useCallback(() => {
    setExportToast("exporting");
    setTimeout(() => setExportToast("done"), 1500);
    setTimeout(() => setExportToast("idle"), 3500);
  }, []);

  const handleCopySku = useCallback((sku: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) navigator.clipboard.writeText(sku);
    setOpenRowMenuId(null);
  }, []);

  const unreadCount = DEMO_NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <div className="bg-[#020617] text-slate-400 text-sm antialiased selection:bg-blue-500/30 overflow-hidden flex flex-col">
      <header className="grid grid-cols-[1fr_auto_1fr] items-center px-6 py-4 bg-slate-950 border-b border-slate-800 shrink-0">
        <span className="text-[1.1rem] font-bold tracking-[0.2em] uppercase bg-linear-to-r from-cyan-300 via-cyan-200 to-violet-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,211,238,0.15)]">
          omnistock
        </span>
        <a
          href="https://valsys.dev/#work"
          className="btn-valsys-back inline-flex items-center justify-center gap-2 justify-self-center"
        >
          Back to <span className="valsys-gradient">Valsys</span>
          <span className="arrow text-2xl">→</span>
        </a>
        <div />
      </header>
      <div className="flex flex-1 min-h-0 w-full">
        {/* Sidebar */}
        <aside className="w-16 border-r border-slate-800/60 flex flex-col items-center py-6 gap-8 bg-[#020617] z-20">
          <div className="text-slate-500 font-semibold tracking-widest text-sm uppercase mb-4">
            OS
          </div>
          <nav className="flex flex-col gap-6">
            <button
              type="button"
              onClick={() => setSidebarActive("dashboard")}
              className={`flex items-center justify-center p-2 rounded-lg transition-colors ${
                sidebarActive === "dashboard"
                  ? "text-blue-400 bg-blue-500/10"
                  : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <iconify-icon
                icon="solar:linear-widget-2"
                width="20"
                strokeWidth="1.5"
              />
            </button>
            <button
              type="button"
              onClick={() => setSidebarActive("inventory")}
              className={`flex items-center justify-center p-2 rounded-lg transition-colors ${
                sidebarActive === "inventory"
                  ? "text-blue-400 bg-blue-500/10"
                  : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <iconify-icon
                icon="solar:linear-box-minimalistic"
                width="20"
                strokeWidth="1.5"
              />
            </button>
            <button
              type="button"
              onClick={() => setSidebarActive("analytics")}
              className={`flex items-center justify-center p-2 rounded-lg transition-colors ${
                sidebarActive === "analytics"
                  ? "text-blue-400 bg-blue-500/10"
                  : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <iconify-icon
                icon="solar:linear-graph-up"
                width="20"
                strokeWidth="1.5"
              />
            </button>
            <button
              type="button"
              onClick={() => setSidebarActive("settings")}
              className={`flex items-center justify-center p-2 rounded-lg transition-colors ${
                sidebarActive === "settings"
                  ? "text-blue-400 bg-blue-500/10"
                  : "text-slate-500 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <iconify-icon
                icon="solar:linear-settings"
                width="20"
                strokeWidth="1.5"
              />
            </button>
          </nav>
          <div className="mt-auto">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-medium text-slate-300">
              JD
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="h-14 border-b border-slate-800/60 flex items-center justify-between px-6 bg-[#020617]/80 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <h1 className="text-slate-200 font-medium tracking-tight text-base">
                Inventory Command
              </h1>
              <div className="h-4 w-px bg-slate-800" />
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 glow-pulse" />
                <span className="text-xs text-slate-500 font-normal">
                  Cloud Sync Live
                </span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative flex items-center">
                <iconify-icon
                  icon="solar:linear-magnifer"
                  width="16"
                  className="absolute left-3 text-slate-500"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search SKU or Order..."
                  className="bg-slate-900/50 border border-slate-800 rounded-full py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:border-slate-700 w-64 placeholder:text-slate-600 transition-all"
                />
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotificationsOpen((o) => !o)}
                  className="relative p-1.5 rounded-full hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <iconify-icon icon="solar:linear-bell" width="20" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
                {notificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-10" aria-hidden onClick={() => setNotificationsOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-20 overflow-hidden">
                      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-300">Notifications</span>
                        <button type="button" onClick={() => setNotificationsOpen(false)} className="text-slate-500 hover:text-slate-300 text-[10px]">Close</button>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {DEMO_NOTIFICATIONS.map((n) => (
                          <div key={n.id} className={`p-3 border-b border-slate-800/50 hover:bg-slate-800/30 ${n.unread ? "bg-blue-500/5" : ""}`}>
                            <p className="text-xs font-medium text-slate-200">{n.title}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{n.body}</p>
                            <p className="text-[10px] text-slate-600 mt-1">{n.time}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-900/20 border border-slate-800/60 p-4 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-normal text-slate-500 uppercase tracking-wider">
                    Total SKUs
                  </span>
                  <iconify-icon
                    icon="solar:linear-layers"
                    width="18"
                    className="text-slate-600"
                  />
                </div>
                <div className="text-xl font-semibold text-slate-100 tracking-tight">
                  {stats.totalSkus.toLocaleString()}
                </div>
                <div className="text-[10px] mt-2 text-emerald-500/80 flex items-center gap-1">
                  <iconify-icon
                    icon="solar:linear-arrow-right-up"
                    width="12"
                  />
                  <span>+4.2% from last month</span>
                </div>
              </div>
              <div className="bg-slate-900/20 border border-slate-800/60 p-4 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-normal text-slate-500 uppercase tracking-wider">
                    Active Syncs
                  </span>
                  <iconify-icon
                    icon="solar:linear-cloud-sync"
                    width="18"
                    className="text-blue-500"
                  />
                </div>
                <div className="text-xl font-semibold text-slate-100 tracking-tight">
                  {stats.activeSyncs}
                </div>
                <div className="text-[10px] mt-2 text-slate-500 flex items-center gap-1">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <span>All nodes operational</span>
                </div>
              </div>
              <div className="bg-slate-900/20 border border-slate-800/60 p-4 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-normal text-slate-500 uppercase tracking-wider">
                    Global Latency
                  </span>
                  <iconify-icon
                    icon="solar:linear-clocks"
                    width="18"
                    className="text-slate-600"
                  />
                </div>
                <div className="text-xl font-semibold text-slate-100 tracking-tight">
                  {stats.latency}ms
                </div>
                <div className="text-[10px] mt-2 text-blue-400/80 flex items-center gap-1">
                  <span>Optimization active</span>
                </div>
              </div>
              <div className="bg-slate-900/20 border border-slate-800/60 p-4 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-normal text-slate-500 uppercase tracking-wider">
                    Sync Integrity
                  </span>
                  <iconify-icon
                    icon="solar:linear-shield-check"
                    width="18"
                    className="text-slate-600"
                  />
                </div>
                <div className="text-xl font-semibold text-slate-100 tracking-tight">
                  {stats.syncIntegrity}%
                </div>
                <div className="text-[10px] mt-2 text-slate-500 flex items-center gap-1">
                  <span>Last check {stats.lastCheck}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Area Chart Section */}
              <div className="lg:col-span-2 bg-slate-900/20 border border-slate-800/60 rounded-xl p-6 flex flex-col">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-slate-200 font-medium tracking-tight text-base">
                      Data Flow Volume
                    </h3>
                    <p className="text-xs text-slate-500">
                      Real-time inventory packet transmission (24h)
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900/80 p-1 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setChartMode("live")}
                      className={`px-3 py-1 text-[10px] font-medium rounded-md transition-colors ${
                        chartMode === "live" ? "bg-slate-800 text-slate-100" : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      Live
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartMode("history")}
                      className={`px-3 py-1 text-[10px] font-medium rounded-md transition-colors ${
                        chartMode === "history" ? "bg-slate-800 text-slate-100" : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      History
                    </button>
                  </div>
                </div>

                {/* Simulated Recharts Area Chart */}
                <div className="flex-1 min-h-[220px] w-full relative chart-gradient">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 800 200"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient
                        id="areaGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#3b82f6"
                          stopOpacity={0.2}
                        />
                        <stop
                          offset="100%"
                          stopColor="#3b82f6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    {/* Grid Lines */}
                    <line
                      x1="0"
                      y1="0"
                      x2="800"
                      y2="0"
                      stroke="#1e293b"
                      strokeWidth="0.5"
                      strokeDasharray="4"
                    />
                    <line
                      x1="0"
                      y1="50"
                      x2="800"
                      y2="50"
                      stroke="#1e293b"
                      strokeWidth="0.5"
                      strokeDasharray="4"
                    />
                    <line
                      x1="0"
                      y1="100"
                      x2="800"
                      y2="100"
                      stroke="#1e293b"
                      strokeWidth="0.5"
                      strokeDasharray="4"
                    />
                    <line
                      x1="0"
                      y1="150"
                      x2="800"
                      y2="150"
                      stroke="#1e293b"
                      strokeWidth="0.5"
                      strokeDasharray="4"
                    />

                    {/* Area */}
                    <path
                      d="M0 180 Q 50 160, 100 170 T 200 120 T 300 140 T 400 60 T 500 90 T 600 40 T 700 80 T 800 50 V 200 H 0 Z"
                      fill="url(#areaGradient)"
                    />
                    {/* Line */}
                    <path
                      d="M0 180 Q 50 160, 100 170 T 200 120 T 300 140 T 400 60 T 500 90 T 600 40 T 700 80 T 800 50"
                      fill="none"
                      stroke="#60a5fa"
                      strokeWidth="2"
                    />

                    {/* Data Points */}
                    <circle cx="400" cy="60" r="4" fill="#60a5fa" />
                    <circle cx="600" cy="40" r="4" fill="#60a5fa" />
                  </svg>
                  {/* Tooltip Mockup */}
                  <div className="absolute top-4 left-[380px] bg-slate-900 border border-slate-700 p-2 rounded-lg shadow-xl pointer-events-none">
                    <p className="text-[10px] text-slate-400">
                      {chartMode === "live" ? "Live · 14:00" : "History · 14:00"}
                    </p>
                    <p className="text-xs font-semibold text-blue-400">
                      {chartMode === "live" ? "1,240 pkts/s" : "Avg 1,180 pkts/s"}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between mt-4 text-[10px] text-slate-600 font-medium">
                  <span>00:00</span>
                  <span>04:00</span>
                  <span>08:00</span>
                  <span>12:00</span>
                  <span>16:00</span>
                  <span>20:00</span>
                  <span>23:59</span>
                </div>
              </div>

              {/* Side Panel / Quick Logs */}
              <div className="bg-slate-900/20 border border-slate-800/60 rounded-xl p-5 overflow-hidden flex flex-col">
                <h3 className="text-slate-200 font-medium tracking-tight text-base mb-4">
                  Node Activity
                </h3>
                <div className="space-y-4">
                  {DEMO_NODES.map((node, i) => (
                    <div key={node.id} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        activeNodeIndex === i ? "bg-blue-500/10 text-blue-400" : "bg-slate-800 text-slate-500"
                      }`}>
                        <iconify-icon icon="solar:linear-map-point" width="18" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-300 font-medium">{node.name}</p>
                        <p className="text-[10px] text-slate-500">
                          {node.status} {node.count}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-600 italic shrink-0">{nodeTimes[node.id] ?? "—"}</span>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setLogsOpen(true)}
                  className="mt-auto w-full py-2 bg-slate-800/50 hover:bg-slate-800 transition-colors rounded-lg border border-slate-700/50 text-[10px] font-medium tracking-wide"
                >
                  VIEW SYSTEM LOGS
                </button>
              </div>
            </div>

            {/* SKU Data Table */}
            <div className="mt-6 bg-slate-900/20 border border-slate-800/60 rounded-xl overflow-hidden">
              <div className="p-5 border-b border-slate-800/60 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <h3 className="text-slate-200 font-medium tracking-tight text-base">
                    Inventory Real-time Flow
                  </h3>
                  {searchQuery.trim() && (
                    <span className="text-[10px] text-slate-500 font-medium">
                      {filteredRows.length} of {skuRows.length} SKUs
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setFilterDropdownOpen((o) => !o)}
                      className={`px-3 py-1.5 border border-slate-700/50 rounded-lg text-[10px] transition-colors flex items-center gap-2 ${
                        classificationFilter !== "All" ? "bg-blue-500/10 text-blue-400 border-blue-500/30" : "bg-slate-800/50 hover:text-slate-200"
                      }`}
                    >
                      <iconify-icon icon="solar:linear-filter" width="14" />
                      Filter
                      {classificationFilter !== "All" && <span className="text-[9px]">· {classificationFilter}</span>}
                    </button>
                    {filterDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-10" aria-hidden onClick={() => setFilterDropdownOpen(false)} />
                        <div className="absolute left-0 top-full mt-1 py-1 w-44 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-20">
                          {CLASSIFICATIONS.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => { setClassificationFilter(c); setFilterDropdownOpen(false); }}
                              className={`w-full text-left px-3 py-2 text-[10px] rounded-none first:rounded-t-lg last:rounded-b-lg transition-colors ${
                                classificationFilter === c ? "bg-blue-500/20 text-blue-400" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleExport}
                    disabled={exportToast === "exporting"}
                    className="px-3 py-1.5 bg-slate-800/50 border border-slate-700/50 rounded-lg text-[10px] hover:text-slate-200 transition-colors flex items-center gap-2 disabled:opacity-70"
                  >
                    {exportToast === "exporting" ? (
                      <iconify-icon icon="solar:refresh-linear" width="14" className="animate-spin" />
                    ) : (
                      <iconify-icon icon="solar:linear-download-square" width="14" />
                    )}
                    {exportToast === "exporting" ? "Exporting…" : exportToast === "done" ? "Exported" : "Export"}
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] font-normal uppercase tracking-widest text-slate-500 border-b border-slate-800/60">
                      <th className="px-6 py-4 font-normal">SKU Identifier</th>
                      <th className="px-6 py-4 font-normal">Classification</th>
                      <th className="px-6 py-4 font-normal">In Stock</th>
                      <th className="px-6 py-4 font-normal">Sync Rate</th>
                      <th className="px-6 py-4 font-normal">
                        Last Transferred
                      </th>
                      <th className="px-6 py-4 font-normal text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {filteredRows.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-slate-500 text-xs">
                          No SKUs match &quot;{searchQuery}&quot;
                        </td>
                      </tr>
                    ) : (
                      filteredRows.map((row) => (
                        <tr key={row.id} className="hover:bg-slate-800/20 transition-colors group">
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  row.dotColor === "blue" ? "bg-blue-500" : "bg-blue-400/50"
                                }`}
                              />
                              <span className="text-slate-200 font-medium tabular-nums">
                                {row.sku}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-3.5 text-xs">{row.classification}</td>
                          <td className="px-6 py-3.5 tabular-nums">{row.inStock}</td>
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${row.syncBarVariant === "full" ? "bg-blue-500" : "bg-blue-500/60"}`}
                                  style={{ width: `${row.syncRate}%` }}
                                />
                              </div>
                              <span className="text-[10px] tabular-nums text-slate-500">
                                {row.syncRate}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-3.5 text-slate-500 text-xs">
                            {row.lastTransferred}
                          </td>
                          <td className="px-6 py-3.5 text-right relative">
                            <button
                              type="button"
                              onClick={() => setOpenRowMenuId(openRowMenuId === row.id ? null : row.id)}
                              className="text-slate-600 group-hover:text-slate-300 p-1 rounded"
                            >
                              <iconify-icon icon="solar:linear-menu-dots" width="18" />
                            </button>
                            {openRowMenuId === row.id && (
                              <>
                                <div className="fixed inset-0 z-10" aria-hidden onClick={() => setOpenRowMenuId(null)} />
                                <div className="absolute right-6 top-full mt-1 py-1 w-40 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-20">
                                  <button type="button" onClick={() => setOpenRowMenuId(null)} className="w-full text-left px-3 py-2 text-[10px] text-slate-400 hover:bg-slate-800 hover:text-slate-200">
                                    View details
                                  </button>
                                  <button type="button" onClick={() => { handleCopySku(row.sku); }} className="w-full text-left px-3 py-2 text-[10px] text-slate-400 hover:bg-slate-800 hover:text-slate-200">
                                    Copy SKU
                                  </button>
                                  <button type="button" onClick={() => setOpenRowMenuId(null)} className="w-full text-left px-3 py-2 text-[10px] text-slate-400 hover:bg-slate-800 hover:text-slate-200">
                                    Export row
                                  </button>
                                </div>
                              </>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Export toast */}
          {exportToast !== "idle" && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-lg bg-slate-800 border border-slate-600 text-slate-200 text-xs font-medium shadow-xl flex items-center gap-2">
              {exportToast === "exporting" && <iconify-icon icon="solar:refresh-linear" width="14" className="animate-spin" />}
              {exportToast === "done" && <iconify-icon icon="solar:linear-download-square" width="14" className="text-emerald-400" />}
              {exportToast === "exporting" ? "Exporting…" : "Exported " + filteredRows.length + " SKUs"}
            </div>
          )}

          {/* System Logs panel */}
          {logsOpen && (
            <div className="fixed inset-0 z-50 flex items-stretch justify-end bg-black/40 backdrop-blur-sm" onClick={() => setLogsOpen(false)}>
              <div className="w-full max-w-md bg-[#0f172a] border-l border-slate-700/60 shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-700/60 flex items-center justify-between shrink-0">
                  <h3 className="text-sm font-semibold text-slate-200">System Logs</h3>
                  <button
                    type="button"
                    onClick={() => setLogsOpen(false)}
                    className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  >
                    <iconify-icon icon="solar:close-circle-linear" width="20" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 font-mono text-[10px] text-slate-400 space-y-1 custom-scrollbar">
                  {logLines.map((line, i) => (
                    <div key={i} className="text-slate-500 hover:text-slate-400 transition-colors">
                      {line}
                    </div>
                  ))}
                </div>
                <div className="p-2 border-t border-slate-700/60 text-[10px] text-slate-600">
                  Live stream · {logLines.length} lines
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
