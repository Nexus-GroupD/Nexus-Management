"use client";

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import ClockButtons from '@/components/ClockButtons';
import TodaySummary from '@/components/TodaySummary';
import WeeklySummary from '@/components/weeklySummary';
import type { ClockStatus } from '@/type';

// In a real app this would come from an auth session.
// For now we let the user pick their ID to demo the functionality.
const DEMO_EMPLOYEES = [
  { id: 1, name: 'Alex Rivera',  role: 'Manager' },
  { id: 2, name: 'Jordan Lee',   role: 'Employee' },
  { id: 3, name: 'Sam Patel',    role: 'Employee' },
  { id: 4, name: 'Casey Morgan', role: 'Employee' },
];

export default function Dashboard() {
  const [selectedId, setSelectedId] = useState<number>(1);
  const [clockStatus, setClockStatus] = useState<ClockStatus>('clocked_out');

  const employee = DEMO_EMPLOYEES.find(e => e.id === selectedId)!;

  return (
    <>
      <Navbar pageTitle="Dashboard" />
      <main className="dash-page">

        {/* Employee selector (replaces auth for demo) */}
        <div className="dash-selector">
          <label className="selector-label">Viewing as:</label>
          <div className="selector-pills">
            {DEMO_EMPLOYEES.map(emp => (
              <button
                key={emp.id}
                className={`selector-pill ${selectedId === emp.id ? 'active' : ''}`}
                onClick={() => setSelectedId(emp.id)}
              >
                {emp.name}
              </button>
            ))}
          </div>
        </div>

        {/* Header card */}
        <div className="dash-hero">
          <div className="dash-avatar">{employee.name[0]}</div>
          <div>
            <h2 className="dash-name">{employee.name}</h2>
            <span className="dash-role">{employee.role}</span>
          </div>
          <div className={`dash-status ${clockStatus}`}>
            {clockStatus === 'clocked_in' ? '● Clocked In' : '○ Clocked Out'}
          </div>
        </div>

        {/* Clock buttons */}
        <section className="dash-section">
          <h3 className="section-title">Time Tracking</h3>
          <ClockButtons
            personId={selectedId}
            initialStatus={clockStatus}
            onStatusChange={setClockStatus}
          />
        </section>

        {/* Today summary & weekly chart */}
        <div className="dash-grid">
          <section className="dash-section">
            <h3 className="section-title">Today's Entries</h3>
            <TodaySummary personId={selectedId} />
          </section>
          <section className="dash-section">
            <h3 className="section-title">Weekly Overview</h3>
            <WeeklySummary personId={selectedId} />
          </section>
        </div>
      </main>

      <style>{`
        .dash-page {
          max-width: 900px;
          margin: 0 auto;
          padding: 6rem 1.5rem 3rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        /* Selector */
        .dash-selector { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
        .selector-label { font-size: 0.8rem; color: #718096; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        .selector-pills { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .selector-pill {
          background: #1a1f2e;
          border: 1px solid rgba(255,255,255,0.08);
          color: #a0aec0;
          padding: 0.35rem 0.85rem;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }
        .selector-pill.active, .selector-pill:hover {
          background: rgba(72,187,120,0.12);
          border-color: rgba(72,187,120,0.3);
          color: #48bb78;
        }
        /* Hero */
        .dash-hero {
          background: #1a1f2e;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .dash-avatar {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: rgba(72,187,120,0.15);
          color: #48bb78;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          font-weight: 800;
          flex-shrink: 0;
        }
        .dash-name { font-size: 1.2rem; font-weight: 700; color: #f7fafc; margin: 0 0 0.2rem; }
        .dash-role { font-size: 0.8rem; color: #718096; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; }
        .dash-status {
          margin-left: auto;
          font-size: 0.8rem;
          font-weight: 700;
          padding: 0.35rem 0.85rem;
          border-radius: 999px;
        }
        .dash-status.clocked_in  { background: rgba(72,187,120,0.15); color: #48bb78; }
        .dash-status.clocked_out { background: rgba(255,255,255,0.06); color: #718096; }
        /* Sections */
        .dash-section { display: flex; flex-direction: column; gap: 0.75rem; }
        .section-title { font-size: 0.8rem; font-weight: 700; color: #718096; text-transform: uppercase; letter-spacing: 0.06em; margin: 0; }
        .dash-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        @media (max-width: 600px) { .dash-grid { grid-template-columns: 1fr; } }
      `}</style>
    </>
  );
}

