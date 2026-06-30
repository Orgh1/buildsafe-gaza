'use strict';

const fs = require('fs');
const path = require('path');
const db = require('../db');
const { UPLOAD_DIR, ALLOWED_IMAGE, ALLOWED_VIDEO } = require('../config');

const insertStmt = db.prepare(
  `INSERT INTO media (assessment_id, filename, original_name, mime_type, size, kind)
   VALUES (@assessment_id, @filename, @original_name, @mime_type, @size, @kind)`
);
const byIdStmt = db.prepare('SELECT * FROM media WHERE id = ?');
const deleteStmt = db.prepare('DELETE FROM media WHERE id = ?');

function kindOf(mime) {
  if (ALLOWED_IMAGE.includes(mime)) return 'image';
  if (ALLOWED_VIDEO.includes(mime)) return 'video';
  return null;
}

function extFor(mime) {
  const map = {
    'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif',
    'video/mp4': '.mp4', 'video/webm': '.webm', 'video/quicktime': '.mov',
  };
  return map[mime] || '';
}

function uniqueName(mime) {
  const rand = Math.random().toString(36).slice(2, 10);
  return `m_${Date.now()}_${rand}${extFor(mime)}`;
}

// Record a media row for a file already written to disk (used by multer uploads)
function record({ assessment_id, filename, original_name, mime_type, size }) {
  const info = insertStmt.run({
    assessment_id,
    filename,
    original_name: original_name || null,
    mime_type: mime_type || null,
    size: size || null,
    kind: kindOf(mime_type) || 'image',
  });
  return byIdStmt.get(info.lastInsertRowid);
}

// Save a base64 data payload (used when syncing offline-captured media)
function saveBase64({ assessment_id, data, original_name, mime_type }) {
  const kind = kindOf(mime_type);
  if (!kind) throw new Error(`Unsupported media type: ${mime_type}`);
  // Accept both raw base64 and data URLs
  const base64 = data.includes(',') ? data.split(',').pop() : data;
  const buffer = Buffer.from(base64, 'base64');
  const filename = uniqueName(mime_type);
  fs.writeFileSync(path.join(UPLOAD_DIR, filename), buffer);
  return record({ assessment_id, filename, original_name, mime_type, size: buffer.length });
}

function getById(id) {
  return byIdStmt.get(id);
}

function remove(media) {
  try {
    fs.unlinkSync(path.join(UPLOAD_DIR, media.filename));
  } catch (_) { /* file may already be gone */ }
  deleteStmt.run(media.id);
}

module.exports = { record, saveBase64, getById, remove, kindOf, uniqueName, extFor };
