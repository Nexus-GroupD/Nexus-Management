export const runtime = "nodejs";

import Database from "better-sqlite3";
import {
  MANAGER_PERMISSIONS,
  TEAM_LEAD_PERMISSIONS,
  EMPLOYEE_PERMISSIONS,
} from "@/lib/permissions";

const db = new Database(process.env.DB_PATH ?? process.cwd() + "/nexus.db");
db.pragma("foreign_keys = ON");

// Core tables
db.exec(`
  CREATE TABLE IF NOT EXISTS people (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    name         TEXT NOT NULL,
    email        TEXT UNIQUE,
    role         TEXT,
    pay_per_hour REAL,
    availability TEXT,
    password     TEXT,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS clock_entries (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    person_ID        INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    clock_in         TEXT NOT NULL,
    clock_out        TEXT,
    date             TEXT NOT NULL,
    duration_minutes REAL,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS teams (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS team_members (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id   INTEGER NOT NULL REFERENCES teams(id)  ON DELETE CASCADE,
    person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    UNIQUE(team_id, person_id)
  );

  CREATE TABLE IF NOT EXISTS custom_roles (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    name             TEXT NOT NULL UNIQUE,
    permission_level TEXT NOT NULL DEFAULT 'viewer',
    is_builtin       INTEGER NOT NULL DEFAULT 0,
    permissions      TEXT NOT NULL DEFAULT '[]'
  );

  CREATE TABLE IF NOT EXISTS shifts (
    shift_ID   INTEGER PRIMARY KEY AUTOINCREMENT,
    date       TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time   TEXT NOT NULL,
    person_ID  INTEGER REFERENCES people(id) ON DELETE SET NULL
  );
`);

// If shifts table was created with old camelCase schema, drop and recreate it
try {
  const cols = (db.prepare("PRAGMA table_info(shifts)").all() as { name: string }[]).map(c => c.name);
  if (cols.includes("shiftId") && !cols.includes("shift_ID")) {
    db.exec("DROP TABLE shifts");
    db.exec(`
      CREATE TABLE shifts (
        shift_ID   INTEGER PRIMARY KEY AUTOINCREMENT,
        date       TEXT NOT NULL,
        start_time TEXT NOT NULL,
        end_time   TEXT NOT NULL,
        person_ID  INTEGER REFERENCES people(id) ON DELETE SET NULL
      )
    `);
  }
} catch {
  // Table doesn't exist yet — handled by CREATE TABLE IF NOT EXISTS above
}

// Add permissions column to existing installations that predate this migration
try {
  db.exec("ALTER TABLE custom_roles ADD COLUMN permissions TEXT NOT NULL DEFAULT '[]'");
} catch {
  // Column already exists — safe to ignore
}

// Seed built-in roles (INSERT OR IGNORE = idempotent)
const seedRole = db.prepare(
  "INSERT OR IGNORE INTO custom_roles (name, permission_level, is_builtin, permissions) VALUES (?, ?, 1, ?)"
);
db.transaction(() => {
  seedRole.run("Employee",  "viewer", JSON.stringify(EMPLOYEE_PERMISSIONS));
  seedRole.run("Team Lead", "viewer", JSON.stringify(TEAM_LEAD_PERMISSIONS));
  seedRole.run("Manager",   "admin",  JSON.stringify(MANAGER_PERMISSIONS));
})();

// Backfill any built-in role that still has empty permissions (upgrades from old schema)
const backfill = db.prepare(
  "UPDATE custom_roles SET permissions = ? WHERE name = ? AND (permissions = '[]' OR permissions IS NULL OR permissions = '')"
);
db.transaction(() => {
  backfill.run(JSON.stringify(EMPLOYEE_PERMISSIONS),  "Employee");
  backfill.run(JSON.stringify(TEAM_LEAD_PERMISSIONS), "Team Lead");
  backfill.run(JSON.stringify(MANAGER_PERMISSIONS),   "Manager");
})();

export default db;
export function getDb() {
  return db;
}
