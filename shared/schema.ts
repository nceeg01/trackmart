import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * Persistence tables. The MVP primarily reads from synthetic Day 1 data
 * computed in `server/synthetic.ts`. These tables exist so the event API
 * (`POST /api/events`) can persist additional ingested events.
 */

export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventType: text("event_type").notNull(), // track_started, zone_entered, zone_exited, line_crossed, queue_snapshot, alert_triggered
  cameraId: text("camera_id").notNull(),
  zoneId: text("zone_id"),
  trackId: text("track_id"),
  ts: text("ts").notNull(),
  confidence: real("confidence"),
  payload: text("payload"), // JSON string
});

export const insertEventSchema = createInsertSchema(events).omit({ id: true });
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

/* ----- Shared dashboard types (used by both client and server) ----- */

export type CameraRole = "entry" | "exit" | "aisle" | "checkout" | "floor";
export type ZoneType = "aisle" | "section" | "checkout" | "entry" | "exit" | "promo" | "transition";

export interface Camera {
  id: string;
  name: string;
  floor: "F1" | "F2" | "CHK" | "ENT";
  role: CameraRole;
  status: "online" | "degraded" | "offline";
  fps: number;
  detectionConfidence: number;
  uptimePct: number;
  droppedFramesPct: number;
}

export interface Zone {
  id: string;
  name: string;
  floor: "F1" | "F2";
  zoneType: ZoneType;
  polygon: [number, number][]; // floor-plan coordinates
}

export interface ZoneMetric {
  zoneId: string;
  name: string;
  floor: "F1" | "F2";
  zoneType: ZoneType;
  visitors: number;
  medianDwellSec: number;
  revisits: number;
  congestionMin: number;
  bestScore: number;
  deadScore: number;
  comfortScore: number;
  reasons: string[];
}

export interface HourlyTraffic {
  hour: number; // 0-23
  entries: number;
  exits: number;
  occupancy: number;
  floor1Occ: number;
  floor2Occ: number;
}

export interface QueueSnapshot {
  ts: string; // ISO hour
  count: number;
  waitEstimateSec: number;
  spillover: boolean;
}

export interface Alert {
  id: string;
  severity: "info" | "warn" | "critical";
  type: string;
  zoneId?: string;
  cameraId?: string;
  message: string;
  ts: string;
  active: boolean;
}

export interface OverviewKpis {
  totalVisitors: number;
  peakHourLabel: string;
  peakHourCount: number;
  avgVisitDurationMin: number;
  checkoutWaitProxySec: number;
  bestSection: { id: string; name: string; score: number; reason: string };
  deadSection: { id: string; name: string; score: number; reason: string };
  comfortScore: number; // 0-100
  comfortLabel: "comfortable" | "watch" | "friction";
  confidence: number; // 0-1 data quality
  detectionsTotal: number;
  tracksTotal: number;
}

export interface PipelineStatus {
  totalCameras: number;
  onlineCameras: number;
  avgFps: number;
  avgDetectionConfidence: number;
  eventsIngested24h: number;
  crossCameraIdNote: string;
  perCameraTracks: { cameraId: string; name: string; tracksToday: number; idSwitchesEstimated: number; fps: number; status: string }[];
}

export interface SecurityIndicators {
  rawVideoRetentionDays: number;
  trackPointRetentionDays: number;
  zoneEventRetentionDays: number;
  dailyAggregateRetention: string;
  auditLogRetentionYears: number;
  pseudonymousIds: boolean;
  faceIdentity: boolean;
  rbacRoles: string[];
  encryptionAtRest: boolean;
  signageDeployed: boolean;
  recentAuditLogs: { actor: string; action: string; object: string; ts: string; result: string }[];
}
