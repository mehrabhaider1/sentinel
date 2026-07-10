import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";

interface RiskGaugeProps {
  value: number;
  max?: number;
  label?: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function RiskGauge({
  value,
  max = 100,
  label,
  size = 120,
  strokeWidth = 10,
  className,
}: RiskGaugeProps) {
  const [animated, setAnimated] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = (value / max) * 100;

  const color =
    percentage >= 70 ? "var(--critical)"
    : percentage >= 45 ? "var(--high)"
    : percentage >= 25 ? "var(--medium)"
    : "var(--low)";

  const level =
    percentage >= 70 ? "Critical"
    : percentage >= 45 ? "High"
    : percentage >= 25 ? "Medium"
    : "Low";

  useEffect(() => {
    const t = setTimeout(() => setAnimated(value), 100);
    return () => clearTimeout(t);
  }, [value]);

  const offset = circumference - (animated / max) * circumference;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--background-tertiary)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-2xl font-bold" style={{ color }}>
            {value}
          </span>
          {max && (
            <span className="text-[10px] text-[var(--foreground-tertiary)] font-mono">/ {max}</span>
          )}
        </div>
      </div>
      {label && (
        <p className="text-xs text-[var(--foreground-secondary)] mt-2">{label}</p>
      )}
      <span
        className="mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-md font-mono"
        style={{ color, background: `${color}15` }}
      >
        {level}
      </span>
    </div>
  );
}
