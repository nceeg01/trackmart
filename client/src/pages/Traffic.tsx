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
  Legend,
  LineChart,
  Line,
} from "recharts";
import { Card, KpiCard, SectionLabel } from "@/components/Kpi";
import { Users, ArrowUpRight, ArrowDownRight, Building2 } from "lucide-react";
import type { HourlyTraffic } from "@shared/schema";

const formatHourLabel = (h: number) => {
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}${ampm}`;
};

export default function Traffic() {
  const { data } = useQuery<HourlyTraffic[]>({ queryKey: ["/api/traffic"] });
  const rows = (data ?? []).map((t) => ({ ...t, label: formatHourLabel(t.hour) }));
  const totalEntries = rows.reduce((s, r) => s + r.entries, 0);
  const totalExits = rows.reduce((s, r) => s + r.exits, 0);
  const peak = rows.reduce((a, b) => (b.entries > a.entries ? b : a), rows[0] ?? { entries: 0, label: "—" } as any);
  const peakOcc = rows.reduce((a, b) => (b.occupancy > a.occupancy ? b : a), rows[0] ?? { occupancy: 0, label: "—" } as any);

  return (
    <div className="space-y-6" data-testid="page-traffic">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard testId="kpi-entries" label="Entries" value={totalEntries} icon={<ArrowUpRight size={14} />} />
        <KpiCard testId="kpi-exits" label="Exits" value={totalExits} icon={<ArrowDownRight size={14} />} />
        <KpiCard testId="kpi-peak-entries" label="Peak Entries" value={peak.entries} detail={peak.label} icon={<Users size={14} />} />
        <KpiCard testId="kpi-peak-occupancy" label="Peak Occupancy" value={peakOcc.occupancy} detail={peakOcc.label} accent="warn" icon={<Building2 size={14} />} />
      </div>

      <Card title="Hourly entries vs exits" subtitle="Stacked bars by hour · entries lead exits by ~30 min" testId="card-traffic-bars">
        <div className="h-[280px]">
          <ResponsiveContainer>
            <BarChart data={rows} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
                contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--popover-border))", borderRadius: 6, fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 11.5, paddingTop: 4 }} iconType="square" />
              <Bar dataKey="entries" name="Entries" fill="hsl(var(--chart-1))" radius={[2, 2, 0, 0]} />
              <Bar dataKey="exits" name="Exits" fill="hsl(var(--chart-3))" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Live occupancy" subtitle="Total people inside the store, by hour" testId="card-occupancy">
          <div className="h-[220px]">
            <ResponsiveContainer>
              <AreaChart data={rows} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="occG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.4)" }}
                  contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--popover-border))", borderRadius: 6, fontSize: 12 }}
                />
                <Area type="monotone" dataKey="occupancy" stroke="hsl(var(--chart-2))" strokeWidth={2} fill="url(#occG)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Floor-level occupancy split" subtitle="Floor 1 vs Floor 2" testId="card-floor-split">
          <div className="h-[220px]">
            <ResponsiveContainer>
              <LineChart data={rows} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                <CartesianGrid stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--popover-border))", borderRadius: 6, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 11.5 }} iconType="square" />
                <Line type="monotone" dataKey="floor1Occ" name="Floor 1" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="floor2Occ" name="Floor 2" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title="Hourly traffic table" subtitle="Tabular breakdown for export" testId="card-traffic-table">
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-left text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground border-b border-border">
                <th className="py-1.5 font-medium">Hour</th>
                <th className="py-1.5 font-medium text-right">Entries</th>
                <th className="py-1.5 font-medium text-right">Exits</th>
                <th className="py-1.5 font-medium text-right">Occupancy</th>
                <th className="py-1.5 font-medium text-right">F1</th>
                <th className="py-1.5 font-medium text-right">F2</th>
              </tr>
            </thead>
            <tbody className="tabular">
              {rows.map((r) => (
                <tr key={r.hour} className="border-b border-border/40 last:border-0" data-testid={`row-hour-${r.hour}`}>
                  <td className="py-1.5">{r.label}</td>
                  <td className="py-1.5 text-right">{r.entries}</td>
                  <td className="py-1.5 text-right">{r.exits}</td>
                  <td className="py-1.5 text-right">{r.occupancy}</td>
                  <td className="py-1.5 text-right">{r.floor1Occ}</td>
                  <td className="py-1.5 text-right">{r.floor2Occ}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
