import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Card, Badge, Button, EmptyState } from "../ui/primitives";
import type { RecentAnalysis } from "../../types";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

export const RecentTable = ({ items }: { items: RecentAnalysis[] }) => {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between p-5 pb-3">
        <h3 className="font-display font-semibold text-sm">Recent analyses</h3>
        <Button size="sm" variant="ghost" onClick={() => navigate("/history")}>
          View all <ChevronRight size={14} />
        </Button>
      </div>
      {items.length === 0 ? (
        <EmptyState
          title="No analyses yet"
          sub="Upload a document from a project page to run your first AI risk analysis."
        />
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-[var(--text-dim)] border-y border-[var(--border)]">
              <th className="font-medium px-5 py-2.5">File</th>
              <th className="font-medium px-5 py-2.5">Risk score</th>
              <th className="font-medium px-5 py-2.5">Date</th>
              <th className="px-5 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr
                key={r.id}
                onClick={() => navigate(`/analyses/${r.id}`)}
                className="border-b border-[var(--border-soft)] last:border-0 hover:bg-[var(--panel-2)] cursor-pointer transition-colors"
              >
                <td className="px-5 py-3 font-medium">{r.filename}</td>
                <td className="px-5 py-3">
                  <Badge level={r.risk_level}>{r.risk_score}/100</Badge>
                </td>
                <td className="px-5 py-3 text-[var(--text-dim)] text-xs">{formatDate(r.created_at)}</td>
                <td className="px-5 py-3">
                  <ChevronRight size={14} className="text-[var(--text-dim)]" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
};
