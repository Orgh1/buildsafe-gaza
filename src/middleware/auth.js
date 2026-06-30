'use strict';

const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const db = require('../db');

const findById = db.prepare(
  'SELECT id, full_name, email, phone, role, created_at FROM engineers WHERE id = ?'
);

function readToken(req) {
  // Prefer the httpOnly cookie; fall back to Authorization: Bearer <token>
  if (req.cookies && req.cookies.token) return req.cookies.token;
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7);
  return null;
}

/**
 * Require a valid session. Attaches req.user (the engineer row) on success.
 */
function requireAuth(req, res, next) {
  const token = readToken(req);
  if (!token) return res.status(401).json({ error: 'Authentication required.' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = findById.get(payload.id);
    if (!user) return res.status(401).json({ error: 'Session no longer valid.' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session.' });
  }
}

/**
 * Require an admin role (builds on requireAuth).
 */
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Administrator access required.' });
    }
    next();
  });
}

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

module.exports = { requireAuth, requireAdmin, signToken, readToken };
