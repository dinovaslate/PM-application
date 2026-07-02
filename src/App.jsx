import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  CircleGauge,
  Download,
  FileSpreadsheet,
  Filter,
  LineChart as LineChartIcon,
  Search,
  Settings2,
  Upload,
  Users,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  MONTHS,
  buildDashboard,
  defaultRules,
  formatCurrency,
  formatPercent,
  parseWorkbooks,
  sampleProjects,
} from "./lib/dashboardData";

const HEALTH_COLORS = {
  Healthy: "#22c55e",
  Warning: "#f59e0b",
  "Need Improvement": "#ef4444",
};

const HEALTH_STACK_KEYS = ["Healthy", "Warning", "Need Improvement"];
const HEALTH_SHORT_LABELS = {
  Healthy: "Healthy",
  Warning: "Warning",
  "Need Improvement": "Need Impr.",
};

const DUE_COLORS = {
  "On Track": "#0f172a",
  "At Risk": "#f59e0b",
  Overdue: "#ef4444",
};

const SCHEDULE_COLORS = {
  "On Time": "#0f172a",
  Leading: "#64748b",
  "Potential Delay": "#f59e0b",
  Delay: "#ef4444",
};

const ISSUE_COLORS = ["#ef4444", "#f59e0b", "#2563eb", "#64748b"];

const PRIORITY_STYLES = {
  Critical: "bg-red-50 text-red-700 border-red-100",
  High: "bg-amber-50 text-amber-700 border-amber-100",
  Medium: "bg-blue-50 text-blue-700 border-blue-100",
  Normal: "bg-slate-100 text-slate-600 border-slate-200",
};

const tabs = [
  {
    id: "overview",
    label: "Executive Overview",
    mobileLabel: "Overview",
    shortLabel: "Ringkasan Eksekutif",
    icon: CircleGauge,
    title: "Ringkasan Eksekutif",
    subtitle: "Kesehatan portfolio dan metrik utama secara singkat.",
  },
  {
    id: "health",
    label: "Project Health",
    mobileLabel: "Health",
    shortLabel: "Kesehatan Proyek",
    icon: BarChart3,
    title: "Project Health Analysis",
    subtitle: "Cross-portfolio assessment of schedule, resource, and issue risk.",
  },
  {
    id: "capacity",
    label: "PM Capacity",
    mobileLabel: "Capacity",
    shortLabel: "Kapasitas PM",
    icon: Users,
    title: "PM Capacity & Workload",
    subtitle: "Resource utilization and risk assessment across the portfolio.",
  },
  {
    id: "priority",
    label: "Action List",
    mobileLabel: "Action",
    shortLabel: "Daftar Tindakan",
    icon: AlertTriangle,
    title: "Priority Action List",
    subtitle: "Cross-portfolio items requiring immediate intervention.",
  },
];

const CUSTOMIZATION_STORAGE_KEY = "pmo-dashboard-customization-v1";

const CUSTOMIZATION_GROUPS = [
  {
    id: "overview",
    title: "Executive Overview",
    options: [
      { id: "overview.kpi.total", label: "KPI Total Proyek" },
      { id: "overview.kpi.healthy", label: "KPI Proyek Sehat" },
      { id: "overview.kpi.warning", label: "KPI Peringatan" },
      { id: "overview.kpi.needImprovement", label: "KPI Kritis" },
      { id: "overview.kpi.overdue", label: "KPI Terlambat" },
      { id: "overview.kpi.valueAtRisk", label: "KPI Value at Risk" },
      { id: "overview.section.insights", label: "Smart Insights Lokal" },
      { id: "overview.section.healthByBu", label: "Distribusi Health per BU" },
      { id: "overview.section.workloadTrend", label: "Tren Beban Kerja PM" },
      { id: "overview.section.priorityProjects", label: "Proyek Prioritas Tinggi" },
    ],
  },
  {
    id: "health",
    title: "Project Health",
    options: [
      { id: "health.section.schedule", label: "Schedule Performance" },
      { id: "health.section.issues", label: "Active Issues by Type" },
      { id: "health.section.conditions", label: "Resource, Cost, dan Health Summary" },
      { id: "health.section.healthByBu", label: "Health Berdasarkan BU" },
      { id: "health.section.highValue", label: "High-Value Projects at Risk" },
      { id: "health.section.detail", label: "Detail IWO, Proyek, Customer, dan PM" },
    ],
  },
  {
    id: "capacity",
    title: "PM Capacity",
    options: [
      { id: "capacity.kpi.totalPm", label: "KPI Total PM Active" },
      { id: "capacity.kpi.averageLoad", label: "KPI Average Workload" },
      { id: "capacity.kpi.overloaded", label: "KPI Overloaded PM" },
      { id: "capacity.kpi.highRisk", label: "KPI High-Risk Projects" },
      { id: "capacity.section.workloadForecast", label: "Workload Forecast" },
      { id: "capacity.section.pmPortfolio", label: "Project Load, Count, dan Cost per PM" },
      { id: "capacity.section.costTrend", label: "Cost Exposure Trend" },
      { id: "capacity.section.pmStatus", label: "PM Status" },
      { id: "capacity.section.rules", label: "Rules Configuration" },
      { id: "capacity.section.topProjectCount", label: "Top PM by Project Count" },
      { id: "capacity.section.workloadByBu", label: "Workload Berdasarkan BU" },
      { id: "capacity.section.riskyPm", label: "PM dengan Proyek Risky" },
    ],
  },
  {
    id: "priority",
    title: "Priority Action List",
    options: [
      { id: "priority.section.filters", label: "Filter dan Export" },
      { id: "priority.section.actionItems", label: "Actionable Items" },
      { id: "priority.section.rules", label: "Rules Configuration" },
    ],
  },
];

const DEFAULT_CUSTOMIZATION = buildDefaultCustomization();

export default function App() {
  const [projects, setProjects] = useState([]);
  const [rules, setRules] = useState(defaultRules);
  const [activeTab, setActiveTab] = useState("overview");
  const [sourceName, setSourceName] = useState("Belum ada data");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [customization, setCustomization] = useState(loadDashboardCustomization);
  const [filters, setFilters] = useState({
    priority: "All",
    bu: "All",
    pm: "All",
    health: "All",
  });

  const dashboard = useMemo(() => buildDashboard(projects, rules), [projects, rules]);
  const isWidgetVisible = useMemo(
    () => (widgetId) => customization[widgetId] !== false,
    [customization],
  );
  const filterOptions = useMemo(() => getFilterOptions(dashboard.projects), [dashboard.projects]);
  const filteredProjects = useMemo(
    () =>
      dashboard.projects.filter((project) => {
        return (
          (filters.priority === "All" || project.priority === filters.priority) &&
          (filters.bu === "All" || project.bu === filters.bu) &&
          (filters.pm === "All" || project.pm === filters.pm) &&
          (filters.health === "All" || project.health === filters.health)
        );
      }),
    [dashboard.projects, filters],
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(CUSTOMIZATION_STORAGE_KEY, JSON.stringify(customization));
  }, [customization]);

  async function handleFileChange(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    setIsLoading(true);
    setError("");

    try {
      const parsed = await parseWorkbooks(files);
      if (!parsed.length) throw new Error("File tidak memiliki baris data yang bisa dibaca.");
      setProjects(parsed);
      setSourceName(formatSourceName(files));
      setFilters({ priority: "All", bu: "All", pm: "All", health: "All" });
    } catch (err) {
      setError(err.message || "Gagal membaca file Excel.");
    } finally {
      setIsLoading(false);
      event.target.value = "";
    }
  }

  function handleCustomizationToggle(widgetId, isVisible) {
    setCustomization((current) => ({
      ...current,
      [widgetId]: isVisible,
    }));
  }

  function handleCustomizationReset(tabId = activeTab) {
    const group = CUSTOMIZATION_GROUPS.find((item) => item.id === tabId);
    if (!group) return;
    setCustomization((current) => {
      const next = { ...current };
      group.options.forEach((option) => {
        next[option.id] = true;
      });
      return next;
    });
  }

  const ActiveView =
    activeTab === "health"
      ? ProjectHealthAnalysis
      : activeTab === "capacity"
        ? PmCapacity
        : activeTab === "priority"
          ? PriorityActionList
          : ExecutiveOverview;
  const activeMeta = tabs.find((tab) => tab.id === activeTab) || tabs[0];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-950 lg:flex">
      <Sidebar
        activeTab={activeTab}
        isLoading={isLoading}
        onFileChange={handleFileChange}
        onOpenCustomize={() => setIsCustomizeOpen(true)}
        onResetSample={() => {
          setProjects(sampleProjects);
          setSourceName("Sample portfolio");
          setError("");
          setFilters({ priority: "All", bu: "All", pm: "All", health: "All" });
        }}
        setActiveTab={setActiveTab}
      />

      <div className="min-w-0 flex-1 lg:pl-64">
        <TopBar
          sourceName={sourceName}
          isLoading={isLoading}
          onFileChange={handleFileChange}
          onOpenCustomize={() => setIsCustomizeOpen(true)}
        />

        <main className="mx-auto max-w-[1440px] overflow-hidden px-4 py-5 sm:px-6 lg:px-8">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-[28px] font-bold leading-9 tracking-normal text-slate-950 md:text-4xl md:leading-[44px]">
                {activeMeta.title}
              </h1>
              <p className="mt-1 text-sm text-slate-500">{activeMeta.subtitle}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex min-w-0 items-center gap-2 text-xs font-semibold uppercase tracking-[0.05em] text-slate-500">
                <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
                <span className="max-w-[220px] truncate sm:max-w-xs">{sourceName}</span>
              </div>
              {projects.length ? (
                <button
                  type="button"
                  onClick={() => setIsCustomizeOpen(true)}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <Settings2 size={14} />
                  Customize
                </button>
              ) : null}
            </div>
          </div>

          {error ? (
            <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          ) : null}

          {projects.length ? (
            <ActiveView
              dashboard={dashboard}
              rules={rules}
              setRules={setRules}
              filters={filters}
              setFilters={setFilters}
              filterOptions={filterOptions}
              filteredProjects={filteredProjects}
              isWidgetVisible={isWidgetVisible}
              onOpenCustomize={() => setIsCustomizeOpen(true)}
              sourceName={sourceName}
            />
          ) : (
            <EmptyDashboard isLoading={isLoading} onFileChange={handleFileChange} />
          )}
        </main>
      </div>

      <CustomizationPanel
        activeTab={activeTab}
        customization={customization}
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        onReset={handleCustomizationReset}
        onToggle={handleCustomizationToggle}
      />
    </div>
  );
}

function Sidebar({ activeTab, setActiveTab, isLoading, onFileChange, onOpenCustomize, onResetSample }) {
  return (
    <aside className="w-full max-w-full border-slate-200 bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:flex lg:w-64 lg:flex-col lg:border-r">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 lg:h-16">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-white">
            <BriefcaseBusiness size={18} />
          </div>
          <div>
            <p className="text-sm font-bold leading-4 text-slate-950">PPM Command</p>
            <p className="text-[11px] leading-4 text-slate-500">Portfolio Intelligence</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 border-b border-slate-200 px-4 py-3 lg:flex lg:flex-col lg:border-b-0">
        <label className="inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-xs font-bold text-white transition hover:bg-slate-800 lg:w-full">
          <Upload size={14} />
          {isLoading ? "Reading..." : "Upload Excel"}
          <input type="file" accept=".xlsx" multiple className="sr-only" onChange={onFileChange} disabled={isLoading} />
        </label>
        <button
          type="button"
          onClick={onResetSample}
          className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 transition hover:bg-slate-50 lg:w-full"
        >
          <FileSpreadsheet size={14} />
          Sample
        </button>
      </div>

      <nav className="grid grid-cols-2 gap-1 px-3 py-3 lg:flex lg:flex-1 lg:flex-col">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex h-10 min-w-0 items-center gap-3 rounded-lg px-3 text-sm font-medium transition ${
                active ? "bg-slate-100 text-slate-950" : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"
              }`}
            >
              <Icon size={16} strokeWidth={1.8} />
              <span className="min-w-0 truncate lg:hidden">{tab.mobileLabel}</span>
              <span className="hidden min-w-0 truncate lg:inline xl:hidden">{tab.shortLabel}</span>
              <span className="hidden min-w-0 truncate xl:inline">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="hidden border-t border-slate-200 px-4 py-4 lg:block">
        <button
          type="button"
          onClick={onOpenCustomize}
          className="mb-2 flex h-9 w-full items-center gap-3 rounded-lg px-2 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-950"
        >
          <Settings2 size={15} />
          Customize
        </button>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
            JD
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Jane Director</p>
            <p className="text-[11px] text-slate-500">Regional PMO</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function TopBar({ sourceName, isLoading, onFileChange, onOpenCustomize }) {
  return (
    <header className="sticky top-0 z-20 hidden h-16 border-b border-slate-200 bg-white/95 px-8 backdrop-blur lg:flex lg:items-center lg:justify-between">
      <p className="text-base font-bold text-slate-950">PPM Intelligence</p>
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            className="h-9 w-72 rounded-full border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700"
            placeholder="Search PMs, projects..."
            readOnly
          />
        </div>
        <span className="max-w-48 truncate rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
          {sourceName}
        </span>
        <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-xs font-bold text-white transition hover:bg-slate-800">
          <Upload size={14} />
          {isLoading ? "Reading..." : "Upload Excel"}
          <input type="file" accept=".xlsx" multiple className="sr-only" onChange={onFileChange} disabled={isLoading} />
        </label>
        <button
          type="button"
          onClick={onOpenCustomize}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
          aria-label="Customize dashboard"
        >
          <Settings2 size={15} />
        </button>
      </div>
    </header>
  );
}

function EmptyDashboard({ isLoading, onFileChange }) {
  return (
    <section className="flex min-h-[520px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-[0_4px_6px_-1px_rgb(15_23_42_/_0.05),0_2px_4px_-2px_rgb(15_23_42_/_0.05)]">
      <div className="max-w-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
          <FileSpreadsheet size={26} strokeWidth={1.8} />
        </div>
        <h2 className="mt-5 text-2xl font-bold text-slate-950">Upload data portfolio untuk mulai</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          Dashboard tidak menampilkan data contoh secara otomatis supaya angka tidak tertukar dengan data asli.
        </p>
        <label className="mx-auto mt-6 inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-md bg-slate-950 px-5 text-sm font-bold text-white transition hover:bg-slate-800">
          <Upload size={16} />
          {isLoading ? "Reading..." : "Upload Excel"}
          <input type="file" accept=".xlsx" multiple className="sr-only" onChange={onFileChange} disabled={isLoading} />
        </label>
        <div className="mt-6 rounded-xl bg-slate-50 p-4 text-left text-xs leading-5 text-slate-600">
          <p className="font-bold text-slate-800">Kolom minimal yang disarankan:</p>
          <p className="mt-1">
            PM, Project atau IWO, BU, Health, Due Status, Schedule, Cost/Value, Start Date, dan workload bulanan Jan-Des.
          </p>
        </div>
      </div>
    </section>
  );
}

function CustomizationPanel({ activeTab, customization, isOpen, onClose, onReset, onToggle }) {
  if (!isOpen) return null;

  const activeGroup = CUSTOMIZATION_GROUPS.find((group) => group.id === activeTab);
  const groups = [
    ...(activeGroup ? [activeGroup] : []),
    ...CUSTOMIZATION_GROUPS.filter((group) => group.id !== activeTab),
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button type="button" className="absolute inset-0 bg-slate-950/30" aria-label="Close customize panel" onClick={onClose} />
      <aside className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-base font-bold text-slate-950">Customize Dashboard</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">Pilih KPI dan section yang mau ditampilkan. Setting tersimpan otomatis.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <div className="space-y-5">
            {groups.map((group) => {
              const visibleCount = group.options.filter((option) => customization[option.id] !== false).length;
              return (
                <section key={group.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-950">{group.title}</p>
                      <p className="text-xs text-slate-500">{visibleCount} dari {group.options.length} aktif</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onReset(group.id)}
                      className="h-8 rounded-md border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700"
                    >
                      Reset
                    </button>
                  </div>
                  <div className="space-y-2">
                    {group.options.map((option) => {
                      const checked = customization[option.id] !== false;
                      return (
                        <label key={option.id} className="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-white px-3 py-2 text-sm shadow-sm">
                          <span className="min-w-0 font-semibold text-slate-700">{option.label}</span>
                          <input
                            type="checkbox"
                            className="h-4 w-4 shrink-0 accent-slate-950"
                            checked={checked}
                            onChange={(event) => onToggle(option.id, event.target.checked)}
                          />
                        </label>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        <div className="border-t border-slate-200 px-5 py-4">
          <button type="button" onClick={onClose} className="h-10 w-full rounded-md bg-slate-950 px-4 text-sm font-bold text-white">
            Done
          </button>
        </div>
      </aside>
    </div>
  );
}

function NoVisibleWidgets({ onOpenCustomize }) {
  return (
    <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center shadow-[0_4px_6px_-1px_rgb(15_23_42_/_0.05),0_2px_4px_-2px_rgb(15_23_42_/_0.05)]">
      <p className="text-sm font-bold text-slate-950">Semua widget di halaman ini sedang disembunyikan.</p>
      <button
        type="button"
        onClick={onOpenCustomize}
        className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-xs font-bold text-white"
      >
        <Settings2 size={14} />
        Customize
      </button>
    </section>
  );
}

function SmartInsights({ dashboard, sourceName }) {
  const insights = useMemo(() => buildSmartInsights(dashboard), [dashboard]);
  const [aiBrief, setAiBrief] = useState(null);
  const [aiStatus, setAiStatus] = useState("idle");
  const [aiError, setAiError] = useState("");
  const aiEndpoint = getAiInsightsEndpoint();

  useEffect(() => {
    setAiBrief(null);
    setAiStatus("idle");
    setAiError("");
  }, [dashboard.kpis.totalProjects, sourceName]);

  async function handleGenerateAiBrief() {
    if (!aiEndpoint) {
      setAiError("AI proxy belum aktif di deployment ini.");
      setAiStatus("error");
      return;
    }

    setAiStatus("loading");
    setAiError("");

    try {
      const response = await fetch(aiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          snapshot: buildAiBriefPayload(dashboard, sourceName),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Gagal generate AI brief.");
      setAiBrief(data.brief);
      setAiStatus("ready");
    } catch (error) {
      setAiError(error.message || "Gagal generate AI brief.");
      setAiStatus("error");
    }
  }

  return (
    <Panel title="Smart Insights" action="Local">
      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-800">{aiBrief ? "AI Brief aktif" : "Insight lokal aktif"}</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {aiEndpoint ? "Klik generate untuk ringkasan LLM dari snapshot dashboard." : "Deploy ke Netlify dan set OPENAI_API_KEY untuk mengaktifkan AI Brief."}
          </p>
        </div>
        <button
          type="button"
          onClick={handleGenerateAiBrief}
          disabled={aiStatus === "loading" || !aiEndpoint}
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-md bg-slate-950 px-3 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {!aiEndpoint ? "AI Proxy Off" : aiStatus === "loading" ? "Generating..." : "Generate AI Brief"}
        </button>
      </div>

      {aiBrief ? <AiBriefCard brief={aiBrief} /> : null}
      {aiError ? (
        <div className="mb-4 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
          {aiError}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {insights.map((insight) => (
          <div key={insight.title} className={`rounded-xl border px-4 py-3 ${insight.tone}`}>
            <p className="text-[10px] font-bold uppercase tracking-[0.05em] opacity-75">{insight.label}</p>
            <p className="mt-2 text-lg font-bold">{insight.title}</p>
            <p className="mt-1 text-xs leading-5 opacity-80">{insight.detail}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function AiBriefCard({ brief }) {
  return (
    <div className="mb-4 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-slate-950">AI Brief</p>
        <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] font-bold uppercase text-blue-700">LLM</span>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-700">{brief.summary}</p>
      {brief.actions?.length ? (
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {brief.actions.map((action, index) => (
            <div key={`${action.title}-${index}`} className="rounded-lg bg-slate-50 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-slate-500">{action.priority}</p>
              <p className="mt-1 text-sm font-bold text-slate-950">{action.title}</p>
              <p className="mt-1 text-xs leading-5 text-slate-600">{action.detail}</p>
            </div>
          ))}
        </div>
      ) : null}
      {brief.questions?.length ? (
        <div className="mt-3 rounded-lg border border-slate-100 px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-slate-500">Questions</p>
          <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-600">
            {brief.questions.map((question, index) => (
              <li key={`${question}-${index}`}>{question}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function ExecutiveOverview({ dashboard, isWidgetVisible, onOpenCustomize, sourceName }) {
  const { kpis, charts, priorityProjects } = dashboard;
  const months = dashboard.months || MONTHS;
  const workloadMode = dashboard.dataQuality?.workloadMode || "live";
  const workloadLabels = getWorkloadMetricLabels(workloadMode);
  const workloadTrendData = toPortfolioWorkloadSeries(charts.pmWorkloadTrend, months, workloadLabels);
  const isProxyWorkload = workloadMode === "proxy";
  const kpiCards = [
    { id: "overview.kpi.total", title: "Total", value: kpis.totalProjects, icon: BriefcaseBusiness, tone: "slate" },
    { id: "overview.kpi.healthy", title: "Sehat", value: kpis.healthy, icon: CheckCircle2, tone: "green" },
    { id: "overview.kpi.warning", title: "Peringatan", value: kpis.warning, icon: AlertTriangle, tone: "amber" },
    { id: "overview.kpi.needImprovement", title: "Kritis", value: kpis.needImprovement, icon: AlertTriangle, tone: "red" },
    { id: "overview.kpi.overdue", title: "Terlambat", value: kpis.overdue, icon: CalendarClock, tone: "red" },
    { id: "overview.kpi.valueAtRisk", title: "Value at Risk", value: formatCurrency(kpis.valueAtRisk), icon: LineChartIcon, tone: "slate" },
  ].filter((card) => isWidgetVisible(card.id));
  const showInsights = isWidgetVisible("overview.section.insights");
  const showHealthByBu = isWidgetVisible("overview.section.healthByBu");
  const showWorkloadTrend = isWidgetVisible("overview.section.workloadTrend");
  const showPriorityProjects = isWidgetVisible("overview.section.priorityProjects");
  const hasVisibleWidgets = kpiCards.length || showInsights || showHealthByBu || showWorkloadTrend || showPriorityProjects;

  return (
    <div className="min-w-0 space-y-6">
      {kpiCards.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          {kpiCards.map((card) => (
            <KpiCard key={card.id} title={card.title} value={card.value} icon={card.icon} tone={card.tone} />
          ))}
        </div>
      ) : null}

      {showInsights ? <SmartInsights dashboard={dashboard} sourceName={sourceName} /> : null}

      {showHealthByBu || showWorkloadTrend ? (
        <div className={`grid gap-5 ${showHealthByBu && showWorkloadTrend ? "lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]" : ""}`}>
          {showHealthByBu ? (
            <Panel title="Distribusi Project Berdasarkan Unit Bisnis" action="Health">
              <HealthByBuVisualization data={charts.healthByBu} />
            </Panel>
          ) : null}

          {showWorkloadTrend ? (
            <Panel title={isProxyWorkload ? "Tren Active Project PM sampai Desember" : "Tren Beban Kerja PM sampai Desember"} action={getWorkloadAction(workloadMode)}>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={workloadTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} />
                  <YAxis tickFormatter={(value) => formatWorkloadAxis(value, workloadMode)} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip workloadMode={workloadMode} />} />
                  <Line type="monotone" dataKey={workloadLabels.average} stroke="#2563eb" strokeWidth={2.6} dot={false} />
                  <Line type="monotone" dataKey={workloadLabels.peak} stroke="#ef4444" strokeWidth={2.6} dot={false} />
                </LineChart>
              </ResponsiveContainer>
              {workloadMode !== "live" ? (
                <p className="mt-2 text-xs text-slate-500">
                  {getWorkloadMessage(workloadMode)}
                </p>
              ) : null}
            </Panel>
          ) : null}
        </div>
      ) : null}

      {showPriorityProjects ? (
        <Panel title="Status Proyek Prioritas Tinggi" action="Lihat Semua">
          <ProjectTable projects={priorityProjects} compact workloadMode={workloadMode} />
        </Panel>
      ) : null}

      {!hasVisibleWidgets ? <NoVisibleWidgets onOpenCustomize={onOpenCustomize} /> : null}
    </div>
  );
}

function ProjectHealthAnalysis({ dashboard, isWidgetVisible, onOpenCustomize }) {
  const { charts, troubledHighValueProjects, projects } = dashboard;
  const scheduleTotal = charts.scheduleDistribution.reduce((sum, item) => sum + item.value, 0);
  const scheduleMap = Object.fromEntries(charts.scheduleDistribution.map((item) => [item.name, item.value]));
  const scheduleRows = ["Delay", "Potential Delay", "On Time", "Leading"].map((name) => ({
    name,
    value: scheduleMap[name] || 0,
    color: SCHEDULE_COLORS[name],
  }));
  const issueTotal = charts.issueByType.reduce((sum, item) => sum + item.value, 0);
  const maxIssueCount = Math.max(...charts.issueByType.map((issue) => issue.value), 1);
  const hasScheduleData = (dashboard.dataQuality?.scheduleInputCount || 0) > 0;
  const hasIssueData = (dashboard.dataQuality?.issueInputCount || 0) > 0;
  const showSchedule = isWidgetVisible("health.section.schedule");
  const showIssues = isWidgetVisible("health.section.issues");
  const showConditions = isWidgetVisible("health.section.conditions");
  const showHealthByBu = isWidgetVisible("health.section.healthByBu");
  const showHighValue = isWidgetVisible("health.section.highValue");
  const showDetail = isWidgetVisible("health.section.detail");
  const hasVisibleWidgets = showSchedule || showIssues || showConditions || showHealthByBu || showHighValue || showDetail;

  return (
    <div className="min-w-0 space-y-6">
      {showSchedule || showIssues ? (
        <div className={`grid gap-5 ${showSchedule && showIssues ? "xl:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]" : ""}`}>
          {showSchedule ? (
            <Panel title="Schedule Performance" action={hasScheduleData ? `${scheduleTotal} records` : "No schedule data"}>
              {hasScheduleData ? (
                <ScheduleBreakdown rows={scheduleRows} total={scheduleTotal} />
              ) : (
                <MissingDataState
                  compact
                  title="Schedule data belum tersedia"
                  description="Kolom schedule tidak ditemukan atau kosong, jadi dashboard tidak akan menebak semua proyek On Time."
                />
              )}
            </Panel>
          ) : null}

          {showIssues ? (
            <Panel title="Active Issues by Type" action={hasIssueData ? `${issueTotal} issues` : "No issue data"}>
              {issueTotal > 0 ? (
                <div className="space-y-4">
                  {charts.issueByType.slice(0, 4).map((item, index) => (
                    <ProgressRow
                      key={item.name}
                      label={item.name}
                      value={item.value}
                      max={maxIssueCount}
                      color={ISSUE_COLORS[index % ISSUE_COLORS.length]}
                    />
                  ))}
                </div>
              ) : (
                <MissingDataState
                  compact
                  title={hasIssueData ? "Tidak ada active issue" : "Issue data belum tersedia"}
                  description={
                    hasIssueData
                      ? "Kolom issue terbaca, dan semua project memiliki open issue 0."
                      : "Tambahkan kolom Open Issue dan Issue Type untuk melihat distribusi masalah."
                  }
                />
              )}
            </Panel>
          ) : null}
        </div>
      ) : null}

      {showConditions ? (
        <div className="grid gap-4 md:grid-cols-3">
          <MiniInsight title="Resource Condition" data={charts.resourceDistribution} />
          <MiniInsight title="Cost Condition" data={charts.costDistribution} />
          <MiniInsight title="Health Distribution" data={charts.healthDistribution} />
        </div>
      ) : null}

      {showHealthByBu ? (
        <Panel title="Health Berdasarkan BU">
          <HealthByBuVisualization data={charts.healthByBu} />
        </Panel>
      ) : null}

      {showHighValue || showDetail ? (
        <div className="grid gap-5">
          {showHighValue ? (
            <Panel title="High-Value Projects at Risk" action="Value">
              <div className="space-y-3">
                {troubledHighValueProjects.map((project) => (
                  <div key={project.id} className="rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-950">{project.project}</p>
                        <p className="mt-1 text-xs text-slate-500">{project.customer}</p>
                      </div>
                      <PriorityBadge priority={project.priority} />
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="font-bold text-slate-950">{formatCurrency(project.value)}</span>
                      <span className="text-slate-500">{project.openIssue} issue</span>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          ) : null}

          {showDetail ? (
            <Panel title="Detail per IWO, Proyek, Customer, dan PM">
              <ProjectTable projects={projects} compact workloadMode={dashboard.dataQuality?.workloadMode || "live"} />
            </Panel>
          ) : null}
        </div>
      ) : null}

      {!hasVisibleWidgets ? <NoVisibleWidgets onOpenCustomize={onOpenCustomize} /> : null}
    </div>
  );
}

function PmCapacity({ dashboard, rules, setRules, isWidgetVisible, onOpenCustomize }) {
  const { charts, pmRiskList } = dashboard;
  const months = dashboard.months || MONTHS;
  const workloadMode = dashboard.dataQuality?.workloadMode || "live";
  const isProxyWorkload = workloadMode === "proxy";
  const [selectedCostPm, setSelectedCostPm] = useState("TOTAL");
  const costTrendData = toSelectedCostSeries(charts.pmCostTrend, months, selectedCostPm);
  const projectCountMap = new Map(charts.projectCountByPm.map((item) => [item.name, item.value]));
  const hasCostData = (dashboard.dataQuality?.costInputCount || 0) > 0 || charts.pmPortfolioSummary.some((pm) => pm.costExposure > 0);
  const topPmProjectCounts = charts.projectCountByPm.slice(0, 10);
  const topRiskyPms = pmRiskList.slice(0, 6);
  const topCriticalPms = charts.pmWorkloadTrend
    .map((pm) => ({ ...pm, peak: Math.max(...months.map((month) => pm[month.key] || 0)) }))
    .sort((a, b) => b.peak - a.peak)
    .slice(0, 4);
  const averageWorkload =
    charts.pmWorkloadTrend.reduce((sum, pm) => sum + averageMonthlyValue(pm, months), 0) /
    Math.max(charts.pmWorkloadTrend.length, 1);
  const kpiCards = [
    { id: "capacity.kpi.totalPm", title: "Total PM Active", value: charts.pmWorkloadTrend.length, icon: Users, tone: "slate" },
    {
      id: "capacity.kpi.averageLoad",
      title: isProxyWorkload ? "Avg Active Projects" : "Average Workload",
      value: formatWorkloadValue(averageWorkload, workloadMode, { decimals: 1 }),
      icon: Activity,
      tone: "red",
    },
    {
      id: "capacity.kpi.overloaded",
      title: isProxyWorkload ? "PM > 1 Active Project" : "Overloaded PM",
      value: dashboard.kpis.overloadedPms,
      icon: AlertTriangle,
      tone: "red",
    },
    { id: "capacity.kpi.highRisk", title: "High-Risk Projects", value: dashboard.kpis.openIssueProjects, icon: CalendarClock, tone: "amber" },
  ].filter((card) => isWidgetVisible(card.id));
  const showWorkloadForecast = isWidgetVisible("capacity.section.workloadForecast");
  const showPmPortfolio = isWidgetVisible("capacity.section.pmPortfolio");
  const showCostTrend = isWidgetVisible("capacity.section.costTrend");
  const showPmStatus = isWidgetVisible("capacity.section.pmStatus");
  const showRules = isWidgetVisible("capacity.section.rules");
  const showTopProjectCount = isWidgetVisible("capacity.section.topProjectCount");
  const showWorkloadByBu = isWidgetVisible("capacity.section.workloadByBu");
  const showRiskyPm = isWidgetVisible("capacity.section.riskyPm");
  const showLowerLeft = showCostTrend || showPmStatus || showRules;
  const showLowerRight = showTopProjectCount || showWorkloadByBu || showRiskyPm;
  const hasVisibleWidgets = kpiCards.length || showWorkloadForecast || showPmPortfolio || showLowerLeft || showLowerRight;

  return (
    <div className="min-w-0 space-y-6">
      {kpiCards.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {kpiCards.map((card) => (
            <KpiCard key={card.id} title={card.title} value={card.value} icon={card.icon} tone={card.tone} />
          ))}
        </div>
      ) : null}

      {showWorkloadForecast ? (
        <Panel title={isProxyWorkload ? "Active Project Forecast sampai Desember" : "Workload Forecast sampai Desember"} action={getWorkloadAction(workloadMode)}>
          <CriticalLoadStrip rows={topCriticalPms} workloadMode={workloadMode} />
          <WorkloadHeatmap rows={charts.pmWorkloadTrend} rules={rules} projectCountMap={projectCountMap} months={months} workloadMode={workloadMode} />
          {workloadMode !== "live" ? (
            <p className="mt-3 text-xs text-slate-500">
              {getWorkloadMessage(workloadMode)}
            </p>
          ) : null}
        </Panel>
      ) : null}

      {showPmPortfolio ? (
        <Panel title="Project Load, Count, dan Cost per PM" action={isProxyWorkload ? "Active Projects" : "Primary"}>
          <PmPortfolioTable rows={charts.pmPortfolioSummary} workloadRows={charts.pmWorkloadTrend} months={months} workloadMode={workloadMode} />
        </Panel>
      ) : null}

      {showLowerLeft || showLowerRight ? (
        <div className={`grid min-w-0 items-start gap-5 overflow-hidden ${showLowerLeft && showLowerRight ? "xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]" : ""}`}>
          {showLowerLeft ? (
            <div className="space-y-5">
              {showCostTrend ? (
                <Panel title="Cost Exposure Trend sampai Desember" action={hasCostData ? "Rp" : "No Cost Data"}>
                  {hasCostData ? (
                    <>
                      <div className="mb-3 flex min-w-0 justify-end">
                        <select
                          className="h-9 w-full min-w-0 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 sm:w-auto"
                          value={selectedCostPm}
                          onChange={(event) => setSelectedCostPm(event.target.value)}
                        >
                          <option value="TOTAL">Total Portfolio</option>
                          {charts.pmCostTrend.map((pm) => (
                            <option key={pm.pm} value={pm.pm}>
                              {pm.pm}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="min-w-0 overflow-hidden">
                        <ResponsiveContainer width="100%" height={240}>
                          <LineChart data={costTrendData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="name" tickLine={false} axisLine={false} />
                            <YAxis width={76} tickFormatter={(value) => formatCurrency(value).replace("Rp ", "")} tickLine={false} axisLine={false} />
                            <Tooltip content={<ChartTooltip currency />} />
                            <Line type="monotone" dataKey="Cost Exposure" stroke="#0f172a" strokeWidth={2.8} dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </>
                  ) : (
                    <MissingDataState
                      title="Cost data belum tersedia"
                      description="Tambahkan kolom Cost, Project Cost, Budget, Value, atau Cost Jan-Des agar trend cost per PM bisa dihitung."
                    />
                  )}
                </Panel>
              ) : null}

              {showPmStatus ? (
                <Panel title="PM Status">
                  <StatusSummaryCards data={charts.pmStatusDistribution} compact />
                </Panel>
              ) : null}

              {showRules ? (
                <Panel title="Rules Configuration">
                  <RulePanelContent rules={rules} setRules={setRules} />
                </Panel>
              ) : null}
            </div>
          ) : null}

          {showLowerRight ? (
            <div className="space-y-5">
              {showTopProjectCount ? (
                <Panel title="Top PM by Project Count" action="Top 10">
                  <RankedBars data={topPmProjectCounts} valueKey="value" labelKey="name" valueFormatter={(value) => `${value} proyek`} />
                </Panel>
              ) : null}

              {showWorkloadByBu ? (
                <Panel title={isProxyWorkload ? "Active Project Berdasarkan BU" : "Workload Berdasarkan BU"}>
                  <RankedBars
                    data={charts.workloadByBu}
                    valueKey="workload"
                    labelKey="name"
                    valueFormatter={(value) => formatWorkloadValue(value, workloadMode, { decimals: 1 })}
                    maxValue={isProxyWorkload ? undefined : 1}
                  />
                </Panel>
              ) : null}

              {showRiskyPm ? (
                <Panel title="PM dengan Proyek Risky">
                  <div className="space-y-3">
                    {topRiskyPms.map((pm) => (
                      <div key={pm.pm} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-slate-950" title={pm.pm}>{pm.pm}</p>
                          <p className="text-xs text-slate-500">{pm.projects} proyek</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-bold text-red-700">{pm.riskyProjects} risky</p>
                          <p className="text-xs text-slate-500">{pm.overdueProjects} overdue</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Panel>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {!hasVisibleWidgets ? <NoVisibleWidgets onOpenCustomize={onOpenCustomize} /> : null}
    </div>
  );
}

function PriorityActionList({ dashboard, filteredProjects, filters, setFilters, filterOptions, rules, setRules, isWidgetVisible, onOpenCustomize }) {
  const workloadMode = dashboard.dataQuality?.workloadMode || "live";
  const showFilters = isWidgetVisible("priority.section.filters");
  const showActionItems = isWidgetVisible("priority.section.actionItems");
  const showRules = isWidgetVisible("priority.section.rules");
  const hasVisibleWidgets = showFilters || showActionItems || showRules;

  return (
    <div className="min-w-0 space-y-6">
      {showFilters ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_4px_6px_-1px_rgb(15_23_42_/_0.05),0_2px_4px_-2px_rgb(15_23_42_/_0.05)] xl:flex-row xl:items-center xl:justify-between">
          <div className="grid flex-1 gap-3 md:grid-cols-4">
            <FilterSelect
              label="Priority"
              value={filters.priority}
              options={["All", "Critical", "High", "Medium", "Normal"]}
              onChange={(value) => setFilters((current) => ({ ...current, priority: value }))}
            />
            <FilterSelect
              label="BU"
              value={filters.bu}
              options={["All", ...filterOptions.bu]}
              onChange={(value) => setFilters((current) => ({ ...current, bu: value }))}
            />
            <FilterSelect
              label="PM"
              value={filters.pm}
              options={["All", ...filterOptions.pm]}
              onChange={(value) => setFilters((current) => ({ ...current, pm: value }))}
            />
            <FilterSelect
              label="Health"
              value={filters.health}
              options={["All", "Healthy", "Warning", "Need Improvement"]}
              onChange={(value) => setFilters((current) => ({ ...current, health: value }))}
            />
          </div>
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-xs font-bold text-white">
            <Download size={14} />
            Export Data
          </button>
        </div>
      ) : null}

      {showActionItems || showRules ? (
        <div className="grid gap-5">
          {showActionItems ? (
            <Panel title="Actionable Items">
              <ProjectTable projects={filteredProjects} workloadMode={workloadMode} />
            </Panel>
          ) : null}
          {showRules ? <RulePanel rules={rules} setRules={setRules} /> : null}
        </div>
      ) : null}

      {!hasVisibleWidgets ? <NoVisibleWidgets onOpenCustomize={onOpenCustomize} /> : null}
    </div>
  );
}

function RulePanel({ rules, setRules }) {
  return (
    <Panel title="Rules Configuration">
      <RulePanelContent rules={rules} setRules={setRules} />
    </Panel>
  );
}

function RulePanelContent({ rules, setRules }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <RuleInput
        label="Critical workload"
        value={rules.criticalWorkload}
        min={0.8}
        max={2}
        step={0.05}
        onChange={(value) => setRules((current) => ({ ...current, criticalWorkload: value }))}
      />
      <RuleInput
        label="Overloaded PM"
        value={rules.overloadedWorkload}
        min={0.6}
        max={1.8}
        step={0.05}
        onChange={(value) => setRules((current) => ({ ...current, overloadedWorkload: value }))}
      />
      <RuleInput
        label="Underutilized PM"
        value={rules.underutilizedWorkload}
        min={0}
        max={1}
        step={0.05}
        onChange={(value) => setRules((current) => ({ ...current, underutilizedWorkload: value }))}
      />
      <RuleInput
        label="High issue count"
        value={rules.highIssueCount}
        min={1}
        max={10}
        step={1}
        onChange={(value) => setRules((current) => ({ ...current, highIssueCount: value }))}
      />
    </div>
  );
}

function KpiCard({ title, value, icon: Icon, tone }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700",
    green: "bg-green-50 text-green-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_4px_6px_-1px_rgb(15_23_42_/_0.05),0_2px_4px_-2px_rgb(15_23_42_/_0.05)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-slate-500">{title}</p>
        <div className={`rounded-lg p-2 ${tones[tone]}`}>
          <Icon size={16} strokeWidth={1.8} />
        </div>
      </div>
      <p className="mt-3 break-words text-xl font-bold tracking-normal text-slate-950 2xl:text-2xl">{value}</p>
    </div>
  );
}

function Panel({ title, action, children }) {
  return (
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_6px_-1px_rgb(15_23_42_/_0.05),0_2px_4px_-2px_rgb(15_23_42_/_0.05)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold text-slate-950">{title}</h2>
        {action ? <span className="text-[11px] font-semibold text-slate-500">{action}</span> : null}
      </div>
      {children}
    </section>
  );
}

function DistributionPanel({ title, data, color, percent = false }) {
  return (
    <Panel title={title}>
      <ResponsiveContainer width="100%" height={230}>
        <BarChart data={data} layout="vertical" margin={{ left: 16 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
          <XAxis type="number" tickFormatter={percent ? (value) => `${Math.round(value * 100)}%` : undefined} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="name" width={100} tickLine={false} axisLine={false} />
          <Tooltip content={<ChartTooltip percent={percent} />} />
          <Bar dataKey={percent ? "workload" : "value"} fill={color} radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Panel>
  );
}

function StackedHealthBars({ data }) {
  return HEALTH_STACK_KEYS.map((key) => (
    <Bar key={key} dataKey={key} stackId="health" fill={HEALTH_COLORS[key]} radius={[0, 0, 0, 0]}>
      {data.map((row) => (
        <Cell
          key={`${row.name}-${key}`}
          radius={getTopStackKey(row, HEALTH_STACK_KEYS) === key ? [6, 6, 0, 0] : [0, 0, 0, 0]}
        />
      ))}
    </Bar>
  ));
}

function HealthByBuVisualization({ data }) {
  return (
    <>
      <div className="md:hidden">
        <HealthByBuList data={data} />
      </div>
      <div className="hidden md:block">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => shortenBuLabel(value, 10)}
            />
            <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
            <Tooltip content={<ChartTooltip />} />
            <StackedHealthBars data={data} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}

function HealthByBuList({ data }) {
  if (!data.length) {
    return <MissingDataState compact title="Tidak ada data BU" description="Upload data portfolio untuk melihat distribusi health per BU." />;
  }

  return (
    <div className="space-y-3">
      {data.map((row) => {
        const total = HEALTH_STACK_KEYS.reduce((sum, key) => sum + (row[key] || 0), 0);
        return (
          <div key={row.name} className="min-w-0 rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <p className="min-w-0 flex-1 truncate text-sm font-bold text-slate-950" title={row.name}>
                {row.name}
              </p>
              <p className="shrink-0 text-xs font-bold text-slate-500">{total} proyek</p>
            </div>
            <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-slate-200">
              {HEALTH_STACK_KEYS.map((key) => {
                const value = row[key] || 0;
                return value ? (
                  <div
                    key={key}
                    className="h-full"
                    style={{
                      width: `${Math.max((value / Math.max(total, 1)) * 100, 2)}%`,
                      backgroundColor: HEALTH_COLORS[key],
                    }}
                  />
                ) : null;
              })}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {HEALTH_STACK_KEYS.map((key) => (
                <div key={key} className="min-w-0 rounded-lg bg-white px-2 py-2">
                  <p className="truncate text-[10px] font-bold text-slate-500" title={key}>
                    {HEALTH_SHORT_LABELS[key] || key}
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-950">{row[key] || 0}</p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function shortenBuLabel(value, maxLength = 18) {
  const text = String(value || "");
  return text.length > maxLength ? `${text.slice(0, Math.max(maxLength - 2, 4))}...` : text;
}

function getTopStackKey(row, keys) {
  for (let index = keys.length - 1; index >= 0; index -= 1) {
    const key = keys[index];
    if ((row[key] || 0) > 0) return key;
  }

  return keys[0];
}

function MiniInsight({ title, data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const top = [...data].sort((a, b) => b.value - a.value)[0];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_4px_6px_-1px_rgb(15_23_42_/_0.05),0_2px_4px_-2px_rgb(15_23_42_/_0.05)]">
      <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-slate-500">{title}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-2xl font-bold text-slate-950">{total}</p>
          <p className="text-xs text-slate-500">Total records</p>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700">{top?.name || "N/A"}</span>
      </div>
    </div>
  );
}

function MissingDataState({ title, description, compact = false }) {
  return (
    <div
      className={`flex items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 text-center ${
        compact ? "min-h-[170px] py-5" : "min-h-[260px]"
      }`}
    >
      <div className="max-w-md">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
          <AlertTriangle size={20} strokeWidth={1.8} />
        </div>
        <p className="mt-4 text-sm font-bold text-slate-950">{title}</p>
        <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function ScheduleBreakdown({ rows, total }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {rows.map((item) => (
          <div key={item.name} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <p className="truncate text-[10px] font-bold uppercase tracking-[0.05em] text-slate-500">{item.name}</p>
            </div>
            <div className="mt-2 flex items-end justify-between gap-2">
              <p className="text-2xl font-bold text-slate-950">{item.value}</p>
              <p className="pb-1 text-xs font-bold text-slate-500">{formatPercent(item.value / Math.max(total, 1))}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 space-y-3">
        {rows.map((item) => {
          const percent = (item.value / Math.max(total, 1)) * 100;
          return (
            <div key={item.name}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">{item.name}</span>
                <span className="font-bold text-slate-950">{item.value} proyek</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: item.value ? `${Math.max(percent, 2)}%` : "0%",
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RankedBars({ data, labelKey, valueKey, valueFormatter, maxValue }) {
  const effectiveMax = maxValue ?? Math.max(...data.map((item) => item[valueKey] || 0), 1);

  if (!data.length) {
    return <MissingDataState title="Tidak ada data" description="Upload data portfolio untuk melihat ranking." />;
  }

  return (
    <div className="space-y-3">
      {data.map((item) => {
        const value = item[valueKey] || 0;
        const width = Math.max(4, Math.min((value / Math.max(effectiveMax, 1)) * 100, 100));
        return (
          <div
            key={item[labelKey]}
            className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:grid-cols-[minmax(120px,190px)_1fr_auto] sm:gap-3"
          >
            <p className="truncate text-sm font-semibold text-slate-700" title={item[labelKey]}>
              {item[labelKey]}
            </p>
            <p className="text-right text-xs font-bold text-slate-600 sm:order-3 sm:min-w-16">{valueFormatter(value)}</p>
            <div className="col-span-2 h-2.5 overflow-hidden rounded-full bg-slate-100 sm:order-2 sm:col-span-1">
              <div className="h-full rounded-full bg-slate-700" style={{ width: `${width}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatusSummaryCards({ data, compact = false }) {
  const colorMap = {
    Overloaded: "bg-red-50 text-red-700 border-red-100",
    Normal: "bg-emerald-50 text-emerald-700 border-emerald-100",
    Underutilized: "bg-slate-50 text-slate-600 border-slate-200",
  };

  return (
    <div className={`grid gap-3 ${compact ? "sm:grid-cols-3" : ""}`}>
      {data.map((item) => (
        <div key={item.name} className={`rounded-xl border px-4 py-3 ${colorMap[item.name] || colorMap.Underutilized}`}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold">{item.name}</p>
            <p className={`${compact ? "text-xl" : "text-2xl"} font-bold`}>{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function SortControls({ sort, onSort, options, className = "" }) {
  return (
    <div className={`flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <label className="flex min-w-0 flex-1 items-center gap-2 text-xs font-bold text-slate-600">
        Sort
        <select
          className="h-9 min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-2 text-xs font-bold text-slate-800"
          value={sort.key}
          onChange={(event) => onSort((current) => ({ ...current, key: event.target.value }))}
        >
          {options.map(([label, key]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className="h-9 rounded-md border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700"
        onClick={() => onSort((current) => ({ ...current, direction: current.direction === "asc" ? "desc" : "asc" }))}
      >
        {sort.direction === "asc" ? "Ascending" : "Descending"}
      </button>
    </div>
  );
}

function MetricChip({ label, value, tone = "slate" }) {
  const toneClass = tone === "red" ? "text-red-700" : "text-slate-950";
  return (
    <div className="min-w-0 rounded-lg bg-slate-50 px-3 py-2">
      <p className="truncate text-[10px] font-bold uppercase tracking-[0.05em] text-slate-500">{label}</p>
      <p className={`mt-1 truncate text-sm font-bold ${toneClass}`} title={String(value)}>
        {value}
      </p>
    </div>
  );
}

function StatusMetric({ label, value }) {
  return (
    <div className="min-w-0 rounded-lg bg-slate-50 px-3 py-2">
      <p className="mb-1 truncate text-[10px] font-bold uppercase tracking-[0.05em] text-slate-500">{label}</p>
      {value}
    </div>
  );
}

function CriticalLoadStrip({ rows, workloadMode = "live" }) {
  if (!rows.length) return null;

  return (
    <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {rows.map((pm) => (
        <div key={pm.pm} className="rounded-xl border border-red-100 bg-red-50 px-3 py-2">
          <div className="flex items-center justify-between gap-3">
            <p className="min-w-0 truncate text-sm font-bold text-slate-950" title={pm.pm}>
              {pm.pm}
            </p>
            <span className="shrink-0 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
              {formatWorkloadValue(pm.peak, workloadMode)}
            </span>
          </div>
          <p className="mt-1 text-[11px] font-semibold text-red-700">
            {workloadMode === "proxy" ? "Peak active projects" : "Peak workload"}
          </p>
        </div>
      ))}
    </div>
  );
}

function WorkloadHeatmap({ rows, rules, projectCountMap, months, workloadMode = "live" }) {
  const [sort, setSort] = useState({ key: "peak", direction: "desc" });
  const [pagination, setPagination] = useState({ page: 1, pageSize: 8 });
  const isProxy = workloadMode === "proxy";
  const sortOptions = [
    ["Project Manager", "pm"],
    ["Projects", "projects"],
    [isProxy ? "Peak Active Projects" : "Peak Load", "peak"],
    ...months.map((month) => [month.label, month.key]),
  ];
  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const getValue = (row) => {
        if (sort.key === "pm") return row.pm || "";
        if (sort.key === "projects") return projectCountMap.get(row.pm) || 0;
        if (sort.key === "peak") return Math.max(...months.map((month) => row[month.key] || 0));
        return row[sort.key] || 0;
      };
      return compareSortValues(getValue(a), getValue(b), sort.direction);
    });
  }, [rows, sort, projectCountMap, months]);
  const pagedRows = usePaginatedRows(sortedRows, pagination, setPagination);

  return (
    <>
      <SortControls sort={sort} onSort={setSort} options={sortOptions} className="mb-3 xl:hidden" />

      <div className="grid gap-3 xl:hidden">
        {pagedRows.rows.map((pm) => (
          <div key={pm.pm} className="w-full min-w-0 overflow-hidden rounded-xl border border-slate-100 bg-white p-3">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-950" title={pm.pm}>{pm.pm}</p>
                <p className="mt-1 text-xs text-slate-500">{projectCountMap.get(pm.pm) || 0} proyek portfolio</p>
              </div>
              <span className="max-w-[132px] shrink-0 truncate rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700 sm:max-w-none">
                Peak {formatWorkloadValue(Math.max(...months.map((month) => pm[month.key] || 0)), workloadMode)}
              </span>
            </div>
            <div className="mt-3 grid min-w-0 grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
              {months.map((month) => {
                const value = pm[month.key] || 0;
                return (
                  <div key={month.key} className={`rounded px-2 py-2 text-center ${heatClass(value, rules, workloadMode)}`}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.05em] opacity-70">{month.label}</p>
                    <p className="mt-1 text-sm font-bold">{formatWorkloadValue(value, workloadMode, { compact: true })}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="hidden rounded-xl border border-slate-100 xl:block">
        <table className="w-full table-fixed border-separate border-spacing-0">
          <thead>
            <tr>
              <th className="w-[220px] bg-slate-50 px-3 py-3 text-left text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500">
                <SortButton label="Project Manager" sortKey="pm" sort={sort} onSort={setSort} />
              </th>
              <th className="w-[84px] bg-slate-50 px-3 py-3 text-left text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500">
                <SortButton label="Projects" sortKey="projects" sort={sort} onSort={setSort} />
              </th>
              {months.map((month) => {
                return (
                  <th key={month.key} className="bg-slate-50 px-3 py-3 text-center text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500">
                    <SortButton label={month.label} sortKey={month.key} sort={sort} onSort={setSort} align="center" />
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pagedRows.rows.map((pm) => (
              <tr key={pm.pm}>
                <td className="border-t border-slate-100 bg-white px-3 py-3 text-sm font-bold text-slate-800">
                  <span className="block truncate" title={pm.pm}>{pm.pm}</span>
                </td>
                <td className="border-t border-slate-100 px-3 py-3 text-sm font-semibold text-slate-700">
                  {projectCountMap.get(pm.pm) || 0}
                </td>
                {months.map((month) => {
                  const value = pm[month.key] || 0;
                  return (
                    <td key={month.key} className="border-t border-slate-100 px-2 py-2">
                      <div className={`rounded px-2 py-2 text-center text-xs font-bold ${heatClass(value, rules, workloadMode)}`}>
                        {formatWorkloadValue(value, workloadMode, { compact: true })}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PaginationControls pagination={pagination} setPagination={setPagination} totalRows={sortedRows.length} pageSizeOptions={[8, 15, 25]} />
    </>
  );
}

function PmPortfolioTable({ rows, workloadRows, months, workloadMode = "live" }) {
  const workloadMap = new Map(workloadRows.map((pm) => [pm.pm, averageMonthlyValue(pm, months)]));
  const peakMap = new Map(workloadRows.map((pm) => [pm.pm, Math.max(...months.map((month) => pm[month.key] || 0))]));
  const [sort, setSort] = useState({ key: "costExposure", direction: "desc" });
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10 });
  const avgLoadLabel = workloadMode === "proxy" ? "Avg Active" : "Avg Load";
  const peakLoadLabel = workloadMode === "proxy" ? "Peak Active" : "Peak Load";
  const sortOptions = [
    ["PM", "pm"],
    ["Projects", "projects"],
    [avgLoadLabel, "avgLoad"],
    [peakLoadLabel, "peakLoad"],
    ["Cost Exposure", "costExposure"],
    ["Value At Risk", "valueAtRisk"],
  ];
  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const getValue = (row) => {
        if (sort.key === "pm") return row.pm || "";
        if (sort.key === "avgLoad") return workloadMap.get(row.pm) || 0;
        if (sort.key === "peakLoad") return peakMap.get(row.pm) || 0;
        return row[sort.key] || 0;
      };
      return compareSortValues(getValue(a), getValue(b), sort.direction);
    });
  }, [rows, sort, workloadMap, peakMap]);
  const pagedRows = usePaginatedRows(sortedRows, pagination, setPagination);

  return (
    <>
      <SortControls sort={sort} onSort={setSort} options={sortOptions} className="mb-3 lg:hidden" />

      <div className="grid gap-3 lg:hidden">
        {pagedRows.rows.map((pm) => (
          <div key={pm.pm} className="w-full min-w-0 overflow-hidden rounded-xl border border-slate-100 bg-white p-3">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-950" title={pm.pm}>{pm.pm}</p>
                <p className="mt-1 text-xs text-slate-500">{pm.projects} proyek portfolio</p>
              </div>
              <p className="max-w-[142px] shrink-0 truncate text-right text-sm font-bold text-slate-950 sm:max-w-none" title={formatCurrency(pm.costExposure)}>
                {formatCurrency(pm.costExposure)}
              </p>
            </div>
            <div className="mt-3 grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-4">
              <MetricChip label={avgLoadLabel} value={formatWorkloadValue(workloadMap.get(pm.pm) || 0, workloadMode, { decimals: 1 })} />
              <MetricChip label={peakLoadLabel} value={formatWorkloadValue(peakMap.get(pm.pm) || 0, workloadMode)} />
              <MetricChip label="Value At Risk" value={formatCurrency(pm.valueAtRisk)} tone="red" />
              <MetricChip label="Projects" value={pm.projects} />
            </div>
          </div>
        ))}
      </div>

      <div className="hidden rounded-xl border border-slate-100 lg:block">
        <table className="w-full table-fixed border-separate border-spacing-0">
          <thead>
            <tr>
              {sortOptions.map(([header, key]) => (
                <th key={key} className={`border-b border-slate-200 bg-slate-50 px-3 py-3 text-left text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500 ${key === "pm" ? "w-[28%]" : ""}`}>
                  <SortButton label={header} sortKey={key} sort={sort} onSort={setSort} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedRows.rows.map((pm) => (
              <tr key={pm.pm} className="hover:bg-slate-50">
                <td className="border-b border-slate-100 px-3 py-3 text-sm font-bold text-slate-950">
                  <span className="block max-w-[280px] truncate" title={pm.pm}>
                    {pm.pm}
                  </span>
                </td>
                <td className="border-b border-slate-100 px-3 py-3 text-sm text-slate-700">{pm.projects}</td>
                <td className="border-b border-slate-100 px-3 py-3 text-sm font-bold text-slate-800">{formatWorkloadValue(workloadMap.get(pm.pm) || 0, workloadMode, { decimals: 1 })}</td>
                <td className="border-b border-slate-100 px-3 py-3 text-sm font-bold text-slate-800">{formatWorkloadValue(peakMap.get(pm.pm) || 0, workloadMode)}</td>
                <td className="border-b border-slate-100 px-3 py-3 text-sm font-bold text-slate-800">{formatCurrency(pm.costExposure)}</td>
                <td className="border-b border-slate-100 px-3 py-3 text-sm font-bold text-red-700">{formatCurrency(pm.valueAtRisk)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PaginationControls pagination={pagination} setPagination={setPagination} totalRows={sortedRows.length} pageSizeOptions={[10, 25, 50]} />
    </>
  );
}

function ProjectTable({ projects, compact = false, workloadMode = "live" }) {
  const [sort, setSort] = useState({ key: "priority", direction: "asc" });
  const [pagination, setPagination] = useState({ page: 1, pageSize: compact ? 6 : 10 });
  const sortOptions = [
    ["Priority", "priority"],
    ["IWO", "iwo"],
    ["Project Name", "project"],
    ["PM", "pm"],
    ["Health", "health"],
    ["Due Status", "dueStatus"],
    ["Sched. Perf.", "schedule"],
    ["Open Issues", "openIssue"],
    ["Cost", "costAmount"],
    [workloadMode === "proxy" ? "Active Project" : "PM Workload", "workload"],
  ];
  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      const getValue = (project) => {
        if (sort.key === "priority") return priorityRank(project.priority);
        if (sort.key === "workload") return project.currentWorkload || 0;
        if (sort.key === "costAmount") return project.costAmount || 0;
        return project[sort.key] ?? "";
      };
      return compareSortValues(getValue(a), getValue(b), sort.direction);
    });
  }, [projects, sort]);
  const pagedProjects = usePaginatedRows(sortedProjects, pagination, setPagination);

  return (
    <>
      <SortControls sort={sort} onSort={setSort} options={sortOptions} className="mb-3 2xl:hidden" />

      <div className="grid gap-3 2xl:hidden">
        {pagedProjects.rows.map((project) => (
          <div key={project.id} className="w-full min-w-0 overflow-hidden rounded-xl border border-slate-100 bg-white p-3">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <PriorityBadge priority={project.priority} />
                  <span className="min-w-0 max-w-[150px] truncate text-xs font-bold text-slate-500" title={project.iwo}>
                    {project.iwo}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm font-bold text-slate-950" title={project.project}>{project.project}</p>
                <p className="mt-1 truncate text-xs text-slate-500" title={project.customer}>{project.customer}</p>
              </div>
              <p className="max-w-[96px] shrink-0 truncate text-right text-xs font-bold text-slate-700 sm:max-w-[150px]" title={project.pm}>{project.pm}</p>
            </div>
            <div className="mt-3 grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3">
              <StatusMetric label="Health" value={<StatusPill value={project.health} colorMap={HEALTH_COLORS} />} />
              <StatusMetric label="Due" value={<StatusPill value={project.dueStatus} colorMap={DUE_COLORS} />} />
              <MetricChip label="Schedule" value={project.schedule} />
              <MetricChip label="Open Issues" value={project.openIssue} />
              <MetricChip label="Cost" value={formatCurrency(project.costAmount)} />
              <MetricChip
                label={workloadMode === "proxy" ? "Active" : "PM Workload"}
                value={formatWorkloadValue(project.currentWorkload, workloadMode, { compact: workloadMode === "proxy" })}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="hidden rounded-xl border border-slate-100 2xl:block">
        <table className="w-full table-fixed border-separate border-spacing-0">
          <thead>
            <tr>
              {sortOptions.map(([header, key]) => (
                <th
                  key={key}
                  className={`border-b border-slate-200 bg-slate-50 px-3 py-3 text-left text-[11px] font-bold uppercase tracking-[0.05em] text-slate-500 ${
                    key === "project" ? "w-[24%]" : key === "iwo" ? "w-[12%]" : key === "priority" ? "w-[9%]" : ""
                  }`}
                >
                  <SortButton label={header} sortKey={key} sort={sort} onSort={setSort} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedProjects.rows.map((project) => (
              <tr key={project.id} className="group hover:bg-slate-50">
                <td className="border-b border-slate-100 px-3 py-3">
                  <PriorityBadge priority={project.priority} />
                </td>
                <td className="border-b border-slate-100 px-3 py-3 text-sm font-semibold text-slate-800">
                  <span className="block truncate" title={project.iwo}>{project.iwo}</span>
                </td>
                <td className="border-b border-slate-100 px-3 py-3">
                  <p className="max-w-[260px] truncate text-sm font-bold text-slate-950">{project.project}</p>
                  {!compact ? <p className="mt-1 text-xs text-slate-500">{project.customer}</p> : null}
                </td>
                <td className="border-b border-slate-100 px-3 py-3 text-sm text-slate-700">
                  <span className="block truncate" title={project.pm}>{project.pm}</span>
                </td>
                <td className="border-b border-slate-100 px-3 py-3">
                  <StatusPill value={project.health} colorMap={HEALTH_COLORS} />
                </td>
                <td className="border-b border-slate-100 px-3 py-3">
                  <StatusPill value={project.dueStatus} colorMap={DUE_COLORS} />
                </td>
                <td className="border-b border-slate-100 px-3 py-3 text-sm text-slate-700">{project.schedule}</td>
                <td className="border-b border-slate-100 px-3 py-3 text-sm font-bold text-slate-800">{project.openIssue}</td>
                <td className="border-b border-slate-100 px-3 py-3 text-sm font-bold text-slate-800">{formatCurrency(project.costAmount)}</td>
                <td className="border-b border-slate-100 px-3 py-3">
                  <div className="h-1.5 w-20 rounded-full bg-slate-100">
                    <div
                      className={`h-1.5 rounded-full ${project.currentWorkload > 1 ? "bg-red-500" : "bg-slate-950"}`}
                      style={{ width: `${Math.min(project.currentWorkload * 100, 100)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs font-bold text-slate-600">
                    {formatWorkloadValue(project.currentWorkload, workloadMode, { compact: workloadMode === "proxy" })}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PaginationControls
        pagination={pagination}
        setPagination={setPagination}
        totalRows={sortedProjects.length}
        pageSizeOptions={compact ? [6, 10, 25] : [10, 25, 50]}
      />
    </>
  );
}

function PriorityBadge({ priority }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${PRIORITY_STYLES[priority]}`}>{priority}</span>;
}

function StatusPill({ value, colorMap }) {
  const color = colorMap[value] || "#64748b";
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      {value}
    </span>
  );
}

function FilterSelect({ label, value, options, onChange }) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.05em] text-slate-500">
        <Filter size={12} />
        {label}
      </span>
      <select
        className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-800"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function SortButton({ label, sortKey, sort, onSort, align = "left" }) {
  const active = sort.key === sortKey;
  const direction = active ? sort.direction : null;

  return (
    <button
      type="button"
      className={`inline-flex min-w-0 w-full items-center gap-1 overflow-hidden text-[11px] font-bold uppercase tracking-[0.05em] ${
        align === "center" ? "justify-center" : "justify-start"
      } ${active ? "text-slate-950" : "text-slate-500 hover:text-slate-800"}`}
      onClick={() =>
        onSort((current) => ({
          key: sortKey,
          direction: current.key === sortKey && current.direction === "asc" ? "desc" : "asc",
        }))
      }
    >
      <span className="min-w-0 truncate">{label}</span>
      <span className="text-[10px] leading-none">{direction === "asc" ? "^" : direction === "desc" ? "v" : "-"}</span>
    </button>
  );
}

function PaginationControls({ pagination, setPagination, totalRows, pageSizeOptions }) {
  const totalPages = Math.max(1, Math.ceil(totalRows / pagination.pageSize));
  const startRow = totalRows === 0 ? 0 : (pagination.page - 1) * pagination.pageSize + 1;
  const endRow = Math.min(totalRows, pagination.page * pagination.pageSize);

  return (
    <div className="mt-3 flex flex-col gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
      <p className="font-semibold">
        Showing {startRow}-{endRow} of {totalRows}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 font-semibold">
          Rows
          <select
            className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs font-bold text-slate-700"
            value={pagination.pageSize}
            onChange={(event) =>
              setPagination({
                page: 1,
                pageSize: Number(event.target.value),
              })
            }
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="h-8 rounded-md border border-slate-200 bg-white px-3 font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={pagination.page <= 1}
          onClick={() => setPagination((current) => ({ ...current, page: Math.max(1, current.page - 1) }))}
        >
          Prev
        </button>
        <span className="min-w-16 text-center font-bold text-slate-700">
          {pagination.page} / {totalPages}
        </span>
        <button
          type="button"
          className="h-8 rounded-md border border-slate-200 bg-white px-3 font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={pagination.page >= totalPages}
          onClick={() => setPagination((current) => ({ ...current, page: Math.min(totalPages, current.page + 1) }))}
        >
          Next
        </button>
      </div>
    </div>
  );
}

function RuleInput({ label, value, min, max, step, onChange }) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-700">
          {label.includes("issue") ? value : formatPercent(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-slate-950"
      />
    </label>
  );
}

function ProgressRow({ label, value, max, color = "#0f172a" }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="min-w-0 truncate pr-3 font-semibold text-slate-700" title={label}>{label}</span>
        <span className="font-bold text-slate-950">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100">
        <div
          className="h-1.5 rounded-full"
          style={{
            width: `${Math.min((value / Math.max(max, 1)) * 100, 100)}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

function MiniLineLegend({ rows }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {rows.map((pm, index) => (
        <span key={pm.pm} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: linePalette[index % linePalette.length] }} />
          {pm.pm}
        </span>
      ))}
    </div>
  );
}

function ChartTooltip({ active, payload, label, percent, currency, workloadMode }) {
  if (!active || !payload?.length) return null;
  const visiblePayload = payload.slice(0, 8);
  const hiddenCount = Math.max(payload.length - visiblePayload.length, 0);
  return (
    <div className="max-w-sm rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-lg">
      {label ? <p className="mb-1 font-bold text-slate-950">{label}</p> : null}
      {visiblePayload.map((item) => (
        <p key={`${item.name}-${item.dataKey}`} className="truncate text-slate-700">
          <span className="font-bold">{item.name || item.dataKey}:</span>{" "}
          {currency
            ? formatCurrency(item.value)
            : workloadMode
              ? formatWorkloadValue(item.value, workloadMode, { decimals: 1 })
              : percent
                ? formatPercent(item.value)
                : item.value}
        </p>
      ))}
      {hiddenCount ? <p className="mt-1 text-xs font-semibold text-slate-500">+{hiddenCount} more series</p> : null}
    </div>
  );
}

function heatClass(value, rules, workloadMode = "live") {
  if (workloadMode === "proxy") {
    if (value >= 5) return "bg-red-100 text-red-800";
    if (value >= 2) return "bg-amber-50 text-amber-700";
    if (value > 0) return "bg-blue-50 text-blue-700";
    return "bg-slate-100 text-slate-500";
  }
  if (value > rules.overloadedWorkload) return "bg-red-100 text-red-800";
  if (value < rules.underutilizedWorkload) return "bg-slate-100 text-slate-500";
  return "bg-blue-50 text-blue-700";
}

function getWorkloadAction(mode) {
  if (mode === "proxy") return "Proxy";
  if (mode === "mixed") return "Mixed";
  return "Live";
}

function getWorkloadMessage(mode) {
  if (mode === "mixed") {
    return "Sebagian baris tidak punya angka workload valid; angka proxy ditampilkan sebagai jumlah proyek aktif, bukan persen kapasitas.";
  }
  return "Tidak ada angka workload/FTE valid yang dikenali; angka di panel ini adalah jumlah proyek aktif per PM berdasarkan Start Date dan End Date.";
}

function compareSortValues(a, b, direction = "asc") {
  const multiplier = direction === "asc" ? 1 : -1;
  const aValue = a ?? "";
  const bValue = b ?? "";

  if (typeof aValue === "number" && typeof bValue === "number") {
    return (aValue - bValue) * multiplier;
  }

  return String(aValue).localeCompare(String(bValue), undefined, {
    numeric: true,
    sensitivity: "base",
  }) * multiplier;
}

function priorityRank(priority) {
  const order = { Critical: 0, High: 1, Medium: 2, Normal: 3 };
  return order[priority] ?? 99;
}

function usePaginatedRows(rows, pagination, setPagination) {
  const totalPages = Math.max(1, Math.ceil(rows.length / pagination.pageSize));
  const safePage = Math.min(Math.max(1, pagination.page), totalPages);

  useEffect(() => {
    if (safePage !== pagination.page) {
      setPagination((current) => ({ ...current, page: safePage }));
    }
  }, [safePage, pagination.page, setPagination]);

  const start = (safePage - 1) * pagination.pageSize;
  return {
    rows: rows.slice(start, start + pagination.pageSize),
    totalPages,
  };
}

function formatWorkloadValue(value, mode = "live", options = {}) {
  if (mode === "proxy") {
    const decimals = options.decimals ?? 0;
    const rounded = Number(value || 0).toFixed(decimals);
    const normalized = decimals ? rounded.replace(/\.0$/, "") : String(Math.round(value || 0));
    return options.compact ? normalized : `${normalized} proyek`;
  }
  return formatPercent(value);
}

function formatWorkloadAxis(value, mode = "live") {
  if (mode === "proxy") return `${Math.round(value || 0)}`;
  return `${Math.round((value || 0) * 100)}%`;
}

function getWorkloadMetricLabels(mode = "live") {
  if (mode === "proxy") {
    return {
      average: "Avg Active Projects",
      peak: "Peak Active Projects",
    };
  }

  return {
    average: "Average PM Load",
    peak: "Peak PM Load",
  };
}

function toPortfolioWorkloadSeries(rows, months = MONTHS, labels = getWorkloadMetricLabels()) {
  return months.map((month) => {
    const values = rows.map((row) => row[month.key] || 0);
    const average = values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
    const peak = Math.max(...values, 0);
    return {
      name: month.label,
      [labels.average]: Number(average.toFixed(2)),
      [labels.peak]: Number(peak.toFixed(2)),
    };
  });
}

function toSelectedCostSeries(rows, months = MONTHS, selectedPm = "TOTAL") {
  const selectedRow = rows.find((row) => row.pm === selectedPm);
  return months.map((month) => {
    const value =
      selectedPm === "TOTAL"
        ? rows.reduce((sum, row) => sum + (row[month.key] || 0), 0)
        : selectedRow?.[month.key] || 0;
    return {
      name: month.label,
      "Cost Exposure": Math.round(value),
    };
  });
}

function toMonthlySeries(rows, mapValue, months = MONTHS) {
  return months.map((month) => {
    const row = { name: month.label };
    rows.forEach((item) => {
      row[item.pm] = mapValue(item[month.key], item);
    });
    return row;
  });
}

function averageMonthlyValue(row, months = MONTHS) {
  return months.reduce((sum, month) => sum + (row[month.key] || 0), 0) / Math.max(months.length, 1);
}

function getFilterOptions(projects) {
  return {
    bu: uniqueSorted(projects.map((project) => project.bu)),
    pm: uniqueSorted(projects.map((project) => project.pm)),
  };
}

function uniqueSorted(values) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function buildDefaultCustomization() {
  return CUSTOMIZATION_GROUPS.reduce((settings, group) => {
    group.options.forEach((option) => {
      settings[option.id] = true;
    });
    return settings;
  }, {});
}

function loadDashboardCustomization() {
  if (typeof window === "undefined") return DEFAULT_CUSTOMIZATION;
  try {
    const stored = JSON.parse(window.localStorage.getItem(CUSTOMIZATION_STORAGE_KEY) || "{}");
    return { ...DEFAULT_CUSTOMIZATION, ...stored };
  } catch {
    return DEFAULT_CUSTOMIZATION;
  }
}

function formatSourceName(files) {
  const names = files.map((file) => file.name).filter(Boolean);
  if (names.length <= 1) return names[0] || "Excel upload";
  const preview = names.slice(0, 2).join(", ");
  return names.length > 2 ? `${names.length} files: ${preview}, ...` : `${names.length} files: ${preview}`;
}

function buildSmartInsights(dashboard) {
  const { kpis, projects, charts, pmRiskList } = dashboard;
  const criticalProjects = projects.filter((project) => project.priority === "Critical");
  const warningValue = projects
    .filter((project) => project.health !== "Healthy" || project.dueStatus === "Overdue")
    .reduce((sum, project) => sum + (project.value || 0), 0);
  const topRiskBu = [...charts.healthByBu]
    .map((row) => ({
      name: row.name,
      risk: (row.Warning || 0) + (row["Need Improvement"] || 0),
      total: HEALTH_STACK_KEYS.reduce((sum, key) => sum + (row[key] || 0), 0),
    }))
    .sort((a, b) => b.risk - a.risk)[0];
  const topPm = pmRiskList[0];
  const topCostPm = [...charts.pmPortfolioSummary].sort((a, b) => b.costExposure - a.costExposure)[0];
  const hasDataGaps =
    dashboard.dataQuality.workloadMode !== "live" ||
    dashboard.dataQuality.scheduleInputCount < projects.length ||
    dashboard.dataQuality.costInputCount < projects.length;

  return [
    {
      label: "Prioritas",
      title: `${criticalProjects.length} critical`,
      detail:
        criticalProjects.length > 0
          ? `${criticalProjects[0].project} perlu dilihat dulu karena kombinasi health, due, schedule, dan load.`
          : "Tidak ada proyek critical dari rule saat ini.",
      tone: criticalProjects.length ? "border-red-100 bg-red-50 text-red-800" : "border-emerald-100 bg-emerald-50 text-emerald-800",
    },
    {
      label: "Value risk",
      title: formatCurrency(warningValue || kpis.valueAtRisk),
      detail: `${kpis.overdue} proyek overdue dan ${kpis.warning + kpis.needImprovement} proyek tidak healthy.`,
      tone: warningValue ? "border-amber-100 bg-amber-50 text-amber-800" : "border-slate-200 bg-slate-50 text-slate-700",
    },
    {
      label: "PM focus",
      title: topPm ? topPm.pm : "No risky PM",
      detail: topPm
        ? `${topPm.riskyProjects} proyek risky, ${topPm.overdueProjects} overdue, ${topPm.projects} proyek total.`
        : "Tidak ada PM dengan kombinasi risiko tinggi.",
      tone: topPm?.riskyProjects ? "border-red-100 bg-red-50 text-red-800" : "border-slate-200 bg-slate-50 text-slate-700",
    },
    {
      label: hasDataGaps ? "Data quality" : "Cost focus",
      title: hasDataGaps ? "Proxy aktif" : topCostPm?.pm || "Cost OK",
      detail: hasDataGaps ? getDataQualityInsight(dashboard.dataQuality, projects.length) : `${topCostPm?.pm || "PM"} memegang exposure ${formatCurrency(topCostPm?.costExposure || 0)}.`,
      tone: hasDataGaps ? "border-blue-100 bg-blue-50 text-blue-800" : "border-slate-200 bg-slate-50 text-slate-700",
    },
  ].map((insight) => {
    if (insight.label !== "Value risk" || !topRiskBu) return insight;
    return {
      ...insight,
      detail: `${insight.detail} BU terbesar: ${topRiskBu.name} (${topRiskBu.risk}/${topRiskBu.total} risky).`,
    };
  });
}

function getDataQualityInsight(dataQuality, totalProjects) {
  if (dataQuality.workloadMode !== "live") return getWorkloadMessage(dataQuality.workloadMode);
  const missing = [];
  if (dataQuality.scheduleInputCount < totalProjects) missing.push("schedule");
  if (dataQuality.costInputCount < totalProjects) missing.push("cost");
  if (dataQuality.issueInputCount < totalProjects) missing.push("issue");
  return `Sebagian data ${missing.join(", ")} kosong, jadi insight memakai kolom yang tersedia saja.`;
}

function getAiInsightsEndpoint() {
  const configured = import.meta.env.VITE_AI_INSIGHTS_ENDPOINT;
  if (configured) return configured;
  if (typeof window === "undefined") return "";
  const host = window.location.hostname;
  if (host.endsWith(".netlify.app")) return "/.netlify/functions/ai-insights";
  if (import.meta.env.PROD && host !== "localhost" && host !== "127.0.0.1" && !host.includes("github.io")) {
    return "/.netlify/functions/ai-insights";
  }
  return "";
}

function buildAiBriefPayload(dashboard, sourceName) {
  const { kpis, charts, priorityProjects, pmRiskList } = dashboard;
  return {
    generatedAt: new Date().toISOString(),
    source: sourceName,
    kpis,
    dataQuality: dashboard.dataQuality,
    healthByBu: charts.healthByBu
      .map((row) => ({
        bu: row.name,
        healthy: row.Healthy || 0,
        warning: row.Warning || 0,
        needImprovement: row["Need Improvement"] || 0,
      }))
      .sort((a, b) => b.warning + b.needImprovement - (a.warning + a.needImprovement))
      .slice(0, 8),
    scheduleDistribution: charts.scheduleDistribution,
    topPriorityProjects: priorityProjects.slice(0, 8).map((project) => ({
      priority: project.priority,
      iwo: project.iwo,
      project: project.project,
      customer: project.customer,
      pm: project.pm,
      bu: project.bu,
      health: project.health,
      dueStatus: project.dueStatus,
      schedule: project.schedule,
      openIssue: project.openIssue,
      value: project.value,
      costAmount: project.costAmount,
      currentWorkload: Number((project.currentWorkload || 0).toFixed(2)),
    })),
    topRiskyPms: pmRiskList.slice(0, 8).map((pm) => ({
      pm: pm.pm,
      projects: pm.projects,
      riskyProjects: pm.riskyProjects,
      overdueProjects: pm.overdueProjects,
    })),
    topCostPms: [...charts.pmPortfolioSummary]
      .sort((a, b) => b.costExposure - a.costExposure)
      .slice(0, 8)
      .map((pm) => ({
        pm: pm.pm,
        projects: pm.projects,
        costExposure: pm.costExposure,
        valueAtRisk: pm.valueAtRisk,
      })),
  };
}

const linePalette = ["#0f172a", "#2563eb", "#64748b", "#f59e0b", "#ef4444", "#16a34a", "#7c3aed"];
