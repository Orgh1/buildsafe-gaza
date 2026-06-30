# BuildSafe Gaza — Live Demo Script (for the discussion)

> Goal: show a smooth, ~6–8 minute end-to-end demo that proves every core feature works,
> ending with the offline-sync highlight. Practice it once before the discussion.

## 0. Before you start (setup — 1 min)
```bash
cd buildsafe-gaza
npm install      # first time only
npm run seed     # creates demo data
npm start        # http://localhost:3000
```
- Open **http://localhost:3000** in Chrome.
- Have a couple of building photos ready on the machine to upload.
- Open a second tab with `docs/diagrams.html` (architecture/UML) and `docs/slides.html` (slides).

---

## 1. Landing page (30s)
- Show the **landing page**: problem, target users (engineers / orgs / government), the 6 core features.
- Point out it's a **PWA** (installable, works offline) — mention the install icon in the address bar.
- Talking point: *"This replaces slow, paper-based, non-standardized assessments."*

## 2. Login (30s) — **TC1**
- Click **Log in** → use `osama@buildsafe.ps` / `Engineer@123`.
- Land on the **Dashboard**: stat cards (total assessments, severe/critical, media), recent list.
- Talking point: *"Auth uses bcrypt password hashing and a JWT in an httpOnly cookie."*

## 3. Create an assessment (90s) — **TC2 + TC3**
- Click **New Assessment**.
- Fill: location (e.g. *"Al-Rimal, Gaza City"*), building type, floors, year.
- Click **Locate** to capture GPS (browser will ask permission).
- Owner info, **damage type**, **severity = Severe**, habitability, notes.
- Under **Media**, select 1–2 photos → show the live previews.
- Click **Save Assessment** → you're redirected to the **assessment view**.
- Talking point: *"One structured, standardized form — same fields for every engineer."*

## 4. View + generate report (60s) — **TC4**
- On the view page, show the organized sections and the **photo gallery** (click a photo → lightbox).
- Click **Generate PDF** → the structured report opens in a new tab (header, fields, embedded photos).
- Talking point: *"The report is generated server-side with PDFKit and is ready to print or share."*

## 5. History: search & filter (45s) — **TC5**
- Go to **History**.
- Filter by **severity = Severe**, then type a keyword in search.
- Talking point: *"Engineers can quickly find and review past inspections."*

## 6. Edit (30s) — **TC7**
- Open an assessment → **Edit** → change severity/notes → save → show the change reflected.

## 7. ⭐ Offline collection + sync (120s) — **TC6 (the highlight)**
1. Open **DevTools (F12) → Network tab → set throttling to "Offline"** (or tick *Offline*).
2. Notice the navbar indicator switches to **🔴 Offline**.
3. Click **New Assessment**, fill it in (add a photo), **Save**.
   - The app shows *"Saved offline…"* and the dashboard shows a **"1 pending"** badge.
   - Open **History** → the pending record appears with a **"pending sync"** badge.
4. Now **set Network back to "Online"** (untick Offline).
5. The app detects connectivity → toast *"Synced 1 record"* → the **pending badge disappears**.
6. Refresh **History** → the record is now a real, saved assessment (with its photo).
- Talking point: *"Offline data lives in IndexedDB; on reconnect we POST to /api/sync, which
  **upserts by client_uuid**, so re-syncing never creates duplicates."*

> Optional wow: open DevTools → **Application → Service Workers** to show it's registered,
> and **Application → IndexedDB → buildsafe-gaza → pending** to show the queued record.

## 8. Wrap (30s)
- Show **diagrams.html** (three-tier architecture, ER, sequence of offline sync).
- Mention **`npm test` → 13/13 passing** (you can run it live if asked).
- Close on the Q&A slide.

---

## If the live demo fails (backup plan)
- Keep the seeded data; the dashboard/history already show 3 sample assessments and a PDF works.
- If offline toggling misbehaves, explain the flow with the **sequence diagram** in diagrams.html.
- Worst case, run `npm test` to prove the backend behavior (including the offline-sync test).
