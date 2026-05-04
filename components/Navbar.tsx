"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './Navbar.css';

interface NavbarProps {
  pageTitle?: string;
}

type Me = { id: number; name: string; email: string; dbRole: string; role: string } | null;

const NAV_LINKS = [
  { href: '/',           label: 'Home',      icon: '⌂',  adminOnly: false },
  { href: '/schedule',   label: 'Schedule',  icon: '📅', adminOnly: false },
  { href: '/dashboard',  label: 'Dashboard', icon: '◈',  adminOnly: false },
  { href: '/history',    label: 'History',   icon: '⏱', adminOnly: false },
  { href: '/messages',   label: 'Messages',  icon: '✉',  adminOnly: false },
  { href: '/add-person', label: 'People',    icon: '👥', adminOnly: false },
  { href: '/announcements', label: 'Announcements', icon: '📢', adminOnly: false },
  { href: '/roles',      label: 'Roles',     icon: '🏷',  adminOnly: true  },
];

const Navbar: React.FC<NavbarProps> = ({ pageTitle = 'Nexus Management' }) => {
  const [isOpen, setIsOpen]           = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [me, setMe]                   = useState<Me>(null);
  const menuRef    = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const pathname   = usePathname();

  useEffect(() => {
    // Load from cache immediately to prevent flash
    const cached = sessionStorage.getItem('nexus-me');
    if (cached) { try { setMe(JSON.parse(cached)); } catch { /* ignore */ } }

    fetch('/api/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        setMe(d);
        if (d) sessionStorage.setItem('nexus-me', JSON.stringify(d));
        else sessionStorage.removeItem('nexus-me');
      })
      .catch(() => setMe(null));
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { setIsOpen(false); setProfileOpen(false); }, [pathname]);

  const initial = me?.name?.charAt(0).toUpperCase() ?? '?';

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-content" ref={menuRef}>
        <button
          className={`hamburger ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen((p) => !p)}
          aria-expanded={isOpen}
          aria-label="Toggle navigation menu"
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>

        <h1 className="navbar-title">{pageTitle}</h1>

        {isOpen && (
          <div className="dropdown-menu" role="menu">
            {NAV_LINKS.filter(({ adminOnly }) => !adminOnly || me?.role === 'admin').map(({ href, label, icon }) => (
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

      {/* Profile */}
      {me && (
        <div className="navbar-profile" ref={profileRef}>
          <button
            className="profile-avatar"
            onClick={() => setProfileOpen((p) => !p)}
            aria-label="Profile menu"
          >
            {initial}
          </button>

          {profileOpen && (
            <div className="profile-dropdown">
              <div className="profile-header">
                <div className="profile-avatar-lg">{initial}</div>
                <div style={{ minWidth: 0 }}>
                  <div className="profile-name">{me.name}</div>
                  {me.email && <div className="profile-email">{me.email}</div>}
                  <span className="profile-role-tag">{me.dbRole}</span>
                </div>
              </div>
              <div className="profile-divider" />
              <Link href="/settings" className="profile-menu-item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06-.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
                Settings
              </Link>
              <form method="POST" action="/api/logout" style={{ display: 'contents' }}>
                <button type="submit" className="profile-menu-item profile-logout">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  Log Out
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
