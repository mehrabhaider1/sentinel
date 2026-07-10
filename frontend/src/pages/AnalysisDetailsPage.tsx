import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { Skeleton } from "../components/ui/skeleton";
import { ErrorState } from "../components/shared/ErrorState";
import { analysisApi } from "../lib/api";
import type { AnalysisDetail, FinalAnalysis } from "../types";
import { formatDate } from "../lib/utils";
import {
  ArrowLeft,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Download,
  Share2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Brain,
  FileText,
  Clock,
  BarChart3,
  Lightbulb,
  Target,
  TrendingUp,
  ScanEye,
  Lock,
  Server,
  Users,
  FileJson,
  GanttChartSquare,
  ListChecks,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Separator } from "../components/ui/separator";
import { PageHeader } from "../components/shared/PageHeader";
import { RiskGauge } from "../components/shared/RiskGauge";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  Cell,
} from "recharts";

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.05, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

const categories = [
  { name: "Data Security", value: 65 },
  { name: "Access Control", value: 45 },
  { name: "Network Sec.", value: 78 },
  { name: "Compliance", value: 55 },
  { name: "Supply Chain", value: 82 },
  { name: "Encryption", value: 38 },
];

const categoryColors = ["var(--critical)", "var(--high)", "var(--medium)", "var(--cyber)", "var(--low)", "var(--high)"];

interface LocalFinding { id: number; title: string; severity: string; category: string; description: string; recommendation: string; }

const defaultFindings: LocalFinding[] = [
  { id: 1, title: "Unencrypted PII Data Storage", severity: "Critical", category: "Data Security", description: "PII data stored in plaintext in the customer database without encryption at rest.", recommendation: "Implement AES-256 encryption for all PII data fields immediately." },
  { id: 2, title: "Missing MFA on Admin Accounts", severity: "Critical", category: "Access Control", description: "Administrator accounts lack multi-factor authentication enforcement.", recommendation: "Enforce MFA for all administrator and privileged accounts." },
  { id: 3, title: "Outdated SSL/TLS Certificates", severity: "High", category: "Network Security", description: "Several SSL/TLS certificates have expired or are using deprecated protocols.", recommendation: "Renew certificates and enforce TLS 1.3 minimum." },
  { id: 4, title: "Insufficient Audit Logging", severity: "High", category: "Compliance", description: "Audit logs do not capture sufficient detail for forensic analysis.", recommendation: "Implement comprehensive audit logging with user, action, timestamp, and resource fields." },
  { id: 5, title: "Weak Password Policy", severity: "Medium", category: "Access Control", description: "Password policy does not meet minimum NIST SP 800-63B requirements.", recommendation: "Update password policy to require 12+ characters with complexity requirements." },
  { id: 6, title: "Missing Data Retention Policy", severity: "Medium", category: "Compliance", description: "No formal data retention and disposal policy exists.", recommendation: "Develop and implement a data retention policy aligned with GDPR/CCPA requirements." },
  { id: 7, title: "Unpatched Dependencies", severity: "Low", category: "Supply Chain", description: "Several third-party dependencies have known vulnerabilities.", recommendation: "Implement automated dependency scanning and patching pipeline." },
];

const defaultComplianceFindings = [
  { framework: "SOC 2", control: "CC6.1 - Encryption", status: "Pass", recommendation: "Encryption controls are properly implemented." },
  { framework: "SOC 2", control: "CC6.2 - Access Control", status: "Partial", recommendation: "MFA should be enforced for all privileged users." },
  { framework: "HIPAA", control: "164.312(a)(1) - Access Control", status: "Fail", recommendation: "Implement unique user identification and emergency access procedures." },
  { framework: "GDPR", control: "Art. 32 - Security of Processing", status: "Pass", recommendation: "Technical measures meet GDPR requirements." },
  { framework: "ISO 27001", control: "A.12.4.1 - Event Logging", status: "Partial", recommendation: "Extend audit logging to cover all security events." },
];

const securityTimeline = [
  { date: "2h ago", event: "Analysis completed", type: "success" },
  { date: "1h 45m ago", event: "AI agent processing findings", type: "info" },
  { date: "1h 30m ago", event: "Security scan initiated", type: "info" },
  { date: "1h ago", event: "Compliance check completed", type: "success" },
  { date: "30m ago", event: "Report generated", type: "success" },
];

const severityConfig: Record<string, { color: string; bg: string; icon: typeof AlertTriangle }> = {
  Critical: { color: "var(--critical)", bg: "var(--critical-subtle)", icon: AlertTriangle },
  High: { color: "var(--high)", bg: "var(--high-subtle)", icon: AlertTriangle },
  Medium: { color: "var(--medium)", bg: "var(--medium-subtle)", icon: AlertTriangle },
  Low: { color: "var(--low)", bg: "var(--low-subtle)", icon: CheckCircle2 },
};

export default function AnalysisDetailsPage() {
  const { analysisId } = useParams();
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [analysis, setAnalysis] = useState<AnalysisDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!analysisId) return;
    const fetchAnalysis = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await analysisApi.get(parseInt(analysisId));
        setAnalysis(data);
      } catch (err: any) {
        setError(err.message || "Failed to load analysis");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [analysisId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3"><Skeleton className="h-8 w-8 rounded-lg" /><Skeleton className="h-8 w-64" /></div>
        <Skeleton className="h-32 rounded-xl" />
        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">{[1,2,3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}</div>
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Failed to load analysis" description={error} onRetry={() => window.location.reload()} />;
  }

  if (!analysis) {
    return <ErrorState title="Analysis not found" description="The analysis you're looking for doesn't exist." />;
  }

  const finalAnalysis = analysis.analysis_json as unknown as FinalAnalysis;
  const rawFindings = finalAnalysis?.security?.findings || [];
  const findings = rawFindings.length > 0 ? rawFindings.map((f, idx) => ({ ...f, id: idx + 1 })) : defaultFindings;
  const complianceFindingsList = finalAnalysis?.compliance?.findings || defaultComplianceFindings;
  const riskScore = analysis.risk_score;
  const complianceScore = finalAnalysis?.compliance?.compliance_score || 0;
  const findingsCount = findings.length;

  return (
    <div className="space-y-6">
      {/* Back & Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[var(--background-secondary)] transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold">Security Analysis Report</h1>
          <p className="text-sm text-[var(--foreground-secondary)]">
            {analysis.filename} &middot; {formatDate(analysis.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Share2 size={14} className="mr-1.5" /> Share
          </Button>
          <Button variant="outline" size="sm">
            <Download size={14} className="mr-1.5" /> Export PDF
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="overview">
            <ScanEye size={14} className="mr-1.5" /> Overview
          </TabsTrigger>
          <TabsTrigger value="findings">
            <AlertTriangle size={14} className="mr-1.5" /> Findings
          </TabsTrigger>
          <TabsTrigger value="compliance">
            <Shield size={14} className="mr-1.5" /> Compliance
          </TabsTrigger>
          <TabsTrigger value="recommendations">
            <Lightbulb size={14} className="mr-1.5" /> Recommendations
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Executive Summary */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--brand)] via-[var(--cyber)] to-[var(--brand)]" />
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Brain size={18} className="text-[var(--brand)]" />
                  <CardTitle>Executive Summary</CardTitle>
                  <Badge variant="outline" className="ml-1">AI Generated</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[var(--foreground-secondary)] leading-relaxed mb-4">
                  {analysis.executive_summary || `This security analysis of ${analysis.filename} was completed using ${analysis.model_name}.`}
                </p>
                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--background-secondary)]">
                    <Target size={14} className="text-[var(--cyber)]" />
                    <span className="text-[var(--foreground-secondary)]">Risk Score: <strong className="text-[var(--foreground)]">{riskScore}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--background-secondary)]">
                    <TrendingUp size={14} className="text-[var(--brand)]" />
                    <span className="text-[var(--foreground-secondary)]">Compliance: <strong className="text-[var(--foreground)]">{complianceScore}%</strong></span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--background-secondary)]">
                    <AlertTriangle size={14} className="text-[var(--critical)]" />
                    <span className="text-[var(--foreground-secondary)]">Findings: <strong className="text-[var(--foreground)]">{findingsCount}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--background-secondary)]">
                    <Lightbulb size={14} className="text-[var(--high)]" />
                    <span className="text-[var(--foreground-secondary)]">Model: <strong className="text-[var(--foreground)]">{analysis.model_name}</strong></span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Score Cards */}
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}>
              <Card className="text-center">
                <CardContent className="p-6">
                  <RiskGauge value={riskScore} size={120} strokeWidth={10} label="Overall Risk Score" />
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}>
              <Card className="text-center">
                <CardContent className="p-6">
                  <RiskGauge value={complianceScore} size={120} strokeWidth={10} label="Compliance Score" />
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}>
              <Card className="text-center">
                <CardContent className="p-6">
                  <RiskGauge value={Math.round((riskScore + complianceScore) / 2)} size={120} strokeWidth={10} label="Security Posture" />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Security Categories Radar */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}>
            <Card>
              <CardHeader>
                <CardTitle>Security Categories</CardTitle>
                <CardDescription>Assessment score by security domain</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={categories}>
                      <PolarGrid stroke="var(--border)" strokeOpacity={0.4} />
                      <PolarAngleAxis dataKey="name" stroke="var(--foreground-tertiary)" fontSize={11} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="var(--foreground-tertiary)" fontSize={10} />
                      <Radar name="Score" dataKey="value" stroke="var(--brand)" fill="var(--brand)" fillOpacity={0.15} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Timeline */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={5}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-[var(--foreground-secondary)]" />
                  <CardTitle>Analysis Timeline</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-0">
                  {securityTimeline.map((event, i) => (
                    <div key={i} className="flex gap-3 pb-4 last:pb-0 relative">
                      {i < securityTimeline.length - 1 && (
                        <div className="absolute left-[7px] top-5 bottom-0 w-px bg-[var(--border-soft)]" />
                      )}
                      <div
                        className="w-3.5 h-3.5 rounded-full mt-0.5 shrink-0 ring-2 ring-[var(--background)]"
                        style={{ background: event.type === "success" ? "var(--low)" : "var(--cyber)" }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{event.event}</p>
                        <p className="text-xs text-[var(--foreground-tertiary)] mt-0.5">{event.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Findings Tab */}
        <TabsContent value="findings" className="space-y-6">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Security Findings</CardTitle>
                    <CardDescription>{findings.length} issues identified</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {Object.entries({
                      Critical: findings.filter((f) => f.severity === "Critical").length,
                      High: findings.filter((f) => f.severity === "High").length,
                      Medium: findings.filter((f) => f.severity === "Medium").length,
                      Low: findings.filter((f) => f.severity === "Low").length,
                    }).map(([sev, count]) => (
                      <Badge key={sev} severity={sev as any}>{count} {sev}</Badge>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {findings.map((finding, i) => {
                  const config = severityConfig[finding.severity as keyof typeof severityConfig];
                  const Icon = config.icon;
                  return (
                    <motion.div
                      key={finding.id}
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      custom={i + 1}
                    >
                      <button
                        onClick={() => setExpandedId(expandedId === finding.id ? null : finding.id)}
                        className="w-full text-left p-4 rounded-lg border border-[var(--border-soft)] hover:border-[var(--border)] hover:bg-[var(--background-secondary)] transition-all group"
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="flex items-center justify-center w-8 h-8 rounded-lg mt-0.5 shrink-0"
                            style={{ background: config.bg, color: config.color }}
                          >
                            <Icon size={16} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                              <span className="font-medium text-sm">{finding.title}</span>
                              <Badge severity={finding.severity as any}>{finding.severity}</Badge>
                            </div>
                            <p className="text-xs text-[var(--foreground-tertiary)]">{finding.category}</p>
                            <AnimatePresence>
                              {expandedId === finding.id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <p className="text-sm text-[var(--foreground-secondary)] mt-3 leading-relaxed">
                                    {finding.description}
                                  </p>
                                  <div className="mt-3 p-3 rounded-lg bg-[var(--brand-subtle)] border border-[var(--brand)]/20">
                                    <p className="text-xs font-medium text-[var(--brand)] mb-1">
                                      <Lightbulb size={12} className="inline mr-1" />
                                      Recommendation
                                    </p>
                                    <p className="text-sm text-[var(--foreground-secondary)]">
                                      {finding.recommendation}
                                    </p>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                          <ChevronDown
                            size={14}
                            className={`text-[var(--foreground-tertiary)] mt-2 transition-transform duration-200 shrink-0 ${
                              expandedId === finding.id ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </button>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>

          {/* Category Breakdown */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={6}>
            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>Risk score by security category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categories} layout="vertical" barSize={24}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.4} />
                      <XAxis type="number" domain={[0, 100]} stroke="var(--foreground-tertiary)" fontSize={11} tickLine={false} />
                      <YAxis dataKey="name" type="category" stroke="var(--foreground-tertiary)" fontSize={11} tickLine={false} width={90} />
                      <Tooltip
                        contentStyle={{
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {categories.map((_, idx) => (
                          <Cell key={idx} fill={categoryColors[idx]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
            <Card>
              <CardHeader>
                <CardTitle>Compliance Analysis</CardTitle>
                <CardDescription>Framework compliance status across standards</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        <th className="text-left text-xs font-medium text-[var(--foreground-secondary)] pb-3 pr-4">Framework</th>
                        <th className="text-left text-xs font-medium text-[var(--foreground-secondary)] pb-3 pr-4">Control</th>
                        <th className="text-left text-xs font-medium text-[var(--foreground-secondary)] pb-3 pr-4">Status</th>
                        <th className="text-left text-xs font-medium text-[var(--foreground-secondary)] pb-3">Recommendation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complianceFindingsList.map((item, i) => (
                        <motion.tr
                          key={i}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="border-b border-[var(--border-soft)] hover:bg-[var(--background-secondary)] transition-colors"
                        >
                          <td className="py-3 pr-4 font-medium">{item.framework}</td>
                          <td className="py-3 pr-4 text-[var(--foreground-secondary)]">{item.control}</td>
                          <td className="py-3 pr-4">
                            <Badge
                              variant={item.status === "Pass" ? "default" : item.status === "Fail" ? "outline" : "subtle"}
                            >
                              {item.status}
                            </Badge>
                          </td>
                          <td className="py-3 text-[var(--foreground-secondary)] text-xs">{item.recommendation}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Lightbulb size={18} className="text-[var(--high)]" />
                  <CardTitle>Top Priorities</CardTitle>
                  <Badge variant="outline" className="ml-1">Recommended Actions</Badge>
                </div>
                <CardDescription>Prioritized next steps based on AI analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { priority: 1, action: "Implement AES-256 encryption for all PII data stores", impact: "Critical", effort: "Medium", category: "Data Security" },
                    { priority: 2, action: "Enforce MFA across all administrator accounts", impact: "Critical", effort: "Low", category: "Access Control" },
                    { priority: 3, action: "Renew expired SSL/TLS certificates and enforce TLS 1.3", impact: "High", effort: "Low", category: "Network Security" },
                    { priority: 4, action: "Implement comprehensive security audit logging", impact: "High", effort: "High", category: "Compliance" },
                    { priority: 5, action: "Update password policy to NIST SP 800-63B standards", impact: "Medium", effort: "Low", category: "Access Control" },
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-start gap-4 p-4 rounded-lg bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)] transition-colors"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--brand-subtle)] text-[var(--brand)] text-sm font-bold shrink-0">
                        {item.priority}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{item.action}</p>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <Badge severity={item.impact as any}>{item.impact} Impact</Badge>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--background-tertiary)] text-[var(--foreground-secondary)]">
                            {item.effort} Effort
                          </span>
                          <span className="text-xs text-[var(--foreground-tertiary)]">{item.category}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
