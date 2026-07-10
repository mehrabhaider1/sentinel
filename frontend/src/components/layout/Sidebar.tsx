import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  LayoutDashboard,
  FolderKanban,
  FileText,
  History,
  Settings,
  ChevronLeft,
  ChevronRight,
  Upload,
  BarChart3,
  Plus,
  LogOut,
  HelpCircle,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { useAuth } from "../../context/AuthContext";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/dashboard" },
  { icon: FolderKanban, label: "Projects", path: "/projects" },
  { icon: FileText, label: "Analyses", path: "/analyses" },
  { icon: History, label: "History", path: "/history" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const isExpanded = !collapsed || hovered;

  const initials = user?.full_name
    ? user.full_name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()
    : "SA";

  return (
    <TooltipProvider delayDuration={300}>
      <motion.aside
        className="fixed left-0 top-0 bottom-0 z-40 flex flex-col border-r border-[var(--sidebar-border)] bg-[var(--sidebar)]"
        animate={{ width: collapsed ? 64 : 260 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        onMouseEnter={() => collapsed && setHovered(true)}
        onMouseLeave={() => collapsed && setHovered(false)}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-[var(--sidebar-border)]">
          <NavLink to="/dashboard" className="flex items-center gap-2 overflow-hidden">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--brand)] shrink-0">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <AnimatePresence>
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="font-display text-base font-bold whitespace-nowrap"
                >
                  Sentinel AI
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
          <button
            onClick={onToggle}
            className="flex items-center justify-center w-6 h-6 rounded-md text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-accent)] transition-colors shrink-0"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Upload button */}
        <div className="px-3 py-3">
          {collapsed && !hovered ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="default"
                  size="icon"
                  className="w-full"
                  onClick={() => navigate("/projects")}
                >
                  <Plus size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">New Analysis</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="default"
              size="default"
              className="w-full gap-2 group"
              onClick={() => navigate("/projects")}
            >
              <Plus size={16} className="shrink-0" />
              <span>New Analysis</span>
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return collapsed && !hovered ? (
              <Tooltip key={item.path}>
                <TooltipTrigger asChild>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center justify-center w-full h-10 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-[var(--brand-subtle)] text-[var(--brand)]"
                          : "text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-accent)]"
                      )
                    }
                  >
                    <Icon size={18} />
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[var(--brand-subtle)] text-[var(--brand)]"
                      : "text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-accent)]"
                  )
                }
              >
                <Icon size={18} className="shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-[var(--sidebar-border)] px-3 py-3 space-y-1">
          {/* Help */}
          {collapsed && !hovered ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="flex items-center justify-center w-full h-9 rounded-lg text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-accent)] transition-colors">
                  <HelpCircle size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Help & Support</TooltipContent>
            </Tooltip>
          ) : (
            <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-[var(--foreground-tertiary)] hover:text-[var(--foreground)] hover:bg-[var(--sidebar-accent)] transition-colors">
              <HelpCircle size={16} className="shrink-0" />
              <span>Help & Support</span>
            </button>
          )}

          {/* Sign Out */}
          {collapsed && !hovered ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => { logout(); navigate("/login"); }}
                  className="flex items-center justify-center w-full h-9 rounded-lg text-[var(--foreground-tertiary)] hover:text-[var(--critical)] hover:bg-[var(--critical)]/10 transition-colors"
                >
                  <LogOut size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">Sign Out</TooltipContent>
            </Tooltip>
          ) : (
            <button
              onClick={() => { logout(); navigate("/login"); }}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-[var(--foreground-tertiary)] hover:text-[var(--critical)] hover:bg-[var(--critical)]/10 transition-colors"
            >
              <LogOut size={16} className="shrink-0" />
              <span>Sign Out</span>
            </button>
          )}

          {/* User profile */}
          <div className={cn("flex items-center gap-3 pt-2", collapsed && !hovered && "justify-center")}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--brand)] to-[var(--cyber)] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            {isExpanded && (
              <div className="overflow-hidden min-w-0">
                <p className="text-sm font-medium truncate">{user?.full_name || "User"}</p>
                <p className="text-xs text-[var(--foreground-tertiary)] truncate">{user?.email || "user@company.com"}</p>
              </div>
            )}
          </div>
        </div>
      </motion.aside>
    </TooltipProvider>
  );
}
