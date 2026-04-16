import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar({ user, setUser }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="navbar-logo">
          <Shield size={20} />
        </div>
        <div className="navbar-title">
          Shram<span>Suraksha</span>
        </div>
      </Link>

      <div className="navbar-links">
        {user ? (
          <>
            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>Dashboard</Link>
            <Link to="/plans" className={`nav-link ${isActive('/plans')}`}>Plans</Link>
            <Link to="/claims" className={`nav-link ${isActive('/claims')}`}>Claims</Link>
            <Link to="/alerts" className={`nav-link ${isActive('/alerts')}`}>Alerts</Link>
            <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 8px' }} />
            <div className="nav-user" onClick={handleLogout} style={{ cursor: 'pointer' }}>
              <div className="nav-avatar">{user.name?.[0] || 'U'}</div>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{user.name?.split(' ')[0]}</span>
            </div>
          </>
        ) : (
          <>
            <a href="#features" className={`nav-link`} onClick={(e) => {
              if (location.pathname !== '/') { e.preventDefault(); navigate('/#features'); }
            }}>Features</a>
            <a href="#how-it-works" className={`nav-link`} onClick={(e) => {
              if (location.pathname !== '/') { e.preventDefault(); navigate('/#how-it-works'); }
            }}>How It Works</a>
            <Link to="/auth" className="nav-btn nav-btn-primary">Get Protected →</Link>
          </>
        )}
      </div>

      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{
          display: 'none',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 8,
          color: 'var(--text-primary)'
        }}
        className="mobile-menu-btn"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div style={{
          position: 'absolute',
          top: 72,
          left: 0,
          right: 0,
          background: 'white',
          borderBottom: '1px solid var(--border)',
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          boxShadow: 'var(--shadow-lg)',
          animation: 'fadeDown 0.2s ease-out'
        }}>
          {user ? (
            <>
              <Link to="/dashboard" className="nav-link" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              <Link to="/plans" className="nav-link" onClick={() => setMobileOpen(false)}>Plans</Link>
              <Link to="/claims" className="nav-link" onClick={() => setMobileOpen(false)}>Claims</Link>
              <Link to="/alerts" className="nav-link" onClick={() => setMobileOpen(false)}>Alerts</Link>
              <button className="btn btn-danger btn-sm" onClick={handleLogout} style={{ marginTop: 8 }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/" className="nav-link" onClick={() => setMobileOpen(false)}>Home</Link>
              <Link to="/auth" className="btn btn-primary btn-sm" onClick={() => setMobileOpen(false)}>Get Protected</Link>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .navbar-links { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
