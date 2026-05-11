import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, Badge } from "@/components/Kpi";
import type { Zone, ZoneMetric } from "@shared/schema";

interface HeatLayer { zoneId: string; dwell: number; motion: number; friction: number }

type Layer = "dwell" | "motion" | "friction";

const LAYER_LABELS: Record<Layer, { label: string; sub: string; lo: string; hi: string }> = {
  dwell: {
    label: "Dwell",
    sub: "Where people stop and linger. Median seconds per visit, normalized.",
    lo: "Short stay",
    hi: "Long dwell",
  },
  motion: {
    label: "Motion",
    sub: "Where people travel. Visitor reach per zone, normalized.",
    lo: "Avoided",
    hi: "High traffic",
  },
  friction: {
    label: "Friction",
    sub: "Where people slow down. Congestion minutes, normalized.",
    lo: "Smooth",
    hi: "Congested",
  },
};

function colorFor(layer: Layer, value: number) {
  // Sequential single-hue gradient
  const v = Math.max(0, Math.min(1, value));
  const hue = layer === "dwell" ? 187 : layer === "motion" ? 35 : 354;
  const sat = 92;
  const light = 75 - v * 40;
  const alpha = 0.18 + v * 0.6;
  return `hsla(${hue}, ${sat}%, ${light}%, ${alpha})`;
}

function strokeFor(layer: Layer, value: number) {
  const hue = layer === "dwell" ? 187 : layer === "motion" ? 35 : 354;
  return `hsl(${hue}, 92%, ${value > 0.4 ? 55 : 40}%)`;
}

export default function Heatmap() {
  const zones = useQuery<Zone[]>({ queryKey: ["/api/zones"] });
  const heat = useQuery<HeatLayer[]>({ queryKey: ["/api/heatmap"] });
  const metrics = useQuery<ZoneMetric[]>({ queryKey: ["/api/zone-metrics"] });

  const [layer, setLayer] = useState<Layer>("dwell");
  const [hovered, setHovered] = useState<string | null>(null);

  const heatMap = new Map(heat.data?.map((h) => [h.zoneId, h]) ?? []);
  const metricsMap = new Map(metrics.data?.map((m) => [m.zoneId, m]) ?? []);

  const allZones = zones.data ?? [];
  const f1Zones = allZones.filter((z) => z.floor === "F1");
  const f2Zones = allZones.filter((z) => z.floor === "F2");

  const cfg = LAYER_LABELS[layer];
  const hoveredZone = hovered ? allZones.find((z) => z.id === hovered) : null;
  const hoveredMetric = hovered ? metricsMap.get(hovered) : null;
  const hoveredHeat = hovered ? heatMap.get(hovered) : null;

  return (
    <div className="space-y-6" data-testid="page-heatmap">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-[20px] font-semibold tracking-tight">Floor heatmap</h2>
          <p className="text-[12px] text-muted-foreground mt-1 max-w-2xl">{cfg.sub}</p>
        </div>
        <div className="flex items-center gap-1 bg-card border border-card-border rounded-md p-0.5">
          {(["dwell", "motion", "friction"] as Layer[]).map((l) => (
            <button
              key={l}
              data-testid={`button-layer-${l}`}
              onClick={() => setLayer(l)}
              className={`px-3 py-1.5 text-[11.5px] rounded capitalize ${
                layer === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover-elevate"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
        <div className="space-y-4">
          <Card title="Floor 1" subtitle="15 zones · entry → aisles → checkout" testId="card-floor-1">
            <FloorMap
              zones={f1Zones}
              heat={heatMap}
              layer={layer}
              hovered={hovered}
              onHover={setHovered}
            />
          </Card>
          <Card title="Floor 2" subtitle="15 zones · stair-led layout, back-right historically cold" testId="card-floor-2">
            <FloorMap
              zones={f2Zones}
              heat={heatMap}
              layer={layer}
              hovered={hovered}
              onHover={setHovered}
            />
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Legend" subtitle={`${cfg.label} intensity`} testId="card-legend">
            <div className="space-y-2">
              <div
                className="h-3 rounded"
                style={{
                  background: `linear-gradient(90deg, ${colorFor(layer, 0)}, ${colorFor(layer, 0.5)}, ${colorFor(layer, 1)})`,
                }}
              />
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>{cfg.lo}</span>
                <span>{cfg.hi}</span>
              </div>
            </div>
          </Card>

          <Card title="Zone inspector" subtitle="Hover a zone on the map" testId="card-inspector">
            {hoveredZone && hoveredMetric && hoveredHeat ? (
              <div className="space-y-2.5 text-[12.5px]">
                <div>
                  <div className="font-semibold">{hoveredZone.name}</div>
                  <div className="text-[11px] text-muted-foreground">{hoveredZone.id} · {hoveredZone.zoneType}</div>
                </div>
                <Row label="Visitors" value={String(hoveredMetric.visitors)} />
                <Row label="Median dwell" value={`${hoveredMetric.medianDwellSec}s`} />
                <Row label="Revisits" value={String(hoveredMetric.revisits)} />
                <Row label="Congestion" value={`${hoveredMetric.congestionMin} min`} />
                <Row label="Dwell heat" value={`${Math.round(hoveredHeat.dwell * 100)}%`} />
                <Row label="Motion heat" value={`${Math.round(hoveredHeat.motion * 100)}%`} />
                <Row label="Friction heat" value={`${Math.round(hoveredHeat.friction * 100)}%`} />
                <div className="pt-1.5 mt-1.5 border-t border-border/60">
                  <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground mb-1">Reasons</div>
                  <div className="flex flex-wrap gap-1">
                    {hoveredMetric.reasons.map((r) => (
                      <Badge key={r}>{r}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-[12px] text-muted-foreground py-8 text-center">
                Hover a zone to see metrics, comfort score, and ranking reasons.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="tabular font-medium">{value}</span>
    </div>
  );
}

function FloorMap({
  zones,
  heat,
  layer,
  hovered,
  onHover,
}: {
  zones: Zone[];
  heat: Map<string, HeatLayer>;
  layer: Layer;
  hovered: string | null;
  onHover: (id: string | null) => void;
}) {
  // floor plan coords range roughly 0..8 x 0..6
  const W = 800;
  const H = 360;
  const sx = W / 8;
  const sy = H / 6;

  return (
    <div className="relative w-full bg-grid rounded-md border border-border/60 overflow-hidden" style={{ aspectRatio: `${W} / ${H}` }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full block" preserveAspectRatio="none">
        {zones.map((z) => {
          const h = heat.get(z.id);
          const v = h ? h[layer] : 0;
          const fill = colorFor(layer, v);
          const stroke = strokeFor(layer, v);
          const pts = z.polygon.map(([x, y]) => `${x * sx},${y * sy}`).join(" ");
          const isHover = hovered === z.id;
          // centroid
          const cx = z.polygon.reduce((s, [x]) => s + x, 0) / z.polygon.length;
          const cy = z.polygon.reduce((s, [, y]) => s + y, 0) / z.polygon.length;
          return (
            <g
              key={z.id}
              onMouseEnter={() => onHover(z.id)}
              onMouseLeave={() => onHover(null)}
              style={{ cursor: "pointer" }}
              data-testid={`zone-${z.id}`}
            >
              <polygon
                points={pts}
                fill={fill}
                stroke={isHover ? "hsl(var(--primary))" : stroke}
                strokeWidth={isHover ? 2 : 1}
                style={{ transition: "all 120ms ease" }}
              />
              <text
                x={cx * sx}
                y={cy * sy}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="9"
                fontWeight="500"
                fill="hsl(var(--foreground))"
                opacity={0.85}
                pointerEvents="none"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                {z.id.replace("F1-", "").replace("F2-", "")}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
