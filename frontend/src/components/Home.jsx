import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, UserPlus, Droplets, Shield, Clock, Users } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

function Home() {
  const { user } = useContext(AuthContext);

  const stats = [
    { icon: <Users size={20} />, label: 'Active Donors', value: '500+' },
    { icon: <Droplets size={20} />, label: 'Blood Groups', value: '8 Types' },
    { icon: <Clock size={20} />, label: 'Response Time', value: '<5 Min' },
    { icon: <Shield size={20} />, label: 'Verified Areas', value: '10+' },
  ];

  return (
    <div className="flex flex-col items-center justify-center animate-fade-in" style={{ paddingTop: '0.5rem', paddingBottom: '2.5rem' }}>
      
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.3rem 0.8rem', borderRadius: '999px', marginBottom: '1rem',
        background: 'rgba(22, 163, 74, 0.08)', border: '1px solid rgba(22, 163, 74, 0.2)',
        color: 'var(--accent-dark)', fontSize: '0.8rem', fontWeight: 600
      }}>
        <Droplets size={12} /> Blood Donation Network — Hyderabad
      </div>

      <h1 style={{ textAlign: 'center', marginBottom: '1rem', lineHeight: 1.1 }}>
        Save Lives.<br />Find Donors Instantly.
      </h1>

      <p style={{
        fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '520px',
        marginBottom: '1.75rem', lineHeight: '1.6', textAlign: 'center'
      }}>
        Connect with verified blood donors in your neighborhood within minutes.
        Every drop counts — register or search now.
      </p>

      <div className="flex gap-4 justify-center w-full" style={{ maxWidth: '800px', flexWrap: 'wrap' }}>
        
        {(!user || user.role === 'donor') && (
          <div className="glass flex-col items-center flex" style={{
            padding: '2rem 1.5rem', flex: '1 1 300px', textAlign: 'center',
            borderTop: '3px solid var(--accent)'
          }}>
            <div style={{
              background: 'rgba(22,163,74,0.08)', padding: '1rem', borderRadius: '14px', marginBottom: '1.25rem'
            }}>
              <UserPlus size={32} color="var(--accent)" />
            </div>
            <h3 style={{ fontSize: '1.2rem' }}>{!user ? 'Become a Donor' : 'Your Dashboard'}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
              {!user ? 'Register yourself as a blood donor and save lives within your community.' : 'Access your dashboard & manage registered donors.'}
            </p>
            <Link to={user ? '/donor' : '/register'}>
              <button className="btn-accent" style={{ padding: '0.75rem 2rem', fontSize: '0.9rem' }}>
                {!user ? 'Register Now' : 'Go to Dashboard'}
              </button>
            </Link>
          </div>
        )}

        {(!user || user.role === 'recipient') && (
          <div className="glass flex-col items-center flex" style={{
            padding: '2rem 1.5rem', flex: '1 1 300px', textAlign: 'center',
            borderTop: '3px solid var(--primary)'
          }}>
            <div style={{
              background: 'rgba(220,38,38,0.06)', padding: '1rem', borderRadius: '14px', marginBottom: '1.25rem'
            }}>
              <HeartHandshake size={32} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '1.2rem' }}>Find a Donor</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Search for available blood donors by area and blood group in emergency situations.
            </p>
            <Link to={!user ? '/login' : '/recipient'}>
              <button className="btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '0.9rem' }}>
                Search Donors
              </button>
            </Link>
          </div>
        )}
      </div>

      {!user && (
        <div className="flex justify-center gap-4 w-full" style={{ maxWidth: '800px', marginTop: '3rem', flexWrap: 'wrap' }}>
          {stats.map((stat, i) => (
            <div key={i} className="animate-fade-in" style={{
              flex: '1 1 140px', textAlign: 'center', padding: '1.25rem 0.75rem',
              background: 'rgba(255,255,255,0.6)', borderRadius: 'var(--radius)',
              border: '1px solid var(--border-subtle)', animationDelay: `${0.3 + i * 0.1}s`
            }}>
              <div style={{ color: 'var(--accent)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                {stat.icon}
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.15rem', color: 'var(--text-main)' }}>{stat.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
