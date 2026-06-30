'use strict';

const express = require('express');
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');
const { isEmail, isNonEmpty } = require('../utils/validate');

const router = express.Router();

const insertStmt = db.prepare(
  `INSERT INTO contacts (name, email, subject, message) VALUES (@name, @email, @subject, @message)`
);

// POST /api/contact — public contact / feedback form
router.post('/', (req, res) => {
  const { name, email, subject, message } = req.body || {};
  const errors = [];
  if (!isNonEmpty(name)) errors.push('Name is required.');
  if (!isEmail(email)) errors.push('A valid email is required.');
  if (!isNonEmpty(message)) errors.push('Message is required.');
  if (errors.length) return res.status(400).json({ error: errors.join(' '), errors });

  insertStmt.run({
    name: name.trim(),
    email: email.trim(),
    subject: isNonEmpty(subject) ? subject.trim() : null,
    message: message.trim(),
  });
  res.status(201).json({ ok: true, message: 'Thank you — your message has been received.' });
});

// GET /api/contact — admin only: list submitted messages
router.get('/', requireAdmin, (req, res) => {
  const rows = db.prepare('SELECT * FROM contacts ORDER BY created_at DESC').all();
  res.json({ contacts: rows });
});

module.exports = router;
