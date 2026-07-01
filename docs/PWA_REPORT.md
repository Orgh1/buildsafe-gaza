# Offline / PWA / i18n / Sync Report

**Author:** Kareem Abu Musameh

## 1. Offline Data Collection & Sync (IndexedDB)
The core requirement of BuildSafe Gaza is the ability to operate in field conditions where internet connectivity is severely degraded or entirely unavailable. 
- **Idempotent Synchronization:** We implemented a mechanism using `client_uuid` to uniquely identify assessments created offline. When the device regains connectivity, the `sync.js` logic pushes these records to the server. The server performs an "upsert" (update or insert) operation, ensuring that multiple sync attempts do not result in duplicate records.
- **IndexedDB Storage:** The frontend uses IndexedDB (wrapped in `idb.js`) to locally store text data and base64-encoded media files.

## 2. Progressive Web App (PWA)
To provide a native-like experience on mobile devices:
- **Service Worker (`sw.js`):** A service worker is registered to precache the application shell (HTML, CSS, JS, and essential assets). It intercepts fetch requests and serves them from the cache when offline, utilizing a "network-first" strategy for dynamic API calls.
- **Installability:** Added a dynamic "Install App" button inside the navbar using the `beforeinstallprompt` event. This enables field engineers to easily install the app to their home screens.

## 3. Localization (i18n) & RTL Support
The application is fully bilingual (English and Arabic).
- **Dynamic Translation (`i18n.js`):** We developed a lightweight translation engine that translates the UI dynamically. It automatically updates the document direction (`dir="rtl"`) when Arabic is selected.
- **Engineering Terminology:** All damage severity strings (e.g. Minor, Moderate, Severe, Critical) and damage types were carefully translated using proper engineering terms (e.g., تصدعات for Cracks, شديد الخطورة for Critical). Numbers intentionally remain Western (0-9) to avoid data entry ambiguity.
