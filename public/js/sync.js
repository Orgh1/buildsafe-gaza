// Offline → server synchronization.
window.BSG = window.BSG || {};

window.BSG.sync = (function () {
  let running = false;

  // Generate a client UUID for offline records (RFC4122-ish v4)
  function uuid() {
    if (crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  // Read a File/Blob as a base64 string (no data: prefix)
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',').pop());
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Queue an assessment captured offline. fields = validated assessment fields,
  // mediaFiles = array of File objects (optional).
  async function queueAssessment(fields, mediaFiles) {
    const client_uuid = fields.client_uuid || uuid();
    const media = [];
    for (const f of mediaFiles || []) {
      media.push({ data: await fileToBase64(f), mime_type: f.type, original_name: f.name });
    }
    const item = { client_uuid, fields: { ...fields, client_uuid }, media, queued_at: new Date().toISOString() };
    await BSG.idb.putPending(item);
    if (BSG.ui) await BSG.ui.updateNetIndicator();
    return item;
  }

  // Push all pending records to the server.
  async function run() {
    if (running) return { skipped: true, reason: 'already-running' };
    if (!navigator.onLine) return { skipped: true, reason: 'offline' };
    running = true;
    try {
      const pending = await BSG.idb.getAllPending();
      if (!pending.length) return { synced: 0, received: 0 };
      const payload = {
        assessments: pending.map((p) => ({ ...p.fields, client_uuid: p.client_uuid, media: p.media || [] })),
      };
      const res = await BSG.api.post('/api/sync', payload);
      for (const r of (res.results || [])) {
        if (r.status === 'created' || r.status === 'updated') {
          await BSG.idb.deletePending(r.client_uuid);
        }
      }
      if (BSG.ui) await BSG.ui.updateNetIndicator();
      return res;
    } finally {
      running = false;
    }
  }

  return { uuid, fileToBase64, queueAssessment, run };
})();
