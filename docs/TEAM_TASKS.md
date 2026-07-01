# Per-Member Setup & Tasks

## Common setup (do once)
1. Install **Git**: https://git-scm.com/download/win  (verify: `git --version`)
2. Install **Node.js LTS**: https://nodejs.org  (verify: `node --version`)
3. Accept the GitHub invite (email or github.com/Orgh1/buildsafe-gaza → Accept).
4. Clone and install:
   ```bash
   git clone https://github.com/Orgh1/buildsafe-gaza.git
   cd buildsafe-gaza
   npm install
   npm start        # http://localhost:3000  (login: osama@buildsafe.ps / Engineer@123)
   ```

## Daily workflow (everyone, every session)
```bash
git checkout main && git pull origin main       # get latest
git checkout <your-branch>                        # your module branch
git merge main                                    # bring your branch up to date
# ...work...
npm test                                          # must pass (13/13)
git add -A && git commit -m "<module>: <what changed>"
git push origin <your-branch>
# On GitHub: open Pull Request (your-branch → main) → a teammate reviews → Merge
```
**Rule:** never push directly to `main`; always via Pull Request.

---

## 👤 Ahmed El-Naggar — Auth & Profile
**Branch:** `feature/auth-profile`
**Files:** `src/routes/auth.js`, `src/routes/profile.js`, `src/middleware/auth.js`,
`public/login.html`, `public/register.html`, `public/profile.html`, `public/js/profile.js`

**Tasks:**
- [ ] Add a "show/hide password" toggle on login & register.
- [ ] Add a password-strength hint on the register form.
- [ ] Add client-side email/format validation feedback.
- [ ] Add test cases for register/login (duplicate email, wrong password) in `tests/`.
- [ ] Write the **Authentication & Security** section of the project report.

---

## 👤 Mahmoud Fahmi Irheem — Reports, Dashboard & Stats
**Branch:** `feature/reports-dashboard`
**Files:** `src/routes/reports.js`, `src/routes/stats.js`, `src/services/report.js`,
`public/report.html`, `public/dashboard.html`, `public/js/report.js`, `public/js/dashboard.js`

**Tasks:**
- [ ] Add a simple severity breakdown chart/bars to the dashboard.
- [ ] Polish the printable report layout (spacing, header, print CSS).
- [ ] Add an assessment count-by-month or by-status summary to stats.
- [ ] Add test cases for the stats/report endpoints in `tests/`.
- [ ] Write the **Reporting & Dashboard** section of the project report.

---

## 👤 Osama Al-Ghazali — Assessments & Media
**Branch:** `feature/assessments-media`
**Files:** `src/routes/assessments.js`, `src/routes/media.js`, `src/services/assessments.js`,
`src/services/media.js`, `public/assessment.html`, `public/view.html`, `public/history.html`,
`public/js/assessment.js`, `public/js/view.js`, `public/js/history.js`

**Tasks:**
- [ ] Add inline validation messages on the assessment form.
- [ ] Add client-side image preview/size check before upload.
- [ ] Add sorting/pagination to the history table.
- [ ] Add test cases for media upload edge cases in `tests/`.
- [ ] Write the **Assessments & Media** section of the project report.

---

## 👤 Kerim Abu Musameh — Offline / PWA / i18n
**Branch:** `feature/offline-i18n`
**Files:** `public/sw.js`, `public/manifest.webmanifest`, `public/js/idb.js`,
`public/js/sync.js`, `public/js/i18n.js`, offline auth in `public/js/ui.js`

**Tasks:**
- [ ] Review all Arabic translations for accuracy.
- [ ] Add an "Install app" button (using `beforeinstallprompt`).
- [ ] Add a test for the offline/sync logic in `tests/`.
- [ ] Improve the Online/Offline indicator UX.
- [ ] Write the **Offline / PWA / i18n** section of the project report.

---

> Each member also writes tests and documentation for their own module.
> _In memory of our teammate Yasser Awda — رحمه الله._
