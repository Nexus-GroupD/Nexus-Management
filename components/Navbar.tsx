"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './Navbar.css';

interface NavbarProps {
  pageTitle?: string;
}

const NAV_LINKS = [
  { href: '/',          label: 'Home',      icon: '⌂' },
  { href: '/schedule',  label: 'Schedule',  icon: '📅' },
  { href: '/dashboard', label: 'Dashboard', icon: '◈' },
  { href: '/history',   label: 'History',   icon: '⏱' },
];

const Navbar: React.FC<NavbarProps> = ({ pageTitle = 'Nexus Management' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-content" ref={menuRef}>
        <button
          className={`hamburger ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(prev => !prev)}
          aria-expanded={isOpen}
          aria-label="Toggle navigation menu"
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>

        <h1 className="navbar-title">
          <span className="navbar-logo">N</span>
          {pageTitle}
        </h1>

        {isOpen && (
          <div className="dropdown-menu" role="menu">
            {NAV_LINKS.map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className={`menu-item ${pathname === href ? 'active' : ''}`}
                role="menuitem"
              >
                <span className="menu-icon">{icon}</span>
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
