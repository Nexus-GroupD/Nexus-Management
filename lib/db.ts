export const runtime = "nodejs";

import Database from "better-sqlite3";
import {
  MANAGER_PERMISSIONS,
  TEAM_LEAD_PERMISSIONS,
  EMPLOYEE_PERMISSIONS,
} from "@/lib/permissions";

let _db: Database.Database | null = null;

function initDb(): Database.Database {
  if (_db) return _db;

  _db = new Database(process.env.DB_PATH ?? process.cwd() + "/nexus.db");
  _db.pragma("foreign_keys = ON");

  _db.exec(`
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

    CREATE TABLE IF NOT EXISTS conversations (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS conversation_participants (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      employee_id     INTEGER NOT NULL REFERENCES people(id)        ON DELETE CASCADE,
      UNIQUE(conversation_id, employee_id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
      sender_id       INTEGER NOT NULL REFERENCES people(id)        ON DELETE CASCADE,
      content         TEXT    NOT NULL,
      created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migrate shifts table if it was created with old camelCase schema
  try {
    const cols = (_db.prepare("PRAGMA table_info(shifts)").all() as { name: string }[]).map(c => c.name);
    if (cols.includes("shiftId") && !cols.includes("shift_ID")) {
      _db.exec("DROP TABLE shifts");
      _db.exec(`
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
    // Safe to ignore
  }

  // Add permissions column to existing installations that predate this migration
  try {
    _db.exec("ALTER TABLE custom_roles ADD COLUMN permissions TEXT NOT NULL DEFAULT '[]'");
  } catch {
    // Column already exists — safe to ignore
  }

  // Seed built-in roles
  const seedRole = _db.prepare(
    "INSERT OR IGNORE INTO custom_roles (name, permission_level, is_builtin, permissions) VALUES (?, ?, 1, ?)"
  );
  _db.transaction(() => {
    seedRole.run("Employee",  "viewer", JSON.stringify(EMPLOYEE_PERMISSIONS));
    seedRole.run("Team Lead", "viewer", JSON.stringify(TEAM_LEAD_PERMISSIONS));
    seedRole.run("Manager",   "admin",  JSON.stringify(MANAGER_PERMISSIONS));
  })();

  // Backfill any built-in role that still has empty permissions
  const backfill = _db.prepare(
    "UPDATE custom_roles SET permissions = ? WHERE name = ? AND (permissions = '[]' OR permissions IS NULL OR permissions = '')"
  );
  _db.transaction(() => {
    backfill.run(JSON.stringify(EMPLOYEE_PERMISSIONS),  "Employee");
    backfill.run(JSON.stringify(TEAM_LEAD_PERMISSIONS), "Team Lead");
    backfill.run(JSON.stringify(MANAGER_PERMISSIONS),   "Manager");
  })();

  return _db;
}

// Proxy so all existing code (db.prepare, db.exec, etc.) works unchanged,
// but the database is only opened on first actual use at runtime.
const db = new Proxy({} as Database.Database, {
  get(_target, prop: string | symbol) {
    return Reflect.get(initDb(), prop);
  },
});

export default db;
export function getDb() {
  return initDb();
}
