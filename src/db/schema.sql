-- BuildSafe Gaza — database schema (SQLite)
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- Field engineers / users of the platform
CREATE TABLE IF NOT EXISTS engineers (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name     TEXT    NOT NULL,
  email         TEXT    NOT NULL UNIQUE,
  phone         TEXT,
  password_hash TEXT    NOT NULL,
  role          TEXT    NOT NULL DEFAULT 'engineer',   -- engineer | admin
  created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Building damage assessments
CREATE TABLE IF NOT EXISTS assessments (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  client_uuid      TEXT    UNIQUE,                      -- generated on device; lets offline records sync without duplication
  engineer_id      INTEGER NOT NULL REFERENCES engineers(id) ON DELETE CASCADE,
  owner_name       TEXT,
  owner_id_number  TEXT,
  owner_phone      TEXT,
  building_location TEXT   NOT NULL,
  latitude         REAL,
  longitude        REAL,
  building_type    TEXT,
  num_floors       INTEGER,
  year_built       INTEGER,
  damage_type      TEXT,
  severity         TEXT    NOT NULL,                    -- Minor | Moderate | Severe | Critical
  habitability     TEXT,                               -- Habitable | Conditional | Uninhabitable
  notes            TEXT,
  status           TEXT    NOT NULL DEFAULT 'submitted',-- draft | submitted | reviewed
  source           TEXT    NOT NULL DEFAULT 'online',   -- online | offline-sync
  created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at       TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_assessments_engineer ON assessments(engineer_id);
CREATE INDEX IF NOT EXISTS idx_assessments_severity ON assessments(severity);
CREATE INDEX IF NOT EXISTS idx_assessments_created  ON assessments(created_at);

-- Media (images / videos) attached to an assessment
CREATE TABLE IF NOT EXISTS media (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  assessment_id INTEGER NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  filename      TEXT    NOT NULL,                       -- stored filename on disk
  original_name TEXT,
  mime_type     TEXT,
  size          INTEGER,
  kind          TEXT,                                   -- image | video
  created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_media_assessment ON media(assessment_id);

-- Contact / feedback messages from the landing page
CREATE TABLE IF NOT EXISTS contacts (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT,
  message    TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Engineer activity tracking
CREATE TABLE IF NOT EXISTS activity_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  engineer_id INTEGER REFERENCES engineers(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,                            -- login | create_assessment | update_assessment | ...
  entity      TEXT,
  entity_id   INTEGER,
  detail      TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_activity_engineer ON activity_log(engineer_id);
