import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, HeartPulse } from 'lucide-react';
import { Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center animate-fade-in" style={{ minHeight: '80vh' }}>
      <div className="glass" style={{ width: '100%', maxWidth: '420px', padding: '3rem' }}>
        
        <div className="flex flex-col items-center" style={{ marginBottom: '2rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            padding: '0.75rem', borderRadius: '14px', marginBottom: '1.25rem'
          }}>
            <HeartPulse color="white" size={28} />
          </div>
          <h2 style={{ textAlign: 'center', marginBottom: '0.25rem' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sign in to continue</p>
        </div>

        {error && (
          <div style={{
            color: 'var(--primary)', marginBottom: '1.25rem', textAlign: 'center',
            background: 'rgba(220,38,38,0.06)', padding: '0.75rem', borderRadius: '10px',
            border: '1px solid rgba(220,38,38,0.15)', fontSize: '0.9rem'
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div style={{ position: 'relative' }}>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" style={{ paddingLeft: '3rem', width: '100%' }} />
            <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '1rem' }} />
          </div>

          <div style={{ position: 'relative' }}>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" style={{ paddingLeft: '3rem', width: '100%' }} />
            <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '1rem' }} />
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '1rem', width: '100%', fontSize: '1rem', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>Create one</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
