# Expected Questions & Answers (for the discussion / المناقشة)

> Prepared answers to the questions the TA (المعيد) is most likely to ask. Each has a short
> English answer and a one-line Arabic talking note (الشرح بالعربي) since the discussion is likely in Arabic.

---

### Q1. Why did you build it as a web app / PWA instead of a native mobile app?
**A.** A PWA runs on any device (phone, tablet, laptop) from a single codebase, is installable like
an app, and — crucially — works **offline** via a service worker and IndexedDB, which is exactly
what field engineers in low-connectivity areas need. No app-store install required.
> عربي: تطبيق ويب PWA يعمل على كل الأجهزة بنسخة واحدة، قابل للتثبيت، ويعمل بدون إنترنت — وهو جوهر متطلبات المشروع.

### Q2. The proposal said ASP.NET Core + SQL Server — why Node.js + SQLite?
**A.** The course explicitly allows any feasible framework, and the report is a *living document*.
We kept the **exact same three-tier architecture and relational data model**; we just used
Node.js + Express for the application layer and SQLite for the data layer. SQLite is a real
relational database (SQL, foreign keys, transactions) and makes the project trivial to run and
demo without installing a DB server. Migrating to SQL Server later only changes the data layer.
> عربي: المنهج يسمح بأي إطار مناسب، والمعمارية ثلاثية الطبقات ونموذج البيانات نفسه لم يتغيرا؛ SQLite قاعدة علائقية حقيقية وأسهل للتشغيل والعرض.

### Q3. How exactly does the offline sync work? How do you avoid duplicates?
**A.** When offline, each assessment is saved to **IndexedDB** with a generated **`client_uuid`**.
On reconnect (the `online` event) the app sends all pending records to `POST /api/sync`. The
server **upserts by `client_uuid`** — if that UUID already exists it updates, otherwise it inserts.
So re-running sync (even twice) is **idempotent**: no duplicates. Synced records are then removed
from IndexedDB. This is covered by automated test **TC6**.
> عربي: كل سجل أوفلاين له معرّف فريد client_uuid، والخادم يعمل upsert على هذا المعرّف، فالمزامنة لا تكرّر البيانات.

### Q4. What happens to photos taken offline?
**A.** Photos are read as base64 and stored alongside the pending record in IndexedDB. During
sync they're sent inside the JSON payload; the server decodes and writes them to file storage and
links them to the assessment. (For very large videos, the production path would switch to chunked
multipart uploads.)
> عربي: الصور تُخزَّن base64 في IndexedDB وتُرسَل مع المزامنة، ثم يحفظها الخادم ويربطها بالتقييم.

### Q5. How is security handled?
**A.** Passwords are hashed with **bcrypt**. Sessions use a **JWT stored in an httpOnly cookie**
(not readable by JavaScript, mitigates XSS token theft). Every assessment/media endpoint enforces
**ownership** — an engineer can only access their own records (tested in **TC9**). Writes are
**validated server-side** (required fields, allowed enums, numeric ranges). We also set basic
security headers and limit upload type/size.
> عربي: كلمات المرور bcrypt، الجلسة JWT في httpOnly cookie، وكل مهندس يصل لبياناته فقط، مع تحقق كامل من المدخلات على الخادم.

### Q6. Show me the database design.
**A.** Five tables: `engineers`, `assessments`, `media`, `contacts`, `activity_log`.
`engineers 1—* assessments 1—* media`; `engineers 1—* activity_log`. `assessments` carries the
`client_uuid` (offline dedup), the building/owner fields, `severity`, `status`, and `source`
(online vs offline-sync). Full ER diagram is in `docs/diagrams.html`.
> عربي: خمسة جداول، علاقات واحد-لمتعدد بين المهندس والتقييمات ثم الوسائط؛ ومخطط ER كامل في diagrams.html.

### Q7. How did you test it?
**A.** An automated suite with Node's built-in test runner (`npm test`) — **13 tests, all passing**
— against an isolated temporary database. It covers the report's cases TC1–TC7 (login, create,
upload, report, history, offline-sync, edit) plus auth enforcement, cross-engineer isolation,
contact validation, stats, and profile/password.
> عربي: مجموعة اختبارات آلية 13 اختبارًا كلها ناجحة، تغطي TC1–TC7 بالإضافة لاختبارات الأمان والعزل.

### Q8. What was the hardest part?
**A.** The **offline-first** flow: deciding the storage (IndexedDB), generating stable client IDs,
making sync idempotent on the server, and keeping the UI's connectivity/pending indicator
accurate. The PDF generation with embedded images was the second tricky piece.
> عربي: الأصعب كان وضع "أوفلاين أولًا" والمزامنة عديمة التكرار، ثم توليد PDF مع الصور.

### Q9. How does the team collaborate (Agile)?
**A.** Scrum across 6 sprints; backlog and tasks on **Jira**, code on **GitHub** with the team, docs
on **Google Drive**. Roles split across UI, API, database, offline/PWA, and testing/documentation.
> عربي: سكروم عبر 6 سبرنتات، Jira للمهام وGitHub للكود وDrive للتوثيق، مع توزيع الأدوار.

### Q10. Is it scalable / production-ready? What would you add?
**A.** The layered design isolates the data layer, so moving to PostgreSQL/SQL Server is contained.
Next steps: a GPS **map view**, organization dashboards with **Excel/CSV export**, the **Background
Sync API**, image compression, and **Arabic (RTL)** localization.
> عربي: التصميم الطبقي يسهّل الترقية لقاعدة أكبر؛ ومن الإضافات: خريطة GPS، تصدير Excel، ترجمة عربية RTL.

### Q11. What's the `activity_log` for?
**A.** It records engineer actions (login, create/update/delete assessment, upload, generate report,
sync) — supporting the report's *"engineer activity tracking"* requirement and future auditing.
> عربي: سجل النشاط يوثّق أفعال المهندس لتتبّع النشاط والتدقيق مستقبلًا.

### Q12. Can two engineers edit the same building?
**A.** Each assessment belongs to the engineer who created it; the API rejects cross-engineer
access. A shared/organization workspace with roles is a planned enhancement.
> عربي: كل تقييم مملوك لمن أنشأه، والـAPI يمنع وصول مهندس آخر؛ ومساحة عمل مشتركة بالأدوار خطة مستقبلية.
