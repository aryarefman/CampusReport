import { useState, useCallback, useEffect } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import './Register.css';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const { register } = useAuth();
  const navigate = useNavigate();

  // Load theme from localStorage
  useEffect(() => {
    const saved = (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError('');

      // Validasi
      if (!username.trim()) {
        setError('Username is required');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Please enter a valid email address');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      setLoading(true);

      try {
        await register(username, email, password);
        alert('Registration successful! Please login.');
        navigate('/login');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Registration failed');
      } finally {
        setLoading(false);
      }
    },
    [username, email, password, confirmPassword, register, navigate]
  );

  return (
    <div className="auth-container">
      <img src="/kiri-login.png" alt="" className="login-side-image left" />
      <img src="/kanan-login.png" alt="" className="login-side-image right" />

      {/* Cloud Images */}
      <img src="/cloud.png" alt="" className="cloud-image cloud-1" />
      <img src="/cloud.png" alt="" className="cloud-image cloud-2" />
      <img src="/cloud.png" alt="" className="cloud-image cloud-3" />
      <img src="/cloud.png" alt="" className="cloud-image cloud-4" />
      <img src="/cloud.png" alt="" className="cloud-image cloud-5" />
      <img src="/cloud.png" alt="" className="cloud-image cloud-6" />
      <img src="/cloud.png" alt="" className="cloud-image cloud-7" />
      <img src="/cloud.png" alt="" className="cloud-image cloud-8" />
      <img src="/cloud.png" className="cloud-image cloud-9" />
      <img src="/cloud.png" className="cloud-image cloud-10" />
      <img src="/cloud.png" className="cloud-image cloud-11" />
      <img src="/cloud.png" className="cloud-image cloud-12" />
      <img src="/cloud.png" className="cloud-image cloud-13" />
      <img src="/cloud.png" className="cloud-image cloud-14" />
      <img src="/cloud.png" className="cloud-image cloud-15" />
      <img src="/cloud.png" className="cloud-image cloud-16" />

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className="theme-toggle-btn"
        style={{
          position: 'absolute',
          top: '70px',
          left: '20px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          zIndex: 2
        }}
      >
        <img
          src={theme === 'light' ? "/sun.png" : "/moon.png"}
          alt="Toggle Theme"
          style={{ width: '200px', height: '200px' }}
        />
      </button>

      {/* Balloon/Airplane Images - Changes based on theme */}
      <img
        src={theme === 'light' ? "/peswat udara.png" : "/balon udara.png"}
        alt=""
        className="balloon-image balloon-left"
      />

      <div className="auth-card">
        <h1>Register</h1>
        <p className="auth-subtitle">Create a new account to get started.</p>

        {error && <div className="error-message" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="reg-username">Username</label>
            <input
              id="reg-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="johndoe"
              required
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              required
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-confirm">Confirm Password</label>
            <input
              id="reg-confirm"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Retype password"
              required
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
}