import React, { useState, useEffect, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import CustomSelect from './CustomSelect';

import {
  Search, MapPin, Droplets, Phone, User, Activity,
  Send, X, CheckCircle, Clock, XCircle, Hospital, ClipboardList
} from 'lucide-react';

const AREAS = [
  "Ameerpet", "Banjara Hills", "Jubilee Hills", "Madhapur",
  "Gachibowli", "Kukatpally", "Secunderabad", "Kondapur",
  "Begumpet", "Hitec City", "Uppal", "Dilshuknagar",
  "Miyapur", "LB Nagar", "Manikonda"
];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  icon: Clock,        color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.25)' },
  accepted: { label: 'Accepted', icon: CheckCircle,  color: '#16a34a', bg: 'rgba(22,163,74,0.08)',   border: 'rgba(22,163,74,0.25)'  },
  rejected: { label: 'Rejected', icon: XCircle,      color: '#dc2626', bg: 'rgba(220,38,38,0.08)',   border: 'rgba(220,38,38,0.25)'  },
};

function RecipientPanel() {
  const { token } = useContext(AuthContext);

  const [tab, setTab] = useState('search'); // 'search' | 'requests'
  const [searchParams, setSearchParams] = useState({ area: '', bloodGroup: '' });
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Request form state
  const [requestModal, setRequestModal] = useState(null); // donor object or null
  const [requestForm, setRequestForm] = useState({ hospitalName: '', patientName: '' });
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestMsg, setRequestMsg] = useState(null);

  // My requests
  const [myRequests, setMyRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  /* ---------- Search ---------- */
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

  /* ---------- My Requests ---------- */
  const fetchMyRequests = async () => {
    setRequestsLoading(true);
    try {
      const res = await API.get('/api/requests/my-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyRequests(res.data);
    } catch (err) {
      console.error('Error fetching requests:', err);
    }
    setRequestsLoading(false);
  };

  useEffect(() => {
    if (tab === 'requests') fetchMyRequests();
  }, [tab]);

  /* ---------- Send Request ---------- */
  const openRequestModal = (donor) => {
    setRequestModal(donor);
    setRequestForm({ hospitalName: '', patientName: '' });
    setRequestMsg(null);
  };

  const closeRequestModal = () => {
    setRequestModal(null);
    setRequestMsg(null);
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    setRequestLoading(true);
    setRequestMsg(null);
    try {
      await API.post('/api/requests', {
        donorId: requestModal._id,
        hospitalName: requestForm.hospitalName,
        patientName: requestForm.patientName
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequestMsg({ type: 'success', text: 'Request sent successfully! The donor has been notified.' });
      setTimeout(() => {
        closeRequestModal();
        setTab('requests');
        fetchMyRequests();
      }, 1800);
    } catch (err) {
      setRequestMsg({ type: 'error', text: err.response?.data?.message || 'Failed to send request.' });
    }
    setRequestLoading(false);
  };

  /* =========================================================
     RENDER
  ========================================================= */
  return (
    <div className="animate-fade-in py-4" style={{ minHeight: '80vh' }}>

      {/* ---- Tab Switcher ---- */}
      <div className="flex justify-center" style={{ marginBottom: '1.75rem' }}>
        <div style={{
          display: 'inline-flex', background: 'rgba(255,255,255,0.7)',
          borderRadius: '999px', padding: '4px', gap: '4px',
          border: '1px solid rgba(0,0,0,0.08)', backdropFilter: 'blur(8px)'
        }}>
          {[
            { key: 'search',   label: 'Find Donors',   icon: Search },
            { key: 'requests', label: 'My Requests',   icon: ClipboardList },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              id={`tab-${key}`}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '999px',
                fontSize: '0.88rem',
                fontWeight: 600,
                border: 'none',
                background: tab === key
                  ? 'linear-gradient(135deg, var(--primary), var(--primary-dark))'
                  : 'transparent',
                color: tab === key ? 'white' : 'var(--text-muted)',
                boxShadow: tab === key ? 'var(--shadow-primary)' : 'none',
                transition: 'all 0.25s ease',
                display: 'flex', alignItems: 'center', gap: '0.4rem'
              }}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* ========== SEARCH TAB ========== */}
      {tab === 'search' && (
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

          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', textAlign: 'center', fontWeight: 800 }}>
            Find a Blood Donor
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.75rem', fontSize: '0.95rem' }}>
            Every second counts. Search our verified network instantly.
          </p>

          {/* Search Bar */}
          <div className="glass w-full mb-6" style={{
            maxWidth: '450px', padding: '1.5rem',
            display: 'flex', flexDirection: 'column', gap: '1.25rem',
            borderTop: '3px solid var(--accent)'
          }}>
            <div style={{ width: '100%' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                <MapPin size={14} color="var(--accent)" /> Location
              </label>
              <CustomSelect
                value={searchParams.area}
                options={AREAS}
                placeholder="Any Area"
                onChange={(e) => setSearchParams(prev => ({ ...prev, area: e.target.value }))}
              />
            </div>
 
            <div style={{ width: '100%' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.6rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.75rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                <Droplets size={14} color="var(--primary)" /> Blood Group
              </label>
              <CustomSelect
                value={searchParams.bloodGroup}
                options={BLOOD_GROUPS}
                placeholder="Any Group"
                onChange={(e) => setSearchParams(prev => ({ ...prev, bloodGroup: e.target.value }))}
              />
            </div>
 
            <button onClick={handleSearch} disabled={loading} className="btn-primary flex items-center gap-2" style={{ height: '48px', padding: '0 1.5rem', justifyContent: 'center', fontSize: '1rem', width: '100%', borderRadius: '12px' }}>
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
                  background: 'rgba(22,163,74,0.03)', padding: '0.6rem 1rem', borderRadius: '8px',
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  border: '1px solid rgba(22,163,74,0.08)', marginBottom: '0.75rem'
                }}>
                  <div className="flex items-center gap-2" style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                    <Phone size={14} color="var(--accent)" />
                    <a href={`tel:${donor.phoneNumber}`} style={{ color: 'var(--accent-dark)' }}>{donor.phoneNumber}</a>
                  </div>
                </div>

                {/* Request Button */}
                <button
                  id={`request-btn-${donor._id}`}
                  onClick={() => openRequestModal(donor)}
                  className="btn-primary flex items-center gap-2"
                  style={{ width: '100%', justifyContent: 'center', padding: '0.6rem 1rem', fontSize: '0.85rem', borderRadius: '10px' }}
                >
                  <Send size={14} /> Send Blood Request
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========== MY REQUESTS TAB ========== */}
      {tab === 'requests' && (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '0.2rem' }}>My Blood Requests</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Track the status of your requests</p>
            </div>
            <button
              onClick={fetchMyRequests}
              style={{ background: 'none', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', padding: '0.4rem 0.9rem', borderRadius: '8px', fontSize: '0.8rem' }}
            >
              ↻ Refresh
            </button>
          </div>

          {requestsLoading && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading requests...</div>
          )}

          {!requestsLoading && myRequests.length === 0 && (
            <div className="glass flex flex-col items-center" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
              <div style={{ background: 'rgba(0,0,0,0.04)', padding: '1rem', borderRadius: '50%', marginBottom: '1rem' }}>
                <ClipboardList size={32} color="var(--text-muted)" />
              </div>
              <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>No Requests Yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Search for donors and send a blood request.</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {myRequests.map((req, i) => {
              const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
              const StatusIcon = cfg.icon;
              return (
                <div
                  key={req._id}
                  className="glass animate-fade-in"
                  style={{ padding: '1.25rem 1.5rem', animationDelay: `${i * 0.06}s`, borderLeft: `3px solid ${cfg.color}` }}
                >
                  <div className="flex justify-between items-start" style={{ marginBottom: '0.75rem' }}>
                    <div>
                      <div className="flex items-center gap-2" style={{ marginBottom: '0.3rem' }}>
                        <User size={15} color="var(--primary)" />
                        <span style={{ fontWeight: 700, fontSize: '1rem' }}>{req.donorId?.name || 'Unknown Donor'}</span>
                        <span style={{
                          background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                          color: 'white', padding: '0.1rem 0.4rem', borderRadius: '5px',
                          fontWeight: 700, fontSize: '0.75rem'
                        }}>{req.bloodGroup}</span>
                      </div>
                      <div className="flex items-center gap-1" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        <MapPin size={11} /> {req.donorId?.area}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.35rem',
                      padding: '0.3rem 0.75rem', borderRadius: '999px',
                      background: cfg.bg, border: `1px solid ${cfg.border}`,
                      color: cfg.color, fontWeight: 700, fontSize: '0.8rem'
                    }}>
                      <StatusIcon size={13} />
                      {cfg.label}
                    </div>
                  </div>

                  {/* Request details */}
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <div style={{ background: 'rgba(0,0,0,0.03)', padding: '0.5rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Hospital</span>
                      <span style={{ fontWeight: 600 }}>{req.hospitalName}</span>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.03)', padding: '0.5rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Patient</span>
                      <span style={{ fontWeight: 600 }}>{req.patientName}</span>
                    </div>
                    <div style={{ background: 'rgba(0,0,0,0.03)', padding: '0.5rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem' }}>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Requested</span>
                      <span style={{ fontWeight: 600 }}>{new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Accepted: show donor phone prominently */}
                  {req.status === 'accepted' && req.donorId?.phoneNumber && (
                    <div style={{
                      marginTop: '0.85rem', background: 'rgba(22,163,74,0.06)',
                      border: '1px solid rgba(22,163,74,0.2)', borderRadius: '10px',
                      padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}>
                      <CheckCircle size={16} color="var(--accent)" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-dark)' }}>
                        Donor accepted! Call:&nbsp;
                        <a href={`tel:${req.donorId.phoneNumber}`} style={{ color: 'var(--accent-dark)', textDecoration: 'underline' }}>
                          {req.donorId.phoneNumber}
                        </a>
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========== REQUEST MODAL ========== */}
      {requestModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div
            className="glass animate-fade-in"
            style={{ width: '100%', maxWidth: '460px', padding: '2rem', borderTop: '4px solid var(--primary)', position: 'relative' }}
          >
            {/* Close */}
            <button
              id="close-request-modal"
              onClick={closeRequestModal}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', padding: '0.25rem' }}
            >
              <X size={20} />
            </button>

            {/* Donor Info Header */}
            <div className="flex items-center gap-3" style={{ marginBottom: '1.4rem' }}>
              <div style={{ background: 'rgba(220,38,38,0.07)', padding: '0.75rem', borderRadius: '12px' }}>
                <Droplets size={22} color="var(--primary)" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Request Blood from</h3>
                <div className="flex items-center gap-2">
                  <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.05rem' }}>{requestModal.name}</span>
                  <span style={{
                    background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                    color: 'white', padding: '0.1rem 0.4rem', borderRadius: '5px',
                    fontWeight: 700, fontSize: '0.75rem'
                  }}>{requestModal.bloodGroup}</span>
                </div>
              </div>
            </div>

            {requestMsg && (
              <div style={{
                padding: '0.7rem 1rem', borderRadius: '10px', marginBottom: '1rem',
                background: requestMsg.type === 'success' ? 'rgba(22,163,74,0.07)' : 'rgba(220,38,38,0.07)',
                border: `1px solid ${requestMsg.type === 'success' ? 'rgba(22,163,74,0.2)' : 'rgba(220,38,38,0.2)'}`,
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                color: requestMsg.type === 'success' ? 'var(--accent-dark)' : 'var(--primary)',
                fontWeight: 500, fontSize: '0.88rem'
              }}>
                {requestMsg.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                {requestMsg.text}
              </div>
            )}

            <form onSubmit={handleSendRequest} className="flex flex-col gap-3">
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  <Hospital size={13} color="var(--accent)" /> Hospital Name
                </label>
                <input
                  id="hospital-name-input"
                  type="text"
                  required
                  placeholder="e.g. Apollo Hospital, Hyderabad"
                  value={requestForm.hospitalName}
                  onChange={e => setRequestForm(p => ({ ...p, hospitalName: e.target.value }))}
                  style={{ padding: '0.75rem 1rem', marginBottom: 0 }}
                />
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  <User size={13} color="var(--accent)" /> Patient Name
                </label>
                <input
                  id="patient-name-input"
                  type="text"
                  required
                  placeholder="Patient's full name"
                  value={requestForm.patientName}
                  onChange={e => setRequestForm(p => ({ ...p, patientName: e.target.value }))}
                  style={{ padding: '0.75rem 1rem', marginBottom: 0 }}
                />
              </div>

              <button
                id="submit-request-btn"
                type="submit"
                disabled={requestLoading}
                className="btn-primary flex items-center gap-2"
                style={{ justifyContent: 'center', padding: '0.85rem', marginTop: '0.25rem', opacity: requestLoading ? 0.7 : 1 }}
              >
                <Send size={15} />
                {requestLoading ? 'Sending...' : 'Send Request to Donor'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecipientPanel;
