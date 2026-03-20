"use client";

import { useEffect, useState } from 'react';
import type { ClockEntry, ApiResponse } from '@/type';
import { formatDate, formatTime, formatDuration } from '@/lib/time';

interface HistoryTableProps {
  personId?: number;
  limit?: number;
}

const HistoryTable: React.FC<HistoryTableProps> = ({ personId, limit = 20 }) => {
  const [entries, setEntries] = useState<ClockEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (personId) params.set('person_ID', String(personId));

    fetch(`/api/history?${params}`)
      .then(r => r.json())
      .then((json: ApiResponse<ClockEntry[]>) => {
        if (json.success && json.data) {
          setEntries(json.data);
        } else {
          setError(json.error ?? 'Failed to load history.');
        }
      })
      .catch(() => setError('Network error. Could not load history.'))
      .finally(() => setLoading(false));
  }, [personId, limit]);

  if (loading) return <p className="ht-state">Loading history…</p>;
  if (error)   return <p className="ht-state ht-error">{error}</p>;
  if (entries.length === 0) return <p className="ht-state">No history found.</p>;

  return (
    <div className="ht-wrapper">
      <table className="ht-table">
        <thead>
          <tr>
            {!personId && <th>Employee</th>}
            <th>Date</th>
            <th>Clock In</th>
            <th>Clock Out</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(e => (
            <tr key={e.id}>
              {!personId && <td>#{e.person_ID}</td>}
              <td>{formatDate(e.date)}</td>
              <td>{formatTime(e.clock_in)}</td>
              <td>{e.clock_out ? formatTime(e.clock_out) : <span className="ht-active">Active</span>}</td>
              <td>{e.duration_minutes ? formatDuration(e.duration_minutes) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <style>{`
        .ht-wrapper { overflow-x: auto; }
        .ht-state { color: #718096; font-size: 0.9rem; }
        .ht-error { color: #fc8181; }
        .ht-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; min-width: 420px; }
        .ht-table th { color: #718096; font-weight: 600; text-align: left; padding: 0.6rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.06); white-space: nowrap; }
        .ht-table td { color: #e2e8f0; padding: 0.7rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .ht-table tr:last-child td { border-bottom: none; }
        .ht-table tr:hover td { background: rgba(255,255,255,0.03); }
        .ht-active { background: rgba(72,187,120,0.15); color: #48bb78; padding: 0.15rem 0.5rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
      `}</style>
    </div>
  );
};

export default HistoryTable;

