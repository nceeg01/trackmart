/**
 * Synthetic Day 1 dataset for the ByteTrack Retail MVP.
 *
 * Scenario: 12 cameras, 30 zones, 25 total customers across one business day.
 * All values are deterministic (seeded) so the dashboard renders consistently.
 */

import type {
  Camera,
  Zone,
  ZoneMetric,
  HourlyTraffic,
  QueueSnapshot,
  Alert,
  OverviewKpis,
  PipelineStatus,
  SecurityIndicators,
} from "@shared/schema";

// ---------------- Seeded RNG ----------------
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(20250511);
const r = (min: number, max: number) => min + rng() * (max - min);
const ri = (min: number, max: number) => Math.floor(r(min, max + 1));

// ---------------- Cameras (12) ----------------
export const cameras: Camera[] = [
  { id: "CAM-ENT-01", name: "Entry — Main Door", floor: "ENT", role: "entry", status: "online", fps: 28, detectionConfidence: 0.86, uptimePct: 99.7, droppedFramesPct: 0.4 },
  { id: "CAM-ENT-02", name: "Exit — Main Door", floor: "ENT", role: "exit", status: "online", fps: 28, detectionConfidence: 0.84, uptimePct: 99.6, droppedFramesPct: 0.6 },
  { id: "CAM-F1-01", name: "Floor 1 — Front Aisles", floor: "F1", role: "floor", status: "online", fps: 25, detectionConfidence: 0.81, uptimePct: 99.2, droppedFramesPct: 1.1 },
  { id: "CAM-F1-02", name: "Floor 1 — Mid Aisles", floor: "F1", role: "floor", status: "online", fps: 25, detectionConfidence: 0.79, uptimePct: 98.9, droppedFramesPct: 1.5 },
  { id: "CAM-F1-03", name: "Floor 1 — Back Wall", floor: "F1", role: "floor", status: "degraded", fps: 18, detectionConfidence: 0.62, uptimePct: 94.8, droppedFramesPct: 6.2 },
  { id: "CAM-F1-04", name: "Floor 1 — Promo Display", floor: "F1", role: "aisle", status: "online", fps: 26, detectionConfidence: 0.83, uptimePct: 99.4, droppedFramesPct: 0.8 },
  { id: "CAM-F2-01", name: "Floor 2 — Stair Landing", floor: "F2", role: "floor", status: "online", fps: 27, detectionConfidence: 0.85, uptimePct: 99.5, droppedFramesPct: 0.5 },
  { id: "CAM-F2-02", name: "Floor 2 — Center", floor: "F2", role: "floor", status: "online", fps: 26, detectionConfidence: 0.80, uptimePct: 99.1, droppedFramesPct: 1.2 },
  { id: "CAM-F2-03", name: "Floor 2 — Back Left", floor: "F2", role: "floor", status: "online", fps: 24, detectionConfidence: 0.74, uptimePct: 97.2, droppedFramesPct: 2.8 },
  { id: "CAM-F2-04", name: "Floor 2 — Back Right", floor: "F2", role: "aisle", status: "online", fps: 25, detectionConfidence: 0.77, uptimePct: 98.4, droppedFramesPct: 1.9 },
  { id: "CAM-F2-05", name: "Floor 2 — Window Wall", floor: "F2", role: "floor", status: "online", fps: 26, detectionConfidence: 0.82, uptimePct: 99.3, droppedFramesPct: 0.9 },
  { id: "CAM-CHK-01", name: "Checkout — Register Lane", floor: "CHK", role: "checkout", status: "online", fps: 29, detectionConfidence: 0.88, uptimePct: 99.9, droppedFramesPct: 0.2 },
];

// ---------------- Zones (30) ----------------
// Floor 1: 15 zones laid out on an 8x6 grid (units in floor-plan coords)
// Floor 2: 15 zones on an 8x6 grid
function makeRect(x: number, y: number, w: number, h: number): [number, number][] {
  return [
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ];
}

const f1: Zone[] = [
  { id: "F1-ENT", name: "Entry Foyer", floor: "F1", zoneType: "entry", polygon: makeRect(0.5, 0.4, 1.6, 1.0) },
  { id: "F1-A01", name: "F1 Aisle 01 — Produce", floor: "F1", zoneType: "aisle", polygon: makeRect(2.4, 0.4, 1.4, 1.0) },
  { id: "F1-A02", name: "F1 Aisle 02 — Bakery", floor: "F1", zoneType: "aisle", polygon: makeRect(4.0, 0.4, 1.4, 1.0) },
  { id: "F1-A03", name: "F1 Aisle 03 — Deli", floor: "F1", zoneType: "aisle", polygon: makeRect(5.6, 0.4, 1.4, 1.0) },
  { id: "F1-PROMO", name: "F1 Promo Display", floor: "F1", zoneType: "promo", polygon: makeRect(2.4, 1.6, 1.6, 0.9) },
  { id: "F1-A04", name: "F1 Aisle 04 — Snacks", floor: "F1", zoneType: "aisle", polygon: makeRect(4.2, 1.6, 1.4, 0.9) },
  { id: "F1-A05", name: "F1 Aisle 05 — Beverages", floor: "F1", zoneType: "aisle", polygon: makeRect(5.8, 1.6, 1.4, 0.9) },
  { id: "F1-T01", name: "F1 Center Lane", floor: "F1", zoneType: "transition", polygon: makeRect(0.5, 2.7, 6.7, 0.5) },
  { id: "F1-A06", name: "F1 Aisle 06 — Dairy", floor: "F1", zoneType: "aisle", polygon: makeRect(0.7, 3.3, 1.4, 1.0) },
  { id: "F1-A07", name: "F1 Aisle 07 — Frozen", floor: "F1", zoneType: "aisle", polygon: makeRect(2.3, 3.3, 1.4, 1.0) },
  { id: "F1-A08", name: "F1 Aisle 08 — Meat", floor: "F1", zoneType: "aisle", polygon: makeRect(3.9, 3.3, 1.4, 1.0) },
  { id: "F1-B01", name: "F1 Back Wall — Seasonal", floor: "F1", zoneType: "section", polygon: makeRect(5.5, 3.3, 1.7, 1.0) },
  { id: "F1-A09", name: "F1 Aisle 09 — Household", floor: "F1", zoneType: "aisle", polygon: makeRect(0.7, 4.5, 2.0, 1.0) },
  { id: "F1-A10", name: "F1 Aisle 10 — Pet", floor: "F1", zoneType: "aisle", polygon: makeRect(2.9, 4.5, 2.0, 1.0) },
  { id: "F1-CHK", name: "Checkout Queue", floor: "F1", zoneType: "checkout", polygon: makeRect(5.1, 4.5, 2.1, 1.0) },
];

const f2: Zone[] = [
  { id: "F2-STR", name: "Stair Landing", floor: "F2", zoneType: "transition", polygon: makeRect(0.5, 0.4, 1.6, 1.0) },
  { id: "F2-A01", name: "F2 Aisle 01 — Apparel Front", floor: "F2", zoneType: "aisle", polygon: makeRect(2.4, 0.4, 1.4, 1.0) },
  { id: "F2-A02", name: "F2 Aisle 02 — Outerwear", floor: "F2", zoneType: "aisle", polygon: makeRect(4.0, 0.4, 1.4, 1.0) },
  { id: "F2-PROMO", name: "F2 Promo Endcap", floor: "F2", zoneType: "promo", polygon: makeRect(5.6, 0.4, 1.6, 1.0) },
  { id: "F2-A03", name: "F2 Aisle 03 — Footwear", floor: "F2", zoneType: "aisle", polygon: makeRect(0.7, 1.6, 1.6, 0.9) },
  { id: "F2-A04", name: "F2 Aisle 04 — Accessories", floor: "F2", zoneType: "aisle", polygon: makeRect(2.5, 1.6, 1.4, 0.9) },
  { id: "F2-A05", name: "F2 Aisle 05 — Home Goods", floor: "F2", zoneType: "aisle", polygon: makeRect(4.1, 1.6, 1.4, 0.9) },
  { id: "F2-WIN", name: "F2 Window Wall", floor: "F2", zoneType: "section", polygon: makeRect(5.7, 1.6, 1.5, 0.9) },
  { id: "F2-T01", name: "F2 Center Lane", floor: "F2", zoneType: "transition", polygon: makeRect(0.5, 2.7, 6.7, 0.5) },
  { id: "F2-A06", name: "F2 Aisle 06 — Electronics", floor: "F2", zoneType: "aisle", polygon: makeRect(0.7, 3.3, 1.5, 1.0) },
  { id: "F2-A07", name: "F2 Aisle 07 — Toys", floor: "F2", zoneType: "aisle", polygon: makeRect(2.4, 3.3, 1.5, 1.0) },
  { id: "F2-A08", name: "F2 Aisle 08 — Books", floor: "F2", zoneType: "aisle", polygon: makeRect(4.1, 3.3, 1.5, 1.0) },
  { id: "F2-B01", name: "F2 Back Left — Clearance", floor: "F2", zoneType: "section", polygon: makeRect(0.7, 4.5, 1.6, 1.0) },
  { id: "F2-B02", name: "F2 Center — Lounge", floor: "F2", zoneType: "section", polygon: makeRect(2.5, 4.5, 2.4, 1.0) },
  { id: "F2-B03", name: "F2 Back Right — Returns", floor: "F2", zoneType: "section", polygon: makeRect(5.1, 4.5, 2.1, 1.0) },
];

export const zones: Zone[] = [...f1, ...f2];

// ---------------- Hourly traffic (8AM – 9PM) ----------------
// 25 total entries; peak 5–6 PM with 7 entries
const hourlyEntries: Record<number, number> = {
  8: 0, 9: 1, 10: 2, 11: 2, 12: 3, 13: 2, 14: 1,
  15: 2, 16: 3, 17: 7, 18: 1, 19: 1, 20: 0, 21: 0,
};

export const hourlyTraffic: HourlyTraffic[] = (() => {
  let occupancy = 0;
  const out: HourlyTraffic[] = [];
  for (let h = 8; h <= 21; h++) {
    const entries = hourlyEntries[h] ?? 0;
    // exits lag entries by ~20-40 min so distribute exits to later hours
    const exits = h <= 9 ? 0 : Math.max(0, Math.round((hourlyEntries[h - 1] ?? 0) * 0.7) + (h >= 18 ? 1 : 0));
    occupancy = Math.max(0, occupancy + entries - exits);
    out.push({
      hour: h,
      entries,
      exits,
      occupancy,
      floor1Occ: Math.round(occupancy * 0.6),
      floor2Occ: Math.round(occupancy * 0.4),
    });
  }
  return out;
})();

// ---------------- Zone metrics (30) ----------------
const ZONE_PROFILE: Record<string, { reach: number; dwell: number; revisit: number; cong: number; reasons: string[] }> = {
  // Floor 1 — strong front, dead back-right
  "F1-ENT":   { reach: 25, dwell: 8, revisit: 3, cong: 6, reasons: ["entry funnel"] },
  "F1-A01":   { reach: 18, dwell: 64, revisit: 5, cong: 2, reasons: ["healthy dwell", "high reach"] },
  "F1-A02":   { reach: 16, dwell: 58, revisit: 4, cong: 2, reasons: ["healthy dwell"] },
  "F1-A03":   { reach: 14, dwell: 49, revisit: 3, cong: 2, reasons: ["healthy dwell"] },
  "F1-PROMO": { reach: 19, dwell: 72, revisit: 6, cong: 3, reasons: ["promo working", "high revisits"] },
  "F1-A04":   { reach: 17, dwell: 75, revisit: 7, cong: 3, reasons: ["healthy dwell", "best-section signal"] }, // BEST
  "F1-A05":   { reach: 13, dwell: 41, revisit: 2, cong: 1, reasons: ["moderate engagement"] },
  "F1-T01":   { reach: 22, dwell: 5,  revisit: 0, cong: 1, reasons: ["transition corridor"] },
  "F1-A06":   { reach: 11, dwell: 38, revisit: 2, cong: 1, reasons: ["moderate engagement"] },
  "F1-A07":   { reach: 9,  dwell: 32, revisit: 1, cong: 1, reasons: ["moderate engagement"] },
  "F1-A08":   { reach: 8,  dwell: 28, revisit: 1, cong: 1, reasons: ["moderate engagement"] },
  "F1-B01":   { reach: 4,  dwell: 14, revisit: 0, cong: 0, reasons: ["low reach", "no revisits"] },
  "F1-A09":   { reach: 7,  dwell: 22, revisit: 1, cong: 1, reasons: ["moderate engagement"] },
  "F1-A10":   { reach: 5,  dwell: 18, revisit: 0, cong: 0, reasons: ["low reach"] },
  "F1-CHK":   { reach: 22, dwell: 288,revisit: 0, cong: 9, reasons: ["queue forms here"] },

  // Floor 2 — back-right is dead
  "F2-STR":   { reach: 14, dwell: 7,  revisit: 0, cong: 1, reasons: ["transit zone"] },
  "F2-A01":   { reach: 11, dwell: 52, revisit: 3, cong: 2, reasons: ["healthy dwell"] },
  "F2-A02":   { reach: 9,  dwell: 44, revisit: 2, cong: 1, reasons: ["moderate engagement"] },
  "F2-PROMO": { reach: 10, dwell: 38, revisit: 2, cong: 1, reasons: ["moderate engagement"] },
  "F2-A03":   { reach: 8,  dwell: 60, revisit: 3, cong: 2, reasons: ["healthy dwell"] },
  "F2-A04":   { reach: 7,  dwell: 34, revisit: 1, cong: 1, reasons: ["moderate engagement"] },
  "F2-A05":   { reach: 6,  dwell: 28, revisit: 1, cong: 0, reasons: ["low reach"] },
  "F2-WIN":   { reach: 5,  dwell: 22, revisit: 0, cong: 0, reasons: ["low reach"] },
  "F2-T01":   { reach: 12, dwell: 4,  revisit: 0, cong: 0, reasons: ["transition"] },
  "F2-A06":   { reach: 6,  dwell: 41, revisit: 1, cong: 1, reasons: ["moderate engagement"] },
  "F2-A07":   { reach: 4,  dwell: 18, revisit: 0, cong: 0, reasons: ["low reach"] },
  "F2-A08":   { reach: 3,  dwell: 12, revisit: 0, cong: 0, reasons: ["low reach", "low dwell"] },
  "F2-B01":   { reach: 2,  dwell: 9,  revisit: 0, cong: 0, reasons: ["very low reach"] },
  "F2-B02":   { reach: 6,  dwell: 96, revisit: 2, cong: 0, reasons: ["long dwell — possible niche engagement"] },
  "F2-B03":   { reach: 1,  dwell: 4,  revisit: 0, cong: 0, reasons: ["1 visitor", "4s median dwell", "no revisits", "no path centrality"] }, // DEAD
};

function normalize(values: number[]): number[] {
  const max = Math.max(...values, 1);
  return values.map((v) => v / max);
}

export const zoneMetrics: ZoneMetric[] = (() => {
  const ids = zones.map((z) => z.id);
  const reaches = ids.map((id) => ZONE_PROFILE[id].reach);
  const dwells = ids.map((id) => ZONE_PROFILE[id].dwell);
  const revisits = ids.map((id) => ZONE_PROFILE[id].revisit);
  const congs = ids.map((id) => ZONE_PROFILE[id].cong);
  const nReach = normalize(reaches);
  const nDwell = normalize(dwells);
  const nRev = normalize(revisits);
  const nCong = normalize(congs);

  return zones.map((z, i) => {
    const p = ZONE_PROFILE[z.id];
    // skip scoring for entry/checkout/transition for ranking purposes
    const skipRank = z.zoneType === "checkout" || z.zoneType === "entry" || z.zoneType === "transition";
    const flowProxy = nReach[i] * 0.7 + nRev[i] * 0.3;
    const friction = nCong[i];
    const best = skipRank ? 0 : Math.max(0, 0.25 * nReach[i] + 0.25 * nDwell[i] + 0.15 * nRev[i] + 0.15 * flowProxy + 0.20 * nDwell[i] - 0.20 * friction);
    const dead = skipRank ? 0 : Math.max(0, 0.30 * (1 - nReach[i]) + 0.25 * (1 - nDwell[i]) + 0.15 * (1 - nRev[i]) + 0.15 * (1 - flowProxy) + 0.15 * (1 - nDwell[i]));
    const comfort = Math.max(0, Math.min(1, 1 - friction * 0.6 - (z.zoneType === "checkout" ? 0.25 : 0)));
    return {
      zoneId: z.id,
      name: z.name,
      floor: z.floor,
      zoneType: z.zoneType,
      visitors: p.reach,
      medianDwellSec: p.dwell,
      revisits: p.revisit,
      congestionMin: p.cong,
      bestScore: Math.round(best * 100),
      deadScore: Math.round(dead * 100),
      comfortScore: Math.round(comfort * 100),
      reasons: p.reasons,
    };
  });
})();

// ---------------- Checkout queue snapshots ----------------
// Captures the 5:20–5:35 PM spike
export const queueSnapshots: QueueSnapshot[] = (() => {
  const out: QueueSnapshot[] = [];
  // every 5 min from 4:00 PM to 7:00 PM
  for (let m = 16 * 60; m <= 19 * 60; m += 5) {
    const h = Math.floor(m / 60);
    const mm = m % 60;
    let count = 1 + Math.round(rng() * 1.5);
    let wait = 90;
    let spillover = false;
    if (h === 17 && mm >= 15 && mm <= 40) {
      count = mm === 25 ? 6 : mm === 30 ? 5 : 4;
      wait = 240 + (mm - 20) * 18;
      spillover = mm >= 25 && mm <= 35;
    } else if (h === 17) {
      count = 2 + Math.round(rng() * 1.2);
      wait = 150;
    } else if (h === 18) {
      count = 1 + Math.round(rng());
      wait = 110;
    }
    out.push({
      ts: `2026-01-19T${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00Z`,
      count,
      waitEstimateSec: Math.round(wait),
      spillover,
    });
  }
  return out;
})();

// ---------------- Alerts ----------------
export const alerts: Alert[] = [
  { id: "ALT-001", severity: "critical", type: "checkout_spillover", zoneId: "F1-CHK", cameraId: "CAM-CHK-01", message: "Checkout queue spilled into Aisle 10 between 5:20 PM and 5:35 PM. Peak count 6.", ts: "2026-01-19T17:25:00Z", active: false },
  { id: "ALT-002", severity: "warn", type: "dead_section", zoneId: "F2-B03", message: "F2 Back Right — Returns has 1 visitor and 4s median dwell on Day 1. Three-day baseline pending.", ts: "2026-01-19T18:00:00Z", active: true },
  { id: "ALT-003", severity: "warn", type: "camera_degraded", cameraId: "CAM-F1-03", message: "CAM-F1-03 detection confidence dropped to 62%. Possible glare from afternoon sun.", ts: "2026-01-19T15:40:00Z", active: true },
  { id: "ALT-004", severity: "info", type: "best_section", zoneId: "F1-A04", message: "F1 Aisle 04 — Snacks is the best-performing section today (17 visitors, 75s median dwell).", ts: "2026-01-19T20:10:00Z", active: false },
  { id: "ALT-005", severity: "warn", type: "low_confidence_tracks", cameraId: "CAM-F1-03", message: "4 low-quality tracks flagged on CAM-F1-03 in the last hour. Aggregates reported with reduced confidence.", ts: "2026-01-19T16:10:00Z", active: true },
  { id: "ALT-006", severity: "info", type: "promo_response", zoneId: "F1-PROMO", message: "F1 Promo Display received 19 visitors with 6 revisits — strong response to seasonal endcap.", ts: "2026-01-19T19:30:00Z", active: false },
];

// ---------------- Overview KPIs ----------------
export const overview: OverviewKpis = (() => {
  const totalVisitors = Object.values(hourlyEntries).reduce((a, b) => a + b, 0); // 25
  const best = zoneMetrics.reduce((a, b) => (b.bestScore > a.bestScore ? b : a));
  const dead = zoneMetrics.reduce((a, b) => (b.deadScore > a.deadScore ? b : a));
  const checkoutZone = zoneMetrics.find((z) => z.zoneId === "F1-CHK")!;
  const peakHourCount = Math.max(...Object.values(hourlyEntries));
  const peakHour = Number(Object.entries(hourlyEntries).find(([, v]) => v === peakHourCount)![0]);
  const formatHour = (h: number) => {
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    const next = (h + 1) % 12 || 12;
    const nextAmpm = (h + 1) >= 12 && (h + 1) < 24 ? "PM" : "AM";
    return `${h12} ${ampm} – ${next} ${nextAmpm}`;
  };

  // avg visit duration: total dwell across all zones / visitors
  const totalDwellSec = zoneMetrics.reduce((s, z) => s + z.medianDwellSec * z.visitors, 0);
  const avgVisitMin = +(totalDwellSec / totalVisitors / 60).toFixed(1);

  // Comfort score: store-wide
  const comfort = 78;

  return {
    totalVisitors,
    peakHourLabel: formatHour(peakHour),
    peakHourCount,
    avgVisitDurationMin: avgVisitMin,
    checkoutWaitProxySec: Math.round(checkoutZone.medianDwellSec),
    bestSection: { id: best.zoneId, name: best.name, score: best.bestScore, reason: best.reasons.join(" · ") },
    deadSection: { id: dead.zoneId, name: dead.name, score: dead.deadScore, reason: dead.reasons.join(" · ") },
    comfortScore: comfort,
    comfortLabel: comfort >= 75 ? "comfortable" : comfort >= 55 ? "watch" : "friction",
    confidence: 0.82,
    detectionsTotal: 18420,
    tracksTotal: 162,
  };
})();

// ---------------- Pipeline status ----------------
export const pipeline: PipelineStatus = (() => {
  const online = cameras.filter((c) => c.status === "online").length;
  const avgFps = +(cameras.reduce((s, c) => s + c.fps, 0) / cameras.length).toFixed(1);
  const avgConf = +(cameras.reduce((s, c) => s + c.detectionConfidence, 0) / cameras.length).toFixed(2);
  return {
    totalCameras: cameras.length,
    onlineCameras: online,
    avgFps,
    avgDetectionConfidence: avgConf,
    eventsIngested24h: 9482,
    crossCameraIdNote:
      "MVP 1.0 uses per-camera ByteTrack only. Global cross-camera identity is conservative and not promised — visits are sessionized from entry/exit timing and floor transitions, with confidence flags on suspected re-entries.",
    perCameraTracks: cameras.map((c) => ({
      cameraId: c.id,
      name: c.name,
      tracksToday: c.role === "entry" || c.role === "exit" ? 28 + ri(0, 4) : c.role === "checkout" ? 24 : 8 + ri(0, 14),
      idSwitchesEstimated: c.status === "degraded" ? 6 : ri(0, 3),
      fps: c.fps,
      status: c.status,
    })),
  };
})();

// ---------------- Security indicators ----------------
export const security: SecurityIndicators = {
  rawVideoRetentionDays: 14,
  trackPointRetentionDays: 60,
  zoneEventRetentionDays: 730,
  dailyAggregateRetention: "indefinite",
  auditLogRetentionYears: 3,
  pseudonymousIds: true,
  faceIdentity: false,
  rbacRoles: ["owner", "admin", "viewer"],
  encryptionAtRest: true,
  signageDeployed: true,
  recentAuditLogs: [
    { actor: "owner@store.local", action: "VIEW_ALERT", object: "ALT-001", ts: "2026-01-19T17:32:00Z", result: "ok" },
    { actor: "admin@store.local", action: "UPDATE_ZONE", object: "F1-CHK", ts: "2026-01-19T15:02:00Z", result: "ok" },
    { actor: "admin@store.local", action: "ROTATE_KEY", object: "kms-key-cam-rtsp", ts: "2026-01-18T22:00:00Z", result: "ok" },
    { actor: "viewer@store.local", action: "EXPORT_DAILY_REPORT", object: "2026-01-18", ts: "2026-01-19T09:14:00Z", result: "ok" },
    { actor: "system", action: "RETENTION_SWEEP", object: "raw_video", ts: "2026-01-19T03:00:00Z", result: "ok" },
  ],
};

// ---------------- Heatmap layer ----------------
// For each zone, output normalized intensity for dwell, motion, friction
export interface HeatLayer {
  zoneId: string;
  dwell: number;   // 0-1
  motion: number;  // 0-1 (visitors / max)
  friction: number;// 0-1
}

export const heatmap: HeatLayer[] = (() => {
  const maxDwell = Math.max(...zoneMetrics.map((z) => z.medianDwellSec));
  const maxVisitors = Math.max(...zoneMetrics.map((z) => z.visitors));
  const maxCong = Math.max(...zoneMetrics.map((z) => z.congestionMin), 1);
  return zoneMetrics.map((z) => ({
    zoneId: z.zoneId,
    dwell: z.medianDwellSec / maxDwell,
    motion: z.visitors / maxVisitors,
    friction: z.congestionMin / maxCong,
  }));
})();
