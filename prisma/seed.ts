/**
 * prisma/seed.ts
 * Seeds the database with sample employees and shifts.
 * Run: npx ts-node prisma/seed.ts  (or add to package.json scripts)
 */

import getDb from '../lib/db';
import { nextNDates } from '../lib/time';

const EMPLOYEES = [
  { name: 'Alex Rivera',   role: 'manager',  email: 'alex@nexus.io' },
  { name: 'Jordan Lee',    role: 'employee', email: 'jordan@nexus.io' },
  { name: 'Sam Patel',     role: 'employee', email: 'sam@nexus.io' },
  { name: 'Casey Morgan',  role: 'employee', email: 'casey@nexus.io' },
];

const SHIFT_TEMPLATES = [
  { start_time: '9:00 AM',  end_time: '5:00 PM'  },
  { start_time: '5:00 PM',  end_time: '11:00 PM' },
];

function seed() {
  const db = getDb();
  if (!db) {
    console.error('Cannot connect to database. Exiting.');
    process.exit(1);
  }

  // Insert employees (skip if already exist)
  const insertEmployee = db.prepare(
    `INSERT OR IGNORE INTO employees (name, role, email) VALUES (?, ?, ?)`
  );

  console.log('Seeding employees...');
  for (const emp of EMPLOYEES) {
    insertEmployee.run(emp.name, emp.role, emp.email);
  }

  // Insert shifts for next 7 days
  const insertShift = db.prepare(
    `INSERT INTO shifts (date, start_time, end_time) VALUES (?, ?, ?)`
  );

  const seedShifts = db.transaction(() => {
    for (const date of nextNDates(7)) {
      for (const template of SHIFT_TEMPLATES) {
        insertShift.run(date, template.start_time, template.end_time);
      }
    }
  });

  console.log('Seeding shifts...');
  seedShifts();

  console.log('Seed complete.');
}

seed();

