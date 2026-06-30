'use strict';

const fs = require('fs');
const path = require('path');
const express = require('express');
const multer = require('multer');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { UPLOAD_DIR, MAX_FILE_SIZE, ALLOWED_IMAGE, ALLOWED_VIDEO } = require('../config');
const mediaSvc = require('../services/media');
const assessmentSvc = require('../services/assessments');
const activity = require('../services/activity');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => cb(null, mediaSvc.uniqueName(file.mimetype)),
});
const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE, files: 10 },
  fileFilter: (req, file, cb) => {
    const ok = [...ALLOWED_IMAGE, ...ALLOWED_VIDEO].includes(file.mimetype);
    cb(ok ? null : new Error('Unsupported file type. Allowed: images and mp4/webm/mov video.'), ok);
  },
});

function ownsAssessment(req, id) {
  const a = assessmentSvc.getById(Number(id));
  return a && a.engineer_id === req.user.id ? a : null;
}

// POST /api/assessments/:id/media  (field name: "files")
router.post('/assessments/:id/media', requireAuth, upload.array('files', 10), (req, res) => {
  const a = ownsAssessment(req, req.params.id);
  if (!a) {
    // Clean up any files multer already saved for a non-owned assessment
    (req.files || []).forEach((f) => { try { fs.unlinkSync(f.path); } catch (_) {} });
    return res.status(404).json({ error: 'Assessment not found.' });
  }
  if (!req.files || req.files.length === 0) return res.status(400).json({ error: 'No files uploaded.' });

  const saved = req.files.map((f) => mediaSvc.record({
    assessment_id: a.id,
    filename: f.filename,
    original_name: f.originalname,
    mime_type: f.mimetype,
    size: f.size,
  }));
  activity.log(req.user.id, 'upload_media', { entity: 'assessment', entityId: a.id, detail: `${saved.length} file(s)` });
  res.status(201).json({ media: saved });
});

// GET /api/media/:id — serve the binary (auth + ownership enforced)
router.get('/media/:id', requireAuth, (req, res) => {
  const m = mediaSvc.getById(Number(req.params.id));
  if (!m) return res.status(404).json({ error: 'Media not found.' });
  const a = assessmentSvc.getById(m.assessment_id);
  if (!a || a.engineer_id !== req.user.id) return res.status(403).json({ error: 'Access denied.' });
  const filePath = path.join(UPLOAD_DIR, m.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File missing on server.' });
  if (m.mime_type) res.type(m.mime_type);
  res.sendFile(filePath);
});

// DELETE /api/media/:id
router.delete('/media/:id', requireAuth, (req, res) => {
  const m = mediaSvc.getById(Number(req.params.id));
  if (!m) return res.status(404).json({ error: 'Media not found.' });
  const a = assessmentSvc.getById(m.assessment_id);
  if (!a || a.engineer_id !== req.user.id) return res.status(403).json({ error: 'Access denied.' });
  mediaSvc.remove(m);
  res.json({ ok: true });
});

module.exports = router;
