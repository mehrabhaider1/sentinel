import { useState } from "react";
import { Search, Bell, Moon, Sun, ChevronDown, Shield } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { Input } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
export function Topbar() {
  const { resolved, toggle } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      navigate(`/history?q=${encodeURIComponent(trimmed)}`);
    }
  };
  const initials = user?.full_name
    ? user.full_name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()
    : "SA";

  return (
    <header className="flex h-16 items-center gap-4 border-b border-[var(--border)] bg-[var(--background)] px-4 lg:px-6">
      {/* Search */}
      <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
        <Input
          placeholder="Search projects, analyses, documents..."
          icon={<Search size={16} />}
          className="h-9 text-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>

      <div className="flex items-center gap-2 ml-auto">
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="flex items-center justify-center w-9 h-9 rounded-lg text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-secondary)] transition-colors"
          title={`Switch to ${resolved === "dark" ? "light" : "dark"} mode`}
        >
          {resolved === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Notifications */}
        <button className="relative flex items-center justify-center w-9 h-9 rounded-lg text-[var(--foreground-secondary)] hover:text-[var(--foreground)] hover:bg-[var(--background-secondary)] transition-colors">
          <Bell size={16} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[var(--critical)] ring-2 ring-[var(--background)]" />
        </button>

        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-[var(--background-secondary)] transition-colors ml-1">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[var(--brand)] to-[var(--cyber)] flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium leading-tight">{user?.full_name || "User"}</p>
                <p className="text-[10px] text-[var(--foreground-tertiary)]">{user?.email || ""}</p>
              </div>
              <ChevronDown size={12} className="text-[var(--foreground-tertiary)]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-3 py-2">
              <p className="text-sm font-medium">{user?.full_name || "User"}</p>
              <p className="text-xs text-[var(--foreground-tertiary)]">{user?.email || "user@company.com"}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Shield size={14} className="mr-2" />
              Profile & Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/dashboard")}>
              <Bell size={14} className="mr-2" />
              Notifications
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-[var(--critical)]"
              onClick={() => { logout(); navigate("/login"); }}
            >
              <span className="flex items-center gap-2 w-full">
                Sign out
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
