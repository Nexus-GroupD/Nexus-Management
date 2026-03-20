"use client";

import { useEffect, useState } from 'react';
import type { ClockEntry, ApiResponse } from '@/type';
import { formatDuration } from '@/lib/time';

interface WeeklySummaryProps {
  personId: number;
}

interface DaySummary {
  date: string;
  label: string;
  minutes: number;
}

const WeeklySummary: React.FC<WeeklySummaryProps> = ({ personId }) => {
  const [days, setDays] = useState<DaySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/history?person_ID=${personId}&limit=100`)
      .then(r => r.json())
      .then((json: ApiResponse<ClockEntry[]>) => {
        if (!json.success || !json.data) return;

        // Build last 7 days
        const result: DaySummary[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const label = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
          const minutes = json.data
            .filter(e => e.date === dateStr)
            .reduce((acc, e) => acc + (e.duration_minutes ?? 0), 0);
          result.push({ date: dateStr, label, minutes });
        }
        setDays(result);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [personId]);

  const maxMinutes = Math.max(...days.map(d => d.minutes), 1);
  const totalMinutes = days.reduce((a, d) => a + d.minutes, 0);

  if (loading) return <p style={{ color: '#718096', fontSize: '0.875rem' }}>Loading weekly summary…</p>;

  return (
    <div className="weekly-summary">
      <div className="ws-header">
        <span className="ws-title">This Week</span>
        <span className="ws-total">{formatDuration(totalMinutes)} total</span>
      </div>
      <div className="ws-bars">
        {days.map(day => (
          <div key={day.date} className="ws-bar-col">
            <span className="ws-time">{day.minutes > 0 ? formatDuration(day.minutes) : ''}</span>
            <div className="ws-bar-track">
              <div
                className="ws-bar-fill"
                style={{ height: `${Math.round((day.minutes / maxMinutes) * 100)}%` }}
              />
            </div>
            <span className={`ws-label ${day.label === 'Today' ? 'today' : ''}`}>{day.label}</span>
          </div>
        ))}
      </div>
      <style>{`
        .weekly-summary { background: #1a1f2e; border-radius: 10px; padding: 1.25rem; }
        .ws-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .ws-title { font-size: 1rem; font-weight: 700; color: #48bb78; }
        .ws-total { font-size: 0.875rem; color: #718096; }
        .ws-bars { display: flex; gap: 0.5rem; align-items: flex-end; height: 100px; }
        .ws-bar-col { display: flex; flex-direction: column; align-items: center; flex: 1; gap: 0.25rem; height: 100%; }
        .ws-time { font-size: 0.65rem; color: #718096; height: 14px; text-align: center; white-space: nowrap; }
        .ws-bar-track { flex: 1; width: 100%; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden; display: flex; align-items: flex-end; }
        .ws-bar-fill { width: 100%; background: #48bb78; border-radius: 4px; transition: height 0.4s ease; min-height: 2px; }
        .ws-label { font-size: 0.7rem; color: #718096; font-weight: 500; }
        .ws-label.today { color: #48bb78; font-weight: 700; }
      `}</style>
    </div>
  );
};

export default WeeklySummary;

