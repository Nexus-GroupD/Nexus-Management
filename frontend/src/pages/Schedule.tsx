import { useState } from 'react';
import type { Shift } from '../types/Shift';
import './Schedule.css';

const Schedule: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([
    { shift_ID: 1, date: '2025-02-20', start_time: '9:00 AM', end_time: '5:00 PM', person_ID: 1 },
    { shift_ID: 2, date: '2025-02-20', start_time: '5:00 PM', end_time: '11:00 PM', person_ID: 2 },
    { shift_ID: 3, date: '2025-02-21', start_time: '9:00 AM', end_time: '5:00 PM' },
  ]);

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
    <div className="schedule-page">
      <div className="schedule-header">
        <p className="subtitle">Employee Shift Management</p>
      </div>
      
      <div className="shifts-container">
        {shifts.map((shift) => (
          <div key={shift.shift_ID} className="shift-card">
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
  );
};

export default Schedule;