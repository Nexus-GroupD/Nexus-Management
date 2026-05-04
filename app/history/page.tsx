"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import HistoryTable from '@/components/historyTable';

interface Employee {
  id: number;
  name: string;
}

export default function History() {
  const [selectedId, setSelectedId] = useState<number>(0);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  useEffect(() => {
    fetch('/api/people')
      .then(r => r.json())
      .then((data: Employee[]) => {
        if (Array.isArray(data)) {
          setEmployees(data);
        }
      })
      .catch(() => {
        // If people can't be loaded, the filter will just show "All Employees"
        console.error('Failed to load employee list.');
      })
      .finally(() => setLoadingEmployees(false));
  }, []);

  // Validate that selectedId is 0 (all) or a real employee ID from the fetched list
  const handleSelect = (value: string) => {
    const parsed = parseInt(value, 10);
    if (!Number.isFinite(parsed) || parsed < 0) return;
    if (parsed !== 0 && !employees.some(e => e.id === parsed)) return;
    setSelectedId(parsed);
  };

  return (
    <>
      <Navbar pageTitle="History" />
      <main className="hist-page">
        <div className="hist-header">
          <h2 className="hist-title">Clock History</h2>
          <p className="hist-sub">Review past time entries for your team.</p>
        </div>

        <div className="hist-filter">
          <label className="filter-label">Filter by employee:</label>
          <select
            className="filter-select"
            value={selectedId}
            onChange={e => handleSelect(e.target.value)}
            disabled={loadingEmployees}
          >
            <option value={0}>All Employees</option>
            {employees.map(e => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>
        </div>

        <div className="hist-table-card">
          <HistoryTable
            personId={selectedId === 0 ? undefined : selectedId}
            limit={50}
            employeeNames={Object.fromEntries(employees.map(e => [e.id, e.name]))}
          />
        </div>
      </main>

      <style>{`
        .hist-page {
          max-width: 900px;
          margin: 0 auto;
          padding: 6rem 1.5rem 3rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .hist-header { margin-bottom: 0.5rem; }
        .hist-title { font-size: 1.75rem; font-weight: 800; color: #f7fafc; margin: 0 0 0.4rem; letter-spacing: -0.02em; }
        .hist-sub { color: #718096; margin: 0; font-size: 0.95rem; }
        .hist-filter { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
        .filter-label { font-size: 0.8rem; color: #718096; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
        .filter-select {
          background: #1a1f2e;
          border: 1px solid rgba(255,255,255,0.1);
          color: #e2e8f0;
          padding: 0.45rem 0.85rem;
          border-radius: 8px;
          font-size: 0.875rem;
          cursor: pointer;
          outline: none;
          transition: border-color 0.15s;
        }
        .filter-select:focus { border-color: #48bb78; }
        .filter-select:disabled { opacity: 0.5; cursor: not-allowed; }
        .hist-table-card {
          background: #1a1f2e;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 1rem 0;
          overflow: hidden;
        }
      `}</style>
    </>
  );
}
