import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Activity,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  TrendingUp,
  Download,
  Clock,
  ExternalLink,
  Bot,
  Zap,
  Brain,
  BarChart3,
  FolderKanban,
  Upload,
  Search,
  ArrowRight,
  ScanEye,
  Siren,
  Gauge,
  Radar,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";
import { Skeleton, SkeletonCard, SkeletonChart } from "../components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { dashboardApi } from "../lib/api";
import type {
  DashboardSummary, RecentAnalysis, RiskDistribution,
  RiskTrendPoint, ComplianceFrameworkScore,
  AIRecommendation as AIRecommendationType,
} from "../types";
import { formatDateRelative } from "../lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.06, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

const defaultRiskData = [
  { name: "Mon", score: 45, baseline: 50 },
  { name: "Tue", score: 38, baseline: 50 },
  { name: "Wed", score: 52, baseline: 50 },
  { name: "Thu", score: 41, baseline: 50 },
  { name: "Fri", score: 33, baseline: 50 },
  { name: "Sat", score: 28, baseline: 50 },
  { name: "Sun", score: 35, baseline: 50 },
];

interface ChartRiskItem { name: string; value: number; color: string; }

const defaultRiskDist: ChartRiskItem[] = [
  { name: "Critical", value: 4, color: "#ef4444" },
  { name: "High", value: 12, color: "#f59e0b" },
  { name: "Medium", value: 18, color: "#3b82f6" },
  { name: "Low", value: 24, color: "#00c880" },
];

const quickActions = [
  { icon: Upload, label: "Upload Document", desc: "Start a new analysis", color: "var(--brand)", path: "/projects" },
  { icon: FolderKanban, label: "New Project", desc: "Create a project", color: "var(--cyber)", path: "/projects" },
  { icon: FileText, label: "View Reports", desc: "See past analyses", color: "var(--high)", path: "/history" },
  { icon: ScanEye, label: "Run Scan", desc: "Quick security scan", color: "#a855f7", path: "/projects" },
];

const timelineColors: Record<string, string> = {
  critical: "var(--critical)",
  success: "var(--low)",
  warning: "var(--high)",
  info: "var(--cyber)",
};

const severityColors: Record<string, string> = {
  Critical: "var(--critical)",
  High: "var(--high)",
  Medium: "var(--medium)",
  Low: "var(--low)",
};

const periodToDays: Record<string, number> = {
  week: 7,
  month: 30,
  quarter: 90,
};

export default function OverviewPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("week");

  // Real data from API
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentList, setRecentList] = useState<RecentAnalysis[]>([]);
  const [riskDist, setRiskDist] = useState<RiskDistribution | null>(null);
  const [riskTrend, setRiskTrend] = useState<RiskTrendPoint[]>([]);
  const [complianceByFramework, setComplianceByFramework] = useState<ComplianceFrameworkScore[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendationType[]>([]);
  const riskTrendData = riskTrend.length > 0
    ? riskTrend.map((p) => ({ name:
            selectedPeriod === "quarter"
              ? new Date(p.date).getDate().toString()
              : new Date(p.date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                }), score: p.average_risk_score, baseline: 50 }))
    : defaultRiskData;
  const complianceData = complianceByFramework.length > 0
    ? complianceByFramework.map((c) => ({ name: c.framework, value: c.score })):[];
  const recommendationsData = recommendations.length > 0
    ? recommendations.map((r) => ({ text: r.text, impact: r.occurrences >= 3 ? "High" : r.occurrences >= 2 ? "Medium" : "Low", effort: "—" })):[];
  useEffect(() => {
    
    const fetchDashboard = async () => {
      try {
        const [summaryData, recentData, riskData, complianceFrameworkData, recommendationsData] = await Promise.all([
        dashboardApi.summary(), dashboardApi.recent(), dashboardApi.riskDistribution(), dashboardApi.complianceByFramework(), dashboardApi.recommendations(4),
        ]);
        setSummary(summaryData);
        setRecentList(recentData);
        setRiskDist(riskData);
        setComplianceByFramework(complianceFrameworkData); setRecommendations(recommendationsData);
        
      } catch (err: any) {
        // Silently fall back to mock data when backend is unavailable
        console.warn("Dashboard API unavailable, using mock data:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // Separate effect: refetches whenever the Week/Month/Quarter toggle
  // changes, instead of only running once on mount like the block above.
  useEffect(() => {
    const days = periodToDays[selectedPeriod] ?? 7;
    dashboardApi
      .riskTrend(days)
      .then(setRiskTrend)
      .catch((err) =>
        console.warn("Risk trend fetch failed:", err.message)
      );
  }, [selectedPeriod]);

  const kpis = summary
    ? [
        { icon: Gauge, label: "Risk Score", value: `${Math.round(summary.average_risk_score)}`, color: "var(--critical)" },
        { icon: CheckCircle2, label: "Compliance", value: "—", color: "var(--low)" },
        { icon: FolderKanban, label: "Projects", value: String(summary.total_projects), color: "var(--cyber)" },
        { icon: Siren, label: "Findings", value: String(summary.high_risk + summary.medium_risk + summary.low_risk), color: "var(--high)" },
      ]
    : defaultKpis;

  // Type helper for rendering KPI cards that may or may not have trend
  type KpiItem = { icon: React.ComponentType<{ size?: number }>; label: string; value: string; color: string };
  const renderKpis: KpiItem[] = kpis as KpiItem[];

  const riskDistData: ChartRiskItem[] = riskDist
    ? [
        { name: "Critical", value: riskDist.critical, color: "#ef4444" },
        { name: "High", value: riskDist.high, color: "#f59e0b" },
        { name: "Medium", value: riskDist.medium, color: "#3b82f6" },
        { name: "Low", value: riskDist.low, color: "#00c880" },
      ].filter((d) => d.value > 0)
    : defaultRiskDist;

  const recentAnalyses = recentList.length > 0
    ? recentList.map((r) => ({
        id: r.id,
        file: r.filename,
        project: `Project #${r.project_id}`,
        risk: r.risk_score,
        status: r.risk_level,
        date: formatDateRelative(r.created_at),
      }))
    : [];

  const hasRealData = summary !== null;

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl" />
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[var(--brand-subtle)] text-[var(--brand)] text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand)] pulse-dot" />
              Security Command Center
              {hasRealData && <span className="text-[10px] text-[var(--foreground-tertiary)] ml-1">· Live</span>}
            </div>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Security Overview</h1>
          <p className="text-sm text-[var(--foreground-secondary)] mt-1">
            Real-time security posture monitoring and AI-powered analysis
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Download size={14} className="mr-1.5" />
              Export Report
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => dashboardApi.exportReport("csv")}>Export as CSV</DropdownMenuItem>
            <DropdownMenuItem onClick={() => dashboardApi.exportReport("pdf")}>Export as PDF</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
          <Button size="sm" onClick={() => navigate("/projects")}>
            <Upload size={14} className="mr-1.5" />
            Upload Document
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {renderKpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={i}
          >
            <Card className="group hover:shadow-[var(--card-shadow-hover)] transition-all duration-200 relative overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-xl"
                    style={{ background: `${kpi.color}15`, color: kpi.color }}
                  >
                    <kpi.icon size={20} />
                  </div>
                </div>
                <p className="text-sm text-[var(--foreground-secondary)] mb-0.5">{kpi.label}</p>
                <p className="font-display text-2xl font-bold">{kpi.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Risk Score Trend</CardTitle>
                  <CardDescription>Average risk score over time</CardDescription>
                </div>
                <div className="flex items-center gap-1 bg-[var(--background-secondary)] rounded-lg p-0.5">
                  {["week", "month", "quarter"].map((p) => (
                    <button
                      key={p}
                      onClick={() => setSelectedPeriod(p)}
                      className={cn(
                        "px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize",
                        selectedPeriod === p
                          ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm"
                          : "text-[var(--foreground-tertiary)] hover:text-[var(--foreground)]"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={riskTrendData}>
                    <defs>
                      <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--critical)" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="var(--critical)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.4} />
                    <XAxis dataKey="name" stroke="var(--foreground-tertiary)" fontSize={12} tickLine={false} />
                    <YAxis stroke="var(--foreground-tertiary)" fontSize={12} tickLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px" }} />
                    <Area type="monotone" dataKey="score" stroke="var(--critical)" strokeWidth={2} fill="url(#riskGradient)" dot={{ fill: "var(--critical)", strokeWidth: 0, r: 3 }} activeDot={{ fill: "var(--critical)", strokeWidth: 2, stroke: "var(--background)", r: 5 }} />
                    <Line type="monotone" dataKey="baseline" stroke="var(--foreground-tertiary)" strokeWidth={1} strokeDasharray="4 4" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5}>
          <Card>
            <CardHeader>
              <CardTitle>Compliance Overview</CardTitle>
              <CardDescription>Score by framework</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={complianceData} layout="vertical" barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.4} />
                    <XAxis type="number" domain={[0, 100]} stroke="var(--foreground-tertiary)" fontSize={12} tickLine={false} />
                    <YAxis dataKey="name" type="category" stroke="var(--foreground-tertiary)" fontSize={12} tickLine={false} width={80} />
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px" }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {complianceData.map((entry) => (
                        <Cell key={entry.name} fill={entry.value >= 80 ? "var(--low)" : entry.value >= 60 ? "var(--high)" : "var(--critical)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Middle Row */}
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={6}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Risk Distribution</CardTitle>
              <CardDescription>Findings by severity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={riskDistData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                      {riskDistData.map((entry) => (<Cell key={entry.name} fill={entry.color} />))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: "13px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {riskDistData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                    <span className="text-xs text-[var(--foreground-secondary)]">{item.name}</span>
                    <span className="text-xs font-medium ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={8}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-[var(--background-secondary)] transition-colors text-left group"
                  >
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0" style={{ background: `${action.color}15`, color: action.color }}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{action.label}</p>
                      <p className="text-xs text-[var(--foreground-tertiary)]">{action.desc}</p>
                    </div>
                    <ArrowRight size={14} className="text-[var(--foreground-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 grid-cols-1">

        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={10}>
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Analyses</CardTitle>
                  <CardDescription>Latest from your projects</CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={() => navigate("/history")}>
                  View All <ArrowRight size={12} className="ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {recentAnalyses.length === 0 ? (
                <div className="p-8 text-center text-sm text-[var(--foreground-tertiary)]">
                  No analyses yet — upload a document to get started.
                </div>
              ) : (
                <div className="divide-y divide-[var(--border-soft)]">
                  {recentAnalyses.slice(0, 5).map((item) => ( 
                    <div
                    key={item.id}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--background-secondary)] transition-colors cursor-pointer"
                    onClick={() => navigate(`/analyses/${item.id}`)}
                  >
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: severityColors[item.status] || "var(--info)" }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.file}</p>
                      <p className="text-xs text-[var(--foreground-tertiary)]">{item.project} &middot; {item.date}</p>
                    </div>
                    <Badge severity={item.status as any}>{item.status}</Badge>
                  </div>
                   ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* AI Recommendations */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={11}>
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--brand)] via-[var(--cyber)] to-[var(--brand)]" />
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain size={18} className="text-[var(--brand)]" />
              <CardTitle>AI Recommendations</CardTitle>
              <Badge variant="default" className="ml-2">AI-Powered</Badge>
            </div>
            <CardDescription>Intelligent insights based on your security analysis data</CardDescription>
          </CardHeader>
          <CardContent>
            {recommendationsData.length === 0 ? (
              <div className="py-8 text-center text-sm text-[var(--foreground-tertiary)]">
                No recommendations yet — recommendations are generated from your analysis findings.
              </div>
            ) : (
              <div className="space-y-3">
                {recommendationsData.map((rec, i) => ( <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)] transition-colors">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--brand-subtle)] text-[var(--brand)] text-xs font-bold">{i + 1}</div>
                  <div className="flex-1"><p className="text-sm font-medium">{rec.text}</p></div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--critical-subtle)] text-[var(--critical)] font-medium">{rec.impact}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--background-tertiary)] text-[var(--foreground-secondary)]">{rec.effort}</span>
                  </div>
                </div> ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

const defaultKpis = [
  { icon: Gauge, label: "Risk Score", value: "—", change: "", trend: "neutral" as const, color: "var(--critical)" },
  { icon: CheckCircle2, label: "Compliance", value: "—", change: "", trend: "neutral" as const, color: "var(--low)" },
  { icon: FolderKanban, label: "Projects", value: "—", change: "", trend: "neutral" as const, color: "var(--cyber)" },
  { icon: Siren, label: "Findings", value: "—", change: "", trend: "neutral" as const, color: "var(--high)" },
];

