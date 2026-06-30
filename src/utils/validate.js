'use strict';

const { SEVERITY_LEVELS, BUILDING_TYPES, DAMAGE_TYPES, HABITABILITY } = require('../config');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isEmail(v) {
  return typeof v === 'string' && EMAIL_RE.test(v.trim());
}

function isNonEmpty(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function clampInt(v, min, max) {
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return null;
  if (typeof min === 'number' && n < min) return min;
  if (typeof max === 'number' && n > max) return max;
  return n;
}

function oneOf(v, list) {
  return list.includes(v);
}

/**
 * Validate an assessment payload (used by both online create and offline sync).
 * Returns { valid, errors:[], data:{} } with a sanitized data object.
 */
function validateAssessment(body) {
  const errors = [];
  const data = {};

  if (!isNonEmpty(body.building_location)) {
    errors.push('Building location is required.');
  } else {
    data.building_location = String(body.building_location).trim();
  }

  if (!oneOf(body.severity, SEVERITY_LEVELS)) {
    errors.push(`Severity must be one of: ${SEVERITY_LEVELS.join(', ')}.`);
  } else {
    data.severity = body.severity;
  }

  // Optional, validated-if-present fields
  data.owner_name = isNonEmpty(body.owner_name) ? String(body.owner_name).trim() : null;
  data.owner_id_number = isNonEmpty(body.owner_id_number) ? String(body.owner_id_number).trim() : null;
  data.owner_phone = isNonEmpty(body.owner_phone) ? String(body.owner_phone).trim() : null;
  data.notes = isNonEmpty(body.notes) ? String(body.notes).trim() : null;

  data.building_type = oneOf(body.building_type, BUILDING_TYPES) ? body.building_type : null;
  data.damage_type = oneOf(body.damage_type, DAMAGE_TYPES) ? body.damage_type : null;
  data.habitability = oneOf(body.habitability, HABITABILITY) ? body.habitability : null;

  data.num_floors = body.num_floors != null && body.num_floors !== '' ? clampInt(body.num_floors, 0, 200) : null;
  data.year_built = body.year_built != null && body.year_built !== '' ? clampInt(body.year_built, 1800, 2100) : null;

  data.latitude = body.latitude != null && body.latitude !== '' ? Number(body.latitude) : null;
  data.longitude = body.longitude != null && body.longitude !== '' ? Number(body.longitude) : null;
  if (data.latitude != null && (Number.isNaN(data.latitude) || data.latitude < -90 || data.latitude > 90)) data.latitude = null;
  if (data.longitude != null && (Number.isNaN(data.longitude) || data.longitude < -180 || data.longitude > 180)) data.longitude = null;

  data.status = oneOf(body.status, ['draft', 'submitted', 'reviewed']) ? body.status : 'submitted';

  return { valid: errors.length === 0, errors, data };
}

module.exports = { isEmail, isNonEmpty, clampInt, oneOf, validateAssessment };
