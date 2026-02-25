"use client";

import { useState } from 'react';
import type { Shift } from '@/type';
import Navbar from '@/components/Navbar';
import './schedule.css';

const Schedule = () => {
  // Generate shifts for the next 7 days
const generateShifts = () => {
  const shifts: Shift[] = [];
  const today = new Date();
  let shiftId = 1;

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateString = date.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // Morning shift
    shifts.push({
      shift_ID: shiftId++,
      date: dateString,
      start_time: '9:00 AM',
      end_time: '5:00 PM',
      person_ID: undefined,
    });

    // Evening shift
    shifts.push({
      shift_ID: shiftId++,
      date: dateString,
      start_time: '5:00 PM',
      end_time: '11:00 PM',
      person_ID: undefined,
    });
  }

  return shifts;
};

const [shifts, setShifts] = useState<Shift[]>(generateShifts());

  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  const people = [
    { id: 1, name: 'Person 1' },
    { id: 2, name: 'Person 2' },
    { id: 3, name: 'Person 3' },
    { id: 4, name: 'Person 4' },
  ];

  const handleAssignment = (shiftId: number, personId: number | undefined) => {
    setShifts(shifts.map(shift => 
      shift.shift_ID === shiftId 
        ? { ...shift, person_ID: personId }
        : shift
    ));
    setOpenDropdown(null);
  };

  const toggleDropdown = (shiftId: number) => {
    setOpenDropdown(openDropdown === shiftId ? null : shiftId);
  };

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
                  {shift.person_ID ? `Assigned to: Person ${shift.person_ID}` : 'Unassigned'}
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