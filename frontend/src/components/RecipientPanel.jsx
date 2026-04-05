import React, { useState, useEffect, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import CustomSelect from './CustomSelect';

import {
  Search, MapPin, Droplets, Phone, User, Activity,
  Send, X, CheckCircle, Clock, XCircle, Hospital, ClipboardList, Map as MapIcon, RotateCcw
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Icons
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const donorIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Helper component to update map view
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

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

function RecipientPanel() {
  const { token } = useContext(AuthContext);

  const [tab, setTab] = useState('search'); // 'search' | 'requests'
  const [searchParams, setSearchParams] = useState({ area: '', bloodGroup: '' });
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Geographic search state
  const [userLocation, setUserLocation] = useState(null); // { lat, lng }
  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState([17.3850, 78.4867]); // Hyderabad default
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [searchMethod, setSearchMethod] = useState('manual'); // 'manual' | 'proximity'
  const [routeDestination, setRouteDestination] = useState(null); // Internal map route

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
    setSearchMethod('manual');
    setShowMap(false);
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

  const handleNearestSearch = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setSearchMethod('proximity');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const coords = [latitude, longitude];
        setUserLocation(coords);
        setMapCenter(coords);
        
        try {
          const response = await API.get('/api/donors/nearest', {
            params: { 
              lat: latitude, 
              lng: longitude, 
              bloodGroup: searchParams.bloodGroup,
              maxDistance: 50000 // 50km
            },
            headers: { Authorization: `Bearer ${token}` }
          });
          setDonors(response.data);
          setShowMap(true);
        } catch (error) {
          console.error('Error finding nearest donors:', error);
          alert("Error finding nearest donors. Please try again.");
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Failed to get your location. Please check browser permissions.");
        setLoading(false);
      },
      { enableHighAccuracy: true }
    );
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
          
          {/* Global Blood Request Modal */}
          {requestModal && (
            <div style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}>
              <div className="animate-scale-in glass" style={{
                width: '100%',
                maxWidth: '460px',
                background: 'white',
                padding: '2.5rem 2rem',
                borderTop: '6px solid var(--primary)',
                boxShadow: '0 40px 80px rgba(0,0,0,0.18)',
                borderRadius: '24px'
              }}>
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>Blood Request</h4>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Asking from {requestModal.name}</p>
                  </div>
                  <button 
                    id="close-request-overlay"
                    onClick={closeRequestModal} 
                    style={{ background: 'rgba(0,0,0,0.04)', border: 'none', color: 'var(--text-muted)', padding: '0.4rem', borderRadius: '50%' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {requestMsg ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
                    {requestMsg.type === 'success' ? (
                      <>
                        <div style={{ background: 'rgba(22,163,74,0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '0.5rem' }}>
                          <CheckCircle size={40} color="var(--accent)" />
                        </div>
                        <h4 style={{ color: 'var(--accent-dark)', margin: 0 }}>Success!</h4>
                        <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)', maxWidth: '280px' }}>{requestMsg.text}</p>
                      </>
                    ) : (
                      <>
                        <XCircle size={40} color="var(--primary)" />
                        <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary)' }}>{requestMsg.text}</p>
                        <button onClick={() => setRequestMsg(null)} className="btn-primary" style={{ padding: '0.6rem 1.2rem', borderRadius: '10px' }}>Try Again</button>
                      </>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleSendRequest} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-4">
                      <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.65rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                          <Hospital size={14} color="var(--accent)" /> Hospital Name
                        </label>
                        <input
                          required
                          placeholder="e.g. Apollo Hospital, Hyderabad"
                          value={requestForm.hospitalName}
                          onChange={e => setRequestForm(p => ({ ...p, hospitalName: e.target.value }))}
                          style={{ padding: '0.85rem 1rem', fontSize: '0.95rem', marginBottom: 0 }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', fontWeight: 700, color: 'var(--text-secondary)', fontSize: '0.65rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                          <User size={14} color="var(--accent)" /> Patient Name
                        </label>
                        <input
                          required
                          placeholder="Patient's full name"
                          value={requestForm.patientName}
                          onChange={e => setRequestForm(p => ({ ...p, patientName: e.target.value }))}
                          style={{ padding: '0.85rem 1rem', fontSize: '0.95rem', marginBottom: 0 }}
                        />
                      </div>
                    </div>
                    <button
                      id="submit-request-overlay"
                      type="submit"
                      disabled={requestLoading}
                      className="btn-primary flex items-center justify-center gap-2"
                      style={{ padding: '1rem', fontSize: '1rem', borderRadius: '12px', marginTop: '0.5rem' }}
                    >
                      <Send size={18} /> {requestLoading ? 'Sending...' : 'Confirm Request'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Hero Section Container */}
          <div className="hero-flex-container flex items-center justify-center w-full" style={{ 
            maxWidth: '1200px', 
            marginBottom: '1.5rem',
            marginTop: '2.5rem', // Clears tabs with space
            padding: '0 1rem',
            gap: '80px' 
          }}>
            {/* Left: Illustration */}
            <div className="flex-1 hide-mobile" style={{ display: 'flex', justifyContent: 'center', maxWidth: '400px' }}>
              <img 
                src="/recipient_hero.png" 
                alt="Find Donor Illustration" 
                style={{ width: '100%', filter: 'drop-shadow(0 25px 45px rgba(0,0,0,0.1))', animation: 'float 6s ease-in-out infinite' }} 
              />
            </div>

            {/* Right: Search Box */}
            <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: '400px', maxWidth: '520px', marginTop: '-1.5rem' }}>
              {/* Badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.35rem 0.9rem', borderRadius: '999px', marginBottom: '1.5rem',
                background: 'rgba(220, 38, 38, 0.07)', border: '1px solid rgba(220, 38, 38, 0.18)',
                color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 600
              }}>
                <Activity size={12} /> Emergency Search
              </div>

              <h2 style={{ fontSize: '2.8rem', marginBottom: '1rem', textAlign: 'left', fontWeight: 950, lineHeight: 0.95, letterSpacing: '-0.03em' }}>
                Find a Blood Donor
              </h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1.05rem', textAlign: 'left', fontWeight: 500, lineHeight: 1.5 }}>
                Search our verified network of life-savers instantly.
              </p>

              {/* Search Bar */}
              <div className="glass w-full shadow-lg" style={{
                padding: '1.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                borderTop: '4px solid var(--accent)',
                borderRadius: '24px'
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
    
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button 
                    onClick={handleSearch} 
                    disabled={loading} 
                    className="btn-primary flex items-center gap-2" 
                    style={{ flex: 1, height: '52px', justifyContent: 'center', fontSize: '1rem', borderRadius: '15px' }}
                  >
                    <Search size={18} /> {loading && searchMethod === 'manual' ? '...' : 'Search'}
                  </button>
                  <button 
                    onClick={handleNearestSearch} 
                    disabled={loading} 
                    className="btn-accent flex items-center gap-2" 
                    style={{ flex: 1, height: '52px', justifyContent: 'center', fontSize: '1rem', borderRadius: '15px' }}
                  >
                    <MapPin size={18} /> {loading && searchMethod === 'proximity' ? '...' : 'Find Nearest'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Info & View Toggle */}
          {hasSearched && !loading && (
            <div style={{ width: '100%', maxWidth: '1100px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>
                {searchMethod === 'proximity' ? (
                  <>Showing nearest donors to your location</>
                ) : (
                  <>Found <span style={{ color: 'var(--accent-dark)', fontWeight: 700 }}>{donors.length}</span> donor{donors.length !== 1 ? 's' : ''}</>
                )}
              </div>
              {donors.length > 0 && (
                <button 
                  onClick={() => setShowMap(!showMap)}
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.5rem', 
                    padding: '0.4rem 0.8rem', borderRadius: '8px', border: '1px solid var(--border-subtle)',
                    background: 'white', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600
                  }}
                >
                  {showMap ? <ClipboardList size={14} /> : <MapIcon size={14} />}
                  {showMap ? 'View List' : 'View on Map'}
                </button>
              )}
            </div>
          )}

          {/* Leaflet Map View */}
          {showMap && donors.length > 0 && (
            <div className="glass w-full mb-8 animate-fade-in" style={{ maxWidth: '1100px', height: '520px', padding: '0', overflow: 'hidden', borderRadius: '20px', position: 'relative', zIndex: 10 }}>
              <MapContainer 
                center={mapCenter} 
                zoom={12} 
                style={{ width: '100%', height: '100%' }}
                scrollWheelZoom={true}
              >
                <ChangeView center={mapCenter} zoom={12} />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* User Location Marker */}
                {userLocation && (
                  <Marker position={userLocation} icon={userIcon}>
                    <Popup>Your Location</Popup>
                  </Marker>
                )}

                {/* Donor Markers */}
                {donors.filter(d => d.location?.coordinates && Array.isArray(d.location.coordinates) && d.location.coordinates.length >= 2).map(donor => (
                  <Marker 
                    key={donor._id} 
                    position={[donor.location.coordinates[1], donor.location.coordinates[0]]}
                    icon={donorIcon}
                  >
                    <Popup minWidth={180}>
                      <div style={{ padding: '0.25rem' }}>
                        <h4 style={{ margin: '0 0 0.4rem 0', color: 'var(--primary)', fontWeight: 800, fontSize: '0.95rem' }}>{donor.name}</h4>
                        <div className="flex items-center gap-1 mb-2" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                          <Droplets size={12} color="var(--primary)" /> {donor.bloodGroup} | <MapPin size={12} /> {donor.area}
                          {donor.distance !== undefined && (
                            <span style={{ color: 'var(--accent-dark)', marginLeft: '4px' }}>
                              ({(donor.distance / 1000).toFixed(1)} km)
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button 
                            className="btn-primary" 
                            style={{ flex: 1, padding: '0.4rem', fontSize: '0.7rem', borderRadius: '6px' }}
                            onClick={() => openRequestModal(donor)}
                          >
                            Request Blood
                          </button>
                          {userLocation && donor.location && donor.location.coordinates && (
                            <a 
                              href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation[0]},${userLocation[1]}&destination=${donor.location.coordinates[1]},${donor.location.coordinates[0]}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-accent flex items-center justify-center gap-1"
                              style={{ flex: 1, padding: '0.4rem', fontSize: '0.7rem', borderRadius: '6px', textDecoration: 'none', color: 'white' }}
                            >
                              <MapIcon size={12} /> Route (Maps)
                            </a>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
              
              {/* Attribution overlay to match user request style */}
              <div style={{
                position: 'absolute', bottom: '10px', left: '10px', zIndex: 1000,
                background: 'rgba(255,255,255,0.9)', padding: '4px 10px', borderRadius: '8px',
                fontSize: '0.7rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px',
                border: '1px solid rgba(0,0,0,0.1)'
              }}>
                <div style={{ width: '8px', height: '8px', background: '#22c55e', borderRadius: '50%' }}></div>
                Leaflet + OpenStreetMap (100% FREE)
              </div>
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
          {!showMap && (
            <div className="grid gap-4 w-full" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', maxWidth: '1100px' }}>
              {donors.map((donor, i) => (
              <div
                key={donor._id}
                className="glass animate-fade-in"
                style={{
                  position: 'relative',
                  zIndex: requestModal?._id === donor._id ? 100 : 1,
                  padding: '1.25rem',
                  animationDelay: `${i * 0.08}s`,
                  borderLeft: '3px solid var(--accent)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                }}
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
                        {donor.distance !== undefined && (
                          <span style={{ fontWeight: 700, color: 'var(--accent-dark)', borderLeft: '1px solid #ddd', paddingLeft: '8px', marginLeft: '6px' }}>
                            {(donor.distance / 1000).toFixed(1)} km away
                          </span>
                        )}
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

                {/* Interaction Buttons */}
                <div className="flex gap-2">
                  <button
                    id={`request-btn-${donor._id}`}
                    onClick={() => openRequestModal(donor)}
                    className="btn-primary flex items-center justify-center gap-2"
                    style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem', borderRadius: '10px' }}
                  >
                    <Send size={14} /> Request
                  </button>
                  {userLocation && donor.location && donor.location.coordinates && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation[0]},${userLocation[1]}&destination=${donor.location.coordinates[1]},${donor.location.coordinates[0]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-accent flex items-center justify-center gap-2"
                      style={{ flex: 1, padding: '0.6rem', fontSize: '0.85rem', borderRadius: '10px', textDecoration: 'none', color: 'white' }}
                    >
                      <MapIcon size={14} /> View in Maps
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
          )}
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

      {/* ========== REQUEST MODAL MOVED INLINE ========== */}
    </div>
  );
}

export default RecipientPanel;
