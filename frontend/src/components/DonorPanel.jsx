import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005';
import { UserPlus, Droplets, MapPin, Phone, CheckCircle, User } from 'lucide-react';

const AREAS = [
  "Ameerpet", "Banjara Hills", "Jubilee Hills", "Madhapur",
  "Gachibowli", "Kukatpally", "Secunderabad", "Kondapur",
  "Begumpet", "Hitec City", "Uppal", "Dilshuknagar",
  "Miyapur", "LB Nagar", "Manikonda"
];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function DonorPanel() {
  const { token } = useContext(AuthContext);
  const [donors, setDonors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', bloodGroup: '', area: '', phoneNumber: '', isAvailable: true
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchMyDonors = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/donors/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDonors(res.data);
    } catch (err) {
      console.error('Error fetching donors:', err);
    }
  };

  useEffect(() => { fetchMyDonors(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await axios.post(`${API_BASE_URL}/api/donors`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'Donor added successfully!' });
      setFormData({ name: '', bloodGroup: '', area: '', phoneNumber: '', isAvailable: true });
      setShowForm(false);
      fetchMyDonors();
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to add donor.' });
    }
    setLoading(false);
  };

  const toggleAvailability = async (id, current) => {
    try {
      await axios.put(`${API_BASE_URL}/api/donors/${id}/status`, { isAvailable: !current }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMyDonors();
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  return (
    <div className="animate-fade-in py-4" style={{ maxWidth: '950px', margin: '0 auto' }}>
      
      <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ marginBottom: '0.2rem', fontSize: '1.5rem' }}>Donor Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.85rem' }}>Manage your registered blood donors</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => { setShowForm(!showForm); setMessage(null); }} style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}>
          <UserPlus size={16} /> {showForm ? 'Cancel' : 'Add Donor'}
        </button>
      </div>

      {message && (
        <div style={{
          padding: '0.75rem 1rem', borderRadius: '10px', marginBottom: '1.25rem',
          background: message.type === 'success' ? 'rgba(22,163,74,0.06)' : 'rgba(220,38,38,0.06)',
          border: `1px solid ${message.type === 'success' ? 'rgba(22,163,74,0.2)' : 'rgba(220,38,38,0.2)'}`
        }} className="flex items-center gap-2">
          {message.type === 'success' && <CheckCircle size={18} color="var(--accent)" />}
          <span style={{ color: message.type === 'success' ? 'var(--accent-dark)' : 'var(--primary)', fontWeight: 500, fontSize: '0.88rem' }}>{message.text}</span>
        </div>
      )}

      {showForm && (
        <div className="glass" style={{ padding: '1.75rem', marginBottom: '1.5rem', borderTop: '3px solid var(--accent)' }}>
          <h3 style={{ marginBottom: '1.25rem', fontSize: '1.05rem' }}>Add a New Donor</h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                <User size={13} color="var(--accent)" /> Donor's Full Name
              </label>
              <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="Enter full name" style={{ padding: '0.7rem 1rem' }} />
            </div>

            <div className="flex gap-3">
              <div style={{ flex: 1 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  <Droplets size={13} color="var(--primary)" /> Blood Group
                </label>
                <select name="bloodGroup" required value={formData.bloodGroup} onChange={handleChange} style={{ padding: '0.7rem 1rem' }}>
                  <option value="" disabled>Select Group</option>
                  {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  <MapPin size={13} color="var(--accent)" /> Area
                </label>
                <select name="area" required value={formData.area} onChange={handleChange} style={{ padding: '0.7rem 1rem' }}>
                  <option value="" disabled>Select Area</option>
                  {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                <Phone size={13} color="var(--accent)" /> Phone Number
              </label>
              <input type="tel" name="phoneNumber" required value={formData.phoneNumber} onChange={handleChange} placeholder="e.g. 9876543210" style={{ padding: '0.7rem 1rem' }} />
            </div>

            <div className="flex items-center gap-3" style={{ marginTop: '0.1rem' }}>
              <input type="checkbox" name="isAvailable" checked={formData.isAvailable} onChange={handleChange} id="avail" style={{ width: '16px', height: '16px', marginBottom: 0, accentColor: 'var(--accent)' }} />
              <label htmlFor="avail" style={{ cursor: 'pointer', fontSize: '0.88rem' }}>Currently available to donate</label>
            </div>

            <button type="submit" disabled={loading} className="btn-accent" style={{ padding: '0.85rem', opacity: loading ? 0.7 : 1, marginTop: '0.25rem', fontSize: '0.9rem' }}>
              {loading ? 'Adding...' : 'Add Donor'}
            </button>
          </form>
        </div>
      )}

      {donors.length === 0 && !showForm && (
        <div className="glass flex flex-col items-center" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <div style={{ background: 'rgba(22,163,74,0.06)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
            <UserPlus size={32} color="var(--text-muted)" />
          </div>
          <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.4rem', fontSize: '1.1rem' }}>No Donors Registered Yet</h3>
          <p style={{ color: 'var(--text-muted)', maxWidth: '320px', fontSize: '0.85rem' }}>Click "Add Donor" to register your first blood donor to the network.</p>
        </div>
      )}

      <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {donors.map((donor, i) => (
          <div key={donor._id} className="glass animate-fade-in" style={{ padding: '1.25rem', animationDelay: `${i * 0.08}s`, borderLeft: `3px solid ${donor.isAvailable ? 'var(--accent)' : 'var(--primary)'}` }}>
            <div className="flex justify-between items-start" style={{ marginBottom: '0.75rem' }}>
              <div className="flex items-center gap-2">
                <div style={{ background: 'rgba(220,38,38,0.06)', padding: '0.5rem', borderRadius: '10px' }}>
                  <User size={18} color="var(--primary)" />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem' }}>{donor.name}</h3>
                  <span className="flex items-center gap-1" style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.1rem' }}>
                    <MapPin size={11} /> {donor.area}
                  </span>
                </div>
              </div>
              <span style={{
                background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                color: 'white', padding: '0.15rem 0.5rem', borderRadius: '6px',
                fontWeight: 700, fontSize: '0.8rem'
              }}>
                {donor.bloodGroup}
              </span>
            </div>

            <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '0.75rem' }}>
              <Phone size={13} /> {donor.phoneNumber}
            </div>

            <div className="flex justify-between items-center" style={{ background: 'rgba(0,0,0,0.02)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
              <span style={{ color: donor.isAvailable ? 'var(--accent-dark)' : 'var(--primary)', fontWeight: 600, fontSize: '0.78rem' }}>
                {donor.isAvailable ? '● Available' : '● Unavailable'}
              </span>
              <button
                onClick={() => toggleAvailability(donor._id, donor.isAvailable)}
                style={{
                  background: 'none', border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)', padding: '0.25rem 0.6rem',
                  borderRadius: '6px', fontSize: '0.72rem', fontWeight: 500
                }}
              >
                {donor.isAvailable ? 'Off' : 'On'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DonorPanel;
