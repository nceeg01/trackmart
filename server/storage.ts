import { events } from "@shared/schema";
import type { Event, InsertEvent } from "@shared/schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { sql } from "drizzle-orm";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite);

// Bootstrap schema (idempotent)
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    camera_id TEXT NOT NULL,
    zone_id TEXT,
    track_id TEXT,
    ts TEXT NOT NULL,
    confidence REAL,
    payload TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_events_ts ON events(ts);
  CREATE INDEX IF NOT EXISTS idx_events_camera ON events(camera_id);
`);

export interface IStorage {
  insertEvent(event: InsertEvent): Promise<Event>;
  recentEvents(limit?: number): Promise<Event[]>;
  eventCount(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async insertEvent(event: InsertEvent): Promise<Event> {
    return db.insert(events).values(event).returning().get();
  }
  async recentEvents(limit = 50): Promise<Event[]> {
    return db.select().from(events).orderBy(sql`id desc`).limit(limit).all();
  }
  async eventCount(): Promise<number> {
    const row = db.select({ c: sql<number>`count(*)` }).from(events).get();
    return row?.c ?? 0;
  }
}

export const storage = new DatabaseStorage();
