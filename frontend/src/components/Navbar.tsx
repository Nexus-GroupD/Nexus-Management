import { useState } from 'react';
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
          <a href="/" className="menu-item">Home</a>
          <a href="/schedule" className="menu-item">Schedule</a>
          <a href="/employees" className="menu-item">Employees</a>
          <a href="/settings" className="menu-item">Settings</a>
        </div>
      )}
    </nav>
  );
};

export default Navbar;