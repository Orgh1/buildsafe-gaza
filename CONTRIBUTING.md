# Team Workflow & Task Split — BuildSafe Gaza

We use **one shared repository** (`Orgh1/buildsafe-gaza`) with **feature branches** and
**Pull Requests**. This is what the course monitors, and every member's contribution
shows clearly through their own commits.

---

## 👥 Task Split (4 modules)

| Module | Owner | Scope (files) |
|--------|-------|---------------|
| **1. Auth & Profile** | Ahmed El-Naggar | `src/routes/auth.js`, `src/routes/profile.js`, `src/middleware/auth.js`, `public/login.html`, `public/register.html`, `public/profile.html`, `public/js/profile.js` |
| **2. Assessments & Media** | Osama Al-Ghazali | `src/routes/assessments.js`, `src/routes/media.js`, `src/services/assessments.js`, `src/services/media.js`, `public/assessment.html`, `public/view.html`, `public/history.html`, `public/js/{assessment,view,history}.js` |
| **3. Reports, Dashboard & Stats** | Mahmoud Fahmi Irheem | `src/routes/reports.js`, `src/routes/stats.js`, `src/services/report.js`, `public/report.html`, `public/dashboard.html`, `public/js/{report,dashboard}.js` |
| **4. Offline / PWA / i18n / Sync** | Kareem Abu Musameh | `public/sw.js`, `public/manifest.webmanifest`, `public/js/{idb,sync,i18n}.js`, offline auth in `public/js/ui.js` |

> **Team of 4.** Each owner also writes the **tests and documentation for their own module**
> (add test cases in `tests/`, update `docs/` and `README.md`, keep the Jira board current).
>
> The code already exists — each owner **improves, tests, documents, and maintains** their
> module (add test cases, polish UI, write their report/Jira section, fix issues). This
> produces real, attributable commit history per member.
>
> _In memory of our teammate Yasser Awda — رحمه الله._

---

## 🔧 Git Workflow (each member, every time)

```bash
# 1. Clone once (after accepting the GitHub invite)
git clone https://github.com/Orgh1/buildsafe-gaza.git
cd buildsafe-gaza
npm install

# 2. Always start from an up-to-date main
git checkout main
git pull origin main

# 3. Create/switch to YOUR module branch
git checkout feature/auth-profile        # use your own branch name (see below)

# 4. Work, then commit small and often
git add -A
git commit -m "auth: add password strength validation"

# 5. Push your branch
git push origin feature/auth-profile

# 6. On GitHub: open a Pull Request  (your branch  →  main)
#    A teammate reviews, then Merge. Delete the branch after merge.
```

### Branch names
| Module | Branch |
|--------|--------|
| Auth & Profile | `feature/auth-profile` |
| Assessments & Media | `feature/assessments-media` |
| Reports & Dashboard | `feature/reports-dashboard` |
| Offline / PWA / i18n | `feature/offline-i18n` |

---

## ✅ Rules
- **Never push directly to `main`** — always via a Pull Request.
- Keep commits small with clear messages: `module: what changed`.
- Pull `main` before starting work each day to avoid conflicts.
- Run `npm test` before opening a PR (all 13 tests must pass).
- Mirror your work as tasks on the **Jira board** (one Epic per module).

## 🗂️ Jira Epics (suggested)
1. **Auth & Profile** — login, register, sessions, profile, password.
2. **Assessments & Media** — CRUD, media upload, history, search/filter.
3. **Reports, Dashboard & Stats** — PDF/print report, dashboard metrics.
4. **Offline / PWA / i18n** — service worker, IndexedDB, sync, Arabic/RTL, install.

## Run locally
```bash
npm install
npm start          # http://localhost:3000  (auto-seeds demo data)
npm test           # run the test suite
```
Demo: `osama@buildsafe.ps` / `Engineer@123`
