import { motion } from "framer-motion";
import { FileSearch } from "lucide-react";
import { cn } from "../../lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        className
      )}
    >
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--background-secondary)] mb-4"
      >
        {icon || <FileSearch size={28} className="text-[var(--foreground-tertiary)]" />}
      </motion.div>
      <h3 className="font-display text-lg font-semibold mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-[var(--foreground-secondary)] max-w-sm mb-6">
          {description}
        </p>
      )}
      {action}
    </motion.div>
  );
}
