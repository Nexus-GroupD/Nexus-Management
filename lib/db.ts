/**
 * lib/db.ts
 * Database stub for Vercel deployment.
 * Returns null — all API routes handle this gracefully.
 */

export interface Database {
  prepare: (sql: string) => {
    get: (...params: unknown[]) => unknown;
    all: (...params: unknown[]) => unknown[];
    run: (...params: unknown[]) => { lastInsertRowid: number };
  };
  exec: (sql: string) => void;
  pragma: (pragma: string) => void;
  transaction: (fn: () => void) => () => void;
}

export default function getDb(): Database | null {
  console.warn('[db] No database configured for this environment.');
  return null;
}
