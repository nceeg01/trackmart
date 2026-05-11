import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, Badge } from "@/components/Kpi";
import { Bell, AlertTriangle, ShieldAlert, Info } from "lucide-react";
import type { Alert } from "@shared/schema";

const ICONS: Record<string, any> = {
  critical: ShieldAlert,
  warn: AlertTriangle,
  info: Info,
};

export default function Alerts() {
  const { data } = useQuery<Alert[]>({ queryKey: ["/api/alerts"] });
  const [filter, setFilter] = useState<"all" | "active" | "info">("all");

  const all = data ?? [];
  const shown = all.filter((a) =>
    filter === "active" ? a.active : filter === "info" ? a.severity === "info" : true
  );
  const counts = {
    active: all.filter((a) => a.active).length,
    critical: all.filter((a) => a.severity === "critical").length,
    warn: all.filter((a) => a.severity === "warn").length,
    info: all.filter((a) => a.severity === "info").length,
  };

  return (
    <div className="space-y-6" data-testid="page-alerts">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="Active" value={counts.active} tone="warn" />
        <SummaryCard label="Critical" value={counts.critical} tone="bad" />
        <SummaryCard label="Warnings" value={counts.warn} tone="warn" />
        <SummaryCard label="Info" value={counts.info} tone="info" />
      </div>

      <div className="flex items-center gap-1 bg-card border border-card-border rounded-md p-0.5 w-fit">
        {(["all", "active", "info"] as const).map((f) => (
          <button
            key={f}
            data-testid={`button-alert-filter-${f}`}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-[11.5px] rounded capitalize ${
              filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover-elevate"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <Card title="Alerts feed" subtitle={`${shown.length} of ${all.length} alerts`} testId="card-alerts-feed">
        <div className="divide-y divide-border/60">
          {shown.map((a) => {
            const Icon = ICONS[a.severity] ?? Bell;
            const tone = a.severity === "critical" ? "bad" : a.severity === "warn" ? "warn" : "info";
            return (
              <div key={a.id} className="py-3 flex gap-3 items-start" data-testid={`alert-row-${a.id}`}>
                <div className={`mt-0.5 ${tone === "bad" ? "text-rose-400" : tone === "warn" ? "text-amber-400" : "text-primary"}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge tone={tone}>{a.severity}</Badge>
                    <span className="text-[11.5px] text-muted-foreground tabular">{a.type}</span>
                    {a.zoneId && <span className="text-[11.5px] text-muted-foreground tabular">· {a.zoneId}</span>}
                    {a.cameraId && <span className="text-[11.5px] text-muted-foreground tabular">· {a.cameraId}</span>}
                    {a.active ? <Badge tone="warn">active</Badge> : <Badge tone="default">resolved</Badge>}
                  </div>
                  <p className="text-[12.5px] mt-1 leading-snug">{a.message}</p>
                  <p className="text-[11px] text-muted-foreground mt-1 tabular">{a.ts.slice(11, 16)} · {a.ts.slice(0, 10)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: number; tone: "good" | "warn" | "bad" | "info" }) {
  const color =
    tone === "bad" ? "text-rose-400" : tone === "warn" ? "text-amber-400" : tone === "good" ? "text-emerald-400" : "text-primary";
  return (
    <div className="rounded-lg border border-card-border bg-card px-4 py-3.5">
      <div className="text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground font-medium">{label}</div>
      <div className={`text-[26px] font-semibold tabular mt-1 ${color}`}>{value}</div>
    </div>
  );
}
