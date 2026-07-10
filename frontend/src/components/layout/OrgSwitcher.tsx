import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, ChevronsUpDown, CheckCircle2 } from "lucide-react";
import { organizationsApi } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import type { Organization } from "../../types";

/**
 * IMPORTANT — read before wiring this into a real multi-org product:
 * GET /api/v1/organizations currently returns EVERY organization in the
 * database, not just the ones the current user belongs to (see the backend
 * review: organizations.py has no tenant-scoping, unlike projects.py).
 * For the hackathon demo this is harmless if you only ever seed one org.
 * Before this becomes a real product, that endpoint needs to filter by
 * the current user's membership, and this component should stop letting
 * you "switch" into an org you don't belong to.
 */
export const OrgSwitcher = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const current = orgs.find((o) => o.id === user?.organization_id) ?? orgs[0];

  useEffect(() => {
    organizationsApi.list().then(setOrgs).catch(() => setOrgs([]));
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-[var(--panel-3)] transition-colors border border-transparent hover:border-[var(--border)]"
      >
        <div className="w-6 h-6 rounded-md bg-[var(--brand)]/15 text-[var(--brand)] flex items-center justify-center">
          <Building2 size={13} />
        </div>
        <div className="text-left leading-tight">
          <p className="text-[13px] font-medium">{current?.name ?? "Loading…"}</p>
          <p className="text-[10px] text-[var(--text-dim)] font-mono">{current?.slug ?? ""}</p>
        </div>
        <ChevronsUpDown size={13} className="text-[var(--text-dim)] ml-1" />
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
              className="absolute z-50 mt-2 w-64 bg-[var(--panel-2)] border border-[var(--border)] rounded-xl shadow-2xl p-1.5"
            >
              <p className="px-2.5 py-1.5 text-[10px] uppercase tracking-wider text-[var(--text-dim)] font-semibold">
                Organizations
              </p>
              {orgs.map((o) => (
                <div
                  key={o.id}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm hover:bg-[var(--panel-3)] text-left"
                >
                  <div className="w-6 h-6 rounded-md bg-[var(--panel-3)] flex items-center justify-center text-[var(--text-mid)]">
                    <Building2 size={12} />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px]">{o.name}</p>
                    <p className="text-[10px] text-[var(--text-dim)] font-mono">{o.slug}</p>
                  </div>
                  {current?.id === o.id && <CheckCircle2 size={14} className="text-[var(--brand)]" />}
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
