import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "../ui/primitives";
import type { RiskDistribution } from "../../types";

/**
 * NOTE: backend/app/schemas/dashboard.py's RiskDistribution only has
 * high/medium/low buckets — there's no "critical" bucket, even though
 * analyses can be labeled risk_level="Critical". That means any Critical
 * analysis is currently invisible in this chart and the numbers won't sum
 * to total_analyses. This isn't something the frontend can fix; flag it
 * for whoever owns dashboard_service.py / schemas/dashboard.py — the fix
 * is adding a `critical: int` field end to end.
 */
export const RiskDonut = ({ data }: { data: RiskDistribution }) => {
  const slices = [
    { name: "High", value: data.high, color: "var(--high)" },
    { name: "Medium", value: data.medium, color: "var(--medium)" },
    { name: "Low", value: data.low, color: "var(--low)" },
  ];
  const total = slices.reduce((a, b) => a + b.value, 0);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-display font-semibold text-sm">Risk distribution</h3>
      </div>
      <p className="text-xs text-[var(--text-dim)] mb-4">Analyses by severity across all projects</p>
      {total === 0 ? (
        <div className="h-40 flex items-center justify-center text-sm text-[var(--text-dim)]">
          No analyses yet
        </div>
      ) : (
        <div className="flex items-center gap-6">
          <div className="relative w-40 h-40 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={slices} dataKey="value" innerRadius={50} outerRadius={70} paddingAngle={3} stroke="none">
                  {slices.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "var(--panel-2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="font-display text-2xl font-bold">{total}</span>
              <span className="text-[10px] text-[var(--text-dim)]">analyses</span>
            </div>
          </div>
          <div className="flex-1 space-y-2.5">
            {slices.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-[var(--text-mid)]">
                  <span className="w-2 h-2 rounded-full" style={{ background: d.color }} /> {d.name}
                </span>
                <span className="font-mono text-xs">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
