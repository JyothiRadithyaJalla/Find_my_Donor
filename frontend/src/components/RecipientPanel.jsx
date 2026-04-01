import React, { useState, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';

import { Search, MapPin, Droplets, Phone, User, Activity } from 'lucide-react';

const AREAS = [
  "Ameerpet", "Banjara Hills", "Jubilee Hills", "Madhapur",
  "Gachibowli", "Kukatpally", "Secunderabad", "Kondapur",
  "Begumpet", "Hitec City", "Uppal", "Dilshuknagar",
  "Miyapur", "LB Nagar", "Manikonda"
];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function RecipientPanel() {
  const { token } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useState({ area: '', bloodGroup: '' });
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setHasSearched(true);
    try {
      const response = await API.get('/api/donors/search', {
        params: searchParams,
        headers: { Authorization: `Bearer ${token}` }
      });
      setDonors(response.data);
    } catch (error) {
      console.error('Error searching donors:', error);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="animate-fade-in py-4" style={{ minHeight: '80vh' }}>
      <div className="flex flex-col items-center">

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.3rem 0.8rem', borderRadius: '999px', marginBottom: '1rem',
          background: 'rgba(220, 38, 38, 0.07)', border: '1px solid rgba(220, 38, 38, 0.18)',
          color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600
        }}>
          <Activity size={12} /> Emergency Search
        </div>

        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', textAlign: 'center', fontWeight: 800 }}>Find a Blood Donor</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem', fontSize: '0.95rem' }}>Every second counts. Search our verified network instantly.</p>

        {/* Search Bar */}
        <div className="glass w-full mb-6" style={{
          maxWidth: '750px', padding: '1.25rem 1.5rem',
          display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap',
          borderTop: '3px solid var(--accent)'
        }}>
          <div style={{ flex: '1 1 180px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              <MapPin size={14} color="var(--accent)" /> Location
            </label>
            <select name="area" value={searchParams.area} onChange={handleChange} style={{ marginBottom: 0, padding: '0.7rem 1rem' }}>
              <option value="">Any Area</option>
              {AREAS.map(area => <option key={area} value={area}>{area}</option>)}
            </select>
          </div>

          <div style={{ flex: '1 1 180px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              <Droplets size={14} color="var(--primary)" /> Blood Group
            </label>
            <select name="bloodGroup" value={searchParams.bloodGroup} onChange={handleChange} style={{ marginBottom: 0, padding: '0.7rem 1rem' }}>
              <option value="">Any Group</option>
              {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>

          <button onClick={handleSearch} disabled={loading} className="btn-primary flex items-center gap-2" style={{ height: '42px', padding: '0 1.5rem', whiteSpace: 'nowrap', fontSize: '0.9rem' }}>
            <Search size={16} /> {loading ? '...' : 'Search'}
          </button>
        </div>

        {/* Results Count */}
        {hasSearched && !loading && donors.length > 0 && (
          <div style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>
            Found <span style={{ color: 'var(--accent-dark)', fontWeight: 700 }}>{donors.length}</span> donor{donors.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* Empty State */}
        {hasSearched && !loading && donors.length === 0 && (
          <div className="glass flex flex-col items-center" style={{ padding: '2.5rem 2rem', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
            <div style={{ background: 'rgba(0,0,0,0.04)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
              <Activity size={32} color="var(--text-muted)" />
            </div>
            <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.4rem', fontSize: '1.1rem' }}>No Donors Found</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '280px', fontSize: '0.85rem' }}>Try broadening your search.</p>
          </div>
        )}

        {/* Donor Cards */}
        <div className="grid gap-4 w-full" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', maxWidth: '1100px' }}>
          {donors.map((donor, i) => (
            <div
              key={donor._id}
              className="glass animate-fade-in"
              style={{ padding: '1.25rem', animationDelay: `${i * 0.08}s`, borderLeft: '3px solid var(--accent)', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div style={{ background: 'rgba(220,38,38,0.07)', padding: '0.6rem', borderRadius: '10px' }}>
                    <User size={18} color="var(--primary)" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.05rem' }}>{donor.name}</h3>
                    <div className="flex items-center gap-1" style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.1rem' }}>
                      <MapPin size={11} /> {donor.area}
                    </div>
                  </div>
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                  color: 'white', padding: '0.2rem 0.6rem', borderRadius: '8px',
                  fontWeight: 700, fontSize: '0.85rem'
                }}>
                  {donor.bloodGroup}
                </div>
              </div>

              <div style={{
                background: 'rgba(22,163,74,0.03)', padding: '0.75rem 1rem', borderRadius: '8px',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                border: '1px solid rgba(22,163,74,0.08)', marginTop: '1rem'
              }}>
                <div className="flex items-center gap-2" style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  <Phone size={14} color="var(--accent)" />
                  <a href={`tel:${donor.phoneNumber}`} style={{ color: 'var(--accent-dark)' }}>{donor.phoneNumber}</a>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default RecipientPanel;
