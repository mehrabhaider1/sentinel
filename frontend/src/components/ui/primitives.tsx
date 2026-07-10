import React, { useEffect, useState } from "react";
import { AlertTriangle, Activity, CheckCircle2 } from "lucide-react";
import clsx from "clsx";
import type { Severity } from "../../types";

export const Card = ({
  className = "",
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={clsx(
      "bg-[var(--panel)] border border-[var(--border)] rounded-xl",
      className
    )}
    {...rest}
  >
    {children}
  </div>
);

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = ({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: ButtonProps) => {
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-[var(--brand)] text-[var(--brand-ink)] hover:brightness-110 font-semibold",
    secondary:
      "bg-[var(--panel-3)] text-[var(--text-hi)] hover:bg-[#262c3a] border border-[var(--border)]",
    ghost: "text-[var(--text-mid)] hover:text-[var(--text-hi)] hover:bg-[var(--panel-2)]",
    danger:
      "bg-[var(--critical)]/10 text-[var(--critical)] hover:bg-[var(--critical)]/20 border border-[var(--critical)]/30",
  };
  const sizes: Record<ButtonSize, string> = {
    sm: "text-xs px-2.5 py-1.5 gap-1.5",
    md: "text-sm px-3.5 py-2 gap-2",
    lg: "text-sm px-5 py-2.5 gap-2",
  };
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-lg transition-all duration-150 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
};

export const levelColor = (level?: Severity | string) =>
  ({
    Critical: "var(--critical)",
    High: "var(--high)",
    Medium: "var(--medium)",
    Low: "var(--low)",
  } as Record<string, string>)[level ?? ""] || "var(--info)";

export const Badge = ({
  level,
  children,
  className = "",
}: {
  level?: Severity | string;
  children: React.ReactNode;
  className?: string;
}) => {
  const color = level ? levelColor(level) : "var(--info)";
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-md font-mono",
        className
      )}
      style={{ color, background: `${color}1A`, border: `1px solid ${color}33` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {children}
    </span>
  );
};

export const StatusPill = ({ status }: { status: string }) => {
  const map: Record<string, { c: string; icon: typeof AlertTriangle }> = {
    "Action Required": { c: "var(--critical)", icon: AlertTriangle },
    "In Review": { c: "var(--medium)", icon: Activity },
    Resolved: { c: "var(--low)", icon: CheckCircle2 },
  };
  const { c, icon: Icon } = map[status] || map["In Review"];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color: c }}>
      <Icon size={13} /> {status}
    </span>
  );
};

export const RadialScore = ({
  value,
  size = 96,
  stroke = 8,
  sub,
}: {
  value: number;
  size?: number;
  stroke?: number;
  sub?: string;
}) => {
  const color =
    value >= 70 ? "var(--critical)" : value >= 45 ? "var(--high)" : value >= 25 ? "var(--medium)" : "var(--low)";
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnimated(value), 100);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--panel-3)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (animated / 100) * c}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-xl font-bold" style={{ color }}>
          {value}
        </span>
        {sub && <span className="text-[10px] text-[var(--text-dim)] font-mono">{sub}</span>}
      </div>
    </div>
  );
};

export const Spinner = ({ className = "" }: { className?: string }) => (
  <div
    className={clsx(
      "w-4 h-4 rounded-full border-2 border-[var(--border)] border-t-[var(--brand)] animate-spin",
      className
    )}
  />
);

export const ErrorBanner = ({ message }: { message: string }) => (
  <div className="flex items-center gap-2 bg-[var(--critical)]/10 border border-[var(--critical)]/30 text-[var(--critical)] text-sm rounded-lg px-4 py-3">
    <AlertTriangle size={15} /> {message}
  </div>
);

export const EmptyState = ({ title, sub }: { title: string; sub?: string }) => (
  <div className="flex flex-col items-center justify-center text-center py-16 text-[var(--text-dim)]">
    <p className="text-sm font-medium text-[var(--text-mid)] mb-1">{title}</p>
    {sub && <p className="text-xs max-w-xs">{sub}</p>}
  </div>
);
