import React from 'react';
import type { Shift } from '../types/Shift';

const Schedule: React.FC = () => {
  // Placeholder data for testing
  const shifts: Shift[] = [
    { shift_ID: 1, date: '2025-02-20', start_time: '9:00 AM', end_time: '5:00 PM', person_ID: 1 },
    { shift_ID: 2, date: '2025-02-20', start_time: '5:00 PM', end_time: '11:00 PM', person_ID: 2 },
    { shift_ID: 3, date: '2025-02-21', start_time: '9:00 AM', end_time: '5:00 PM' },
  ];

  return (
    <div className="schedule-container">
      <h1>Schedule</h1>
      <div className="shift-list">
        <ul>
          {shifts.map((shift) => (
            <li key={shift.shift_ID}>
              <strong>{shift.date}</strong> | {shift.start_time} - {shift.end_time} | 
              {shift.person_ID ? ` Person ID: ${shift.person_ID}` : ' Unassigned'}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Schedule;