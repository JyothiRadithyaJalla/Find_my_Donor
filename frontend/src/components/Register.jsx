import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, Phone, HeartPulse } from 'lucide-react';
import { Link } from 'react-router-dom';

function Register() {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'recipient', phoneNumber: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { register } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(formData);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="flex justify-center items-center animate-fade-in" style={{ minHeight: '80vh' }}>
      <div className="glass" style={{ width: '100%', maxWidth: '480px', padding: '3rem' }}>
        
        <div className="flex flex-col items-center" style={{ marginBottom: '2rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
            padding: '0.75rem', borderRadius: '14px', marginBottom: '1.25rem'
          }}>
            <HeartPulse color="white" size={28} />
          </div>
          <h2 style={{ textAlign: 'center', marginBottom: '0.25rem' }}>Create Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Join our lifesaving network</p>
        </div>

        {error && (
          <div style={{
            color: 'var(--primary)', marginBottom: '1.25rem', textAlign: 'center',
            background: 'rgba(220,38,38,0.06)', padding: '0.75rem', borderRadius: '10px',
            border: '1px solid rgba(220,38,38,0.15)', fontSize: '0.9rem'
          }}>{error}</div>
        )}

        {/* Role Toggle */}
        <div className="flex justify-center gap-3 mb-6" style={{ background: 'rgba(0,0,0,0.03)', padding: '0.35rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'recipient' })}
            style={{
              flex: 1, padding: '0.7rem', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 600,
              background: formData.role === 'recipient' ? 'linear-gradient(135deg, var(--accent), var(--accent-dark))' : 'transparent',
              color: formData.role === 'recipient' ? 'white' : 'var(--text-muted)',
              boxShadow: formData.role === 'recipient' ? 'var(--shadow-accent)' : 'none'
            }}
          >
            🔍 Recipient
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, role: 'donor' })}
            style={{
              flex: 1, padding: '0.7rem', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 600,
              background: formData.role === 'donor' ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))' : 'transparent',
              color: formData.role === 'donor' ? 'white' : 'var(--text-muted)',
              boxShadow: formData.role === 'donor' ? 'var(--shadow-primary)' : 'none'
            }}
          >
            💉 Blood Donor
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div style={{ position: 'relative' }}>
            <input name="name" required value={formData.name} onChange={handleChange} placeholder="Full Name" style={{ paddingLeft: '3rem' }} />
            <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '1rem' }} />
          </div>

          <div style={{ position: 'relative' }}>
            <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="Email address" style={{ paddingLeft: '3rem' }} />
            <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '1rem' }} />
          </div>

          <div style={{ position: 'relative' }}>
            <input type="password" name="password" required value={formData.password} onChange={handleChange} placeholder="Password" style={{ paddingLeft: '3rem' }} />
            <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '1rem' }} />
          </div>

          <div style={{ position: 'relative' }}>
            <input type="tel" name="phoneNumber" required value={formData.phoneNumber} onChange={handleChange} placeholder="Phone Number" style={{ paddingLeft: '3rem' }} />
            <Phone size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '1rem' }} />
          </div>

          <button type="submit" disabled={loading} className={formData.role === 'donor' ? 'btn-primary' : 'btn-accent'} style={{ padding: '1rem', width: '100%', fontSize: '1rem', marginTop: '0.5rem', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Creating account...' : `Register as ${formData.role === 'donor' ? 'Donor' : 'Recipient'}`}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
