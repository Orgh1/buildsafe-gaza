'use strict';

const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { validateAssessment } = require('../utils/validate');
const svc = require('../services/assessments');
const activity = require('../services/activity');

const router = express.Router();
router.use(requireAuth);

const mediaCount = db.prepare('SELECT COUNT(*) AS n FROM media WHERE assessment_id = ?');
const deleteStmt = db.prepare('DELETE FROM assessments WHERE id = ? AND engineer_id = ?');

// GET /api/assessments  — list current engineer's assessments, with optional filter/search
router.get('/', (req, res) => {
  const { q, severity, status, sort } = req.query;
  const where = ['engineer_id = @engineer_id'];
  const params = { engineer_id: req.user.id };

  if (severity) { where.push('severity = @severity'); params.severity = severity; }
  if (status) { where.push('status = @status'); params.status = status; }
  if (q) {
    where.push('(building_location LIKE @q OR owner_name LIKE @q OR notes LIKE @q)');
    params.q = `%${q}%`;
  }

  const order = sort === 'oldest' ? 'created_at ASC' : 'created_at DESC';
  const rows = db.prepare(
    `SELECT a.*, (SELECT COUNT(*) FROM media m WHERE m.assessment_id = a.id) AS media_count
     FROM assessments a WHERE ${where.join(' AND ')} ORDER BY ${order}`
  ).all(params);

  res.json({ assessments: rows, count: rows.length });
});

// GET /api/assessments/:id — single assessment with media
router.get('/:id', (req, res) => {
  const a = svc.getById(Number(req.params.id));
  if (!a || a.engineer_id !== req.user.id) return res.status(404).json({ error: 'Assessment not found.' });
  res.json({ assessment: svc.withMedia(a) });
});

// POST /api/assessments — create
router.post('/', (req, res) => {
  const { valid, errors, data } = validateAssessment(req.body || {});
  if (!valid) return res.status(400).json({ error: errors.join(' '), errors });
  const created = svc.create(data, req.user.id, 'online');
  activity.log(req.user.id, 'create_assessment', { entity: 'assessment', entityId: created.id, detail: created.building_location });
  res.status(201).json({ assessment: created });
});

// PUT /api/assessments/:id — update
router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = svc.getById(id);
  if (!existing || existing.engineer_id !== req.user.id) return res.status(404).json({ error: 'Assessment not found.' });

  const { valid, errors, data } = validateAssessment(req.body || {});
  if (!valid) return res.status(400).json({ error: errors.join(' '), errors });

  const updated = svc.update(id, data, req.user.id);
  activity.log(req.user.id, 'update_assessment', { entity: 'assessment', entityId: id });
  res.json({ assessment: updated });
});

// DELETE /api/assessments/:id
router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  const existing = svc.getById(id);
  if (!existing || existing.engineer_id !== req.user.id) return res.status(404).json({ error: 'Assessment not found.' });
  deleteStmt.run(id, req.user.id);
  activity.log(req.user.id, 'delete_assessment', { entity: 'assessment', entityId: id });
  res.json({ ok: true });
});

module.exports = router;
