// @ts-nocheck
"use client";

import { useState, useMemo, useEffect } from "react";

type RegionId = "Global" | "EU" | "NA" | "APAC";
type TxStatus = "Success" | "Processing";

interface Transaction {
  id: string;
  originNode: string;
  timestamp: string;
  allocation: string;
  status: TxStatus;
  region: RegionId;
}

const REGIONS: RegionId[] = ["Global", "EU", "NA", "APAC"];

const NODES_BY_REGION: Record<Exclude<RegionId, "Global">, string[]> = {
  EU: ["Luxembourg Cluster 02", "Frankfurt Hub", "London Core", "Paris Edge 01"],
  NA: ["New York Core 01", "Chicago Node", "Toronto Cluster", "LAX Finance"],
  APAC: ["Singapore East Edge", "Tokyo Central", "Sydney Hub", "HK Gateway"],
};

function randomId() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const n = Math.floor(10000 + Math.random() * 90000);
  const c = letters[Math.floor(Math.random() * letters.length)];
  return `TX-${n}-${c}`;
}

function randomAllocation() {
  const formats = [
    () => `€${(Math.random() * 500000 + 10000).toFixed(2)}`,
    () => `$${(Math.random() * 800000 + 5000).toFixed(2)}`,
    () => `$${(Math.random() * 2 + 0.5).toFixed(2)}M`,
    () => `£${(Math.random() * 200000).toFixed(2)}`,
  ];
  return formats[Math.floor(Math.random() * formats.length)]();
}

function randomTimestamp() {
  const d = new Date();
  const m = d.getMinutes().toString().padStart(2, "0");
  const h = d.getHours().toString().padStart(2, "0");
  return `Oct ${d.getDate()}, 2023 · ${h}:${m}`;
}

function generateTransaction(region?: Exclude<RegionId, "Global">): Transaction {
  const r = region ?? (["EU", "NA", "APAC"] as const)[Math.floor(Math.random() * 3)];
  const nodes = NODES_BY_REGION[r];
  const originNode = nodes[Math.floor(Math.random() * nodes.length)];
  return {
    id: randomId(),
    originNode,
    timestamp: randomTimestamp(),
    allocation: randomAllocation(),
    status: Math.random() > 0.3 ? "Success" : "Processing",
    region: r,
  };
}

const INITIAL_TXS: Transaction[] = [
  { id: "TX-09281-Z", originNode: "Luxembourg Cluster 02", timestamp: "Oct 24, 2023 · 14:02", allocation: "€245,000.00", status: "Success", region: "EU" },
  { id: "TX-09282-A", originNode: "Singapore East Edge", timestamp: "Oct 24, 2023 · 13:58", allocation: "$12,400.00", status: "Processing", region: "APAC" },
  { id: "TX-09283-B", originNode: "New York Core 01", timestamp: "Oct 24, 2023 · 13:55", allocation: "$1.4M", status: "Success", region: "NA" },
];

const MAX_LEDGER_ROWS = 12;

const VIEW_TITLES: Record<string, string> = {
  deck: "Executive Dashboard",
  ledger: "Global Ledger",
  audits: "Security Audits",
  infra: "Infrastructure",
};

const DEMO_AUDITS = [
  { id: "1", name: "ISO-27001 Compliance", status: "Passed", date: "Today" },
  { id: "2", name: "PCI-DSS Scan", status: "Passed", date: "Yesterday" },
  { id: "3", name: "Penetration Test", status: "Scheduled", date: "Next week" },
  { id: "4", name: "Access Review", status: "In progress", date: "—" },
];

const DEMO_NODES = [
  { region: "EU", nodes: ["Luxembourg Cluster 02", "Frankfurt Hub", "London Core"], status: "Nominal" },
  { region: "NA", nodes: ["New York Core 01", "Chicago Node", "Toronto Cluster"], status: "Nominal" },
  { region: "APAC", nodes: ["Singapore East Edge", "Tokyo Central", "Sydney Hub"], status: "Nominal" },
];

export default function NovapayPage() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => INITIAL_TXS.map((t) => ({ ...t })));
  const [regionFilter, setRegionFilter] = useState<RegionId>("Global");
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [chartRange, setChartRange] = useState<"day" | "week">("week");
  const [sidebarActive, setSidebarActive] = useState("deck");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);
  const [metrics, setMetrics] = useState({ velocity: 184002, latency: 18, nodes: 1240, alerts: 3 });
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const filteredTransactions = useMemo(() => {
    let list = transactions;
    if (regionFilter !== "Global") list = list.filter((t) => t.region === regionFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((t) => t.id.toLowerCase().includes(q) || t.originNode.toLowerCase().includes(q) || t.allocation.toLowerCase().includes(q));
    }
    return list;
  }, [transactions, regionFilter, searchQuery]);

  useEffect(() => {
    const id = setInterval(() => {
      setTransactions((prev) => {
        const next = [generateTransaction(), ...prev];
        if (next.length > MAX_LEDGER_ROWS) next.pop();
        return next;
      });
      setMetrics((m) => ({ ...m, velocity: m.velocity + Math.floor(Math.random() * 20) }));
    }, 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-slate-50 text-slate-600 text-sm font-light m-0 p-0 selection:bg-blue-100 selection:text-blue-900">
      <header className="grid grid-cols-[1fr_auto_1fr] items-center px-6 py-4 bg-slate-900 border-b border-slate-700 shrink-0">
        <span className="text-[1.1rem] font-bold tracking-[0.2em] uppercase bg-linear-to-r from-cyan-300 via-cyan-200 to-violet-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,211,238,0.15)]">
          novapay
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
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        {/* Sidebar */}
        <aside className="w-16 lg:w-64 border-r border-slate-200 bg-white flex flex-col z-20 transition-all duration-300">
          <div className="h-16 flex items-center px-6 border-b border-slate-100">
            <div className="text-slate-500 font-semibold tracking-widest text-sm uppercase">
              NP
            </div>
          </div>

          <nav className="flex-1 px-3 py-6 space-y-1">
            <div className="mb-4 px-3 text-[0.65rem] font-semibold text-slate-400 uppercase tracking-widest hidden lg:block">
              System Management
            </div>
            {[
              { id: "deck", label: "Intelligence Deck", icon: "solar:widget-linear" },
              { id: "ledger", label: "Global Ledger", icon: "solar:transfer-horizontal-linear" },
              { id: "audits", label: "Security Audits", icon: "solar:shield-check-linear" },
              { id: "infra", label: "Infrastructure", icon: "solar:users-group-two-rounded-linear" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSidebarActive(item.id)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg w-full text-left transition-all ${
                  sidebarActive === item.id ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <iconify-icon icon={item.icon} style={{ fontSize: "1.25rem" }} strokeWidth="1.5" />
                <span className="font-medium hidden lg:block">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-slate-100">
            <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-slate-50">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium text-xs">
                JD
              </div>
              <div className="hidden lg:block overflow-hidden">
                <p className="text-xs font-medium text-slate-900 truncate">
                  Julian Draxler
                </p>
                <p className="text-[10px] text-slate-400 truncate uppercase tracking-tight font-medium">
                  Head of Operations
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden dot-pattern">
          {/* Header */}
          <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 z-10">
            <div className="flex items-center space-x-4">
              <h1 className="text-slate-900 text-base font-semibold tracking-tight">
                {VIEW_TITLES[sidebarActive] ?? "Executive Dashboard"}
              </h1>
              <div className="h-4 w-px bg-slate-200" />
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Live Infrastructure
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="relative hidden sm:block">
                <iconify-icon
                  icon="solar:magnifer-linear"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  style={{ fontSize: "1rem" }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Global search..."
                  className="bg-slate-100 border-transparent text-xs rounded-full py-2 pl-10 pr-4 w-64 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                />
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setNotificationsOpen((o) => !o)}
                  className="relative p-2 rounded-full text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <iconify-icon icon="solar:bell-linear" style={{ fontSize: "1.25rem" }} strokeWidth="1.5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                </button>
                {notificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-10" aria-hidden onClick={() => setNotificationsOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-2">
                      <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-500">Alerts</span>
                        <button type="button" onClick={() => { showToast("All alerts marked read"); setNotificationsOpen(false); }} className="text-[10px] font-medium text-blue-600 hover:underline">Mark all read</button>
                      </div>
                      <button type="button" onClick={() => setNotificationsOpen(false)} className="w-full px-4 py-2 text-left text-xs text-slate-600 hover:bg-slate-50">New transaction batch · Just now</button>
                      <button type="button" onClick={() => setNotificationsOpen(false)} className="w-full px-4 py-2 text-left text-xs text-slate-600 hover:bg-slate-50">Cluster Luxembourg · Sync OK</button>
                      <button type="button" onClick={() => setNotificationsOpen(false)} className="w-full px-4 py-2 text-left text-xs text-slate-600 hover:bg-slate-50">Risk check passed · 14:00</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Content by view */}
          <div className="flex-1 p-6 lg:p-8 overflow-y-auto custom-scrollbar">
            {sidebarActive === "deck" && (
            <>
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <iconify-icon
                      icon="solar:course-up-linear"
                      style={{ fontSize: "1.25rem" }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    +12.4%
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">
                  Transaction Velocity
                </p>
                <h3 className="text-2xl text-slate-900 font-semibold tracking-tight mono">
                  {metrics.velocity.toLocaleString()}
                </h3>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-slate-50 text-slate-600 rounded-lg">
                    <iconify-icon
                      icon="solar:bomb-minimalistic-linear"
                      style={{ fontSize: "1.25rem" }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    Stable
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">
                  System Latency
                </p>
                <h3 className="text-2xl text-slate-900 font-semibold tracking-tight mono">
                  {metrics.latency}<span className="text-sm font-normal text-slate-400 ml-1">ms</span>
                </h3>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-slate-50 text-slate-600 rounded-lg">
                    <iconify-icon
                      icon="solar:global-linear"
                      style={{ fontSize: "1.25rem" }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    Primary
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">
                  Active Nodes
                </p>
                <h3 className="text-2xl text-slate-900 font-semibold tracking-tight mono">
                  {metrics.nodes.toLocaleString()}
                </h3>
              </div>

              <button type="button" onClick={() => setNotificationsOpen(true)} className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow text-left w-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                    <iconify-icon
                      icon="solar:shield-warning-linear"
                      style={{ fontSize: "1.25rem" }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                    {metrics.alerts} Alerts
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-1">
                  Risk Exposure
                </p>
                <h3 className="text-2xl text-slate-900 font-semibold tracking-tight mono">
                  Low
                </h3>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Visualization */}
              <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                  <div>
                    <h3 className="text-slate-900 font-semibold tracking-tight text-base">
                      Throughput Analysis
                    </h3>
                    <p className="text-xs text-slate-400">
                      Real-time enterprise data distribution
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setChartRange("day")}
                      className={`px-3 py-1.5 text-xs font-medium border rounded-lg shadow-sm transition-colors ${
                        chartRange === "day" ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Day
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartRange("week")}
                      className={`px-3 py-1.5 text-xs font-medium border rounded-lg shadow-sm transition-colors ${
                        chartRange === "week" ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      Week
                    </button>
                  </div>
                </div>
                <div className="p-8 flex-1 flex flex-col justify-end space-y-8">
                  <div className="flex items-end justify-between h-48 space-x-2">
                    <div className="w-full bg-slate-100 rounded-t-sm h-[40%] hover:bg-blue-200 transition-colors relative group">
                      <div className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded">
                        2.4k
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-t-sm h-[60%] hover:bg-blue-200 transition-colors" />
                    <div className="w-full bg-slate-100 rounded-t-sm h-[55%] hover:bg-blue-200 transition-colors" />
                    <div className="w-full bg-slate-100 rounded-t-sm h-[80%] hover:bg-blue-200 transition-colors" />
                    <div className="w-full bg-blue-600 rounded-t-sm h-[95%] hover:bg-blue-700 transition-colors" />
                    <div className="w-full bg-slate-100 rounded-t-sm h-[70%] hover:bg-blue-200 transition-colors" />
                    <div className="w-full bg-slate-100 rounded-t-sm h-[45%] hover:bg-blue-200 transition-colors" />
                    <div className="w-full bg-slate-100 rounded-t-sm h-[65%] hover:bg-blue-200 transition-colors" />
                    <div className="w-full bg-slate-100 rounded-t-sm h-[85%] hover:bg-blue-200 transition-colors" />
                    <div className="w-full bg-slate-100 rounded-t-sm h-[30%] hover:bg-blue-200 transition-colors" />
                    <div className="w-full bg-blue-500 rounded-t-sm h-[90%] hover:bg-blue-600 transition-colors" />
                    <div className="w-full bg-slate-100 rounded-t-sm h-[50%] hover:bg-blue-200 transition-colors" />
                  </div>
                  <div className="flex justify-between text-[10px] mono font-medium text-slate-400 uppercase tracking-widest border-t border-slate-100 pt-4">
                    <span>Mon 12</span>
                    <span>Tue 13</span>
                    <span>Wed 14</span>
                    <span>Thu 15</span>
                    <span>Fri 16</span>
                    <span>Sat 17</span>
                    <span>Sun 18</span>
                  </div>
                </div>
              </div>

              {/* Operations Feed */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100">
                  <h3 className="text-slate-900 font-semibold tracking-tight text-base">
                    Network Integrity
                  </h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                        <iconify-icon
                          icon="solar:square-academic-cap-linear"
                          style={{ fontSize: "1.25rem" }}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          Compliance Sync
                        </p>
                        <p className="text-xs text-slate-400">
                          Regional ISO-27001
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-emerald-600">
                        Passed
                      </p>
                      <p className="text-[10px] mono text-slate-400">
                        02m ago
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                        <iconify-icon
                          icon="solar:plain-linear"
                          style={{ fontSize: "1.25rem" }}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          Mainframe 01-A
                        </p>
                        <p className="text-xs text-slate-400">
                          Load Balancing
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-blue-600">
                        Active
                      </p>
                      <p className="text-[10px] mono text-slate-400">
                        08m ago
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                        <iconify-icon
                          icon="solar:database-linear"
                          style={{ fontSize: "1.25rem" }}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          PostgreSQL Cloud
                        </p>
                        <p className="text-xs text-slate-400">
                          Data Replication
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold text-amber-600">
                        Delayed
                      </p>
                      <p className="text-[10px] mono text-slate-400">
                        14m ago
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setLogsOpen(true)}
                    className="w-full py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    View System Logs
                  </button>
                </div>
              </div>
            </div>

            {/* Global Ledger Table */}
            <div className="mt-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <h3 className="text-slate-900 font-semibold tracking-tight text-base">
                    Operational Ledger
                  </h3>
                  {regionFilter !== "Global" && (
                    <span className="text-[10px] text-slate-500 font-medium">{filteredTransactions.length} in {regionFilter}</span>
                  )}
                </div>
                <div className="relative flex items-center space-x-2">
                  <button type="button" onClick={() => showToast(`Exported ${filteredTransactions.length} transactions`)} className="flex items-center space-x-2 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50">Export CSV</button>
                  <button
                    type="button"
                    onClick={() => setFilterDropdownOpen((o) => !o)}
                    className={`flex items-center space-x-2 px-3 py-1.5 border rounded-lg text-xs font-medium transition-colors ${
                      regionFilter !== "Global" ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <iconify-icon icon="solar:filter-linear" />
                    <span>Filter by Region</span>
                    {regionFilter !== "Global" && <span className="text-[10px]">· {regionFilter}</span>}
                    <iconify-icon icon="solar:alt-arrow-down-linear" />
                  </button>
                  {filterDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" aria-hidden onClick={() => setFilterDropdownOpen(false)} />
                      <div className="absolute right-0 top-full mt-1 py-1 min-w-[120px] bg-white border border-slate-200 rounded-lg shadow-xl z-20">
                        {REGIONS.map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => { setRegionFilter(r); setFilterDropdownOpen(false); }}
                            className={`w-full text-left px-4 py-2 text-xs rounded-none first:rounded-t-lg last:rounded-b-lg transition-colors ${
                              regionFilter === r ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                        Transaction ID
                      </th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                        Origin Node
                      </th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                        Timestamp
                      </th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                        Allocation
                      </th>
                      <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-400 font-semibold text-right">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                          No transactions match {regionFilter !== "Global" ? `region ${regionFilter}` : "filters"}
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-900 mono uppercase">{tx.id}</td>
                          <td className="px-6 py-4">{tx.originNode}</td>
                          <td className="px-6 py-4 text-slate-400">{tx.timestamp}</td>
                          <td className="px-6 py-4 font-medium text-slate-900">{tx.allocation}</td>
                          <td className="px-6 py-4 text-right">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded font-medium ${
                              tx.status === "Success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-blue-50 text-blue-700 border border-blue-100"
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            </>
            )}

            {sidebarActive === "ledger" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500">Filter and search transactions, then export.</p>
                <button type="button" onClick={() => showToast(`Exported ${filteredTransactions.length} transactions`)} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700">Export CSV</button>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <h3 className="text-slate-900 font-semibold tracking-tight text-base">Operational Ledger</h3>
                    {regionFilter !== "Global" && <span className="text-[10px] text-slate-500 font-medium">{filteredTransactions.length} in {regionFilter}</span>}
                  </div>
                  <div className="relative flex items-center space-x-2">
                    <button type="button" onClick={() => setFilterDropdownOpen((o) => !o)} className={`flex items-center space-x-2 px-3 py-1.5 border rounded-lg text-xs font-medium transition-colors ${regionFilter !== "Global" ? "border-blue-300 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                      <iconify-icon icon="solar:filter-linear" />
                      <span>Filter by Region</span>
                      {regionFilter !== "Global" && <span className="text-[10px]">· {regionFilter}</span>}
                      <iconify-icon icon="solar:alt-arrow-down-linear" />
                    </button>
                    {filterDropdownOpen && (
                      <>
                        <div className="fixed inset-0 z-10" aria-hidden onClick={() => setFilterDropdownOpen(false)} />
                        <div className="absolute right-0 top-full mt-1 py-1 min-w-[120px] bg-white border border-slate-200 rounded-lg shadow-xl z-20">
                          {REGIONS.map((r) => (
                            <button key={r} type="button" onClick={() => { setRegionFilter(r); setFilterDropdownOpen(false); }} className={`w-full text-left px-4 py-2 text-xs rounded-none first:rounded-t-lg last:rounded-b-lg transition-colors ${regionFilter === r ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-600 hover:bg-slate-50"}`}>{r}</button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50">
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Transaction ID</th>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Origin Node</th>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Timestamp</th>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-400 font-semibold">Allocation</th>
                        <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-400 font-semibold text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {filteredTransactions.length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No transactions match {regionFilter !== "Global" ? `region ${regionFilter}` : "filters"}</td></tr>
                      ) : (
                        filteredTransactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 font-semibold text-slate-900 mono uppercase">{tx.id}</td>
                            <td className="px-6 py-4">{tx.originNode}</td>
                            <td className="px-6 py-4 text-slate-400">{tx.timestamp}</td>
                            <td className="px-6 py-4 font-medium text-slate-900">{tx.allocation}</td>
                            <td className="px-6 py-4 text-right">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded font-medium ${tx.status === "Success" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-blue-50 text-blue-700 border border-blue-100"}`}>{tx.status}</span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            )}

            {sidebarActive === "audits" && (
            <div className="space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="text-slate-900 font-semibold tracking-tight text-base">Security Audits</h3>
                  <button type="button" onClick={() => showToast("Audit scheduled")} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700">Run audit</button>
                </div>
                <div className="divide-y divide-slate-100">
                  {DEMO_AUDITS.map((a) => (
                    <div key={a.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50/50">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{a.name}</p>
                        <p className="text-xs text-slate-500">{a.date}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${a.status === "Passed" ? "bg-emerald-50 text-emerald-700" : a.status === "In progress" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{a.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            )}

            {sidebarActive === "infra" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {DEMO_NODES.map((r) => (
                  <div key={r.region} className="bg-white border border-slate-200 rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-slate-900">{r.region}</h3>
                      <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{r.status}</span>
                    </div>
                    <ul className="space-y-2">
                      {r.nodes.map((n) => (
                        <li key={n} className="text-xs text-slate-600 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {n}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Quick actions</h3>
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => showToast("Health check running")} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50">Health check</button>
                  <button type="button" onClick={() => setLogsOpen(true)} className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50">View logs</button>
                </div>
              </div>
            </div>
            )}
          </div>

          {/* Footer */}
          <footer className="h-10 border-t border-slate-200 bg-white flex items-center justify-between px-8 text-[10px] font-medium text-slate-400 uppercase tracking-widest">
            <div className="flex items-center space-x-6">
              <span>
                Cluster Status:{" "}
                <span className="text-emerald-500">Nominal</span>
              </span>
              <span>
                Database:{" "}
                <span className="text-slate-600">Global Sync Active</span>
              </span>
            </div>
            <div>© 2024 Nexus Operations Group · Ver 1.4.2</div>
          </footer>

          {toast && (
            <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-900 text-white text-sm font-medium rounded-lg shadow-xl">
              {toast}
            </div>
          )}

          {/* System Logs panel */}
          {logsOpen && (
            <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm" onClick={() => setLogsOpen(false)}>
              <div className="w-full max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col dot-pattern" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white">
                  <h3 className="text-sm font-semibold text-slate-900">System Logs</h3>
                  <button type="button" onClick={() => setLogsOpen(false)} className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                    <iconify-icon icon="solar:close-circle-linear" width="20" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 font-mono text-[10px] text-slate-500 space-y-1 custom-scrollbar max-h-[70vh]">
                  <div>[14:02:01] Ledger sync · {transactions.length} tx</div>
                  <div>[14:01:58] Region filter: {regionFilter}</div>
                  <div>[14:01:55] Cluster EU nominal</div>
                  <div>[14:01:52] Cluster NA nominal</div>
                  <div>[14:01:48] Cluster APAC nominal</div>
                  <div>[14:01:45] Velocity: {metrics.velocity.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
