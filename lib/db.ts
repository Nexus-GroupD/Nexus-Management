/**
 * lib/db.ts
 * Lightweight SQLite wrapper using better-sqlite3.
 * Falls back gracefully if the DB file cannot be opened.
 */

import path from 'path';
import fs from 'fs';

// We use a dynamic require so the module can be tree-shaken in environments
// that don't need it (e.g. edge runtime). Install: npm i better-sqlite3 @types/better-sqlite3
let db: import('better-sqlite3').Database | null = null;

function getDb() {
  if (db) return db;

  // Allow override via env var for tests / different deploy paths
  const dbPath = process.env.DB_PATH ?? path.join(process.cwd(), 'Nexus.db');

  if (!fs.existsSync(dbPath)) {
    console.warn(`[db] Database file not found at ${dbPath}. Running without persistence.`);
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Database = require('better-sqlite3');
    db = new Database(dbPath, { verbose: process.env.NODE_ENV === 'development' ? console.log : undefined });

    // Enable WAL mode for better concurrent read performance
    db!.pragma('journal_mode = WAL');
    db!.pragma('foreign_keys = ON');

    initSchema();
    return db;
  } catch (err) {
    console.error('[db] Failed to open database:', err);
    return null;
  }
}

/** Ensure tables exist (idempotent). */
function initSchema() {
  const database = db!;
  database.exec(`
    CREATE TABLE IF NOT EXISTS employees (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      role        TEXT    NOT NULL DEFAULT 'employee',
      email       TEXT    UNIQUE,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS shifts (
      shift_ID    INTEGER PRIMARY KEY AUTOINCREMENT,
      date        TEXT    NOT NULL,
      start_time  TEXT    NOT NULL,
      end_time    TEXT    NOT NULL,
      person_ID   INTEGER REFERENCES employees(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS clock_entries (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      person_ID       INTEGER NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
      clock_in        TEXT    NOT NULL,
      clock_out       TEXT,
      date            TEXT    NOT NULL,
      duration_minutes INTEGER
    );
  `);
}

export default getDb;

