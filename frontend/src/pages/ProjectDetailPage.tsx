import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FolderKanban,
  FileText,
  Clock,
  AlertTriangle,
  Upload,
  MoreHorizontal,
  Download,
  Shield,
  CheckCircle2,
  BarChart3,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { MetricCard } from "../components/shared/MetricCard";
import { ErrorState } from "../components/shared/ErrorState";
import { EmptyState } from "../components/shared/EmptyState";
import { projectsApi, analysisApi } from "../lib/api";
import type { Project, AnalysisListItem } from "../types";
import { UploadModal } from "../components/UploadModal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu";

const severityColors: Record<string, string> = {
  Critical: "var(--critical)",
  High: "var(--high)",
  Medium: "var(--medium)",
  Low: "var(--low)",
};

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [analyses, setAnalyses] = useState<AnalysisListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const fetchData = async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const id = parseInt(projectId);
      const [proj, analysisList] = await Promise.all([
        projectsApi.get(id),
        analysisApi.listForProject(id),
      ]);
      setProject(proj);
      setAnalyses(analysisList);
    } catch (err: any) {
      setError(err.message || "Failed to load project");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, [projectId]);
    const handleExport = (format: "csv" | "pdf") => {
    if (project) projectsApi.exportReport(project.id, format);
  };
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">{Array.from({ length: 4 }).map((_, i) => (<Skeleton key={i} className="h-8 w-24 rounded-lg" />))}</div>
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => (<Skeleton key={i} className="h-28 rounded-xl" />))}</div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Failed to load project" description={error} onRetry={() => window.location.reload()} />;
  }

  if (!project) {
    return <ErrorState title="Project not found" description="The project you're looking for doesn't exist." />;
  }

  const criticalCount = analyses.filter((a) => a.risk_level === "Critical" || a.risk_level === "High").length;
  const avgRisk = analyses.length > 0 ? Math.round(analyses.reduce((s, a) => s + a.risk_score, 0) / analyses.length) : 0;
  const lastAnalysis = analyses.length > 0
    ? new Date(analyses[0].created_at).toLocaleDateString()
    : "No analyses yet";

  return (
    <div className="space-y-6">
      {/* Back button & header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/projects")}
          className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[var(--background-secondary)] transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold">{project.name}</h1>
          {project.description && (
            <p className="text-sm text-[var(--foreground-secondary)]">{project.description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={analyses.length === 0}>
                <Download size={14} className="mr-1.5" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("csv")}>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf")}>Export as PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" onClick={() => setUploadOpen(true)}>
            <Upload size={14} className="mr-1.5" /> Upload Document
          </Button>
        </div>
      </div>
      {project && (
        <UploadModal
          open={uploadOpen}
          onOpenChange={setUploadOpen}
          projectId={project.id}
          onUploaded={fetchData}
        />
      )}
      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <MetricCard icon={<FileText size={20} />} label="Total Analyses" value={String(analyses.length)} color="var(--cyber)" index={0} />
        <MetricCard icon={<AlertTriangle size={20} />} label="Critical/High" value={String(criticalCount)} color="var(--critical)" index={1} />
        <MetricCard icon={<BarChart3 size={20} />} label="Avg Risk Score" value={String(avgRisk)} color="var(--high)" index={2} />
        <MetricCard icon={<Clock size={20} />} label="Last Analysis" value={lastAnalysis} color="var(--brand)" index={3} />
      </div>

      {/* Analyses Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Analyses</CardTitle>
              <CardDescription>{analyses.length} analysis{analyses.length !== 1 ? "es" : ""} for this project</CardDescription>
            </div>
            <div className="flex items-center gap-1 bg-[var(--background-secondary)] rounded-lg p-0.5">
              {["All", "PDF", "DOCX", "TXT"].map((f) => (
                <button key={f} className="px-3 py-1 text-xs font-medium rounded-md transition-colors hover:bg-[var(--background)] hover:shadow-sm">{f}</button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {analyses.length === 0 ? (
            <EmptyState
              icon={<FolderKanban size={24} className="text-[var(--foreground-tertiary)]" />}
              title="No analyses yet"
              description="Upload a document to start your first AI security analysis for this project."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-left font-medium text-[var(--foreground-secondary)] pb-3 pr-4">File</th>
                    <th className="text-left font-medium text-[var(--foreground-secondary)] pb-3 pr-4">Type</th>
                    <th className="text-left font-medium text-[var(--foreground-secondary)] pb-3 pr-4">Risk Score</th>
                    <th className="text-left font-medium text-[var(--foreground-secondary)] pb-3 pr-4">Status</th>
                    <th className="text-left font-medium text-[var(--foreground-secondary)] pb-3 pr-4">Date</th>
                    <th className="text-right font-medium text-[var(--foreground-secondary)] pb-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {analyses.map((item, i) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.3 }}
                      className="border-b border-[var(--border-soft)] hover:bg-[var(--background-secondary)] transition-colors cursor-pointer"
                      onClick={() => navigate(`/analyses/${item.id}`)}
                    >
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <FileText size={14} className="text-[var(--foreground-tertiary)]" />
                          <span className="font-medium">{item.filename}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4"><Badge variant="subtle">{item.document_type.toUpperCase()}</Badge></td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-[var(--background-tertiary)] overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${item.risk_score}%`, background: severityColors[item.risk_level] || "var(--info)" }} />
                          </div>
                          <span className="text-xs font-mono">{item.risk_score}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4"><Badge severity={item.risk_level as any}>{item.risk_level}</Badge></td>
                      <td className="py-3 pr-4 text-[var(--foreground-secondary)]">{new Date(item.created_at).toLocaleDateString()}</td>
                      <td className="py-3 text-right">
                        <button className="p-1 rounded-md hover:bg-[var(--background-secondary)] transition-colors">
                          <MoreHorizontal size={14} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
