import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FolderKanban,
  Plus,
  Search,
  Grid3X3,
  List,
  MoreHorizontal,
  FileText,
  Clock,
  ArrowUpRight,
  Trash2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { SkeletonCard } from "../components/ui/skeleton";
import { PageHeader } from "../components/shared/PageHeader";
import { EmptyState } from "../components/shared/EmptyState";
import { ErrorState } from "../components/shared/ErrorState";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { cn } from "../lib/utils";
import { projectsApi } from "../lib/api";
import type { Project } from "../types";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.05, ease: [0.25, 0.1, 0.25, 1] },
  }),
};

export default function ProjectsPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);

  // API state
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectsApi.list();
      setProjects(data);
    } catch (err: any) {
      setError(err.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setSubmitting(true);
    try {
      const created = await projectsApi.create({ name: newName, description: newDesc || undefined });
      setProjects((prev) => [created, ...prev]);
      setCreateOpen(false);
      setNewName("");
      setNewDesc("");
    } catch (err: any) {
      console.error("Failed to create project:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      await projectsApi.remove(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      console.error("Failed to delete project:", err);
    } finally {
      setDeleting(null);
      setDeleteDialog(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Projects" description="Manage your security analysis projects" />
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Failed to load projects" description={error} onRetry={fetchProjects} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description={`${projects.length} project${projects.length !== 1 ? "s" : ""} — Manage your security analysis projects`}
      >
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus size={14} className="mr-1.5" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Project</DialogTitle>
              <DialogDescription>Create a new project to organize your security analyses.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <label className="block text-sm font-medium mb-1.5">Project Name *</label>
                <Input
                  placeholder="e.g. Infrastructure Security"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Description</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm placeholder:text-[var(--foreground-tertiary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] resize-none"
                  placeholder="Describe the project's purpose..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={submitting || !newName.trim()}>
                {submitting ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
                Create Project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Filters & Search */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
        custom={1}
        className="flex flex-col sm:flex-row items-start sm:items-center gap-3"
      >
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-tertiary)]" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm placeholder:text-[var(--foreground-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[var(--background-secondary)] rounded-lg p-0.5">
            <button
              onClick={() => setView("grid")}
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-md transition-colors",
                view === "grid" ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm" : "text-[var(--foreground-tertiary)] hover:text-[var(--foreground)]"
              )}
            >
              <Grid3X3 size={14} />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-md transition-colors",
                view === "list" ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm" : "text-[var(--foreground-tertiary)] hover:text-[var(--foreground)]"
              )}
            >
              <List size={14} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-[var(--foreground-tertiary)] ml-auto">
          <span className="font-medium text-[var(--foreground-secondary)]">{filtered.length}</span> project{filtered.length !== 1 ? "s" : ""}
        </div>
      </motion.div>

      {/* Content */}
      {filtered.length === 0 && !loading ? (
        <EmptyState
          icon={<FolderKanban size={28} className="text-[var(--foreground-tertiary)]" />}
          title={search ? "No projects found" : "No projects yet"}
          description={search ? "Try a different search term" : "Create your first project to get started with security analysis"}
          action={
            !search ? <Button onClick={() => setCreateOpen(true)}><Plus size={14} className="mr-1.5" /> Create Project</Button> : undefined
          }
        />
      ) : view === "grid" ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project, i) => (
            <motion.div
              key={project.id}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              custom={i + 2}
            >
              <Card
                className="group cursor-pointer hover:shadow-[var(--card-shadow-hover)] hover:border-[var(--brand)]/30 transition-all duration-200 h-full"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--brand-subtle)] text-[var(--brand)]">
                      <FolderKanban size={20} />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteDialog(project.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-[var(--background-secondary)] text-[var(--foreground-tertiary)] hover:text-[var(--critical)]"
                    >
                      <MoreHorizontal size={14} />
                    </button>
                  </div>

                  <h3 className="font-display font-semibold mb-1 group-hover:text-[var(--brand)] transition-colors">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-sm text-[var(--foreground-secondary)] line-clamp-2 mb-4 flex-1">
                      {project.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-[var(--foreground-tertiary)]">
                    <span className="flex items-center gap-1">
                      <FileText size={12} />
                      ID: {project.id}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--border-soft)]">
                    <span className="text-xs text-[var(--foreground-tertiary)]">
                      Updated {new Date(project.updated_at).toLocaleDateString()}
                    </span>
                    <Badge variant="default">Active</Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card>
          <div className="divide-y divide-[var(--border-soft)]">
            {filtered.map((project, i) => (
              <motion.div
                key={project.id}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={i + 2}
                className="flex items-center gap-4 p-4 hover:bg-[var(--background-secondary)] transition-colors cursor-pointer group"
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[var(--brand-subtle)] text-[var(--brand)] shrink-0">
                  <FolderKanban size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{project.name}</p>
                  {project.description && (
                    <p className="text-xs text-[var(--foreground-tertiary)] truncate">{project.description}</p>
                  )}
                </div>
                <div className="hidden sm:flex items-center gap-4 text-xs text-[var(--foreground-secondary)]">
                  <span>ID: {project.id}</span>
                  <span>{new Date(project.created_at).toLocaleDateString()}</span>
                </div>
                <Badge variant="default">Active</Badge>
                <ArrowUpRight size={14} className="text-[var(--foreground-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Delete Dialog */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this project? This action cannot be undone.
              All associated analyses will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--critical-subtle)] border border-[var(--critical)]/20">
            <AlertTriangle size={16} className="text-[var(--critical)] shrink-0" />
            <p className="text-xs text-[var(--critical)]">
              This will permanently delete all analyses and data associated with this project.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={deleting === deleteDialog}
              onClick={() => deleteDialog && handleDelete(deleteDialog)}
            >
              {deleting === deleteDialog ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
              Delete Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
