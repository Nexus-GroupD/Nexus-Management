"use client";

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import './schedule.css';

interface ShiftFromAPI {
  shiftId: number;
  date: string;
  startTime: string;
  endTime: string;
  personId: number | null;
  employee?: { id: number; name: string } | null;
}

interface ShiftDisplay {
  shift_ID: number;
  date: string;
  start_time: string;
  end_time: string;
  person_ID?: number;
  employee_name?: string;
}

const Schedule = () => {
  const [shifts, setShifts] = useState<ShiftDisplay[]>([]);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [people, setPeople] = useState<{ id: number; name: string }[]>([
    { id: 1, name: 'Alex Rivera' },
    { id: 2, name: 'Jordan Lee' },
    { id: 3, name: 'Sam Patel' },
    { id: 4, name: 'Casey Morgan' },
  ]);

  // Generate default shifts for next 7 days and save to DB
  const seedShifts = async () => {
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];

      await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateString, startTime: '9:00 AM', endTime: '5:00 PM' }),
      });
      await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateString, startTime: '5:00 PM', endTime: '11:00 PM' }),
      });
    }
  };

  // Fetch shifts from API
  const fetchShifts = async () => {
    try {
      const res = await fetch('/api/shifts');
      const json = await res.json();
      if (json.success && json.data) {
        const mapped: ShiftDisplay[] = json.data.map((s: ShiftFromAPI) => ({
          shift_ID: s.shiftId,
          date: s.date,
          start_time: s.startTime,
          end_time: s.endTime,
          person_ID: s.personId ?? undefined,
          employee_name: s.employee?.name,
        }));
        return mapped;
      }
    } catch (err) {
      console.error('Failed to fetch shifts:', err);
    }
    return [];
  };

  useEffect(() => {
    const loadShifts = async () => {
      let data = await fetchShifts();
      if (data.length === 0) {
        await seedShifts();
        data = await fetchShifts();
      }
      setShifts(data);
      setLoading(false);
    };
    loadShifts();
  }, []);

  const handleAssignment = async (shiftId: number, personId: number | undefined) => {
    try {
      const res = await fetch('/api/shifts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shiftId, personId: personId ?? null }),
      });
      const json = await res.json();
      if (json.success) {
        const assignedPerson = people.find(p => p.id === personId);
        setShifts(shifts.map(shift =>
          shift.shift_ID === shiftId
            ? { ...shift, person_ID: personId, employee_name: assignedPerson?.name }
            : shift
        ));
      }
    } catch (err) {
      console.error('Failed to update shift:', err);
    }
    setOpenDropdown(null);
  };

  const toggleDropdown = (shiftId: number) => {
    setOpenDropdown(openDropdown === shiftId ? null : shiftId);
  };

  if (loading) {
    return (
      <>
        <Navbar pageTitle="Schedule" />
        <div className="schedule-page">
          <p>Loading shifts...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar pageTitle="Schedule" />
      <div className="schedule-page">
        <div className="schedule-header">
          <p className="subtitle">Employee Shift Management</p>
        </div>

        <div className="shifts-container">
          {shifts.map((shift) => (
            <div key={shift.shift_ID} className={`shift-card ${openDropdown === shift.shift_ID ? 'dropdown-open' : ''}`}>
              <div className="shift-date">{shift.date}</div>
              <div className="shift-time">
                {shift.start_time} - {shift.end_time}
              </div>

              <div className="assignment-container">
                <button
                  className={`shift-assignment ${!shift.person_ID ? 'unassigned' : ''}`}
                  onClick={() => toggleDropdown(shift.shift_ID)}
                >
                  {shift.person_ID
                    ? `Assigned to: ${shift.employee_name || 'Person ' + shift.person_ID}`
                    : 'Unassigned'}
                  <span className="dropdown-arrow">▼</span>
                </button>

                {openDropdown === shift.shift_ID && (
                  <div className="assignment-dropdown">
                    {people.map(person => (
                      <div
                        key={person.id}
                        className="dropdown-item"
                        onClick={() => handleAssignment(shift.shift_ID, person.id)}
                      >
                        {person.name}
                      </div>
                    ))}
                    <div
                      className="dropdown-item unassign"
                      onClick={() => handleAssignment(shift.shift_ID, undefined)}
                    >
                      Unassign
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Schedule;