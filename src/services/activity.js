'use strict';

const db = require('../db');

const stmt = db.prepare(
  `INSERT INTO activity_log (engineer_id, action, entity, entity_id, detail)
   VALUES (@engineer_id, @action, @entity, @entity_id, @detail)`
);

/**
 * Record an engineer activity. Best-effort: never throws into the request path.
 */
function log(engineerId, action, { entity = null, entityId = null, detail = null } = {}) {
  try {
    stmt.run({
      engineer_id: engineerId ?? null,
      action,
      entity,
      entity_id: entityId,
      detail,
    });
  } catch (err) {
    // Activity logging must not break the main operation
    console.error('activity log failed:', err.message);
  }
}

module.exports = { log };
