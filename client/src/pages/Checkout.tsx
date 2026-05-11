import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ReferenceArea,
} from "recharts";
import { Card, KpiCard, Badge } from "@/components/Kpi";
import { ShoppingCart, Clock, Hourglass, AlertTriangle } from "lucide-react";
import type { QueueSnapshot } from "@shared/schema";

export default function Checkout() {
  const { data } = useQuery<QueueSnapshot[]>({ queryKey: ["/api/checkout/queue"] });
  const rows = (data ?? []).map((q) => ({
    ...q,
    label: q.ts.slice(11, 16),
    waitMin: +(q.waitEstimateSec / 60).toFixed(1),
  }));
  const peak = rows.reduce((a, b) => (b.count > a.count ? b : a), rows[0] ?? ({ count: 0, label: "—", waitMin: 0 } as any));
  const avgWait = rows.length ? +(rows.reduce((s, r) => s + r.waitMin, 0) / rows.length).toFixed(1) : 0;
  const spilloverWindows = rows.filter((r) => r.spillover);

  return (
    <div className="space-y-6" data-testid="page-checkout">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard testId="kpi-peak-queue" label="Peak Queue" value={peak.count} detail={`@ ${peak.label}`} accent="warn" icon={<ShoppingCart size={14} />} />
        <KpiCard testId="kpi-avg-wait" label="Avg Wait" value={avgWait} unit="min" icon={<Clock size={14} />} />
        <KpiCard testId="kpi-peak-wait" label="Peak Wait" value={Math.max(...rows.map((r) => r.waitMin), 0)} unit="min" accent="warn" icon={<Hourglass size={14} />} />
        <KpiCard testId="kpi-spillover" label="Spillover Windows" value={spilloverWindows.length} detail="5-min snapshots" accent={spilloverWindows.length ? "bad" : "good"} icon={<AlertTriangle size={14} />} />
      </div>

      <Card title="Queue length and wait estimate" subtitle="5-minute snapshots · 4 PM – 7 PM · shaded band shows spillover into Aisle 10" testId="card-queue">
        <div className="h-[320px]">
          <ResponsiveContainer>
            <ComposedChart data={rows} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} interval={2} />
              <YAxis yAxisId="left" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} width={28} label={{ value: "count", angle: -90, position: "insideLeft", style: { fontSize: 10, fill: "hsl(var(--muted-foreground))" }, offset: 16 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} width={32} label={{ value: "min", angle: 90, position: "insideRight", style: { fontSize: 10, fill: "hsl(var(--muted-foreground))" } }} />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
                contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--popover-border))", borderRadius: 6, fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 11.5 }} iconType="square" />
              {spilloverWindows.length > 0 && (
                <ReferenceArea yAxisId="left" x1={spilloverWindows[0].label} x2={spilloverWindows[spilloverWindows.length - 1].label} strokeOpacity={0} fill="hsl(var(--destructive))" fillOpacity={0.08} />
              )}
              <Bar yAxisId="left" dataKey="count" name="Queue count" fill="hsl(var(--chart-2))" radius={[2, 2, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="waitMin" name="Wait (min)" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Snapshot log" subtitle={`${rows.length} snapshots between 4 PM and 7 PM`} testId="card-queue-log">
          <div className="max-h-[320px] overflow-y-auto" style={{ overscrollBehavior: "contain" as any }}>
            <table className="w-full text-[12.5px]">
              <thead className="sticky top-0 bg-card">
                <tr className="text-left text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground border-b border-border">
                  <th className="py-1.5 font-medium">Time</th>
                  <th className="py-1.5 font-medium text-right">Count</th>
                  <th className="py-1.5 font-medium text-right">Wait</th>
                  <th className="py-1.5 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="tabular">
                {rows.map((r) => (
                  <tr key={r.ts} className="border-b border-border/30 last:border-0" data-testid={`row-snapshot-${r.label}`}>
                    <td className="py-1.5">{r.label}</td>
                    <td className="py-1.5 text-right">{r.count}</td>
                    <td className="py-1.5 text-right">{r.waitMin}m</td>
                    <td className="py-1.5 text-right">
                      {r.spillover ? <Badge tone="bad">spillover</Badge> : r.count >= 4 ? <Badge tone="warn">building</Badge> : <Badge tone="good">ok</Badge>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="What the queue suggests" subtitle="Owner-facing checkout analysis" testId="card-queue-suggest">
          <ul className="space-y-3 text-[12.5px] leading-snug">
            <li>
              <span className="font-medium">Peak forms at 5:25 PM</span>
              <span className="text-muted-foreground"> — 6 people in queue. Estimated wait climbed to {Math.max(...rows.map(r => r.waitMin)).toFixed(1)} min.</span>
            </li>
            <li>
              <span className="font-medium">Spillover into F1 Aisle 10</span>
              <span className="text-muted-foreground"> — queue extended outside the checkout polygon between 5:25 and 5:35 PM. Comfort score for that window dropped to 56.</span>
            </li>
            <li>
              <span className="font-medium">Suggested action</span>
              <span className="text-muted-foreground"> — cross-train one floor associate to run a second register from 5:00 to 6:00 PM. Re-measure for 5 weekdays.</span>
            </li>
            <li>
              <span className="font-medium">Confidence note</span>
              <span className="text-muted-foreground"> — wait estimate uses queue dwell as a proxy. POS service-time data will replace this in Phase 3.</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
