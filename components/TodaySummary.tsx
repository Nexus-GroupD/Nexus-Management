"use client";

import { useEffect, useState } from 'react';
import type { ClockEntry, ApiResponse } from '@/type';
import { formatTime, formatDuration } from '@/lib/time';

interface TodaySummaryProps {
  personId: number;
}

const TodaySummary: React.FC<TodaySummaryProps> = ({ personId }) => {
  const [entries, setEntries] = useState<ClockEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    fetch(`/api/history?person_ID=${personId}`)
      .then(r => r.json())
      .then((json: ApiResponse<ClockEntry[]>) => {
        if (json.success && json.data) {
          setEntries(json.data.filter(e => e.date === today));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [personId]);

  const totalMinutes = entries.reduce((acc, e) => acc + (e.duration_minutes ?? 0), 0);

  if (loading) return <p style={{ color: '#a0aec0', fontSize: '0.9rem' }}>Loading today's summary…</p>;

  return (
    <div className="today-summary">
      <h3 className="summary-heading">Today</h3>
      {entries.length === 0 ? (
        <p className="no-entries">No clock entries yet today.</p>
      ) : (
        <>
          <table className="summary-table">
            <thead>
              <tr>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(e => (
                <tr key={e.id}>
                  <td>{formatTime(e.clock_in)}</td>
                  <td>{e.clock_out ? formatTime(e.clock_out) : <span className="active-badge">Active</span>}</td>
                  <td>{e.duration_minutes ? formatDuration(e.duration_minutes) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="total-time">Total: <strong>{formatDuration(totalMinutes)}</strong></p>
        </>
      )}
      <style>{`
        .today-summary { background: #1a1f2e; border-radius: 10px; padding: 1.25rem; }
        .summary-heading { font-size: 1rem; font-weight: 700; color: #48bb78; margin: 0 0 0.75rem; }
        .no-entries { color: #718096; font-size: 0.875rem; margin: 0; }
        .summary-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
        .summary-table th { color: #718096; font-weight: 600; text-align: left; padding: 0.4rem 0; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .summary-table td { color: #e2e8f0; padding: 0.4rem 0; }
        .active-badge { background: rgba(72,187,120,0.15); color: #48bb78; padding: 0.15rem 0.5rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
        .total-time { color: #a0aec0; font-size: 0.875rem; margin: 0.75rem 0 0; }
        .total-time strong { color: #f7fafc; }
      `}</style>
    </div>
  );
};

export default TodaySummary;

