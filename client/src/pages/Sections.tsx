import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, Badge } from "@/components/Kpi";
import { Layers, Star, Snowflake } from "lucide-react";
import type { ZoneMetric } from "@shared/schema";

export default function Sections() {
  const { data } = useQuery<ZoneMetric[]>({ queryKey: ["/api/zone-metrics"] });
  const [floor, setFloor] = useState<"all" | "F1" | "F2">("all");

  const all = data ?? [];
  const filtered = floor === "all" ? all : all.filter((z) => z.floor === floor);
  const rankable = filtered.filter((z) => z.bestScore > 0 || z.deadScore > 0);

  const best = [...rankable].sort((a, b) => b.bestScore - a.bestScore).slice(0, 10);
  const dead = [...rankable].sort((a, b) => b.deadScore - a.deadScore).slice(0, 10);

  return (
    <div className="space-y-6" data-testid="page-sections">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[20px] font-semibold tracking-tight">Section performance</h2>
          <p className="text-[12px] text-muted-foreground mt-1">
            Rankings combine reach, healthy dwell, revisits, path centrality, and friction.
            Checkout, entry, and transition zones are excluded from ranking.
          </p>
        </div>
        <div className="flex items-center gap-1 bg-card border border-card-border rounded-md p-0.5" role="tablist">
          {(["all", "F1", "F2"] as const).map((f) => (
            <button
              key={f}
              data-testid={`button-floor-${f}`}
              onClick={() => setFloor(f)}
              className={`px-3 py-1.5 text-[11.5px] rounded ${
                floor === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover-elevate"
              }`}
            >
              {f === "all" ? "All Floors" : `Floor ${f.slice(1)}`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card
          title="Top 10 best-performing sections"
          subtitle="Higher signal = healthier commercial behavior"
          action={<span className="text-emerald-400"><Star size={14} /></span>}
          testId="card-best-rank"
        >
          <RankTable rows={best} mode="best" />
        </Card>

        <Card
          title="Top 10 dead-section risks"
          subtitle="Higher risk = low reach, low dwell, low revisits, low path centrality"
          action={<span className="text-rose-400"><Snowflake size={14} /></span>}
          testId="card-dead-rank"
        >
          <RankTable rows={dead} mode="dead" />
        </Card>
      </div>

      <Card title="All sections — Day 1" subtitle={`${filtered.length} of 30 zones · including non-rankable`} testId="card-all-sections">
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-left text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground border-b border-border">
                <th className="py-1.5 font-medium">Zone</th>
                <th className="py-1.5 font-medium">Type</th>
                <th className="py-1.5 font-medium text-right">Visitors</th>
                <th className="py-1.5 font-medium text-right">Median dwell</th>
                <th className="py-1.5 font-medium text-right">Revisits</th>
                <th className="py-1.5 font-medium text-right">Congestion (min)</th>
                <th className="py-1.5 font-medium text-right">Comfort</th>
              </tr>
            </thead>
            <tbody className="tabular">
              {filtered.map((z) => (
                <tr key={z.zoneId} className="border-b border-border/40 last:border-0" data-testid={`row-zone-${z.zoneId}`}>
                  <td className="py-1.5 pr-2">
                    <div className="font-medium">{z.name}</div>
                    <div className="text-[11px] text-muted-foreground">{z.zoneId} · {z.floor}</div>
                  </td>
                  <td className="py-1.5 text-muted-foreground">{z.zoneType}</td>
                  <td className="py-1.5 text-right">{z.visitors}</td>
                  <td className="py-1.5 text-right">{z.medianDwellSec}s</td>
                  <td className="py-1.5 text-right">{z.revisits}</td>
                  <td className="py-1.5 text-right">{z.congestionMin}</td>
                  <td className="py-1.5 text-right">
                    <Badge tone={z.comfortScore >= 75 ? "good" : z.comfortScore >= 55 ? "warn" : "bad"}>
                      {z.comfortScore}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function RankTable({ rows, mode }: { rows: ZoneMetric[]; mode: "best" | "dead" }) {
  return (
    <table className="w-full text-[12.5px]">
      <thead>
        <tr className="text-left text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground border-b border-border">
          <th className="py-1.5 font-medium w-6">#</th>
          <th className="py-1.5 font-medium">Section</th>
          <th className="py-1.5 font-medium text-right">Reach</th>
          <th className="py-1.5 font-medium text-right">Dwell</th>
          <th className="py-1.5 font-medium text-right">{mode === "best" ? "Signal" : "Risk"}</th>
        </tr>
      </thead>
      <tbody className="tabular">
        {rows.map((z, i) => (
          <tr key={z.zoneId} className="border-b border-border/40 last:border-0" data-testid={`row-${mode}-${z.zoneId}`}>
            <td className="py-2 text-muted-foreground">{i + 1}</td>
            <td className="py-2 pr-2">
              <div className="font-medium">{z.name}</div>
              <div className="text-[11px] text-muted-foreground">{z.reasons.join(" · ")}</div>
            </td>
            <td className="py-2 text-right">{z.visitors}</td>
            <td className="py-2 text-right">{z.medianDwellSec}s</td>
            <td className="py-2 text-right">
              <Badge tone={mode === "best" ? "good" : "bad"}>
                {mode === "best" ? z.bestScore : z.deadScore}
              </Badge>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
