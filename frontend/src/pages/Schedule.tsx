import type { Shift } from '../types/Shift';
import './Schedule.css';

const Schedule: React.FC = () => {
  const shifts: Shift[] = [
    { shift_ID: 1, date: '2025-02-20', start_time: '9:00 AM', end_time: '5:00 PM', person_ID: 1 },
    { shift_ID: 2, date: '2025-02-20', start_time: '5:00 PM', end_time: '11:00 PM', person_ID: 2 },
    { shift_ID: 3, date: '2025-02-21', start_time: '9:00 AM', end_time: '5:00 PM' },
  ];

  return (
    <div className="schedule-page">
      <div className="schedule-header">
        <h1>Schedule</h1>
        <p className="subtitle">Employee Shift Management</p>
      </div>
      
      <div className="shifts-container">
        {shifts.map((shift) => (
          <div key={shift.shift_ID} className="shift-card">
            <div className="shift-date">{shift.date}</div>
            <div className="shift-time">
              {shift.start_time} - {shift.end_time}
            </div>
            <div className={`shift-assignment ${!shift.person_ID ? 'unassigned' : ''}`}>
              {shift.person_ID ? `Assigned to: Person ${shift.person_ID}` : 'Unassigned'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schedule;