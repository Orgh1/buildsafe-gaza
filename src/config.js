'use strict';

const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, 'data');

module.exports = {
  ROOT,
  DATA_DIR,
  UPLOAD_DIR: path.join(DATA_DIR, 'uploads'),
  DB_PATH: process.env.DB_PATH || path.join(DATA_DIR, 'buildsafe.db'),
  PORT: Number(process.env.PORT) || 3000,
  JWT_SECRET: process.env.JWT_SECRET || 'buildsafe-gaza-dev-secret-change-in-prod',
  JWT_EXPIRES: '7d',
  // Upload limits
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50 MB per file
  ALLOWED_IMAGE: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_VIDEO: ['video/mp4', 'video/webm', 'video/quicktime'],
  // Domain enums (single source of truth, shared conceptually with the frontend)
  BUILDING_TYPES: ['Residential', 'Commercial', 'Industrial', 'Public', 'Mixed-use', 'Other'],
  DAMAGE_TYPES: ['Structural', 'Partial collapse', 'Cracks', 'Fire', 'Water', 'Facade', 'Other'],
  SEVERITY_LEVELS: ['Minor', 'Moderate', 'Severe', 'Critical'],
  HABITABILITY: ['Habitable', 'Conditional', 'Uninhabitable'],
};
