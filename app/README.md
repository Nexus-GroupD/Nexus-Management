# Nexus Management - Frontend

Next.js + TypeScript frontend for the Nexus employee scheduling system.

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm

### macOS Installation

1. **Clone the repository**
```bash
git clone https://github.com/Nexus-GroupD/Nexus-Management.git
cd Nexus-Management
```

2. **Install dependencies**
```bash
npm install
```

3. **Run development server**
```bash
npm run dev
```

4. **Open in browser**
Navigate to [http://localhost:3000](http://localhost:3000)

### Windows Installation

1. **Clone the repository**
```cmd
git clone https://github.com/Nexus-GroupD/Nexus-Management.git
cd Nexus-Management
```

2. **Install dependencies**
```cmd
npm install
```

3. **Run development server**
```cmd
npm run dev
```

4. **Open in browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## Recent Changes

### Migration to Next.js
- Migrated from React + Vite to Next.js for better routing and server-side capabilities
- Implemented file-based routing structure (`app/` directory)
- Added `"use client"` directives for interactive components

### Schedule Page Features
- **Auto-generated shifts**: Dynamically creates shifts for the next 7 days based on current date
- **Dropdown assignment system**: Click any shift to assign Person 1-4 or unassign
- **Visual status indicators**: Green buttons for assigned shifts, red for unassigned
- **Responsive card layout**: Grid-based design that adapts to screen size

### Navigation System
- **Hamburger menu**: Fixed navbar with collapsible menu in top-left
- **Page titles**: Dynamic titles displayed next to hamburger icon
- **Client-side routing**: Instant navigation between pages using Next.js Link

## Tech Stack

- **Framework:** Next.js 15
- **Language:** TypeScript
- **UI Library:** React 18
- **Styling:** CSS (component-scoped)
- **Routing:** Next.js App Router (file-based)

## Project Structure
```
Nexus-Management/
├── app/
│   ├── schedule/
│   │   ├── page.tsx           # Schedule page component
│   │   └── schedule.css       # Schedule styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page
├── components/
│   ├── Navbar.tsx             # Navigation component
│   └── Navbar.css             # Navbar styles
├── type/
│   └── index.ts               # TypeScript interfaces
└── package.json               # Dependencies
```

## Current Features

### Home Page
- Welcome landing page
- Navigation via hamburger menu

### Schedule Page (`/schedule`)
- **Auto-generated shifts** for next 7 days (2 shifts per day: 9 AM-5 PM, 5 PM-11 PM)
- **Employee assignment** via dropdown menu (Person 1-4)
- **Visual indicators**: Green = assigned, Red = unassigned
- **Interactive cards** with hover effects

### Navigation
- **Hamburger menu** with links to Home, Schedule, Employees, Settings
- **Fixed navbar** stays at top while scrolling
- **Page-specific titles** displayed in navbar


-Nexus Team