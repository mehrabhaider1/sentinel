import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  File,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { analysisApi } from "../lib/api";
interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  onUploaded?: () => void;
}

export function UploadModal({ open, onOpenChange, projectId, onUploaded }: UploadModalProps) {
  const [dragOver, setDragOver] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files).filter(
      (f) =>
        f.type === "application/pdf" ||
        f.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        f.type === "text/plain" ||
        f.name.endsWith(".pdf") ||
        f.name.endsWith(".docx") ||
        f.name.endsWith(".txt")
    );
    if (dropped.length) setFiles((prev) => [...prev, ...dropped]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    setUploading(true);
    
    setError(null);
    try {
      for (let i = 0; i < files.length; i++) {
        await analysisApi.analyze(projectId, files[i]);
        setProgress(Math.round(((i + 1) / files.length) * 100));
      }
      setUploading(false);
      setUploaded(true);
      onUploaded?.();
      setTimeout(() => {
        onOpenChange(false);
        setFiles([]);
        setUploaded(false);
        setProgress(0);
      }, 1200);
    } catch (err: any) {
      setUploading(false);
      setError(err.message || "Upload failed. Please try again.");
     }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a security document for AI analysis. Supports PDF, DOCX, and TXT files.
          </DialogDescription>
        </DialogHeader>
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--critical-subtle)] text-[var(--critical)] text-sm">
              <AlertTriangle size={16} className="shrink-0" />
              {error}
            </div>
          )}
        {uploading || uploaded ? (
          <div className="py-8 text-center space-y-4">
            {uploaded ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
              >
                <CheckCircle2 size={48} className="text-[var(--brand)] mx-auto" />
              </motion.div>
            ) : (
              <Loader2 size={48} className="text-[var(--brand)] mx-auto animate-spin" />
            )}
            <p className="text-sm font-medium">
              {uploaded ? "Analysis Complete!" : "Analyzing document..."}
            </p>
            {!uploaded && (
              <div className="w-full bg-[var(--background-tertiary)] rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-[var(--brand)] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}
            <p className="text-xs text-[var(--foreground-tertiary)]">
              {uploaded
                ? "Redirecting to analysis..."
                : `Processing ${files.length} file${files.length > 1 ? "s" : ""}...`}
            </p>
          </div>
        ) : files.length > 0 ? (
          <div className="space-y-3 py-4">
            {files.map((file, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-[var(--background-secondary)]"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[var(--brand-subtle)] text-[var(--brand)]">
                  <FileText size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-[var(--foreground-tertiary)]">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <button
                  onClick={() => removeFile(i)}
                  className="p-1 rounded-md hover:bg-[var(--background-tertiary)] text-[var(--foreground-tertiary)]"
                >
                  <X size={14} />
                </button>
              </motion.div>
            ))}
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setFiles([])}>
                Clear
              </Button>
              <Button className="flex-1" onClick={handleUpload}>
                Analyze {files.length > 1 ? `${files.length} Files` : "Document"}
              </Button>
            </div>
          </div>
        ) : (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "relative py-12 text-center border-2 border-dashed rounded-xl transition-all duration-200 cursor-pointer group",
              dragOver
                ? "border-[var(--brand)] bg-[var(--brand-subtle)]"
                : "border-[var(--border)] hover:border-[var(--brand)]/50 hover:bg-[var(--background-secondary)]"
            )}
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            <input
              id="file-upload"
              type="file"
              className="hidden"
              multiple
              accept=".pdf,.docx,.txt"
              onChange={handleFileSelect}
            />
            <motion.div
              animate={dragOver ? { y: -8, scale: 1.1 } : {}}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <Upload
                size={36}
                className={cn(
                  "mx-auto mb-3 transition-colors",
                  dragOver ? "text-[var(--brand)]" : "text-[var(--foreground-tertiary)] group-hover:text-[var(--brand)]"
                )}
              />
            </motion.div>
            <p className="text-sm font-medium mb-1">
              {dragOver ? "Drop files here" : "Drag & drop files here"}
            </p>
            <p className="text-xs text-[var(--foreground-tertiary)]">
              or click to browse &middot; PDF, DOCX, TXT
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
