import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HeartPulse, LogOut } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

function Navbar() {
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar flex justify-between items-center">
      <div className="flex items-center gap-3">
        <div style={{
          background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
          padding: '0.45rem', borderRadius: '10px', display: 'flex'
        }}>
          <HeartPulse color="white" size={22} />
        </div>
        <Link to="/" className="nav-brand">FindMyDonor</Link>
      </div>
      <div className="nav-links flex items-center">
        <Link to="/" className={isActive('/')}>Home</Link>
        {!user && (
          <>
            <Link to="/login" className={isActive('/login')}>Login</Link>
            <Link to="/register" className={isActive('/register')}>Register</Link>
          </>
        )}
        {user && user.role === 'donor' && (
          <Link to="/donor" className={isActive('/donor')}>Dashboard</Link>
        )}
        {user && user.role === 'recipient' && (
          <Link to="/recipient" className={isActive('/recipient')}>Search</Link>
        )}
        {user && (
          <button onClick={logout} className="flex items-center gap-2" style={{
            marginLeft: '1.5rem', background: 'rgba(220, 38, 38, 0.08)',
            color: 'var(--primary)', border: '1px solid rgba(220, 38, 38, 0.2)',
            padding: '0.45rem 1rem', borderRadius: '10px', fontSize: '0.85rem'
          }}>
            <LogOut size={15} /> Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
