'use strict';

const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const multer = require('multer');

const app = express();

// ---- Core middleware ----
app.use(cookieParser());

// Global JSON parser with a modest limit, but skip /api/sync which uses its own
// larger limit (base64 media payloads can be big).
const jsonParser = express.json({ limit: '2mb' });
app.use((req, res, next) => {
  if (req.path.startsWith('/api/sync')) return next();
  return jsonParser(req, res, next);
});
app.use(express.urlencoded({ extended: true }));

// Light security headers (no external dependency)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
  next();
});

// ---- API routes ----
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/assessments', require('./routes/assessments'));
app.use('/api/assessments', require('./routes/reports')); // /:id/report and /:id/report.pdf
app.use('/api', require('./routes/media'));                // /assessments/:id/media, /media/:id
app.use('/api/sync', require('./routes/sync'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/stats', require('./routes/stats'));

// ---- Static frontend (PWA) ----
const PUBLIC_DIR = path.join(__dirname, '..', 'public');
app.use(express.static(PUBLIC_DIR));

// 404 for unmatched API routes
app.use('/api', (req, res) => res.status(404).json({ error: 'Endpoint not found.' }));

// ---- Error handler (incl. multer errors) ----
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  if (err && /Unsupported file type/.test(err.message)) {
    return res.status(400).json({ error: err.message });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

module.exports = app;
