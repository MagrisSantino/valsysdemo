// @ts-nocheck
"use client";

import { useState, useMemo } from "react";

type NavId = "dashboard" | "memberships" | "payments" | "schedules" | "settings";

interface Student {
  id: string;
  name: string;
  email: string;
  initials: string;
  plan: string;
  status: "Paid" | "Pending";
  amount: string;
}

const INITIAL_STUDENTS: Student[] = [
  { id: "1", name: "Alex Morgan", email: "alex@pulse.io", initials: "AM", plan: "Elite Performance", status: "Paid", amount: "$199.00" },
  { id: "2", name: "Sarah Chen", email: "s.chen@gmail.com", initials: "SC", plan: "Standard Access", status: "Pending", amount: "$89.00" },
  { id: "3", name: "Ryan Klose", email: "rklose@me.com", initials: "RK", plan: "Elite Performance", status: "Paid", amount: "$199.00" },
  { id: "4", name: "Maya Dubois", email: "md@outlook.com", initials: "MD", plan: "Basic Yearly", status: "Paid", amount: "$750.00" },
];

const PLANS = ["Elite Performance", "Standard Access", "Basic Yearly"];

const VIEW_TITLES: Record<NavId, string> = {
  dashboard: "Dashboard",
  memberships: "Memberships & Payments",
  payments: "Payments",
  schedules: "Schedules",
  settings: "Settings",
};

const DEMO_SCHEDULES = [
  { id: "1", title: "Morning HIIT", time: "06:00 - 07:00", day: "Mon, Wed, Fri", capacity: "12/16" },
  { id: "2", title: "Yoga Flow", time: "09:00 - 10:00", day: "Tue, Thu", capacity: "8/12" },
  { id: "3", title: "Strength & Conditioning", time: "18:00 - 19:00", day: "Mon, Wed", capacity: "14/14" },
  { id: "4", title: "Open Gym", time: "07:00 - 22:00", day: "Daily", capacity: "Open" },
];

function amountToNum(a: string) {
  return Number(a.replace(/[$,]/g, "")) || 0;
}

export default function KinetixPage() {
  const [activeNav, setActiveNav] = useState<NavId>("memberships");
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [modalOpen, setModalOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPlan, setFormPlan] = useState(PLANS[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openRowMenuId, setOpenRowMenuId] = useState<string | null>(null);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPlan, setEditPlan] = useState("");
  const [settings, setSettings] = useState({ emails: true, reminders: true, defaultView: "month" });
  const [toast, setToast] = useState<{ message: string } | null>(null);

  const showToast = (message: string) => {
    setToast({ message });
    setTimeout(() => setToast(null), 2500);
  };

  const totalRevenue = useMemo(() => students.filter((s) => s.status === "Paid").reduce((sum, s) => sum + amountToNum(s.amount), 0), [students]);
  const pendingAmount = useMemo(() => students.filter((s) => s.status === "Pending").reduce((sum, s) => sum + amountToNum(s.amount), 0), [students]);
  const paidCount = students.filter((s) => s.status === "Paid").length;
  const pendingCount = students.filter((s) => s.status === "Pending").length;

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.trim().toLowerCase();
    return students.filter((s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.plan.toLowerCase().includes(q));
  }, [students, searchQuery]);

  const handleSubmitStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;
    const initials = formName.trim().split(/\s+/).map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    setStudents((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: formName.trim(),
        email: formEmail.trim(),
        initials: initials || "??",
        plan: formPlan,
        status: "Pending",
        amount: formPlan === "Elite Performance" ? "$199.00" : formPlan === "Standard Access" ? "$89.00" : "$750.00",
      },
    ]);
    setFormName("");
    setFormEmail("");
    setFormPlan(PLANS[0]);
    setModalOpen(false);
    showToast("Student added successfully");
  };

  const markAsPaid = (id: string) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, status: "Paid" as const } : s)));
    setOpenRowMenuId(null);
    showToast("Marked as paid");
  };

  const removeStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    setOpenRowMenuId(null);
    setEditingStudentId(null);
    showToast("Student removed");
  };

  const startEdit = (s: Student) => {
    setEditingStudentId(s.id);
    setEditName(s.name);
    setEditEmail(s.email);
    setEditPlan(s.plan);
    setOpenRowMenuId(null);
  };

  const saveEdit = () => {
    if (!editingStudentId) return;
    const amount = editPlan === "Elite Performance" ? "$199.00" : editPlan === "Standard Access" ? "$89.00" : "$750.00";
    setStudents((prev) =>
      prev.map((s) =>
        s.id === editingStudentId
          ? { ...s, name: editName, email: editEmail, plan: editPlan, amount, initials: editName.trim().split(/\s+/).map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "??" }
          : s
      )
    );
    setEditingStudentId(null);
    showToast("Student updated");
  };

  const navItem = (id: NavId, label: string, icon: string) => (
    <button
      type="button"
      onClick={() => setActiveNav(id)}
      className={`flex items-center gap-3 px-4 py-2 text-sm font-medium rounded-lg transition-colors w-full text-left ${
        activeNav === id ? "text-white bg-neutral-900" : "text-neutral-400 hover:text-white hover:bg-neutral-900"
      }`}
    >
      <iconify-icon icon={icon} width="20" height="20" style={{ strokeWidth: 1.5 }} />
      {label}
    </button>
  );

  return (
    <div className="bg-[#050505] text-neutral-300 min-h-screen flex flex-col">
      <header className="grid grid-cols-[1fr_auto_1fr] items-center px-6 py-4 bg-neutral-950 border-b border-neutral-800 shrink-0">
        <span className="text-[1.1rem] font-bold tracking-[0.2em] uppercase bg-linear-to-r from-cyan-300 via-cyan-200 to-violet-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,211,238,0.15)]">
          kinetix
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
      <div className="flex flex-1 min-h-0">
      {/* Sidebar */}
      <aside className="w-64 border-r border-neutral-800/50 flex flex-col hidden lg:flex">
        <div className="p-8">
          <div className="text-xl font-semibold tracking-tighter text-white flex items-center gap-2">
            <div className="w-6 h-6 bg-violet-600 rounded flex items-center justify-center text-xs">
              A
            </div>
            CORE.
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navItem("dashboard", "Dashboard", "solar:widget-2-linear")}
          {navItem("memberships", "Memberships", "solar:users-group-rounded-linear")}
          {navItem("payments", "Payments", "solar:card-2-linear")}
          {navItem("schedules", "Schedules", "solar:calendar-minimalistic-linear")}
          {navItem("settings", "Settings", "solar:settings-linear")}
        </nav>

        <div className="p-6 border-t border-neutral-800/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-medium border border-neutral-700">
              JD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                Julian Rossi
              </p>
              <p className="text-xs text-neutral-500 truncate">Admin Access</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar relative">
        {/* Subtle Glow Background */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-violet-600/5 blur-[120px] pointer-events-none" />

        {/* Header */}
        <header className="h-16 border-b border-neutral-800/50 flex items-center justify-between px-8 sticky top-0 bg-[#050505]/80 backdrop-blur-md z-10">
          <h1 className="text-lg font-semibold tracking-tight text-white">
            {VIEW_TITLES[activeNav]}
          </h1>
          <div className="flex items-center gap-4">
            {(activeNav === "memberships" || activeNav === "dashboard") && (
              <div className="relative">
                <iconify-icon icon="solar:magnifer-linear" width="20" height="20" className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search students..."
                  className="w-48 pl-9 pr-4 py-2 rounded-lg bg-neutral-900/50 border border-neutral-800 text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>
            )}
            {(activeNav === "memberships" || activeNav === "dashboard") && (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-violet-950/20"
              >
                <iconify-icon icon="solar:add-circle-linear" width="18" height="18" />
                New Subscription
              </button>
            )}
          </div>
        </header>

        {/* Content by view */}
        {activeNav === "dashboard" && (
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-widest">Total Revenue</span>
                <iconify-icon icon="solar:graph-up-linear" width="18" height="18" className="text-violet-400" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-white">
                  ${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </h2>
                <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                  <iconify-icon
                    icon="solar:arrow-right-up-linear"
                    width="12"
                    height="12"
                  />
                  12% vs last month
                </p>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-widest">
                  Active Members
                </span>
                <iconify-icon
                  icon="solar:user-rounded-linear"
                  width="18"
                  height="18"
                  className="text-violet-400"
                />
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-white">
                  {students.length}
                </h2>
                <p className="text-xs text-neutral-500 mt-1">{pendingCount} pending payment</p>
              </div>
            </div>

            <div className="glass-card p-6 rounded-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-neutral-500 uppercase tracking-widest">
                  Revenue Growth
                </span>
                <div className="flex gap-1 h-6 items-end">
                  <div className="w-1 bg-violet-500/20 h-2 rounded-full" />
                  <div className="w-1 bg-violet-500/40 h-4 rounded-full" />
                  <div className="w-1 bg-violet-500/60 h-3 rounded-full" />
                  <div className="w-1 bg-violet-500/80 h-5 rounded-full" />
                  <div className="w-1 bg-violet-500 h-6 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-white">
                  94.2%
                </h2>
                <p className="text-xs text-neutral-500 mt-1">Retention rate</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl">
            <div className="space-y-6">
              {/* Revenue Summary Chart Card */}
              <div className="glass-card p-6 rounded-2xl violet-glow">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-sm font-medium text-white">
                      Revenue Summary
                    </h3>
                    <p className="text-xs text-neutral-500">
                      Weekly projections
                    </p>
                  </div>
                  <div className="bg-neutral-800 px-2 py-1 rounded text-[10px] font-medium text-neutral-400 border border-neutral-700">
                    7D
                  </div>
                </div>

                <div className="flex items-end justify-between h-32 gap-2 mb-4">
                  <div className="w-full bg-neutral-800/50 rounded-sm h-2/3 group relative hover:bg-violet-500/20 transition-all duration-300">
                    <div className="absolute inset-x-0 bottom-0 bg-violet-600/30 h-1/2 rounded-sm transition-all group-hover:bg-violet-600" />
                  </div>
                  <div className="w-full bg-neutral-800/50 rounded-sm h-3/4 group relative hover:bg-violet-500/20 transition-all duration-300">
                    <div className="absolute inset-x-0 bottom-0 bg-violet-600/30 h-2/3 rounded-sm transition-all group-hover:bg-violet-600" />
                  </div>
                  <div className="w-full bg-neutral-800/50 rounded-sm h-1/2 group relative hover:bg-violet-500/20 transition-all duration-300">
                    <div className="absolute inset-x-0 bottom-0 bg-violet-600/30 h-1/4 rounded-sm transition-all group-hover:bg-violet-600" />
                  </div>
                  <div className="w-full bg-neutral-800/50 rounded-sm h-5/6 group relative hover:bg-violet-500/20 transition-all duration-300">
                    <div className="absolute inset-x-0 bottom-0 bg-violet-600/30 h-4/5 rounded-sm transition-all group-hover:bg-violet-600" />
                  </div>
                  <div className="w-full bg-neutral-800/50 rounded-sm h-2/3 group relative hover:bg-violet-500/20 transition-all duration-300">
                    <div className="absolute inset-x-0 bottom-0 bg-violet-600/30 h-1/2 rounded-sm transition-all group-hover:bg-violet-600 shadow-[0_0_20px_rgba(139,92,246,0.3)]" />
                  </div>
                  <div className="w-full bg-neutral-800/50 rounded-sm h-3/4 group relative hover:bg-violet-500/20 transition-all duration-300">
                    <div className="absolute inset-x-0 bottom-0 bg-violet-600/30 h-3/5 rounded-sm transition-all group-hover:bg-violet-600" />
                  </div>
                  <div className="w-full bg-neutral-800/50 rounded-sm h-full group relative hover:bg-violet-500/20 transition-all duration-300">
                    <div className="absolute inset-x-0 bottom-0 bg-violet-600 h-full rounded-sm shadow-[0_0_20px_rgba(139,92,246,0.4)]" />
                  </div>
                </div>
                <div className="flex justify-between text-[10px] text-neutral-600 font-medium px-1">
                  <span>MON</span>
                  <span>TUE</span>
                  <span>WED</span>
                  <span>THU</span>
                  <span>FRI</span>
                  <span>SAT</span>
                  <span>SUN</span>
                </div>
              </div>

              {/* Upcoming Renewals */}
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-sm font-medium text-white mb-4">
                  Upcoming Renewals
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-violet-500" />
                      <span className="text-xs text-neutral-300">{pendingCount} Pending</span>
                    </div>
                    <span className="text-xs text-neutral-500">${pendingAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-neutral-700" />
                      <span className="text-xs text-neutral-300">{paidCount} Paid</span>
                    </div>
                    <span className="text-xs text-neutral-500">${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <button type="button" onClick={() => setActiveNav("payments")} className="w-full mt-6 py-2 rounded-lg border border-neutral-800 text-xs font-medium text-neutral-400 hover:text-white hover:border-neutral-700 transition-all">Review All Billing</button>
              </div>
            </div>
            <div className="glass-card p-6 rounded-2xl flex flex-col justify-center items-center text-center">
              <iconify-icon icon="solar:users-group-rounded-linear" width="48" className="text-violet-500/50 mb-3" />
              <p className="text-sm font-medium text-white mb-1">{students.length} active students</p>
              <p className="text-xs text-neutral-500 mb-4">Manage memberships and subscriptions</p>
              <button type="button" onClick={() => setActiveNav("memberships")} className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium">Go to Memberships</button>
            </div>
          </div>
        </div>
        )}

        {activeNav === "memberships" && (
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 glass-card rounded-2xl overflow-hidden flex flex-col">
              <div className="p-6 border-b border-neutral-800/50 flex items-center justify-between">
                <h3 className="text-base font-medium text-white tracking-tight">Active Students</h3>
                {searchQuery && <span className="text-xs text-neutral-500">{filteredStudents.length} results</span>}
                <button type="button" onClick={() => setActiveNav("dashboard")} className="text-xs text-neutral-500 hover:text-white transition-colors">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs font-medium text-neutral-500 border-b border-neutral-800/50">
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">Plan</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                      <th className="px-6 py-4 w-12" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/30">
                    {editingStudentId ? (
                      <tr className="bg-neutral-900/30">
                        <td colSpan={5} className="px-6 py-4">
                          <div className="flex flex-wrap items-center gap-3">
                            <input value={editName} onChange={(e) => setEditName(e.target.value)} className="px-3 py-1.5 rounded bg-neutral-800 border border-neutral-700 text-white text-sm w-36" placeholder="Name" />
                            <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} className="px-3 py-1.5 rounded bg-neutral-800 border border-neutral-700 text-white text-sm w-40" placeholder="Email" />
                            <select value={editPlan} onChange={(e) => setEditPlan(e.target.value)} className="px-3 py-1.5 rounded bg-neutral-800 border border-neutral-700 text-white text-sm">
                              {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <button type="button" onClick={saveEdit} className="px-3 py-1.5 rounded bg-violet-600 text-white text-xs font-medium">Save</button>
                            <button type="button" onClick={() => setEditingStudentId(null)} className="px-3 py-1.5 rounded border border-neutral-600 text-neutral-400 text-xs">Cancel</button>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                    {filteredStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-white/5 transition-colors group relative">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-medium text-white">{s.initials}</div>
                          <div>
                            <p className="text-sm font-medium text-neutral-200">{s.name}</p>
                            <p className="text-xs text-neutral-500">{s.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4"><span className="text-xs text-neutral-400">{s.plan}</span></td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${s.status === "Paid" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>{s.status}</span>
                        </td>
                        <td className="px-6 py-4 text-right"><span className="text-sm font-medium text-white">{s.amount}</span></td>
                        <td className="px-6 py-4 text-right">
                          <div className="relative">
                            <button type="button" onClick={() => setOpenRowMenuId(openRowMenuId === s.id ? null : s.id)} className="p-1 rounded text-neutral-500 hover:text-white">
                              <iconify-icon icon="solar:menu-dots-linear" width="18" />
                            </button>
                            {openRowMenuId === s.id && (
                              <>
                                <div className="fixed inset-0 z-10" aria-hidden onClick={() => setOpenRowMenuId(null)} />
                                <div className="absolute right-0 top-full mt-1 py-1 w-40 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl z-20">
                                  <button type="button" onClick={() => startEdit(s)} className="w-full text-left px-3 py-2 text-xs text-neutral-400 hover:bg-neutral-800 hover:text-white">Edit</button>
                                  {s.status === "Pending" && <button type="button" onClick={() => markAsPaid(s.id)} className="w-full text-left px-3 py-2 text-xs text-neutral-400 hover:bg-neutral-800 hover:text-white">Mark as Paid</button>}
                                  <button type="button" onClick={() => removeStudent(s.id)} className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-neutral-800">Remove</button>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="space-y-6">
              <div className="glass-card p-6 rounded-2xl violet-glow">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-sm font-medium text-white">Revenue Summary</h3>
                    <p className="text-xs text-neutral-500">From current roster</p>
                  </div>
                  <div className="bg-neutral-800 px-2 py-1 rounded text-[10px] font-medium text-neutral-400 border border-neutral-700">7D</div>
                </div>
                <div className="flex items-end justify-between h-32 gap-2 mb-4">
                  {[0.6, 0.75, 0.5, 0.85, 0.65, 0.9, 1].map((h, i) => (
                    <div key={i} className="flex-1 bg-neutral-800/50 rounded-sm group relative hover:bg-violet-500/20 transition-all duration-300" style={{ height: `${h * 100}%` }}>
                      <div className="absolute inset-x-0 bottom-0 bg-violet-600/30 rounded-sm transition-all group-hover:bg-violet-600" style={{ height: "70%" }} />
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-neutral-600 font-medium px-1">
                  <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
                </div>
              </div>
              <div className="glass-card p-6 rounded-2xl">
                <h3 className="text-sm font-medium text-white mb-4">Upcoming Renewals</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-violet-500" />
                      <span className="text-xs text-neutral-300">{pendingCount} Pending Today</span>
                    </div>
                    <span className="text-xs text-neutral-500">${pendingAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-neutral-700" />
                      <span className="text-xs text-neutral-300">{paidCount} Paid this month</span>
                    </div>
                    <span className="text-xs text-neutral-500">${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <button type="button" onClick={() => setActiveNav("payments")} className="w-full mt-6 py-2 rounded-lg border border-neutral-800 text-xs font-medium text-neutral-400 hover:text-white hover:border-neutral-700 transition-all">Review All Billing</button>
              </div>
            </div>
          </div>
        </div>
        )}

        {activeNav === "payments" && (
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-2xl">
              <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Collected</p>
              <p className="text-2xl font-semibold text-white">${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="glass-card p-6 rounded-2xl">
              <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Pending</p>
              <p className="text-2xl font-semibold text-amber-400">${pendingAmount.toFixed(2)}</p>
            </div>
            <div className="glass-card p-6 rounded-2xl">
              <p className="text-xs text-neutral-500 uppercase tracking-wider mb-1">Transactions</p>
              <p className="text-2xl font-semibold text-white">{students.length}</p>
            </div>
          </div>
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-neutral-800/50">
              <h3 className="text-base font-medium text-white">Payment history</h3>
            </div>
            <div className="divide-y divide-neutral-800/30">
              {students.map((s) => (
                <div key={s.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/5">
                  <div>
                    <p className="text-sm font-medium text-white">{s.name}</p>
                    <p className="text-xs text-neutral-500">{s.plan} · {s.status}</p>
                  </div>
                  <span className="text-sm font-medium text-white">{s.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        )}

        {activeNav === "schedules" && (
        <div className="p-8 space-y-8">
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-neutral-800/50 flex items-center justify-between">
              <h3 className="text-base font-medium text-white">Weekly schedule</h3>
              <span className="text-xs text-neutral-500">This week</span>
            </div>
            <div className="divide-y divide-neutral-800/30">
              {DEMO_SCHEDULES.map((sch) => (
                <div key={sch.id} className="px-6 py-4 flex items-center justify-between hover:bg-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400">
                      <iconify-icon icon="solar:calendar-minimalistic-linear" width="20" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{sch.title}</p>
                      <p className="text-xs text-neutral-500">{sch.time} · {sch.day}</p>
                    </div>
                  </div>
                  <span className="text-xs text-neutral-400">{sch.capacity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        )}

        {activeNav === "settings" && (
        <div className="p-8 max-w-xl">
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-neutral-800/50">
              <h3 className="text-base font-medium text-white">Preferences</h3>
            </div>
            <div className="divide-y divide-neutral-800/30">
              <div className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Email notifications</p>
                  <p className="text-xs text-neutral-500">New signups and payments</p>
                </div>
                <button type="button" onClick={() => setSettings((s) => ({ ...s, emails: !s.emails }))} className={`w-12 h-7 rounded-full transition-colors ${settings.emails ? "bg-violet-600" : "bg-neutral-700"}`}>
                  <span className={`block w-5 h-5 rounded-full bg-white shadow mt-0.5 transition-transform ${settings.emails ? "translate-x-6 ml-0.5" : "translate-x-1"}`} />
                </button>
              </div>
              <div className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Reminder emails</p>
                  <p className="text-xs text-neutral-500">Renewal and payment reminders</p>
                </div>
                <button type="button" onClick={() => setSettings((s) => ({ ...s, reminders: !s.reminders }))} className={`w-12 h-7 rounded-full transition-colors ${settings.reminders ? "bg-violet-600" : "bg-neutral-700"}`}>
                  <span className={`block w-5 h-5 rounded-full bg-white shadow mt-0.5 transition-transform ${settings.reminders ? "translate-x-6 ml-0.5" : "translate-x-1"}`} />
                </button>
              </div>
              <div className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Default calendar view</p>
                  <p className="text-xs text-neutral-500">When opening Schedules</p>
                </div>
                <span className="text-xs text-neutral-400 bg-neutral-800 px-2 py-1 rounded">{settings.defaultView}</span>
              </div>
            </div>
            <div className="p-6 border-t border-neutral-800/50">
              <button type="button" onClick={() => showToast("Settings saved")} className="text-sm font-medium text-violet-400 hover:text-violet-300">Save changes</button>
            </div>
          </div>
          <div className="mt-6 glass-card rounded-2xl p-6">
            <h3 className="text-sm font-medium text-white mb-2">About CORE</h3>
            <p className="text-xs text-neutral-500">Academy management · Demo</p>
            <p className="text-[10px] text-neutral-600 mt-1">Version 1.0.0</p>
          </div>
        </div>
        )}

        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-lg glass-card border border-white/10 text-white text-sm font-medium shadow-xl">
            {toast.message}
          </div>
        )}
      </main>

      {/* Modal: New Subscription */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="glass-card rounded-2xl w-full max-w-md shadow-2xl border border-white/10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-neutral-800/50 flex items-center justify-between">
              <h3 className="text-base font-semibold text-white tracking-tight">
                New Subscription
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800/50 transition-colors"
                aria-label="Close"
              >
                <iconify-icon icon="solar:close-circle-linear" width="22" height="22" />
              </button>
            </div>
            <form onSubmit={handleSubmitStudent} className="p-6 space-y-4">
              <div>
                <label htmlFor="kinetix-name" className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1.5">
                  Full name
                </label>
                <input
                  id="kinetix-name"
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Jordan Smith"
                  className="w-full px-4 py-2.5 rounded-lg bg-neutral-900/50 border border-neutral-700 text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-all"
                  required
                />
              </div>
              <div>
                <label htmlFor="kinetix-email" className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <input
                  id="kinetix-email"
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full px-4 py-2.5 rounded-lg bg-neutral-900/50 border border-neutral-700 text-white text-sm placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-all"
                  required
                />
              </div>
              <div>
                <label htmlFor="kinetix-plan" className="block text-xs font-medium text-neutral-500 uppercase tracking-wider mb-1.5">
                  Plan
                </label>
                <select
                  id="kinetix-plan"
                  value={formPlan}
                  onChange={(e) => setFormPlan(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-neutral-900/50 border border-neutral-700 text-white text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-all"
                >
                  {PLANS.map((p) => (
                    <option key={p} value={p} className="bg-neutral-900 text-white">
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg border border-neutral-700 text-neutral-400 text-sm font-medium hover:bg-neutral-800/50 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors shadow-lg shadow-violet-950/20"
                >
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
