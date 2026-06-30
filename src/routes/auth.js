'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');
const { signToken, requireAuth } = require('../middleware/auth');
const { isEmail, isNonEmpty } = require('../utils/validate');
const activity = require('../services/activity');

const router = express.Router();

const insertEngineer = db.prepare(
  `INSERT INTO engineers (full_name, email, phone, password_hash, role)
   VALUES (@full_name, @email, @phone, @password_hash, @role)`
);
const findByEmail = db.prepare('SELECT * FROM engineers WHERE email = ?');
const countEngineers = db.prepare('SELECT COUNT(*) AS n FROM engineers');

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: false, // set true behind HTTPS in production
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function publicUser(u) {
  return { id: u.id, full_name: u.full_name, email: u.email, phone: u.phone, role: u.role };
}

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { full_name, email, phone, password } = req.body || {};
  const errors = [];
  if (!isNonEmpty(full_name)) errors.push('Full name is required.');
  if (!isEmail(email)) errors.push('A valid email is required.');
  if (!isNonEmpty(password) || password.length < 6) errors.push('Password must be at least 6 characters.');
  if (errors.length) return res.status(400).json({ error: errors.join(' '), errors });

  if (findByEmail.get(email.trim().toLowerCase())) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  // First registered user becomes admin (useful for the stats dashboard demo)
  const isFirst = countEngineers.get().n === 0;
  const password_hash = bcrypt.hashSync(password, 10);
  const info = insertEngineer.run({
    full_name: full_name.trim(),
    email: email.trim().toLowerCase(),
    phone: isNonEmpty(phone) ? phone.trim() : null,
    password_hash,
    role: isFirst ? 'admin' : 'engineer',
  });

  const user = db.prepare('SELECT * FROM engineers WHERE id = ?').get(info.lastInsertRowid);
  activity.log(user.id, 'register', { entity: 'engineer', entityId: user.id });
  const token = signToken(user);
  res.cookie('token', token, COOKIE_OPTS);
  res.status(201).json({ user: publicUser(user), token });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!isEmail(email) || !isNonEmpty(password)) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }
  const user = findByEmail.get(email.trim().toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  activity.log(user.id, 'login', { entity: 'engineer', entityId: user.id });
  const token = signToken(user);
  res.cookie('token', token, COOKIE_OPTS);
  res.json({ user: publicUser(user), token });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', { ...COOKIE_OPTS, maxAge: undefined });
  res.json({ ok: true });
});

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
