import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";
import {
  Users,
  Clock,
  TrendingUp,
  ShoppingCart as Cart,
  Star,
  Snowflake,
  Gauge,
  Activity,
} from "lucide-react";
import { KpiCard, Card, Badge, SectionLabel } from "@/components/Kpi";
import type {
  OverviewKpis,
  HourlyTraffic,
  ZoneMetric,
  QueueSnapshot,
  Alert,
} from "@shared/schema";

const formatHourLabel = (h: number) => {
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}${ampm}`;
};

export default function Overview() {
  const kpi = useQuery<OverviewKpis>({ queryKey: ["/api/overview"] });
  const traffic = useQuery<HourlyTraffic[]>({ queryKey: ["/api/traffic"] });
  const zones = useQuery<ZoneMetric[]>({ queryKey: ["/api/zone-metrics"] });
  const queue = useQuery<QueueSnapshot[]>({ queryKey: ["/api/checkout/queue"] });
  const alerts = useQuery<Alert[]>({ queryKey: ["/api/alerts"] });

  const k = kpi.data;
  const trafficData = traffic.data?.map((t) => ({ ...t, label: formatHourLabel(t.hour) })) ?? [];
  const topBest = (zones.data ?? []).filter((z) => z.bestScore > 0).sort((a, b) => b.bestScore - a.bestScore).slice(0, 5);
  const topDead = (zones.data ?? []).filter((z) => z.deadScore > 0).sort((a, b) => b.deadScore - a.deadScore).slice(0, 5);
  const queueData = queue.data?.map((q) => ({ ...q, label: q.ts.slice(11, 16) })) ?? [];
  const activeAlerts = (alerts.data ?? []).filter((a) => a.active);

  return (
    <div className="space-y-6" data-testid="page-overview">
      {/* Header line */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[12px] text-muted-foreground">Day 1 summary · 25 customers expected · synthetic dataset</p>
          <h2 className="text-[20px] font-semibold tracking-tight mt-1">Store Operations Overview</h2>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Badge tone="info">Confidence {k ? Math.round(k.confidence * 100) : "—"}%</Badge>
          <Badge tone="default">{k?.tracksTotal ?? "—"} tracks</Badge>
          <Badge tone="default">{(k?.detectionsTotal ?? 0).toLocaleString()} detections</Badge>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3" data-testid="kpi-strip">
        <KpiCard
          testId="kpi-total-visitors"
          label="Total Visitors"
          value={k?.totalVisitors ?? "—"}
          detail="Entry-line crossings (deduped)"
          icon={<Users size={14} />}
        />
        <KpiCard
          testId="kpi-peak-hour"
          label="Peak Hour"
          value={k?.peakHourCount ?? "—"}
          unit="visitors"
          detail={k?.peakHourLabel}
          icon={<TrendingUp size={14} />}
        />
        <KpiCard
          testId="kpi-avg-visit"
          label="Avg Visit Duration"
          value={k?.avgVisitDurationMin ?? "—"}
          unit="min"
          detail="Across all sessions"
          icon={<Clock size={14} />}
        />
        <KpiCard
          testId="kpi-checkout-wait"
          label="Checkout Wait Proxy"
          value={k ? `${Math.floor(k.checkoutWaitProxySec / 60)}:${String(k.checkoutWaitProxySec % 60).padStart(2, "0")}` : "—"}
          unit="min"
          accent="warn"
          trend="Spike 5:20–5:35 PM"
          icon={<Cart size={14} />}
        />
        <KpiCard
          testId="kpi-best-section"
          label="Best Section"
          value={k?.bestSection.name.replace("F1 Aisle 04 — ", "") ?? "—"}
          accent="good"
          detail={k?.bestSection.reason}
          icon={<Star size={14} />}
        />
        <KpiCard
          testId="kpi-dead-section"
          label="Dead Section"
          value={k?.deadSection.name.replace("F2 Back Right — ", "") ?? "—"}
          accent="bad"
          detail={k?.deadSection.reason}
          icon={<Snowflake size={14} />}
        />
        <KpiCard
          testId="kpi-comfort"
          label="Comfort Score"
          value={k?.comfortScore ?? "—"}
          unit="/ 100"
          accent={k?.comfortLabel === "comfortable" ? "good" : k?.comfortLabel === "watch" ? "warn" : "bad"}
          detail={k?.comfortLabel}
          icon={<Gauge size={14} />}
        />
      </div>

      {/* Row 1: Traffic + Comfort breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card
          title="Hourly traffic"
          subtitle="Entry flow and live store occupancy across the business day"
          className="lg:col-span-2"
          testId="card-hourly-traffic"
        >
          <div className="h-[260px]">
            <ResponsiveContainer>
              <AreaChart data={trafficData} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="entriesG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="0" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
                  contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--popover-border))", borderRadius: 6, fontSize: 12 }}
                />
                <Area type="monotone" dataKey="entries" stroke="hsl(var(--chart-1))" strokeWidth={2} fill="url(#entriesG)" name="Entries" />
                <Line type="monotone" dataKey="occupancy" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} name="Occupancy" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 text-[11.5px] mt-1">
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-[hsl(var(--chart-1))]" /> Entries</span>
            <span className="flex items-center gap-1.5"><span className="size-2 rounded-sm bg-[hsl(var(--chart-2))]" /> Live occupancy</span>
          </div>
        </Card>

        <Card title="Comfort breakdown" subtitle="Store-wide friction components" testId="card-comfort">
          {[
            { label: "Aisle congestion", value: 88, note: "Quiet day" },
            { label: "Stop-start behavior", value: 80, note: "Smooth flow" },
            { label: "Reversals", value: 82, note: "Few back-tracks" },
            { label: "Checkout queue", value: 56, note: "5:20–5:35 PM spike", warn: true },
            { label: "Queue spillover", value: 64, note: "Brief, contained", warn: true },
          ].map((m) => (
            <div key={m.label} className="mb-3 last:mb-0">
              <div className="flex items-center justify-between text-[11.5px]">
                <span className="text-foreground">{m.label}</span>
                <span className={`tabular ${m.warn ? "text-amber-400" : "text-emerald-400"}`}>{m.value}</span>
              </div>
              <div className="h-1.5 bg-muted rounded mt-1.5 overflow-hidden">
                <div
                  className={`h-full rounded ${m.warn ? "bg-amber-500" : "bg-emerald-500"}`}
                  style={{ width: `${m.value}%` }}
                />
              </div>
              <div className="text-[10.5px] text-muted-foreground mt-0.5">{m.note}</div>
            </div>
          ))}
        </Card>
      </div>

      {/* Row 2: Section rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card
          title="Top 5 best-performing sections"
          subtitle="Reach + healthy dwell + revisits − friction"
          testId="card-best-sections"
        >
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-left text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground border-b border-border">
                <th className="py-1.5 font-medium">Section</th>
                <th className="py-1.5 font-medium text-right">Visitors</th>
                <th className="py-1.5 font-medium text-right">Dwell</th>
                <th className="py-1.5 font-medium text-right">Signal</th>
              </tr>
            </thead>
            <tbody>
              {topBest.map((z) => (
                <tr key={z.zoneId} className="border-b border-border/40 last:border-0" data-testid={`row-best-${z.zoneId}`}>
                  <td className="py-2 pr-2">
                    <div className="font-medium">{z.name}</div>
                    <div className="text-[11px] text-muted-foreground">{z.reasons.join(" · ")}</div>
                  </td>
                  <td className="py-2 text-right tabular">{z.visitors}</td>
                  <td className="py-2 text-right tabular">{z.medianDwellSec}s</td>
                  <td className="py-2 text-right">
                    <Badge tone="good">{z.bestScore}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card
          title="Top 5 dead-section risks"
          subtitle="Higher risk = low reach + low dwell + path avoidance"
          testId="card-dead-sections"
        >
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-left text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground border-b border-border">
                <th className="py-1.5 font-medium">Section</th>
                <th className="py-1.5 font-medium text-right">Visitors</th>
                <th className="py-1.5 font-medium text-right">Dwell</th>
                <th className="py-1.5 font-medium text-right">Risk</th>
              </tr>
            </thead>
            <tbody>
              {topDead.map((z) => (
                <tr key={z.zoneId} className="border-b border-border/40 last:border-0" data-testid={`row-dead-${z.zoneId}`}>
                  <td className="py-2 pr-2">
                    <div className="font-medium">{z.name}</div>
                    <div className="text-[11px] text-muted-foreground">{z.reasons.join(" · ")}</div>
                  </td>
                  <td className="py-2 text-right tabular">{z.visitors}</td>
                  <td className="py-2 text-right tabular">{z.medianDwellSec}s</td>
                  <td className="py-2 text-right">
                    <Badge tone="bad">{z.deadScore}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Row 3: Checkout queue mini + Alerts list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Checkout queue" subtitle="Count over time · 4–7 PM window" className="lg:col-span-2" testId="card-checkout-mini">
          <div className="h-[180px]">
            <ResponsiveContainer>
              <BarChart data={queueData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="0" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10.5 }} axisLine={false} tickLine={false} interval={2} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
                  contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--popover-border))", borderRadius: 6, fontSize: 12 }}
                />
                <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Active alerts" subtitle={`${activeAlerts.length} need attention`} testId="card-active-alerts">
          <div className="space-y-2">
            {activeAlerts.length === 0 && (
              <div className="text-[12px] text-muted-foreground py-6 text-center">No active alerts. Comfortable day.</div>
            )}
            {activeAlerts.map((a) => (
              <div key={a.id} className="flex gap-2 items-start text-[12px]" data-testid={`alert-${a.id}`}>
                <Badge tone={a.severity === "critical" ? "bad" : a.severity === "warn" ? "warn" : "info"}>
                  {a.severity}
                </Badge>
                <span className="text-foreground leading-snug">{a.message}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Day 1 narrative */}
      <Card title="Day 1 narrative" subtitle="What the dashboard suggests the owner do next" testId="card-narrative">
        <ul className="space-y-2 text-[13px] leading-relaxed">
          <li className="flex gap-3">
            <span className="text-primary mt-0.5"><Activity size={14} /></span>
            <span>
              25 customers entered, peaking 7-strong between 5 and 6 PM. Staff coverage for that window held but the queue tipped into the aisle for 15 minutes.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-emerald-400 mt-0.5"><Star size={14} /></span>
            <span>
              <span className="font-medium">F1 Aisle 04 — Snacks</span> is the day's best section (17 visitors, 75s median dwell, 7 revisits). The seasonal endcap on F1 Promo is also pulling repeat visits.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-rose-400 mt-0.5"><Snowflake size={14} /></span>
            <span>
              <span className="font-medium">F2 Back Right — Returns</span> saw 1 visitor and 4s of dwell. Consider rotating a promo display into that lane and re-testing for 7 days.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-amber-400 mt-0.5"><Cart size={14} /></span>
            <span>
              Checkout wait peaked at 5:25 PM with 6 people in queue. Cross-train one floor associate to run a second register during 5–6 PM.
            </span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
