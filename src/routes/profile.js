'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { isEmail, isNonEmpty } = require('../utils/validate');
const activity = require('../services/activity');

const router = express.Router();

const updateProfile = db.prepare(
  `UPDATE engineers
   SET full_name = @full_name, phone = @phone, email = @email, updated_at = datetime('now')
   WHERE id = @id`
);
const updatePassword = db.prepare(
  `UPDATE engineers SET password_hash = @hash, updated_at = datetime('now') WHERE id = @id`
);
const findByEmail = db.prepare('SELECT id FROM engineers WHERE email = ?');
const findFull = db.prepare('SELECT * FROM engineers WHERE id = ?');

// GET /api/profile
router.get('/', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// PUT /api/profile  — update name / phone / email
router.put('/', requireAuth, (req, res) => {
  const { full_name, phone, email } = req.body || {};
  if (!isNonEmpty(full_name)) return res.status(400).json({ error: 'Full name is required.' });
  if (!isEmail(email)) return res.status(400).json({ error: 'A valid email is required.' });

  const normEmail = email.trim().toLowerCase();
  const existing = findByEmail.get(normEmail);
  if (existing && existing.id !== req.user.id) {
    return res.status(409).json({ error: 'That email is already used by another account.' });
  }

  updateProfile.run({
    id: req.user.id,
    full_name: full_name.trim(),
    phone: isNonEmpty(phone) ? phone.trim() : null,
    email: normEmail,
  });
  activity.log(req.user.id, 'update_profile', { entity: 'engineer', entityId: req.user.id });
  const user = findFull.get(req.user.id);
  res.json({ user: { id: user.id, full_name: user.full_name, email: user.email, phone: user.phone, role: user.role } });
});

// PUT /api/profile/password — change password
router.put('/password', requireAuth, (req, res) => {
  const { current_password, new_password } = req.body || {};
  if (!isNonEmpty(new_password) || new_password.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });
  }
  const user = findFull.get(req.user.id);
  if (!bcrypt.compareSync(current_password || '', user.password_hash)) {
    return res.status(401).json({ error: 'Current password is incorrect.' });
  }
  updatePassword.run({ id: req.user.id, hash: bcrypt.hashSync(new_password, 10) });
  activity.log(req.user.id, 'change_password', { entity: 'engineer', entityId: req.user.id });
  res.json({ ok: true });
});

module.exports = router;
