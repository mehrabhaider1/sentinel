import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FileText,
  Search,
  Filter,
  Download,
  ChevronDown,
  ArrowUpDown,
  MoreHorizontal,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { PageHeader } from "../components/shared/PageHeader";
import { EmptyState } from "../components/shared/EmptyState";
import { ErrorState } from "../components/shared/ErrorState";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "../components/ui/dropdown-menu";
import { cn, formatDate } from "../lib/utils";
import { analysisApi } from "../lib/api";
import type { AnalysisListItem } from "../types";

const severityColors: Record<string, string> = {
  Critical: "var(--critical)",
  High: "var(--high)",
  Medium: "var(--medium)",
  Low: "var(--low)",
};

export default function HistoryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<string>("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // API state
  const [analyses, setAnalyses] = useState<AnalysisListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const perPage = 10;

  const fetchAnalyses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await analysisApi.listAll();
      setAnalyses(data);
    } catch (err: any) {
      setError(err.message || "Failed to load analyses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, []);
  // Re-sync if ?q= changes while already mounted on /history (e.g. user
  // searches again from the Topbar without leaving the page) — React Router
  // won't remount this component for a same-route navigation.
  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null) {
      setSearch(q);
      setPage(1);
    }
  }, [searchParams]);
  let filtered = analyses.filter(
    (h) =>
      (h.filename.toLowerCase().includes(search.toLowerCase())) &&
      (!statusFilter || h.risk_level === statusFilter)
  );

  filtered.sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortField === "risk") return (a.risk_score - b.risk_score) * dir;
    return 0;
  });

  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const toggleSort = (field: string) => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      await analysisApi.remove(id);
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
    } catch (err: any) {
      console.error("Failed to delete:", err);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Analysis History" description="View and manage all your security document analyses" />
        <Card className="p-4 space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-8 ml-auto" />
            </div>
          ))}
        </Card>
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Failed to load analyses" description={error} onRetry={fetchAnalyses} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analysis History"
        description={`${analyses.length} analysis${analyses.length !== 1 ? "es" : ""} — View and manage your security document analyses`}
      >
        <Button variant="outline" size="sm">
          <Download size={14} className="mr-1.5" /> Export CSV
        </Button>
      </PageHeader>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-3"
      >
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-tertiary)]" />
          <input
            type="text"
            placeholder="Search by filename..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter size={14} className="mr-1.5" />
                {statusFilter || "Status"}
                <ChevronDown size={12} className="ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => { setStatusFilter(null); setPage(1); }}>All Statuses</DropdownMenuItem>
              {["Critical", "High", "Medium", "Low"].map((s) => (
                <DropdownMenuItem key={s} onClick={() => { setStatusFilter(s); setPage(1); }}>{s}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <span className="text-xs text-[var(--foreground-tertiary)] whitespace-nowrap">
            <span className="font-medium text-[var(--foreground-secondary)]">{filtered.length}</span> results
          </span>
        </div>
      </motion.div>

      {/* Table */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FileText size={28} className="text-[var(--foreground-tertiary)]" />}
            title={search ? "No analyses found" : "No analyses yet"}
            description={search ? "Try a different search or filter" : "Upload a document to start your first analysis"}
            action={
              !search ? <Button><FileText size={14} className="mr-1.5" /> Upload Document</Button> : undefined
            }
          />
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left font-medium text-[var(--foreground-secondary)] p-4 pr-4">
                    <button onClick={() => toggleSort("filename")} className="flex items-center gap-1 hover:text-[var(--foreground)]">
                      Filename <ArrowUpDown size={12} />
                    </button>
                  </th>
                  <th className="text-left font-medium text-[var(--foreground-secondary)] p-4 pr-4">Type</th>
                  <th className="text-left font-medium text-[var(--foreground-secondary)] p-4 pr-4">
                    <button onClick={() => toggleSort("risk")} className="flex items-center gap-1 hover:text-[var(--foreground)]">
                      Risk Score <ArrowUpDown size={12} />
                    </button>
                  </th>
                  <th className="text-left font-medium text-[var(--foreground-secondary)] p-4 pr-4">Status</th>
                  <th className="text-left font-medium text-[var(--foreground-secondary)] p-4 pr-4">Date</th>
                  <th className="text-right font-medium text-[var(--foreground-secondary)] p-4"></th>
                </tr>
              </thead>
              <tbody>
                {paged.map((item, i) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-[var(--border-soft)] hover:bg-[var(--background-secondary)] transition-colors cursor-pointer group"
                    onClick={() => navigate(`/analyses/${item.id}`)}
                  >
                    <td className="p-4 pr-4">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-[var(--foreground-tertiary)]" />
                        <span className="font-medium">{item.filename}</span>
                      </div>
                    </td>
                    <td className="p-4 pr-4"><Badge variant="subtle">{item.document_type.toUpperCase()}</Badge></td>
                    <td className="p-4 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-[var(--background-tertiary)] overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${item.risk_score}%`, background: severityColors[item.risk_level] || "var(--info)" }} />
                        </div>
                        <span className="text-xs font-mono">{item.risk_score}</span>
                      </div>
                    </td>
                    <td className="p-4 pr-4"><Badge severity={item.risk_level as any}>{item.risk_level}</Badge></td>
                    <td className="p-4 pr-4 text-[var(--foreground-secondary)]">{formatDate(item.created_at)}</td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-1 rounded-md hover:bg-[var(--background-secondary)] transition-colors" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal size={14} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/analyses/${item.id}`)}>
                            <Eye size={14} className="mr-2" /> View Analysis
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download size={14} className="mr-2" /> Export Report
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-[var(--critical)]"
                            onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                            disabled={deleting === item.id}
                          >
                            {deleting === item.id ? <Loader2 size={14} className="animate-spin mr-2" /> : <Trash2 size={14} className="mr-2" />}
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--foreground-tertiary)]">
          Showing <span className="font-medium text-[var(--foreground-secondary)]">{(page - 1) * perPage + 1}</span> to{" "}
          <span className="font-medium text-[var(--foreground-secondary)]">{Math.min(page * perPage, filtered.length)}</span> of{" "}
          <span className="font-medium text-[var(--foreground-secondary)]">{filtered.length}</span> results
        </span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="w-8 h-8" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft size={14} />
          </Button>
          {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={cn("w-8 h-8 text-xs rounded-lg transition-colors", page === i + 1 ? "bg-[var(--brand)] text-white" : "text-[var(--foreground-secondary)] hover:bg-[var(--background-secondary)]")}
            >
              {i + 1}
            </button>
          ))}
          <Button variant="ghost" size="icon" className="w-8 h-8" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            <ChevronRight size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
}
