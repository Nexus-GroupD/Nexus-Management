/**
 * lib/time.ts
 * Shared time/date utility functions.
 */

/** Format an ISO date string to a human-readable date like "Mon, Mar 20" */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00'); // ensure local parsing
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

/** Format a clock timestamp (ISO) to a human-readable time like "3:45 PM" */
export function formatTime(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

/** Compute the duration in minutes between two ISO timestamps */
export function durationMinutes(clockIn: string, clockOut: string): number {
  const diff = new Date(clockOut).getTime() - new Date(clockIn).getTime();
  return Math.round(diff / 60_000);
}

/** Format minutes into a "Xh Ym" string */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Return today's date string in YYYY-MM-DD format */
export function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

/** Return the next N dates (including today) as YYYY-MM-DD strings */
export function nextNDates(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}
/** Returns a greeting based on the current hour */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
