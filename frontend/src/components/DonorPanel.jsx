import React, { useState, useEffect, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';

import {
  UserPlus, Droplets, MapPin, Phone, CheckCircle, User,
  Bell, ClipboardList, XCircle, Clock, Hospital
} from 'lucide-react';

const AREA_COORDS = {
  "Ameerpet": [78.4485, 17.4375],
  "Banjara Hills": [78.4447, 17.4150],
  "Jubilee Hills": [78.4111, 17.4299],
  "Madhapur": [78.3831, 17.4483],
  "Gachibowli": [78.3489, 17.4401],
  "Kukatpally": [78.3996, 17.4834],
  "Secunderabad": [78.4983, 17.4399],
  "Kondapur": [78.3615, 17.4623],
  "Begumpet": [78.4619, 17.4448],
  "Hitec City": [78.3758, 17.4435],
  "Uppal": [78.5581, 17.3984],
  "Dilshuknagar": [78.5247, 17.3685],
  "Miyapur": [78.3512, 17.4948],
  "LB Nagar": [78.5485, 17.3457],
  "Manikonda": [78.3820, 17.3995]
};
const AREAS = Object.keys(AREA_COORDS);
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  icon: Clock,        color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.25)' },
  accepted: { label: 'Accepted', icon: CheckCircle,  color: '#16a34a', bg: 'rgba(22,163,74,0.08)',   border: 'rgba(22,163,74,0.25)'  },
  rejected: { label: 'Rejected', icon: XCircle,      color: '#dc2626', bg: 'rgba(220,38,38,0.08)',   border: 'rgba(220,38,38,0.25)'  },
};

function DonorPanel() {
  const { token } = useContext(AuthContext);

  const [tab, setTab] = useState('donors'); // 'donors' | 'requests'

  // ---- Donors ----
  const [donors, setDonors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', bloodGroup: '', area: '', phoneNumber: '', isAvailable: true
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // ---- Incoming Requests ----
  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [respondMsg, setRespondMsg] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);

  /* ---------- Fetch my donors ---------- */
  const fetchMyDonors = async () => {
    try {
      const res = await API.get('/api/donors/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDonors(res.data);
    } catch (err) {
      console.error('Error fetching donors:', err);
    }
  };

  /* ---------- Fetch incoming requests ---------- */
  const fetchRequests = async () => {
    setRequestsLoading(true);
    try {
      const res = await API.get('/api/requests/donor-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data);
      setPendingCount(res.data.filter(r => r.status === 'pending').length);
    } catch (err) {
      console.error('Error fetching requests:', err);
    }
    setRequestsLoading(false);
  };

  useEffect(() => {
    fetchMyDonors();
    fetchRequests(); // also fetch on mount to show badge count
  }, []);

  useEffect(() => {
    if (tab === 'requests') fetchRequests();
  }, [tab]);

  /* ---------- Respond to request ---------- */
  const handleRespond = async (requestId, status) => {
    setRespondMsg(null);
    try {
      await API.put(`/api/requests/${requestId}/respond`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRespondMsg({
        id: requestId,
        type: status === 'accepted' ? 'success' : 'info',
        text: status === 'accepted'
          ? '✅ You accepted the request! The recipient has been informed.'
          : '❌ Request declined.'
      });
      fetchRequests();
    } catch (err) {
      setRespondMsg({ id: requestId, type: 'error', text: err.response?.data?.message || 'Failed to respond.' });
    }
  };

  /* ---------- Add donor form ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Get coordinates for the selected area
    const coords = AREA_COORDS[formData.area];
    const payload = {
      ...formData,
      location: {
        type: 'Point',
        coordinates: coords // [lng, lat]
      }
    };

    try {
      await API.post('/api/donors', payload, {
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
      await API.put(`/api/donors/${id}/status`, { isAvailable: !current }, {
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

  /* =========================================================
     RENDER
  ========================================================= */
  return (
    <div className="animate-fade-in py-4" style={{ maxWidth: '950px', margin: '0 auto' }}>

      {/* ---- Tab Switcher ---- */}
      <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
        <div style={{
          display: 'inline-flex', background: 'rgba(255,255,255,0.7)',
          borderRadius: '999px', padding: '4px', gap: '4px',
          border: '1px solid rgba(0,0,0,0.08)', backdropFilter: 'blur(8px)'
        }}>
          {[
            { key: 'donors',   label: 'My Donors',       icon: UserPlus },
            { key: 'requests', label: 'Blood Requests',  icon: Bell, badge: pendingCount },
          ].map(({ key, label, icon: Icon, badge }) => (
            <button
              key={key}
              id={`donor-tab-${key}`}
              onClick={() => setTab(key)}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '999px',
                fontSize: '0.88rem',
                fontWeight: 600,
                border: 'none',
                background: tab === key
                  ? 'linear-gradient(135deg, var(--accent), var(--accent-dark))'
                  : 'transparent',
                color: tab === key ? 'white' : 'var(--text-muted)',
                boxShadow: tab === key ? 'var(--shadow-accent)' : 'none',
                transition: 'all 0.25s ease',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                position: 'relative'
              }}
            >
              <Icon size={14} /> {label}
              {badge > 0 && (
                <span style={{
                  background: 'var(--primary)', color: 'white',
                  borderRadius: '999px', fontSize: '0.65rem', fontWeight: 800,
                  padding: '0.05rem 0.4rem', marginLeft: '0.15rem',
                  minWidth: '18px', textAlign: 'center', lineHeight: '1.4'
                }}>{badge}</span>
              )}
            </button>
          ))}
        </div>

        {tab === 'donors' && (
          <button
            className="btn-accent flex items-center gap-2"
            onClick={() => { setShowForm(!showForm); setMessage(null); }}
            style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
          >
            <UserPlus size={16} /> {showForm ? 'Cancel' : 'Add Donor'}
          </button>
        )}
      </div>

      {/* ========== DONORS TAB ========== */}
      {tab === 'donors' && (
        <>
          <div style={{ marginBottom: '0.3rem', marginTop: '1rem' }}>
            <h2 style={{ marginBottom: '0.5rem', fontSize: '2rem', fontWeight: 900 }}>Donor Dashboard</h2>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>Manage your registered blood donors and save lives in your community.</p>
          </div>

          {message && (
            <div style={{
              padding: '0.75rem 1rem', borderRadius: '10px', margin: '1rem 0',
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
        </>
      )}

      {/* ========== REQUESTS TAB ========== */}
      {tab === 'requests' && (
        <div>
          <div className="flex justify-between items-center" style={{ marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '0.2rem' }}>Incoming Blood Requests</h2>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.85rem' }}>
                Recipients who need your help — accept or decline each request
              </p>
            </div>
            <button
              onClick={fetchRequests}
              style={{ background: 'none', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', padding: '0.4rem 0.9rem', borderRadius: '8px', fontSize: '0.8rem' }}
            >
              ↻ Refresh
            </button>
          </div>

          {requestsLoading && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading requests...</div>
          )}

          {!requestsLoading && requests.length === 0 && (
            <div className="glass flex flex-col items-center" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
              <div style={{ background: 'rgba(0,0,0,0.04)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
                <Bell size={32} color="var(--text-muted)" />
              </div>
              <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>No Requests Yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>When a recipient sends you a blood request, it will appear here.</p>
            </div>
          )}

          <div className="flex flex-col gap-4">
            {requests.map((req, i) => {
              const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
              const StatusIcon = cfg.icon;
              const isPending = req.status === 'pending';

              return (
                <div
                  key={req._id}
                  className="glass animate-fade-in"
                  style={{ padding: '1.4rem 1.6rem', animationDelay: `${i * 0.06}s`, borderLeft: `4px solid ${cfg.color}` }}
                >
                  {/* Header row */}
                  <div className="flex justify-between items-start" style={{ marginBottom: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                        Blood Request
                      </div>
                      <div className="flex items-center gap-2">
                        <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>from {req.recipientName}</span>
                        <span style={{
                          background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                          color: 'white', padding: '0.1rem 0.45rem', borderRadius: '5px',
                          fontWeight: 700, fontSize: '0.75rem'
                        }}>{req.bloodGroup}</span>
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.15rem' }}>
                        <Phone size={11} style={{ display: 'inline', marginRight: '4px' }} />
                        {req.recipientPhone}
                      </div>
                    </div>

                    {/* Status badge */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.35rem',
                      padding: '0.3rem 0.8rem', borderRadius: '999px',
                      background: cfg.bg, border: `1px solid ${cfg.border}`,
                      color: cfg.color, fontWeight: 700, fontSize: '0.8rem'
                    }}>
                      <StatusIcon size={13} />
                      {cfg.label}
                    </div>
                  </div>

                  {/* Request details */}
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                    <div style={{ background: 'rgba(0,0,0,0.03)', padding: '0.5rem 0.95rem', borderRadius: '8px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Hospital size={14} color="var(--accent)" />
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Hospital</div>
                        <div style={{ fontWeight: 700 }}>{req.hospitalName}</div>
                      </div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.03)', padding: '0.5rem 0.95rem', borderRadius: '8px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <User size={14} color="var(--accent)" />
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Patient</div>
                        <div style={{ fontWeight: 700 }}>{req.patientName}</div>
                      </div>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.03)', padding: '0.5rem 0.95rem', borderRadius: '8px', fontSize: '0.82rem' }}>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Requested on</div>
                      <div style={{ fontWeight: 700 }}>{new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                  </div>

                  {/* Inline feedback after responding */}
                  {respondMsg && respondMsg.id === req._id && (
                    <div style={{
                      padding: '0.65rem 1rem', borderRadius: '10px', marginBottom: '0.85rem',
                      background: respondMsg.type === 'success' ? 'rgba(22,163,74,0.07)' : 'rgba(220,38,38,0.07)',
                      border: `1px solid ${respondMsg.type === 'success' ? 'rgba(22,163,74,0.2)' : 'rgba(220,38,38,0.2)'}`,
                      color: respondMsg.type === 'success' ? 'var(--accent-dark)' : 'var(--primary)',
                      fontWeight: 600, fontSize: '0.88rem'
                    }}>
                      {respondMsg.text}
                    </div>
                  )}

                  {/* Action buttons */}
                  {(isPending || req.status === 'accepted') && (
                    <div className="flex gap-3">
                      {isPending && (
                        <button
                          id={`accept-btn-${req._id}`}
                          onClick={() => handleRespond(req._id, 'accepted')}
                          className="btn-accent flex items-center gap-2"
                          style={{ flex: 1, justifyContent: 'center', padding: '0.65rem', fontSize: '0.88rem', borderRadius: '10px' }}
                        >
                          <CheckCircle size={15} /> Accept
                        </button>
                      )}
                      <button
                        id={`reject-btn-${req._id}`}
                        onClick={() => handleRespond(req._id, 'rejected')}
                        style={{
                          flex: 1, justifyContent: 'center', padding: '0.65rem',
                          fontSize: '0.88rem', borderRadius: '10px',
                          background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.2)',
                          color: 'var(--primary)', fontWeight: 600,
                          display: 'flex', alignItems: 'center', gap: '0.4rem'
                        }}
                      >
                        <XCircle size={15} /> {req.status === 'accepted' ? 'Cancel / Decline' : 'Decline'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default DonorPanel;
