"use client";

import { useState } from 'react';
import Link from 'next/link';
import './Navbar.css';

interface NavbarProps {
  pageTitle?: string;
}

const Navbar: React.FC<NavbarProps> = ({ pageTitle = 'Nexus Management' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        <button className="hamburger" onClick={toggleMenu}>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        <h1 className="navbar-title">{pageTitle}</h1>
      </div>

      {isOpen && (
        <div className="dropdown-menu">
          <Link href="/" className="menu-item">Home</Link>
          <Link href="/schedule" className="menu-item">Schedule</Link>
          <Link href="/employees" className="menu-item">Employees</Link>
          <Link href="/settings" className="menu-item">Settings</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;