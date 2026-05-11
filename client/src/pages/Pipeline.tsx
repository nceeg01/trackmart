import { useQuery } from "@tanstack/react-query";
import { Card, KpiCard, Badge } from "@/components/Kpi";
import { Cpu, Server, Camera as CameraIcon, Activity, GitBranch } from "lucide-react";
import type { Camera, PipelineStatus } from "@shared/schema";

export default function Pipeline() {
  const cams = useQuery<Camera[]>({ queryKey: ["/api/cameras"] });
  const pipe = useQuery<PipelineStatus>({ queryKey: ["/api/pipeline"] });
  const counts = useQuery<{ count: number }>({ queryKey: ["/api/events/count"] });

  const p = pipe.data;
  const c = cams.data ?? [];

  return (
    <div className="space-y-6" data-testid="page-pipeline">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard testId="kpi-cameras-online" label="Cameras Online" value={p ? `${p.onlineCameras}/${p.totalCameras}` : "—"} icon={<CameraIcon size={14} />} accent={p && p.onlineCameras === p.totalCameras ? "good" : "warn"} />
        <KpiCard testId="kpi-avg-fps" label="Avg FPS" value={p?.avgFps ?? "—"} icon={<Activity size={14} />} />
        <KpiCard testId="kpi-avg-conf" label="Avg Detection Conf." value={p ? Math.round(p.avgDetectionConfidence * 100) : "—"} unit="%" icon={<Cpu size={14} />} />
        <KpiCard testId="kpi-events-24h" label="Events 24h" value={(p?.eventsIngested24h ?? 0).toLocaleString()} detail={`${counts.data?.count ?? 0} persisted in SQLite`} icon={<Server size={14} />} />
      </div>

      <Card title="ByteTrack pipeline" subtitle="How frames become events" testId="card-pipeline-flow">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-[12px]">
          {[
            { label: "RTSP ingest", note: "OpenCV / FFmpeg, per camera, timestamp synced via NTP" },
            { label: "Person detector", note: "YOLOX adapter, x1/y1/x2/y2/score format" },
            { label: "ByteTrack (per-camera)", note: "Associates low-score detections to keep occluded tracks" },
            { label: "Zone engine", note: "Foot-point polygon containment with hysteresis" },
            { label: "Event API", note: "POST /api/events · idempotent · pseudonymous IDs" },
          ].map((s, i) => (
            <div key={s.label} className="rounded-md border border-card-border bg-background/50 px-3 py-2.5 relative" data-testid={`step-pipeline-${i}`}>
              <div className="text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground mb-1">Step {i + 1}</div>
              <div className="font-medium">{s.label}</div>
              <div className="text-[11.5px] text-muted-foreground mt-1 leading-snug">{s.note}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="MVP limitation — Cross-camera identity" subtitle="The honest constraint built into MVP 1.0" action={<span className="text-amber-400"><GitBranch size={14} /></span>} testId="card-cross-cam">
        <p className="text-[13px] leading-relaxed">
          {p?.crossCameraIdNote ??
            "MVP 1.0 uses per-camera ByteTrack only. Global cross-camera identity is conservative and not promised."}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3 text-[12px]">
          <div className="rounded-md border border-card-border bg-background/50 px-3 py-2">
            <div className="text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">Reliable</div>
            <div className="mt-1">Per-camera tracks, zone events, dwell, queue dwell, entry/exit counts.</div>
          </div>
          <div className="rounded-md border border-card-border bg-background/50 px-3 py-2">
            <div className="text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">Conservative</div>
            <div className="mt-1">Floor transitions and visit stitching using entry/exit timing and camera topology.</div>
          </div>
          <div className="rounded-md border border-card-border bg-background/50 px-3 py-2">
            <div className="text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">Not promised</div>
            <div className="mt-1">Perfect global identity across all 12 cameras. Re-ID is a Phase 3 capability.</div>
          </div>
        </div>
      </Card>

      <Card title="Per-camera health" subtitle="12 cameras · 4 Floor 1 · 5 Floor 2 · 2 entry/exit · 1 checkout" testId="card-cam-health">
        <div className="overflow-x-auto">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="text-left text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground border-b border-border">
                <th className="py-1.5 font-medium">Camera</th>
                <th className="py-1.5 font-medium">Floor</th>
                <th className="py-1.5 font-medium">Role</th>
                <th className="py-1.5 font-medium text-right">FPS</th>
                <th className="py-1.5 font-medium text-right">Conf.</th>
                <th className="py-1.5 font-medium text-right">Uptime</th>
                <th className="py-1.5 font-medium text-right">Dropped</th>
                <th className="py-1.5 font-medium text-right">Tracks today</th>
                <th className="py-1.5 font-medium text-right">ID switches</th>
                <th className="py-1.5 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="tabular">
              {c.map((cam) => {
                const t = p?.perCameraTracks.find((x) => x.cameraId === cam.id);
                return (
                  <tr key={cam.id} className="border-b border-border/40 last:border-0" data-testid={`row-cam-${cam.id}`}>
                    <td className="py-2 pr-2">
                      <div className="font-medium">{cam.name}</div>
                      <div className="text-[11px] text-muted-foreground">{cam.id}</div>
                    </td>
                    <td className="py-2 text-muted-foreground">{cam.floor}</td>
                    <td className="py-2 text-muted-foreground">{cam.role}</td>
                    <td className="py-2 text-right">{cam.fps}</td>
                    <td className="py-2 text-right">{Math.round(cam.detectionConfidence * 100)}%</td>
                    <td className="py-2 text-right">{cam.uptimePct}%</td>
                    <td className="py-2 text-right">{cam.droppedFramesPct}%</td>
                    <td className="py-2 text-right">{t?.tracksToday ?? "—"}</td>
                    <td className="py-2 text-right">{t?.idSwitchesEstimated ?? "—"}</td>
                    <td className="py-2 text-right">
                      <Badge tone={cam.status === "online" ? "good" : cam.status === "degraded" ? "warn" : "bad"}>
                        {cam.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
