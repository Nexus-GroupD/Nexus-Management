/**
 * lib/db.ts
 * Database connection stub.
 * SQLite via better-sqlite3 is supported in local/self-hosted environments.
 * For Vercel deployment, a hosted database (e.g. Vercel Postgres) is required.
 */

export default function getDb() {
  console.warn('[db] No database configured for this environment.');
  return null;
}
