import { cn } from "../../lib/utils";
import type { Severity } from "../../types";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "subtle";
  severity?: Severity;
}

const severityStyles: Record<string, { bg: string; text: string; dot: string }> = {
  Critical: { bg: "bg-[var(--critical-subtle)]", text: "text-[var(--critical)]", dot: "bg-[var(--critical)]" },
  High: { bg: "bg-[var(--high-subtle)]", text: "text-[var(--high)]", dot: "bg-[var(--high)]" },
  Medium: { bg: "bg-[var(--medium-subtle)]", text: "text-[var(--medium)]", dot: "bg-[var(--medium)]" },
  Low: { bg: "bg-[var(--low-subtle)]", text: "text-[var(--low)]", dot: "bg-[var(--low)]" },
};

export function Badge({
  className,
  variant = "default",
  severity,
  children,
  ...props
}: BadgeProps) {
  const sev = severity ? severityStyles[severity] : null;

  if (sev && variant !== "outline") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-md",
          sev.bg,
          sev.text,
          className
        )}
        {...props}
      >
        <span className={cn("w-1.5 h-1.5 rounded-full", sev.dot)} />
        {children}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-md border",
        variant === "outline" && "border-[var(--border)] text-[var(--foreground-secondary)]",
        variant === "subtle" && "bg-[var(--background-secondary)] text-[var(--foreground-secondary)] border-transparent",
        variant === "default" && "bg-[var(--brand-subtle)] text-[var(--brand)] border-transparent",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
