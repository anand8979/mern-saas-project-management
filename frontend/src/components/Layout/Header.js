import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/dashboard" className="logo">
            Project Management
          </Link>

          {/* Hamburger visible only on mobile */}
          <button
            className="mobile-nav-toggle"
            aria-label={mobileNavOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen((s) => !s)}
          >
            <span className={`hamburger ${mobileNavOpen ? 'open' : ''}`} />
          </button>

          <nav className={`nav ${mobileNavOpen ? 'open' : ''}`}>
            <Link to="/dashboard" className="nav-link" onClick={() => setMobileNavOpen(false)}>
              Dashboard
            </Link>
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <>
                <Link to="/projects/new" className="nav-link" onClick={() => setMobileNavOpen(false)}>
                  Create Project
                </Link>
                <Link to="/tasks/new" className="nav-link" onClick={() => setMobileNavOpen(false)}>
                  Create Task
                </Link>
              </>
            )}
            {user?.role === 'admin' && (
              <Link to="/users" className="nav-link" onClick={() => setMobileNavOpen(false)}>
                Users
              </Link>
            )}
            <div className="user-menu">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">({user?.role})</span>
              <button onClick={() => { setMobileNavOpen(false); handleLogout(); }} className="btn-logout">
                Logout
              </button>
            </div>
          </nav>

          {/* backdrop to close mobile nav when open (mobile only) */}
          {mobileNavOpen && <div className="nav-backdrop" onClick={() => setMobileNavOpen(false)} />}
        </div>
      </div>
    </header>
  );
};

export default Header;

