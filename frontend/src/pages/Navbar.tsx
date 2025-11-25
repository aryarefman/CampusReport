// src/pages/Navbar.tsx
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import {
  FileText,
  LogOut,
  Moon,
  Sun,
  User,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Load theme from localStorage
  useEffect(() => {
    const saved = (localStorage.getItem('theme') as 'light' | 'dark') || 'dark';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Hide navbar on unauthenticated pages (login/register)
  if (!isAuthenticated) return null;

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* BRAND */}
        <Link to="/dashboard" className="nav-brand">
          <FileText size={28} />
          <span style={{ marginLeft: 8 }}>CampusReport</span>
        </Link>

        {/* LINKS */}
        <div className="nav-links">
          <Link
            to="/home"
            className={`nav-link ${location.pathname === '/home' ? 'active' : ''}`}
          >
            Home
          </Link>
          <Link
            to="/report"
            className={`nav-link ${location.pathname === '/report' ? 'active' : ''}`}
          >
            Report
          </Link>
          <Link
            to="/my-reports"
            className={`nav-link ${location.pathname === '/my-reports' ? 'active' : ''}`}
          >
            My Reports
          </Link>
          {user?.role === 'admin' && (
            <>
              <Link
                to="/admin"
                className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
              >
                Manage
              </Link>
              <Link
                to="/admin/chat"
                className={`nav-link ${location.pathname === '/admin/chat' ? 'active' : ''}`}
              >
                Chat
              </Link>
            </>
          )}
        </div>

        {/* USER ACTIONS */}
        <div className="nav-user">
          <div className="user-info">
            <User size={20} />
            <span style={{ marginLeft: 6 }}>{user?.username || 'User'}</span>
          </div>
          <button onClick={toggleTheme} className="btn-theme-toggle">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={handleLogout} className="btn-logout">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
}
