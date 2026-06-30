# BuildSafe Gaza — Building Damage Assessment Platform

A web-based, **offline-capable** platform that helps field engineers conduct preliminary
assessments of partially damaged buildings in Gaza (2023). Engineers can enter building &
owner data, classify damage and severity, attach photos/videos, and generate structured PDF
reports — **even without an internet connection**. Records captured offline are stored on the
device and synchronized automatically when connectivity returns.

> Islamic University of Gaza — Software Engineering Project (Second Semester, 2026)

---

## ✨ Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | **Field Inspection Form** | Owner info, building details, damage type & severity, habitability, engineer notes, GPS. |
| 2 | **Media Documentation** | Upload multiple images and videos per assessment, with previews and a lightbox viewer. |
| 3 | **Automated PDF Reports** | One-click structured report with embedded photos, ready to print/export. |
| 4 | **Offline Data Collection** | Create assessments offline; data + photos saved locally via IndexedDB. |
| 5 | **Automatic Synchronization** | Idempotent sync (keyed by `client_uuid`) pushes offline records to the server when online. |
| 6 | **Dashboard & History** | Personal stats, severity breakdown, recent activity, search & filter of all assessments. |
| 7 | **Authentication & Profiles** | Secure login (JWT in httpOnly cookie + bcrypt), profile and password management. |
| 8 | **Contact / Feedback** | Public contact form; admin can review submitted messages. |
| 9 | **Installable PWA** | Manifest + service worker; installable on phone/desktop and works from cache offline. |

---

## 🏗️ Architecture (Three-Tier)

```
┌─────────────────────────────────────────────────────────────┐
│  Presentation Layer  —  PWA (HTML5, CSS3, Bootstrap 5, JS)    │
│  Service Worker (app-shell cache)  +  IndexedDB (offline DB)  │
└───────────────┬─────────────────────────────────────────────┘
                │  HTTPS / JSON + multipart
┌───────────────▼─────────────────────────────────────────────┐
│  Application Layer  —  Node.js + Express REST API            │
│  Auth · Assessments · Media · Reports (PDFKit) · Sync · Stats │
└───────────────┬─────────────────────────────────────────────┘
                │  better-sqlite3
┌───────────────▼─────────────────────────────────────────────┐
│  Data Layer  —  SQLite relational database + file storage    │
│  engineers · assessments · media · contacts · activity_log   │
└─────────────────────────────────────────────────────────────┘
```

> **Note on the stack:** the original proposal named ASP.NET Core + SQL Server. The
> implementation uses an equivalent **Node.js + Express + SQLite** three-tier stack — the
> course allows any feasible framework, and SQLite keeps the same relational model while making
> the project trivial to run and demo. The architecture, layering, and data model are unchanged.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** (developed on Node 22)

### Install & run
```bash
cd buildsafe-gaza
npm install
npm run seed     # creates demo accounts + sample assessments
npm start        # http://localhost:3000
```

Open **http://localhost:3000**.

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

## 🔌 API Reference (summary)

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
| `POST` | `/api/sync` | Bulk-sync offline assessments (+ base64 media) |
| `GET` | `/api/sync/status` | Connectivity / account probe |
| `POST` | `/api/contact` | Submit contact message |
| `GET` | `/api/stats` | Dashboard metrics |

---

## 📶 How offline & sync work

1. **Create offline** → the form detects `navigator.onLine === false` and saves the assessment
   (and photos, as base64) into **IndexedDB** with a generated `client_uuid`.
2. **Indicator** → the navbar shows an *Offline* dot and a *"N pending"* badge.
3. **Reconnect** → the `online` event fires; the app `POST`s all pending records to `/api/sync`.
4. **Idempotency** → the server upserts by `client_uuid`, so re-syncing never creates duplicates.
5. **Cleanup** → successfully synced records are removed from IndexedDB and appear in History.

The **service worker** precaches the full app shell, so the app itself loads with no network.

---

## 🧪 Testing

`npm test` runs an isolated suite (separate temp database) covering the report's test cases:

- **TC1** Login · **TC2** Create Assessment · **TC3** Upload Image · **TC4** Generate Report
- **TC5** View History · **TC6** Offline collection + sync · **TC7** Edit Assessment
- Plus: auth enforcement, cross-engineer isolation, contact validation, stats, profile/password.

---

## 📁 Project Structure

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

## 👥 Team

Mahmoud Fahmi Irheem · Osama Rami Al-Ghazali · Yasser Mohammed Awda ·
Ahmed Magdy El-Naggar · Kerim Yusuf Ebu Musameh
