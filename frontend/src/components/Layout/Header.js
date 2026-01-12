import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

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
          <nav className="nav">
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>
            {(user?.role === 'admin' || user?.role === 'manager') && (
              <>
                <Link to="/projects/new" className="nav-link">
                  Create Project
                </Link>
                <Link to="/tasks/new" className="nav-link">
                  Create Task
                </Link>
              </>
            )}
            {user?.role === 'admin' && (
              <Link to="/users" className="nav-link">
                Users
              </Link>
            )}
            <div className="user-menu">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">({user?.role})</span>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;

