'use strict';

const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

// GET /api/stats — dashboard metrics.
// Engineers see their own data; admins see system-wide totals.
router.get('/', (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const scope = isAdmin ? '' : 'WHERE engineer_id = @id';
  const params = { id: req.user.id };

  const total = db.prepare(`SELECT COUNT(*) AS n FROM assessments ${scope}`).get(params).n;

  const bySeverity = db.prepare(
    `SELECT severity, COUNT(*) AS n FROM assessments ${scope} GROUP BY severity`
  ).all(params);

  const byStatus = db.prepare(
    `SELECT status, COUNT(*) AS n FROM assessments ${scope} GROUP BY status`
  ).all(params);

  const mediaScope = isAdmin
    ? ''
    : 'WHERE assessment_id IN (SELECT id FROM assessments WHERE engineer_id = @id)';
  const mediaTotal = db.prepare(`SELECT COUNT(*) AS n FROM media ${mediaScope}`).get(params).n;

  const recent = db.prepare(
    `SELECT id, building_location, severity, status, created_at
     FROM assessments ${scope} ORDER BY created_at DESC LIMIT 5`
  ).all(params);

  const severityMap = {};
  for (const r of bySeverity) severityMap[r.severity] = r.n;
  const statusMap = {};
  for (const r of byStatus) statusMap[r.status] = r.n;

  const payload = {
    scope: isAdmin ? 'system' : 'personal',
    total_assessments: total,
    total_media: mediaTotal,
    by_severity: severityMap,
    by_status: statusMap,
    recent,
  };

  if (isAdmin) {
    payload.total_engineers = db.prepare('SELECT COUNT(*) AS n FROM engineers').get().n;
    payload.offline_synced = db.prepare("SELECT COUNT(*) AS n FROM assessments WHERE source = 'offline-sync'").get().n;
  }

  res.json({ stats: payload });
});

module.exports = router;
