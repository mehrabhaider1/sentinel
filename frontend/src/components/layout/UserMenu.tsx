import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LogOut, Settings, User as UserIcon } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const initials = (name: string) =>
  name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const UserMenu = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 hover:opacity-90">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--brand)] to-[var(--info)] flex items-center justify-center text-[11px] font-bold text-[var(--brand-ink)]">
          {initials(user.full_name)}
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 z-50 mt-2 w-60 bg-[var(--panel-2)] border border-[var(--border)] rounded-xl shadow-2xl p-1.5"
            >
              <div className="px-2.5 py-2 mb-1 border-b border-[var(--border-soft)]">
                <p className="text-[13px] font-medium">{user.full_name}</p>
                <p className="text-[11px] text-[var(--text-dim)]">{user.email}</p>
              </div>
              {[
                { icon: UserIcon, label: "Profile" },
                { icon: Settings, label: "Preferences" },
              ].map((it) => (
                <button
                  key={it.label}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-[var(--text-mid)] hover:bg-[var(--panel-3)] hover:text-[var(--text-hi)]"
                >
                  <it.icon size={14} /> {it.label}
                </button>
              ))}
              <div className="h-px bg-[var(--border)] my-1.5" />
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-[var(--critical)] hover:bg-[var(--critical)]/10"
              >
                <LogOut size={14} /> Sign out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
