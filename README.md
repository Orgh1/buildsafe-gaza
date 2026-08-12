# BuildSafe Gaza — Building Damage Assessment Platform

A web-based, offline-capable platform that helps field engineers conduct preliminary
assessments of partially damaged buildings in Gaza. Engineers can enter building and
owner data, classify damage and severity, attach photos and videos, and generate structured PDF
reports even without an internet connection. Records captured offline are stored on the
device and synchronized automatically when connectivity returns.

Islamic University of Gaza — Software Engineering Project (Second Semester, 2026).

---

## Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | Field Inspection Form | Owner info, building details, damage type and severity, habitability, engineer notes, GPS. |
| 2 | Media Documentation | Upload multiple images and videos per assessment, with previews and a lightbox viewer. |
| 3 | Automated PDF Reports | One-click structured report with embedded photos, ready to print or export. |
| 4 | Offline Data Collection | Create assessments offline; data and photos saved locally via IndexedDB. |
| 5 | Automatic Synchronization | Idempotent sync (keyed by `client_uuid`) pushes offline records to the server when online. |
| 6 | Dashboard and History | Personal stats, severity breakdown, recent activity, search and filter of all assessments. |
| 7 | Authentication and Profiles | Secure login (JWT in an httpOnly cookie plus bcrypt), profile and password management. |
| 8 | Contact / Feedback | Public contact form; administrators can review submitted messages. |
| 9 | Installable PWA | Manifest and service worker; installable on phone or desktop and works from cache offline. |

---

## Tech Stack

- Backend: Node.js and Express (REST API)
- Database: SQLite via better-sqlite3 (WAL mode)
- Authentication: JSON Web Tokens in httpOnly cookies, bcrypt password hashing
- Reports: PDFKit
- File uploads: Multer (images and video)
- Frontend: Progressive Web App — HTML5, CSS3, Bootstrap 5, vanilla JavaScript
- Offline: Service Worker (app-shell cache) and IndexedDB (offline record store)
- Testing: Node.js built-in test runner (`node:test`)

## Architecture (Three-Tier)

```
Presentation Layer  —  PWA (HTML5, CSS3, Bootstrap 5, JS)
Service Worker (app-shell cache)  +  IndexedDB (offline DB)
        |  HTTPS / JSON + multipart
Application Layer  —  Node.js + Express REST API
Auth · Assessments · Media · Reports (PDFKit) · Sync · Stats
        |  better-sqlite3
Data Layer  —  SQLite relational database + file storage
engineers · assessments · media · contacts · activity_log
```

Note on the stack: the original proposal named ASP.NET Core and SQL Server. The
implementation uses an equivalent Node.js, Express, and SQLite three-tier stack — the
course allows any feasible framework, and SQLite keeps the same relational model while making
the project trivial to run and demo. The architecture, layering, and data model are unchanged.

---

## Getting Started

### Prerequisites
- Node.js 18 or newer (developed on Node 22)

### Install and run
```bash
cd buildsafe-gaza
npm install
npm start        # http://localhost:3000  (auto-seeds demo data on first run)
```

Open http://localhost:3000. The database auto-seeds demo accounts and sample
assessments on first boot, so `npm start` is all you need. You can still run
`npm run seed` manually to re-seed.

### Deploy to Render (durable public link)
1. Push this repo to GitHub.
2. On render.com: New + → Blueprint, select the repo (it reads `render.yaml`).
3. Render builds and provides a permanent `https://<name>.onrender.com` URL that works without your machine.

The app reads Render's `PORT` environment variable and auto-seeds demo data on first boot.

### Demo accounts
| Role | Email | Password |
|------|-------|----------|
| Engineer | `osama@buildsafe.ps` | `Engineer@123` |
| Admin | `admin@buildsafe.ps` | `Admin@123` |

### Scripts
| Command | Purpose |
|---------|---------|
| `npm start` | Run the server |
| `npm run dev` | Run with auto-reload (`node --watch`) |
| `npm run seed` | Seed demo data |
| `npm test` | Run the automated test suite (`node --test`) |

---

## API Reference (summary)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create account (first user becomes admin) |
| `POST` | `/api/auth/login` | Log in (sets httpOnly cookie) |
| `POST` | `/api/auth/logout` | Log out |
| `GET`  | `/api/auth/me` | Current user |
| `GET/PUT` | `/api/profile` | View / update profile |
| `PUT` | `/api/profile/password` | Change password |
| `GET` | `/api/assessments` | List (filters: `q`, `severity`, `status`, `sort`) |
| `POST` | `/api/assessments` | Create assessment |
| `GET/PUT/DELETE` | `/api/assessments/:id` | View / update / delete |
| `POST` | `/api/assessments/:id/media` | Upload media (multipart, field `files`) |
| `GET/DELETE` | `/api/media/:id` | Serve / delete a media file |
| `GET` | `/api/assessments/:id/report` | Report (JSON) |
| `GET` | `/api/assessments/:id/report.pdf` | Report (PDF) |
| `POST` | `/api/sync` | Bulk-sync offline assessments (plus base64 media) |
| `GET` | `/api/sync/status` | Connectivity / account probe |
| `POST` | `/api/contact` | Submit contact message |
| `GET` | `/api/stats` | Dashboard metrics |

---

## How offline and sync work

1. Create offline: the form detects `navigator.onLine === false` and saves the assessment
   (and photos, as base64) into IndexedDB with a generated `client_uuid`.
2. Indicator: the navbar shows an Offline dot and an "N pending" badge.
3. Reconnect: the `online` event fires; the app POSTs all pending records to `/api/sync`.
4. Idempotency: the server upserts by `client_uuid`, so re-syncing never creates duplicates.
5. Cleanup: successfully synced records are removed from IndexedDB and appear in History.

The service worker precaches the full app shell, so the app itself loads with no network.

---

## Testing

`npm test` runs an isolated suite (separate temp database) covering the report's test cases:

- TC1 Login, TC2 Create Assessment, TC3 Upload Image, TC4 Generate Report
- TC5 View History, TC6 Offline collection and sync, TC7 Edit Assessment
- Plus: auth enforcement, cross-engineer isolation, contact validation, stats, profile and password.

---

## Project Structure

```
buildsafe-gaza/
├── src/
│   ├── server.js          # entry point
│   ├── app.js             # Express app + middleware wiring
│   ├── config.js          # config + domain enums
│   ├── db/                # schema.sql, connection, seed
│   ├── middleware/        # auth (JWT)
│   ├── routes/            # auth, profile, assessments, media, reports, sync, contact, stats
│   └── services/          # assessments, media, report (PDFKit), activity
├── public/                # PWA frontend (HTML/CSS/JS, manifest, sw.js, icons, vendored Bootstrap)
├── tests/                 # node:test API suite
└── docs/                  # presentation, demo script, diagrams
```

---

## Status

Functional and feature-complete for the course scope. The application runs locally with a single
`npm start`, auto-seeds demo data, ships an automated `node:test` suite covering the documented
test cases, and is deployable to Render via the included `render.yaml` blueprint.

---

## Team

Mahmoud Fahmi Irheem, Osama Rami Al-Ghazali, Yasser Mohammed Awda,
Ahmed Magdy El-Naggar, Kareem Yousef Abu Musameh.
