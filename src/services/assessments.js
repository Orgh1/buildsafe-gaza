'use strict';

const db = require('../db');

const COLUMNS = [
  'client_uuid', 'owner_name', 'owner_id_number', 'owner_phone', 'building_location',
  'latitude', 'longitude', 'building_type', 'num_floors', 'year_built',
  'damage_type', 'severity', 'habitability', 'notes', 'status',
];

const insertStmt = db.prepare(
  `INSERT INTO assessments
     (client_uuid, engineer_id, owner_name, owner_id_number, owner_phone, building_location,
      latitude, longitude, building_type, num_floors, year_built, damage_type, severity,
      habitability, notes, status, source)
   VALUES
     (@client_uuid, @engineer_id, @owner_name, @owner_id_number, @owner_phone, @building_location,
      @latitude, @longitude, @building_type, @num_floors, @year_built, @damage_type, @severity,
      @habitability, @notes, @status, @source)`
);

const updateStmt = db.prepare(
  `UPDATE assessments SET
     owner_name=@owner_name, owner_id_number=@owner_id_number, owner_phone=@owner_phone,
     building_location=@building_location, latitude=@latitude, longitude=@longitude,
     building_type=@building_type, num_floors=@num_floors, year_built=@year_built,
     damage_type=@damage_type, severity=@severity, habitability=@habitability,
     notes=@notes, status=@status, updated_at=datetime('now')
   WHERE id=@id AND engineer_id=@engineer_id`
);

const byIdStmt = db.prepare('SELECT * FROM assessments WHERE id = ?');
const byClientUuidStmt = db.prepare('SELECT * FROM assessments WHERE client_uuid = ?');
const mediaStmt = db.prepare('SELECT id, filename, original_name, mime_type, size, kind, created_at FROM media WHERE assessment_id = ? ORDER BY id');

function buildRow(data, engineerId, source) {
  const row = { engineer_id: engineerId, source: source || 'online' };
  for (const c of COLUMNS) row[c] = data[c] != null ? data[c] : null;
  return row;
}

function create(data, engineerId, source = 'online') {
  const row = buildRow(data, engineerId, source);
  const info = insertStmt.run(row);
  return byIdStmt.get(info.lastInsertRowid);
}

function update(id, data, engineerId) {
  const row = buildRow(data, engineerId);
  row.id = id;
  const info = updateStmt.run(row);
  return info.changes > 0 ? byIdStmt.get(id) : null;
}

function getById(id) {
  return byIdStmt.get(id);
}

function getByClientUuid(uuid) {
  if (!uuid) return null;
  return byClientUuidStmt.get(uuid);
}

function withMedia(assessment) {
  if (!assessment) return null;
  return { ...assessment, media: mediaStmt.all(assessment.id) };
}

module.exports = { create, update, getById, getByClientUuid, withMedia, COLUMNS };
