# TrackMart

TrackMart is an MVP dashboard for ByteTrack-powered retail customer behavior analytics from CCTV footage. The goal is to help store owners understand how customers move through a store, which sections perform well, which sections are dead zones, and where checkout or aisle friction may be hurting the shopping experience.

This repository is an MVP prototype. It currently uses a deterministic synthetic Day 1 dataset rather than real CCTV streams, so business owners, operators, developers, and data people can review the product concept before real-world camera integration.

## MVP abstract

Retail owners often know what sold, but they do not always know how customers moved before the sale. TrackMart explores whether CCTV-based movement analytics can help owners make better decisions about layout, staffing, signage, product placement, and checkout operations.

MVP 1.0 models a store with 12 CCTV feeds, 30 zones and aisles, and a Day 1 scenario with 25 visitors. The dashboard shows traffic patterns, dwell time, best-performing sections, dead-section risks, checkout queue friction, customer-flow heatmaps, alerts, camera health, and privacy/security indicators.

The key product question is: can a simple owner-facing dashboard turn store footage into practical business intelligence for small and medium retail businesses?

## What the dashboard answers

- How many customers came in today, and when?
- Which aisles or sections attracted the most attention?
- Which areas look like dead zones with low reach, low dwell, or low path centrality?
- How long did customers spend near checkout?
- Where did bottlenecks, queue spillovers, or uncomfortable roaming patterns appear?
- Which store layout or staffing changes should the owner test next?

## Current MVP features

- Overview KPI strip for total visitors, peak hour, average visit duration, checkout wait proxy, best section, dead section, and comfort score.
- Traffic page with hourly entries and store occupancy trends.
- Section performance page ranking best sections and dead-section risks.
- Interactive heatmap page with dwell, motion, and friction layers across 30 zones.
- Checkout page showing queue pressure, wait proxy, and spillover periods.
- Alerts page for checkout congestion, camera degradation, and dead-section risks.
- Pipeline page explaining the ByteTrack event pipeline and MVP limitations.
- Admin and security page with retention policy, pseudonymous IDs, audit logging, and camera health.
- Backend API routes with synthetic data and SQLite-backed event ingestion.
- Rate-limited `POST /api/events` endpoint for prototype event ingestion.

## Tech stack

- React
- Vite
- TypeScript
- Express
- SQLite via Drizzle ORM and `better-sqlite3`
- TanStack Query
- Tailwind CSS
- Recharts
- Wouter hash routing

## ByteTrack integration plan

MVP 1.0 currently focuses on the business dashboard and event model. The next implementation layer is the real computer-vision pipeline:

1. Read CCTV footage or RTSP streams with OpenCV, FFmpeg, or GStreamer.
2. Run a person detector per camera.
3. Pass detections into ByteTrack for per-camera tracking.
4. Convert local tracks into events such as `track_started`, `zone_entered`, `zone_exited`, `line_crossed`, and `queue_snapshot`.
5. Send structured events to the dashboard backend.

Important limitation: MVP 1.0 treats ByteTrack IDs as per-camera local tracks. Perfect cross-camera identity is not promised in this release. Conservative sessionization and global re-identification can be added later.

## Privacy and security posture

This MVP is designed around privacy-aware analytics:

- Uses pseudonymous tracking IDs.
- Does not store names or face identities.
- Does not include facial recognition.
- Separates analytics events from raw video.
- Shows retention-policy concepts for raw footage, track points, zone events, aggregates, and audit logs.
- Includes a rate limit on event ingestion to reduce abuse in public demos.

## Getting started

```bash
npm install
npm run dev
```

The app runs on port 5000 by default.

Build for production:

```bash
npm run build
npm start
```

Type-check:

```bash
npm run check
```

## Project structure

```text
client/              React frontend
server/              Express API and synthetic dataset
shared/schema.ts     Shared data types and SQLite schema
script/build.ts      Production build script
```

Key files:

- `server/synthetic.ts` contains the deterministic Day 1 store dataset.
- `server/routes.ts` exposes dashboard APIs.
- `server/storage.ts` persists prototype event ingestion.
- `client/src/pages/Heatmap.tsx` renders the interactive zone heatmap.
- `client/src/pages/Pipeline.tsx` documents the tracking pipeline concept.

## Feedback wanted

This project is public because feedback is the point. Useful feedback includes:

- Would this be helpful for a small or medium retail business?
- Which metrics would actually influence store-owner decisions?
- What should be prioritized next: POS integration, staff scheduling insights, real-time alerts, real CCTV ingestion, or better heatmaps?
- What privacy, signage, retention, or operational concerns should be handled earlier?
- What would make the dashboard worth paying for?

## Roadmap

- Real video-file ingestion demo.
- RTSP camera worker scaffold.
- ByteTrack adapter and detector adapter.
- Zone polygon calibration UI.
- POS/category sales import.
- Weekly trend reports.
- Exportable owner reports.
- Stronger auth for production deployments.

## License

MIT
