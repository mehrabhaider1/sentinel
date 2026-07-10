import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "../../lib/utils";

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  projects: "Projects",
  history: "History",
  analyses: "Analysis",
  settings: "Settings",
};

export function Breadcrumbs() {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  // Don't show breadcrumbs on dashboard
  if (segments.length === 1 && segments[0] === "dashboard") return null;

  return (
    <nav className="flex items-center gap-1.5 text-xs text-[var(--foreground-tertiary)] mb-4">
      <Link
        to="/dashboard"
        className="flex items-center gap-1 hover:text-[var(--foreground)] transition-colors"
      >
        <Home size={12} />
        <span>Home</span>
      </Link>
      {segments.map((segment, index) => {
        const path = "/" + segments.slice(0, index + 1).join("/");
        const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
        const isLast = index === segments.length - 1;

        return (
          <div key={segment} className="flex items-center gap-1.5">
            <ChevronRight size={10} className="text-[var(--foreground-tertiary)]" />
            {isLast ? (
              <span className="text-[var(--foreground-secondary)] font-medium">{label}</span>
            ) : (
              <Link
                to={path}
                className="hover:text-[var(--foreground)] transition-colors"
              >
                {label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
