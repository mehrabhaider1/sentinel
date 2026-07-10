import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: { value: string; direction: "up" | "down" };
  color?: string;
  index?: number;
  onClick?: () => void;
}

export function MetricCard({
  icon,
  label,
  value,
  trend,
  color = "var(--brand)",
  index = 0,
  onClick,
}: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.25, 0.1, 0.25, 1] }}
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 transition-all duration-200 hover:shadow-[var(--card-shadow-hover)]",
        onClick && "cursor-pointer"
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-xl"
          style={{ background: `${color}15`, color }}
        >
          {icon}
        </div>
        {trend && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full",
              trend.direction === "down"
                ? "bg-[var(--low-subtle)] text-[var(--low)]"
                : trend.direction === "up"
                ? "bg-[var(--critical-subtle)] text-[var(--critical)]"
                : "bg-[var(--background-secondary)] text-[var(--foreground-secondary)]"
            )}
          >
            <span>{trend.direction === "up" ? "↑" : "↓"}</span>
            {trend.value}
          </span>
        )}
      </div>
      <p className="text-sm text-[var(--foreground-secondary)] mb-0.5">{label}</p>
      <p className="font-display text-2xl font-bold">{value}</p>
    </motion.div>
  );
}
