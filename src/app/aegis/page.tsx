// @ts-nocheck
"use client";

import { useState, useCallback } from "react";

type ShiftVariant =
  | "blue"
  | "indigo"
  | "emerald"
  | "amber"
  | "blue-dark"
  | "indigo-dark";

interface Shift {
  label: string;
  variant: ShiftVariant;
}

interface CalendarDay {
  day: number;
  isPrevMonth: boolean;
  shifts: Shift[];
  isWeekend: boolean;
}

const SHIFT_STYLES: Record<
  ShiftVariant,
  string
> = {
  blue: "bg-blue-50 text-blue-700 p-1.5 rounded text-[0.6rem] border border-blue-100",
  indigo:
    "bg-indigo-50 text-indigo-700 p-1.5 rounded text-[0.6rem] border border-indigo-100",
  emerald:
    "bg-emerald-50 text-emerald-700 p-1.5 rounded text-[0.6rem] border border-emerald-100",
  amber:
    "bg-amber-50 text-amber-700 p-1.5 rounded text-[0.6rem] border border-amber-100",
  "blue-dark":
    "bg-blue-600 text-white p-1.5 rounded text-[0.6rem] shadow-sm",
  "indigo-dark":
    "bg-indigo-600 text-white p-1.5 rounded text-[0.6rem] shadow-sm",
};

const INITIAL_CALENDAR_DAYS: CalendarDay[] = [
  { day: 25, isPrevMonth: true, shifts: [], isWeekend: false },
  { day: 26, isPrevMonth: true, shifts: [], isWeekend: false },
  { day: 27, isPrevMonth: true, shifts: [], isWeekend: false },
  { day: 28, isPrevMonth: true, shifts: [], isWeekend: false },
  { day: 29, isPrevMonth: true, shifts: [], isWeekend: false },
  { day: 30, isPrevMonth: true, shifts: [], isWeekend: false },
  { day: 1, isPrevMonth: false, shifts: [], isWeekend: false },
  {
    day: 2,
    isPrevMonth: false,
    shifts: [{ label: "Dr. Sarah V. (AM)", variant: "blue" }],
    isWeekend: false,
  },
  {
    day: 3,
    isPrevMonth: false,
    shifts: [{ label: "Dr. Marcus (PM)", variant: "indigo" }],
    isWeekend: false,
  },
  { day: 4, isPrevMonth: false, shifts: [], isWeekend: false },
  {
    day: 5,
    isPrevMonth: false,
    shifts: [{ label: "Lab Sync - R2", variant: "emerald" }],
    isWeekend: false,
  },
  { day: 6, isPrevMonth: false, shifts: [], isWeekend: false },
  { day: 7, isPrevMonth: false, shifts: [], isWeekend: true },
  { day: 8, isPrevMonth: false, shifts: [], isWeekend: true },
  { day: 9, isPrevMonth: false, shifts: [], isWeekend: false },
  { day: 10, isPrevMonth: false, shifts: [], isWeekend: false },
  {
    day: 11,
    isPrevMonth: false,
    shifts: [{ label: "Audit: Floor 3", variant: "amber" }],
    isWeekend: false,
  },
  { day: 12, isPrevMonth: false, shifts: [], isWeekend: false },
  {
    day: 13,
    isPrevMonth: false,
    shifts: [{ label: "Dr. Sarah V. (AM)", variant: "blue" }],
    isWeekend: false,
  },
  { day: 14, isPrevMonth: false, shifts: [], isWeekend: true },
  { day: 15, isPrevMonth: false, shifts: [], isWeekend: true },
  { day: 16, isPrevMonth: false, shifts: [], isWeekend: false },
  { day: 17, isPrevMonth: false, shifts: [], isWeekend: false },
  { day: 18, isPrevMonth: false, shifts: [], isWeekend: false },
  {
    day: 19,
    isPrevMonth: false,
    shifts: [
      { label: "Dr. Aris (AM)", variant: "blue-dark" },
      { label: "Dr. Chen (PM)", variant: "indigo-dark" },
    ],
    isWeekend: false,
  },
  { day: 20, isPrevMonth: false, shifts: [], isWeekend: false },
  { day: 21, isPrevMonth: false, shifts: [], isWeekend: true },
  { day: 22, isPrevMonth: false, shifts: [], isWeekend: true },
];

const INITIAL_STAFF = { total: 42, physicians: 18, nursing: 24 };

type ViewId = "schedule" | "staff" | "departmental" | "analytics" | "settings";

const DEMO_STAFF_LIST = [
  { id: "1", name: "Dr. Sarah Vance", role: "Attending Physician", department: "Emergency", status: "On shift", initials: "SV" },
  { id: "2", name: "Dr. Marcus Chen", role: "Resident", department: "Internal Medicine", status: "On shift", initials: "MC" },
  { id: "3", name: "Dr. Elena Aris", role: "Attending Physician", department: "Neurology", status: "On call", initials: "EA" },
  { id: "4", name: "Dr. James Miller", role: "Attending Physician", department: "Surgery", status: "Off", initials: "JM" },
  { id: "5", name: "Dr. Maya Lang", role: "Resident", department: "Pediatrics", status: "On shift", initials: "ML" },
  { id: "6", name: "Dr. Ryan Foster", role: "Attending Physician", department: "Cardiology", status: "On call", initials: "RF" },
  { id: "7", name: "Nurse Kate Wilson", role: "RN", department: "ICU", status: "On shift", initials: "KW" },
  { id: "8", name: "Nurse David Okonkwo", role: "RN", department: "Emergency", status: "On shift", initials: "DO" },
];

const DEMO_DEPARTMENTS = [
  { id: "1", name: "Emergency", lead: "Dr. Sarah Vance", staffCount: 12, beds: 24, occupancy: 68 },
  { id: "2", name: "Internal Medicine", lead: "Dr. Marcus Chen", staffCount: 18, beds: 48, occupancy: 72 },
  { id: "3", name: "Neurology", lead: "Dr. Elena Aris", staffCount: 6, beds: 16, occupancy: 85 },
  { id: "4", name: "Surgery", lead: "Dr. James Miller", staffCount: 14, beds: 12, occupancy: 61 },
  { id: "5", name: "Pediatrics", lead: "Dr. Maya Lang", staffCount: 10, beds: 20, occupancy: 79 },
  { id: "6", name: "ICU", lead: "Nurse Kate Wilson", staffCount: 8, beds: 14, occupancy: 74 },
];

const VIEW_TITLES: Record<ViewId, { title: string; subtitle?: string }> = {
  schedule: { title: "Shift Operations", subtitle: "October 2023" },
  staff: { title: "Staff Directory", subtitle: "42 on-call personnel" },
  departmental: { title: "Departmental", subtitle: "6 units" },
  analytics: { title: "Analytics", subtitle: "Operations overview" },
  settings: { title: "Settings", subtitle: "MDOS configuration" },
};

export default function AegisPage() {
  const [calendarDays] = useState<CalendarDay[]>(INITIAL_CALENDAR_DAYS);
  const [staff] = useState(INITIAL_STAFF);
  const [selectedDay, setSelectedDay] = useState<number | null>(19);
  const [isLoadingShifts, setIsLoadingShifts] = useState(false);
  const [assignReserveStatus, setAssignReserveStatus] = useState<
    "idle" | "routing" | "success"
  >("idle");
  const [currentView, setCurrentView] = useState<ViewId>("schedule");

  const handleDayClick = useCallback((day: number, isPrevMonth: boolean) => {
    if (isPrevMonth) return;
    setSelectedDay(day);
    setIsLoadingShifts(true);
    setTimeout(() => setIsLoadingShifts(false), 800);
  }, []);

  const handleAutoAssign = useCallback(() => {
    if (assignReserveStatus !== "idle") return;
    setAssignReserveStatus("routing");
    setTimeout(() => setAssignReserveStatus("success"), 2000);
  }, [assignReserveStatus]);

  const selectedDayData = selectedDay
    ? calendarDays.find((d) => d.day === selectedDay && !d.isPrevMonth)
    : null;

  return (
    <div className="bg-zinc-50 text-zinc-600 min-h-screen flex flex-col overflow-hidden">
      {/* Header: un solo logo (tipografía marca) + botón volver */}
      <header className="grid grid-cols-[1fr_auto_1fr] items-center px-6 py-4 bg-zinc-900/95 border-b border-zinc-700/50 shrink-0">
        <span className="text-[1.1rem] font-bold tracking-[0.2em] uppercase bg-linear-to-r from-cyan-300 via-cyan-200 to-violet-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(34,211,238,0.15)]">
          aegis
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
      <div className="flex flex-1 overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-zinc-200 flex-col p-6 gap-8 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-zinc-900 text-xl tracking-tighter font-medium mono">
            MD<span className="text-blue-600">OS</span>
          </span>
        </div>

        <nav className="flex flex-col gap-6">
          <div className="space-y-3">
            <p className="text-[0.65rem] uppercase tracking-[0.15em] text-zinc-400 font-medium">
              Main Registry
            </p>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => setCurrentView("schedule")}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg w-full text-left transition-colors group ${
                  currentView === "schedule"
                    ? "bg-zinc-100 text-zinc-900 border border-zinc-200"
                    : "hover:bg-zinc-50 border border-transparent"
                }`}
              >
                <iconify-icon
                  icon="solar:calendar-minimalistic-linear"
                  style={{ fontSize: "1.25rem" }}
                  className={currentView === "schedule" ? "text-zinc-900" : "text-zinc-400 group-hover:text-zinc-900"}
                />
                <span className="text-sm font-normal">Shift Schedule</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentView("staff")}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg w-full text-left transition-colors group ${
                  currentView === "staff"
                    ? "bg-zinc-100 text-zinc-900 border border-zinc-200"
                    : "hover:bg-zinc-50 border border-transparent"
                }`}
              >
                <iconify-icon
                  icon="solar:users-group-rounded-linear"
                  style={{ fontSize: "1.25rem" }}
                  className={currentView === "staff" ? "text-zinc-900" : "text-zinc-400 group-hover:text-zinc-900"}
                />
                <span className="text-sm font-normal">Staff Directory</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentView("departmental")}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg w-full text-left transition-colors group ${
                  currentView === "departmental"
                    ? "bg-zinc-100 text-zinc-900 border border-zinc-200"
                    : "hover:bg-zinc-50 border border-transparent"
                }`}
              >
                <iconify-icon
                  icon="solar:case-linear"
                  style={{ fontSize: "1.25rem" }}
                  className={currentView === "departmental" ? "text-zinc-900" : "text-zinc-400 group-hover:text-zinc-900"}
                />
                <span className="text-sm font-normal">Departmental</span>
              </button>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-zinc-100">
            <p className="text-[0.65rem] uppercase tracking-[0.15em] text-zinc-400 font-medium">
              Operational
            </p>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => setCurrentView("analytics")}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg w-full text-left transition-colors group ${
                  currentView === "analytics"
                    ? "bg-zinc-100 text-zinc-900 border border-zinc-200"
                    : "hover:bg-zinc-50 border border-transparent"
                }`}
              >
                <iconify-icon
                  icon="solar:chart-square-linear"
                  style={{ fontSize: "1.25rem" }}
                  className={currentView === "analytics" ? "text-zinc-900" : "text-zinc-400 group-hover:text-zinc-900"}
                />
                <span className="text-sm font-normal">Analytics</span>
              </button>
              <button
                type="button"
                onClick={() => setCurrentView("settings")}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg w-full text-left transition-colors group ${
                  currentView === "settings"
                    ? "bg-zinc-100 text-zinc-900 border border-zinc-200"
                    : "hover:bg-zinc-50 border border-transparent"
                }`}
              >
                <iconify-icon
                  icon="solar:settings-linear"
                  style={{ fontSize: "1.25rem" }}
                  className={currentView === "settings" ? "text-zinc-900" : "text-zinc-400 group-hover:text-zinc-900"}
                />
                <span className="text-sm font-normal">Settings</span>
              </button>
            </div>
          </div>
        </nav>

        <div className="mt-auto p-4 rounded-xl border border-zinc-200 bg-zinc-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white text-xs font-medium">
              AH
            </div>
            <div className="overflow-hidden">
              <p className="text-xs text-zinc-900 font-medium truncate">
                Dr. A. Henderson
              </p>
              <p className="text-[0.6rem] text-zinc-500">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-y-auto pb-16 md:pb-0">
        {/* Header */}
        <header className="h-14 md:h-16 bg-white border-b border-zinc-200 px-4 md:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-lg text-zinc-900 font-medium tracking-tight">
              {VIEW_TITLES[currentView].title}
            </h1>
            {VIEW_TITLES[currentView].subtitle && (
              <>
                <div className="h-4 w-px bg-zinc-200" />
                <p className="text-sm text-zinc-500 font-normal">
                  {VIEW_TITLES[currentView].subtitle}
                </p>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-md border border-green-100">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              <span className="text-[0.65rem] text-green-700 font-medium mono">
                SYSTEM NOMINAL
              </span>
            </div>
            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-400 transition-colors"
            >
              <iconify-icon
                icon="solar:magnifer-linear"
                style={{ fontSize: "1.25rem" }}
              />
            </button>
            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-400 transition-colors relative"
            >
              <iconify-icon
                icon="solar:bell-linear"
                style={{ fontSize: "1.25rem" }}
              />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 border-2 border-white rounded-full" />
            </button>
          </div>
        </header>

        {/* Main content by view */}
        {currentView === "schedule" && (
        <div className="p-4 md:p-8 flex flex-col lg:flex-row gap-4 md:gap-8">
          {/* Calendar Section */}
          <section className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-3 py-1.5 bg-white border border-zinc-200 rounded-md text-xs font-medium text-zinc-900 hover:bg-zinc-50"
                >
                  Today
                </button>
                <div className="flex border border-zinc-200 rounded-md overflow-hidden">
                  <button
                    type="button"
                    className="p-1.5 bg-white hover:bg-zinc-50 border-r border-zinc-200"
                  >
                    <iconify-icon icon="solar:alt-arrow-left-linear" />
                  </button>
                  <button
                    type="button"
                    className="p-1.5 bg-white hover:bg-zinc-50"
                  >
                    <iconify-icon icon="solar:alt-arrow-right-linear" />
                  </button>
                </div>
              </div>
              <div className="flex bg-zinc-100 p-1 rounded-lg">
                <button
                  type="button"
                  className="px-4 py-1.5 bg-white text-zinc-900 text-xs font-medium rounded shadow-sm border border-zinc-200/50"
                >
                  Month
                </button>
                <button
                  type="button"
                  className="px-4 py-1.5 text-zinc-500 text-xs font-medium rounded hover:text-zinc-900"
                >
                  Week
                </button>
                <button
                  type="button"
                  className="px-4 py-1.5 text-zinc-500 text-xs font-medium rounded hover:text-zinc-900"
                >
                  Day
                </button>
              </div>
            </div>

            {/* Complete Calendar Grid */}
            <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
            <div className="min-w-[480px] bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
              <div className="calendar-grid border-b border-zinc-200 bg-zinc-50/50">
                <div className="p-3 text-center border-r border-zinc-100">
                  <span className="text-[0.65rem] font-medium tracking-wider text-zinc-400 uppercase">
                    Mon
                  </span>
                </div>
                <div className="p-3 text-center border-r border-zinc-100">
                  <span className="text-[0.65rem] font-medium tracking-wider text-zinc-400 uppercase">
                    Tue
                  </span>
                </div>
                <div className="p-3 text-center border-r border-zinc-100">
                  <span className="text-[0.65rem] font-medium tracking-wider text-zinc-400 uppercase">
                    Wed
                  </span>
                </div>
                <div className="p-3 text-center border-r border-zinc-100">
                  <span className="text-[0.65rem] font-medium tracking-wider text-zinc-400 uppercase">
                    Thu
                  </span>
                </div>
                <div className="p-3 text-center border-r border-zinc-100">
                  <span className="text-[0.65rem] font-medium tracking-wider text-zinc-400 uppercase">
                    Fri
                  </span>
                </div>
                <div className="p-3 text-center border-r border-zinc-100">
                  <span className="text-[0.65rem] font-medium tracking-wider uppercase text-blue-600">
                    Sat
                  </span>
                </div>
                <div className="p-3 text-center">
                  <span className="text-[0.65rem] font-medium tracking-wider uppercase text-blue-600">
                    Sun
                  </span>
                </div>
              </div>

              <div className="calendar-grid auto-rows-[minmax(120px,auto)]">
                {calendarDays.map((cell, index) => {
                  const isActive =
                    selectedDay === cell.day && !cell.isPrevMonth;
                  const isClickable = !cell.isPrevMonth;
                  const borderClass =
                    index % 7 === 6
                      ? "border-b border-zinc-100"
                      : "border-r border-b border-zinc-100";
                  return (
                    <button
                      key={index}
                      type="button"
                      disabled={!isClickable}
                      onClick={() => handleDayClick(cell.day, cell.isPrevMonth)}
                      className={`p-2 text-left mono text-xs space-y-1 ${borderClass} transition-colors ${
                        cell.isPrevMonth
                          ? "bg-zinc-50/30 text-zinc-300 cursor-default"
                          : isActive
                            ? "bg-blue-50/30 text-zinc-900 font-medium cursor-default"
                            : cell.isWeekend
                              ? "bg-blue-50/20 text-zinc-500 hover:bg-blue-50/30 cursor-pointer"
                              : "text-zinc-500 hover:bg-zinc-50/50 cursor-pointer"
                      }`}
                    >
                      {isActive ? (
                        <>
                          <span className="w-6 h-6 flex items-center justify-center bg-blue-600 text-white rounded-full mx-auto mb-2">
                            {cell.day}
                          </span>
                          <div className="space-y-1">
                            {cell.shifts.map((shift) => (
                              <div
                                key={shift.label}
                                className={SHIFT_STYLES[shift.variant]}
                              >
                                {shift.label}
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <>
                          <span>{String(cell.day).padStart(2, "0")}</span>
                          {cell.shifts.map((shift) => (
                            <div
                              key={shift.label}
                              className={SHIFT_STYLES[shift.variant]}
                            >
                              {shift.label}
                            </div>
                          ))}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            </div>

            {/* Vista central: carga de turnos o resumen del día seleccionado */}
            {selectedDay !== null && (
              <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm min-h-[80px] flex items-center justify-center">
                {isLoadingShifts ? (
                  <div className="flex items-center gap-2 text-zinc-500 text-sm">
                    <iconify-icon
                      icon="solar:refresh-linear"
                      style={{ fontSize: "1.25rem" }}
                      className="animate-spin"
                    />
                    <span>Loading shifts for October {selectedDay}...</span>
                  </div>
                ) : selectedDayData ? (
                  <div className="w-full">
                    <p className="text-[0.65rem] text-zinc-400 font-medium uppercase tracking-wider mb-2">
                      Shifts for October {selectedDay}
                    </p>
                    {selectedDayData.shifts.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedDayData.shifts.map((shift) => (
                          <span
                            key={shift.label}
                            className={SHIFT_STYLES[shift.variant]}
                          >
                            {shift.label}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500">No shifts scheduled</p>
                    )}
                  </div>
                ) : null}
              </div>
            )}
          </section>

          {/* Alerts Sidebar */}
          <section className="w-full lg:w-80 space-y-6 shrink-0">
            <div className="flex items-center justify-between">
              <h2 className="text-[0.7rem] text-zinc-400 font-medium uppercase tracking-widest">
                Live Inventory
              </h2>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[0.6rem] rounded font-medium mono">
                ACTIVE
              </span>
            </div>

            <div className="space-y-4">
              {/* Metrics Card */}
              <div className="bg-white border border-zinc-200 p-5 rounded-xl shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500 font-normal">
                    On-Call Staff
                  </span>
                  <span className="text-xs text-zinc-900 font-medium mono">
                    {staff.total} Total
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                    <p className="text-[0.6rem] text-zinc-400 font-medium uppercase">
                      Physicians
                    </p>
                    <p className="text-lg text-zinc-900 font-normal mono tracking-tight">
                      {staff.physicians}
                    </p>
                  </div>
                  <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                    <p className="text-[0.6rem] text-zinc-400 font-medium uppercase">
                      Nursing
                    </p>
                    <p className="text-lg text-zinc-900 font-normal mono tracking-tight">
                      {staff.nursing}
                    </p>
                  </div>
                </div>
              </div>

              {/* Shift Alert */}
              <div className="bg-zinc-900 p-5 rounded-xl space-y-4 shadow-md overflow-hidden relative">
                <div className="absolute top-0 right-0 p-3 opacity-20">
                  <iconify-icon
                    icon="solar:shield-warning-linear"
                    style={{ fontSize: "3rem" }}
                    className="text-white"
                  />
                </div>
                <div className="relative">
                  <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">
                    Critical Coverage
                  </p>
                  <h3 className="text-white text-sm font-normal mt-1">
                    Neurology Gap Detected
                  </h3>
                  <p className="text-[0.65rem] text-zinc-500 mt-2 font-light">
                    Shift gap from 02:00 to 06:00 tomorrow. Emergency backup
                    required.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAutoAssign}
                  disabled={assignReserveStatus !== "idle"}
                  className={`w-full py-2 text-[0.7rem] font-medium rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 ${
                    assignReserveStatus === "success"
                      ? "bg-emerald-600 text-white shadow-emerald-900/20 cursor-default"
                      : assignReserveStatus === "routing"
                        ? "bg-blue-600/80 text-white shadow-blue-900/20 cursor-wait"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-900/20"
                  }`}
                >
                  {assignReserveStatus === "routing" && (
                    <iconify-icon
                      icon="solar:refresh-linear"
                      style={{ fontSize: "1rem" }}
                      className="animate-spin"
                    />
                  )}
                  {assignReserveStatus === "idle" && "Auto-Assign Reserve"}
                  {assignReserveStatus === "routing" && "Routing..."}
                  {assignReserveStatus === "success" && "Assigned Successfully"}
                </button>
              </div>

              {/* Activity Feed */}
              <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                  <span className="text-[0.65rem] text-zinc-400 font-medium uppercase">
                    Recent Updates
                  </span>
                  <iconify-icon
                    icon="solar:refresh-linear"
                    style={{ fontSize: "0.8rem" }}
                    className="text-zinc-400"
                  />
                </div>
                <div className="divide-y divide-zinc-100">
                  <div className="p-4 flex gap-3">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 shrink-0" />
                    <div>
                      <p className="text-xs text-zinc-900 font-normal">
                        Dr. Miller swapped 24/10 shift with Dr. Lang.
                      </p>
                      <p className="text-[0.65rem] text-zinc-400 mt-1">
                        4 mins ago
                      </p>
                    </div>
                  </div>
                  <div className="p-4 flex gap-3">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                    <div>
                      <p className="text-xs text-zinc-900 font-normal">
                        System generated November draft roster.
                      </p>
                      <p className="text-[0.65rem] text-zinc-400 mt-1">
                        2 hours ago
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
        )}

        {currentView === "staff" && (
          <div className="p-4 md:p-8 flex flex-col gap-6">
            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-4 md:px-6 py-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
                <span className="text-xs text-zinc-500 font-medium">Search and filter staff</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search by name or role..."
                    className="px-3 py-1.5 text-xs border border-zinc-200 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button type="button" className="px-3 py-1.5 text-xs font-medium bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200 whitespace-nowrap">
                    Filter
                  </button>
                </div>
              </div>
              <div className="divide-y divide-zinc-100">
                {DEMO_STAFF_LIST.map((person) => (
                  <div
                    key={person.id}
                    className="px-4 md:px-6 py-3 md:py-4 flex items-center gap-3 md:gap-4 hover:bg-zinc-50/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-700 text-sm font-medium shrink-0">
                      {person.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-900">{person.name}</p>
                      <p className="text-xs text-zinc-500">{person.role} · {person.department}</p>
                    </div>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        person.status === "On shift"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : person.status === "On call"
                            ? "bg-blue-50 text-blue-700 border border-blue-100"
                            : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {person.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentView === "departmental" && (
          <div className="p-4 md:p-8 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {DEMO_DEPARTMENTS.map((dept) => (
                <div
                  key={dept.id}
                  className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-sm font-semibold text-zinc-900">{dept.name}</h3>
                    <span className="text-[10px] font-medium text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded">
                      {dept.beds} beds
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mb-2">Lead: {dept.lead}</p>
                  <div className="flex items-center gap-2 text-xs">
                    <iconify-icon icon="solar:users-group-rounded-linear" style={{ fontSize: "1rem" }} className="text-zinc-400" />
                    <span className="text-zinc-600 font-medium mono">{dept.staffCount}</span>
                    <span className="text-zinc-400">staff on roster</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-zinc-900 mb-4">Unit occupancy (demo)</h3>
              <div className="space-y-3">
                {DEMO_DEPARTMENTS.map((dept) => (
                  <div key={dept.id} className="flex items-center gap-4">
                    <span className="text-xs text-zinc-600 w-28">{dept.name}</span>
                    <div className="flex-1 h-2 bg-zinc-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${dept.occupancy}%` }}
                      />
                    </div>
                    <span className="text-[10px] mono text-zinc-400 w-8">{dept.occupancy}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentView === "analytics" && (
          <div className="p-4 md:p-8 flex flex-col gap-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white border border-zinc-200 p-5 rounded-xl shadow-sm">
                <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider mb-1">Shift coverage</p>
                <p className="text-2xl font-semibold text-zinc-900 mono">94%</p>
                <p className="text-xs text-emerald-600 mt-1">+2% vs last week</p>
              </div>
              <div className="bg-white border border-zinc-200 p-5 rounded-xl shadow-sm">
                <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider mb-1">Avg. response time</p>
                <p className="text-2xl font-semibold text-zinc-900 mono">4.2m</p>
                <p className="text-xs text-zinc-500 mt-1">Target &lt;5m</p>
              </div>
              <div className="bg-white border border-zinc-200 p-5 rounded-xl shadow-sm">
                <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider mb-1">Swap requests</p>
                <p className="text-2xl font-semibold text-zinc-900 mono">12</p>
                <p className="text-xs text-amber-600 mt-1">3 pending approval</p>
              </div>
              <div className="bg-white border border-zinc-200 p-5 rounded-xl shadow-sm">
                <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider mb-1">Overtime hours</p>
                <p className="text-2xl font-semibold text-zinc-900 mono">48h</p>
                <p className="text-xs text-zinc-500 mt-1">This month</p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <div className="bg-white border border-zinc-200 rounded-xl p-4 md:p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-zinc-900 mb-4">Coverage by day (Oct)</h3>
                <div className="flex items-end justify-between h-40 gap-1">
                  {[72, 85, 78, 90, 88, 82, 94].map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full bg-zinc-100 rounded-t-sm flex-1 flex flex-col justify-end">
                        <div className="bg-blue-500 rounded-t-sm" style={{ height: `${val}%` }} />
                      </div>
                      <span className="text-[10px] text-zinc-400">{`D${i + 1}`}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-zinc-900 mb-4">Alerts this week</h3>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-xs">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-zinc-600">Neurology gap detected (resolved)</span>
                  </li>
                  <li className="flex items-center gap-3 text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-zinc-600">Roster published for Nov</span>
                  </li>
                  <li className="flex items-center gap-3 text-xs">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-zinc-600">2 swap requests approved</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {currentView === "settings" && (
          <div className="p-4 md:p-8 max-w-xl">
            <div className="bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
                <h3 className="text-sm font-semibold text-zinc-900">Preferences</h3>
              </div>
              <div className="divide-y divide-zinc-100">
                <div className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">Email notifications</p>
                    <p className="text-xs text-zinc-500">Shift changes and alerts</p>
                  </div>
                  <button type="button" className="w-10 h-6 rounded-full bg-blue-600 relative transition-colors">
                    <span className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full" />
                  </button>
                </div>
                <div className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">Push notifications</p>
                    <p className="text-xs text-zinc-500">Critical coverage alerts</p>
                  </div>
                  <button type="button" className="w-10 h-6 rounded-full bg-zinc-200 relative transition-colors">
                    <span className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full" />
                  </button>
                </div>
                <div className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">Default view</p>
                    <p className="text-xs text-zinc-500">Calendar opening view</p>
                  </div>
                  <span className="text-xs text-zinc-500 bg-zinc-100 px-2 py-1 rounded">Month</span>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50/30">
                <button type="button" className="text-xs font-medium text-blue-600 hover:text-blue-700">
                  Save changes
                </button>
              </div>
            </div>
            <div className="mt-6 bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-zinc-900 mb-2">About MDOS</h3>
              <p className="text-xs text-zinc-500">Medical shift operations dashboard · Demo build</p>
              <p className="text-[10px] text-zinc-400 mt-1">Version 1.0.0</p>
            </div>
          </div>
        )}
      </main>
      </div>
      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-zinc-200 flex justify-around items-center py-2 px-2">
        {(["schedule", "staff", "departmental", "analytics", "settings"] as ViewId[]).map((id) => {
          const icons: Record<ViewId, string> = {
            schedule: "solar:calendar-minimalistic-linear",
            staff: "solar:users-group-rounded-linear",
            departmental: "solar:case-linear",
            analytics: "solar:chart-square-linear",
            settings: "solar:settings-linear",
          };
          const labels: Record<ViewId, string> = {
            schedule: "Schedule",
            staff: "Staff",
            departmental: "Depts",
            analytics: "Analytics",
            settings: "Settings",
          };
          return (
            <button
              key={id}
              type="button"
              onClick={() => setCurrentView(id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-0 ${
                currentView === id
                  ? "text-blue-600 bg-blue-50"
                  : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              <iconify-icon icon={icons[id]} style={{ fontSize: "1.2rem" }} />
              <span className="text-[0.55rem] font-medium leading-none">{labels[id]}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
