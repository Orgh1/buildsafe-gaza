'use strict';

const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const svc = require('../services/assessments');
const { streamReport } = require('../services/report');
const activity = require('../services/activity');

const router = express.Router();
router.use(requireAuth);

const engineerStmt = db.prepare('SELECT id, full_name, email, phone FROM engineers WHERE id = ?');

// GET /api/assessments/:id/report  — structured JSON (used for on-screen report view)
router.get('/:id/report', (req, res) => {
  const a = svc.getById(Number(req.params.id));
  if (!a || a.engineer_id !== req.user.id) return res.status(404).json({ error: 'Assessment not found.' });
  const full = svc.withMedia(a);
  full.engineer = engineerStmt.get(a.engineer_id);
  res.json({ report: full });
});

// GET /api/assessments/:id/report.pdf — downloadable PDF
router.get('/:id/report.pdf', (req, res) => {
  const a = svc.getById(Number(req.params.id));
  if (!a || a.engineer_id !== req.user.id) return res.status(404).json({ error: 'Assessment not found.' });
  const full = svc.withMedia(a);
  const engineer = engineerStmt.get(a.engineer_id);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="BSG-report-${a.id}.pdf"`);
  activity.log(req.user.id, 'generate_report', { entity: 'assessment', entityId: a.id });
  streamReport(res, { assessment: full, engineer, media: full.media });
});

module.exports = router;
