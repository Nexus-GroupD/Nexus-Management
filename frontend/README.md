# Nexus Management - Frontend

A React + TypeScript web application for managing employee schedules and shifts.

## Tech Stack

- **Frontend Framework:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite
- **Styling:** CSS

## Project Structure
```
frontend/
├── src/
│   ├── pages/
│   │   └── Schedule.tsx       # Main schedule page
│   ├── types/
│   │   └── Shift.ts           # TypeScript interfaces
│   ├── App.tsx                # Root component
│   └── main.tsx               # Entry point
└── package.json
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation

1. Clone the repository
```bash
git clone https://github.com/Nexus-GroupD/Nexus-Management.git
cd Nexus-Management/frontend
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

The app will be available at `http://localhost:5173/`

## Features

### Current Features
- **Schedule Page:** View employee shifts with dates, times, and assignments
- **TypeScript Types:** Strongly-typed Shift interface matching the database schema

### Planned Features
- Shift creation and editing
- Employee assignment
- Calendar view
- Backend API integration

## Database Schema

The frontend interfaces with a SQLite database containing:

**Shift Table:**
- `shift_ID` (INTEGER, Primary Key)
- `date` (TEXT)
- `start_time` (TEXT)
- `end_time` (TEXT)
- `person_ID` (INTEGER, Foreign Key → Person table)

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Team

Group D 