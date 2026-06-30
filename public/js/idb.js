// Minimal IndexedDB layer for offline-first storage.
// Store "pending": assessments captured offline, queued for sync (keyed by client_uuid).
// Store "cache":   a local mirror of server assessments so the list/history works offline.
window.BSG = window.BSG || {};

window.BSG.idb = (function () {
  const DB_NAME = 'buildsafe-gaza';
  const DB_VERSION = 2;
  let dbPromise = null;

  function open() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const r = indexedDB.open(DB_NAME, DB_VERSION);
      r.onupgradeneeded = () => {
        const db = r.result;
        if (!db.objectStoreNames.contains('pending')) {
          db.createObjectStore('pending', { keyPath: 'client_uuid' });
        }
        if (!db.objectStoreNames.contains('cache')) {
          db.createObjectStore('cache', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('details')) {
          db.createObjectStore('details', { keyPath: 'id' });
        }
      };
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
    return dbPromise;
  }

  function tx(store, mode, fn) {
    return open().then((db) => new Promise((resolve, reject) => {
      const t = db.transaction(store, mode);
      const s = t.objectStore(store);
      const result = fn(s);
      t.oncomplete = () => resolve(result && result.__req ? result.__req.result : result);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
    }));
  }

  // --- pending (offline queue) ---
  function putPending(item) { return tx('pending', 'readwrite', (s) => ({ __req: s.put(item) })); }
  function deletePending(uuid) { return tx('pending', 'readwrite', (s) => ({ __req: s.delete(uuid) })); }
  function getAllPending() { return tx('pending', 'readonly', (s) => ({ __req: s.getAll() })); }
  function getPending(uuid) { return tx('pending', 'readonly', (s) => ({ __req: s.get(uuid) })); }
  async function countPending() { return (await getAllPending()).length; }

  // --- cache (read mirror) ---
  function putCache(list) {
    return open().then((db) => new Promise((resolve, reject) => {
      const t = db.transaction('cache', 'readwrite');
      const s = t.objectStore('cache');
      s.clear();
      (list || []).forEach((a) => s.put(a));
      t.oncomplete = () => resolve(true);
      t.onerror = () => reject(t.error);
    }));
  }
  function getCache() { return tx('cache', 'readonly', (s) => ({ __req: s.getAll() })); }

  // --- details (full assessment+report data, cached for offline reports/view) ---
  function putDetail(id, data) {
    return tx('details', 'readwrite', (s) => ({ __req: s.put({ id: Number(id), data }) }));
  }
  async function getDetail(id) {
    const row = await tx('details', 'readonly', (s) => ({ __req: s.get(Number(id)) }));
    return row ? row.data : null;
  }

  return { putPending, deletePending, getAllPending, getPending, countPending, putCache, getCache, putDetail, getDetail };
})();
