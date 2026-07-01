# User Stories — BuildSafe Gaza

Format: **As a [role], I want [goal], so that [benefit]**, with acceptance criteria.
Actors: **Field Engineer** (primary), **Humanitarian / Admin**, **Visitor**.

---

## A. Field Engineer

**US-01 — Register & Log in**
As a field engineer, I want to create an account and log in securely, so that only authorized engineers can access assessment tools.
- Acceptance: password stored hashed (bcrypt); invalid credentials are rejected; a session (JWT cookie) is created on success.

**US-02 — Create a building assessment**
As a field engineer, I want to create a new assessment, so that I can document a damaged building.
- Acceptance: building location and severity are required; the record is saved and appears in my history.

**US-03 — Enter building & owner information**
As a field engineer, I want to record building details (type, floors, year, GPS) and owner information (name, ID, phone), so that each assessment is complete and traceable.
- Acceptance: all fields are stored; optional fields may be left empty.

**US-04 — Capture GPS location**
As a field engineer, I want to capture the building's GPS coordinates automatically, so that its location is precise.
- Acceptance: a "Locate" button fills latitude/longitude from the device; can also be entered manually.

**US-05 — Classify damage type and severity**
As a field engineer, I want to select damage type, severity, and habitability, so that building conditions are evaluated consistently.
- Acceptance: severity is one of Minor/Moderate/Severe/Critical; values are validated on the server.

**US-06 — Upload photos and videos**
As a field engineer, I want to attach images and videos of the damage, so that visual evidence supports the assessment.
- Acceptance: multiple files can be uploaded; each is linked to the assessment; only allowed types/sizes are accepted.

**US-07 — Generate a report**
As a field engineer, I want to generate a structured report, so that results can be shared with organizations and authorities.
- Acceptance: the report shows all filled fields + photos and can be printed / saved as PDF; supports Arabic and English.

**US-08 — View assessment history**
As a field engineer, I want to view and search my previous assessments, so that I can track completed inspections.
- Acceptance: list is filterable by severity/status and searchable by location/owner/notes.

**US-09 — Edit an assessment**
As a field engineer, I want to update an existing assessment, so that I can correct or add information.
- Acceptance: changes are saved and reflected immediately; only the owner engineer can edit.

**US-10 — Work offline**
As a field engineer, I want to complete assessments without internet, so that I can keep working in low-connectivity areas.
- Acceptance: when offline, the assessment (and photos) are saved on the device; a "pending sync" indicator is shown.

**US-11 — Automatic synchronization**
As a field engineer, I want my offline data to sync automatically when I reconnect, so that no information is lost.
- Acceptance: on reconnect, pending records are sent to the server; syncing twice never creates duplicates (idempotent by client_uuid).

**US-12 — Manage my profile**
As a field engineer, I want to view/update my profile and change my password, so that my information stays accurate and secure.
- Acceptance: profile updates are saved; password change requires the current password.

---

## B. Humanitarian Organization / Administrator

**US-13 — Review assessment reports**
As a humanitarian officer, I want to view assessment reports, so that I can prioritize emergency response.
- Acceptance: reports are accessible and show damage severity and evidence.

**US-14 — View system statistics**
As an administrator, I want to view system-wide statistics, so that project progress and assessment activity can be analyzed.
- Acceptance: dashboard shows totals, severity breakdown, media counts, and number of engineers.

---

## C. Visitor

**US-15 — Contact the team**
As a visitor, I want to send a message through a contact form, so that I can ask questions or give feedback.
- Acceptance: name, email, and message are required and validated; a confirmation is shown on success.

---

### Traceability (Story → Module → Test)
| Stories | Module (owner) | Tests |
|---|---|---|
| US-01, US-12 | Auth & Profile (Ahmed) | TC1, TC8, TC9, TC12 |
| US-02–US-06, US-08, US-09 | Assessments & Media (Osama) | TC2, TC3, TC5, TC7 |
| US-07, US-13, US-14 | Reports & Dashboard (Mahmoud) | TC4, TC11 |
| US-10, US-11 | Offline & Sync (Kareem) | TC6 |
| US-15 | Contact | TC10 |
