'use strict';

const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { validateAssessment } = require('../utils/validate');
const assessmentSvc = require('../services/assessments');
const mediaSvc = require('../services/media');
const activity = require('../services/activity');

const router = express.Router();
router.use(requireAuth);

// Larger JSON limit for this route only (base64 media can be sizeable)
router.use(express.json({ limit: '60mb' }));

/**
 * POST /api/sync
 * Body: { assessments: [ { client_uuid, ...fields, media: [{ data, mime_type, original_name }] } ] }
 * Idempotent on client_uuid: re-syncing the same record updates instead of duplicating.
 */
router.post('/', (req, res) => {
  const items = Array.isArray(req.body && req.body.assessments) ? req.body.assessments : [];
  if (items.length === 0) return res.json({ results: [], synced: 0 });

  const results = [];
  let synced = 0;

  const runOne = db.transaction((item) => {
    const { valid, errors, data } = validateAssessment(item);
    if (!valid) {
      results.push({ client_uuid: item.client_uuid || null, status: 'rejected', errors });
      return;
    }
    data.client_uuid = item.client_uuid || null;

    const existing = assessmentSvc.getByClientUuid(data.client_uuid);
    let record;
    let action;
    if (existing) {
      if (existing.engineer_id !== req.user.id) {
        results.push({ client_uuid: data.client_uuid, status: 'conflict', error: 'Owned by another engineer.' });
        return;
      }
      record = assessmentSvc.update(existing.id, data, req.user.id);
      action = 'updated';
    } else {
      record = assessmentSvc.create(data, req.user.id, 'offline-sync');
      action = 'created';
    }

    // Attach any base64 media that has not yet been synced for this record
    let mediaSaved = 0;
    if (Array.isArray(item.media)) {
      for (const m of item.media) {
        if (!m || !m.data || !m.mime_type) continue;
        try {
          mediaSvc.saveBase64({
            assessment_id: record.id,
            data: m.data,
            mime_type: m.mime_type,
            original_name: m.original_name || null,
          });
          mediaSaved += 1;
        } catch (err) {
          // skip a single bad media item without failing the whole record
        }
      }
    }

    synced += 1;
    results.push({ client_uuid: data.client_uuid, server_id: record.id, status: action, media_saved: mediaSaved });
  });

  for (const item of items) {
    try {
      runOne(item);
    } catch (err) {
      results.push({ client_uuid: item && item.client_uuid, status: 'error', error: err.message });
    }
  }

  activity.log(req.user.id, 'sync', { detail: `${synced}/${items.length} record(s)` });
  res.json({ results, synced, received: items.length, server_time: new Date().toISOString() });
});

// GET /api/sync/status — quick connectivity / account summary probe
router.get('/status', (req, res) => {
  const n = db.prepare('SELECT COUNT(*) AS n FROM assessments WHERE engineer_id = ?').get(req.user.id).n;
  res.json({ online: true, server_time: new Date().toISOString(), server_assessments: n });
});

module.exports = router;
