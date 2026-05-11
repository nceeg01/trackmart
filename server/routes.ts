import type { Express } from "express";
import type { Server } from "node:http";
import rateLimit from "express-rate-limit";
import { storage } from "./storage";
import { insertEventSchema } from "@shared/schema";
import {
  cameras,
  zones,
  zoneMetrics,
  hourlyTraffic,
  queueSnapshots,
  alerts,
  overview,
  pipeline,
  security,
  heatmap,
} from "./synthetic";

// Rate-limit the event ingestion endpoint: 60 requests/minute per IP.
// This prevents the public demo's SQLite DB from being flooded by anonymous
// callers. No auth is required (prototype demo), but abuse is throttled.
const eventsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests — rate limit is 60 events/minute per IP." },
});

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  app.get("/api/overview", (_req, res) => res.json(overview));
  app.get("/api/cameras", (_req, res) => res.json(cameras));
  app.get("/api/zones", (_req, res) => res.json(zones));
  app.get("/api/zone-metrics", (_req, res) => res.json(zoneMetrics));
  app.get("/api/traffic", (_req, res) => res.json(hourlyTraffic));
  app.get("/api/checkout/queue", (_req, res) => res.json(queueSnapshots));
  app.get("/api/alerts", (_req, res) => res.json(alerts));
  app.get("/api/pipeline", (_req, res) => res.json(pipeline));
  app.get("/api/security", (_req, res) => res.json(security));
  app.get("/api/heatmap", (_req, res) => res.json(heatmap));

  app.post("/api/events", eventsLimiter, async (req, res) => {
    const parsed = insertEventSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });
    const inserted = await storage.insertEvent(parsed.data);
    res.status(201).json(inserted);
  });

  app.get("/api/events/recent", async (req, res) => {
    const limit = Math.min(Number(req.query.limit) || 50, 500);
    res.json(await storage.recentEvents(limit));
  });

  app.get("/api/events/count", async (_req, res) => {
    res.json({ count: await storage.eventCount() });
  });

  return httpServer;
}
