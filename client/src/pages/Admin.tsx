import { useQuery } from "@tanstack/react-query";
import { Card, Badge, KpiCard } from "@/components/Kpi";
import { Shield, Lock, Eye, EyeOff, FileSignature, KeySquare, Users } from "lucide-react";
import type { SecurityIndicators } from "@shared/schema";

export default function Admin() {
  const { data } = useQuery<SecurityIndicators>({ queryKey: ["/api/security"] });
  const s = data;

  return (
    <div className="space-y-6" data-testid="page-admin">
      <div>
        <h2 className="text-[20px] font-semibold tracking-tight">Admin &amp; Security</h2>
        <p className="text-[12px] text-muted-foreground mt-1 max-w-2xl">
          Operational, retention, and privacy posture for the ByteTrack Retail MVP. Pseudonymous track IDs only — no face identity or names are stored.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard testId="kpi-pseudo" label="Pseudonymous IDs" value={s?.pseudonymousIds ? "Yes" : "No"} accent="good" icon={<EyeOff size={14} />} detail="No names or face vectors" />
        <KpiCard testId="kpi-face" label="Face Identity" value={s?.faceIdentity ? "Enabled" : "Disabled"} accent={s?.faceIdentity ? "bad" : "good"} icon={<Eye size={14} />} detail="By policy" />
        <KpiCard testId="kpi-encryption" label="Encryption at rest" value={s?.encryptionAtRest ? "Active" : "Off"} accent="good" icon={<Lock size={14} />} detail="DB + object storage" />
        <KpiCard testId="kpi-signage" label="Signage Deployed" value={s?.signageDeployed ? "Yes" : "No"} accent="good" icon={<FileSignature size={14} />} detail="ICO CCTV §3.3" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Retention policy" subtitle="Different data classes, different lifetimes" testId="card-retention">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-left text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground border-b border-border">
                <th className="py-1.5 font-medium">Class</th>
                <th className="py-1.5 font-medium text-right">Retention</th>
                <th className="py-1.5 font-medium">Reason</th>
              </tr>
            </thead>
            <tbody className="tabular">
              <Retention name="Raw video" value={`${s?.rawVideoRetentionDays ?? "—"} days`} reason="Debug + incident review only" />
              <Retention name="Track points" value={`${s?.trackPointRetentionDays ?? "—"} days`} reason="Recompute heatmaps; tracking QA" />
              <Retention name="Zone events" value={`${s?.zoneEventRetentionDays ?? "—"} days`} reason="Historical business analytics" />
              <Retention name="Daily aggregates" value={s?.dailyAggregateRetention ?? "—"} reason="Trends without personal data" />
              <Retention name="Audit logs" value={`${s?.auditLogRetentionYears ?? "—"} years`} reason="Compliance + security review" />
            </tbody>
          </table>
        </Card>

        <Card title="RBAC roles" subtitle="Stubbed for MVP — owner / admin / viewer" action={<span className="text-primary"><Users size={14} /></span>} testId="card-rbac">
          <ul className="space-y-2.5 text-[12.5px]">
            <li className="flex gap-3 items-start">
              <Badge tone="info">owner</Badge>
              <span className="text-muted-foreground">All dashboards, exports, retention policy, RBAC management, audit logs, raw video review.</span>
            </li>
            <li className="flex gap-3 items-start">
              <Badge tone="info">admin</Badge>
              <span className="text-muted-foreground">Camera management, zone polygons, retention settings, audit logs. No raw video by default.</span>
            </li>
            <li className="flex gap-3 items-start">
              <Badge tone="info">viewer</Badge>
              <span className="text-muted-foreground">Dashboards and daily reports. No exports, no admin, no raw video.</span>
            </li>
          </ul>
        </Card>
      </div>

      <Card title="Audit log (recent)" subtitle="Append-only · keyed by actor + action + object" action={<span className="text-primary"><Shield size={14} /></span>} testId="card-audit">
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="text-left text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground border-b border-border">
              <th className="py-1.5 font-medium">When</th>
              <th className="py-1.5 font-medium">Actor</th>
              <th className="py-1.5 font-medium">Action</th>
              <th className="py-1.5 font-medium">Object</th>
              <th className="py-1.5 font-medium text-right">Result</th>
            </tr>
          </thead>
          <tbody className="tabular">
            {(s?.recentAuditLogs ?? []).map((row, i) => (
              <tr key={i} className="border-b border-border/40 last:border-0" data-testid={`row-audit-${i}`}>
                <td className="py-1.5">{row.ts.replace("T", " ").slice(0, 16)}</td>
                <td className="py-1.5">{row.actor}</td>
                <td className="py-1.5">{row.action}</td>
                <td className="py-1.5 text-muted-foreground">{row.object}</td>
                <td className="py-1.5 text-right">
                  <Badge tone={row.result === "ok" ? "good" : "bad"}>{row.result}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="Key management" subtitle="MVP stub — credentials are never in source" action={<span className="text-primary"><KeySquare size={14} /></span>} testId="card-keys">
        <ul className="space-y-1.5 text-[12.5px] text-muted-foreground">
          <li>· RTSP credentials referenced via env-resolved secret IDs (e.g. <code className="tabular text-foreground">${"{kms-key-cam-rtsp}"}</code>).</li>
          <li>· Database encryption keys are stored in the platform secret manager; rotation cadence: 90 days.</li>
          <li>· Object-storage signed URLs expire after 15 minutes; raw-video download requires owner role.</li>
          <li>· Aligned with the OWASP cryptographic storage guidance: no key material in source control.</li>
        </ul>
      </Card>
    </div>
  );
}

function Retention({ name, value, reason }: { name: string; value: string; reason: string }) {
  return (
    <tr className="border-b border-border/40 last:border-0">
      <td className="py-1.5 font-medium">{name}</td>
      <td className="py-1.5 text-right">{value}</td>
      <td className="py-1.5 text-muted-foreground text-[11.5px]">{reason}</td>
    </tr>
  );
}
