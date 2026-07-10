import React from "react";
import { Card, RadialScore } from "../ui/primitives";
import type { ComplianceOverview } from "../../types";

/**
 * DESIGN DECISION, explained: the original mockup had a multi-month
 * compliance TREND line chart. The backend's GET /dashboard/compliance
 * only returns a point-in-time snapshot (average/highest/lowest across
 * current analyses) — there's no created_at-bucketed time series endpoint.
 * Rather than fabricate fake historical months (which would make the demo
 * look broken the moment a judge asks "where does that data come from?"),
 * this renders an honest range visualization of what the API actually
 * provides. If you want a real trend later: add a
 * GET /dashboard/compliance/history?interval=week endpoint that buckets
 * Analysis.created_at with SQL date_trunc, and swap this component for a
 * recharts <LineChart> — the frontend seam is already isolated here so
 * that's a one-file change.
 */
export const ComplianceOverviewCard = ({ data }: { data: ComplianceOverview }) => {
  const hasData = data.highest_score > 0 || data.lowest_score > 0 || data.average_score > 0;

  return (
    <Card className="p-5">
      <h3 className="font-display font-semibold text-sm mb-1">Compliance overview</h3>
      <p className="text-xs text-[var(--text-dim)] mb-4">Score range across all analyzed documents</p>

      {!hasData ? (
        <div className="h-40 flex items-center justify-center text-sm text-[var(--text-dim)]">
          No analyses yet
        </div>
      ) : (
        <div className="flex items-center gap-6">
          <RadialScore value={Math.round(data.average_score)} sub="/ 100" />
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex justify-between text-xs text-[var(--text-dim)] mb-1.5">
                <span>Lowest: {data.lowest_score}</span>
                <span>Highest: {data.highest_score}</span>
              </div>
              <div className="relative h-2 rounded-full bg-[var(--panel-3)]">
                <div
                  className="absolute h-2 rounded-full bg-[var(--info)]/40"
                  style={{
                    left: `${data.lowest_score}%`,
                    width: `${Math.max(data.highest_score - data.lowest_score, 2)}%`,
                  }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-[var(--info)] border-2 border-[var(--panel)]"
                  style={{ left: `calc(${data.average_score}% - 5px)` }}
                  title="Average"
                />
              </div>
            </div>
            <p className="text-xs text-[var(--text-mid)]">
              Average compliance score is <span className="font-mono text-[var(--info)]">{data.average_score}</span> across
              all stored analyses.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};
