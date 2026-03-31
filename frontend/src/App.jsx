import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import DonorPanel from './components/DonorPanel';
import RecipientPanel from './components/RecipientPanel';
import Login from './components/Login';
import Register from './components/Register';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import './index.css';

const ProtectedRoute = ({ children, roleRequired }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roleRequired && user.role !== roleRequired) {
    return <Navigate to="/" />;
  }
  return children;
};

const pageClassMap = {
  '/': 'page-home',
  '/login': 'page-login',
  '/register': 'page-register',
  '/donor': 'page-donor',
  '/recipient': 'page-recipient',
};

function AppContent() {
  const location = useLocation();
  const pageClass = pageClassMap[location.pathname] || 'page-home';

  return (
    <div className={`app-container ${pageClass}`}>
      <div className="page-bg" />
      <Navbar />
      <main className="container animate-fade-in" key={location.pathname}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/donor"
            element={
              <ProtectedRoute roleRequired="donor">
                <DonorPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recipient"
            element={
              <ProtectedRoute roleRequired="recipient">
                <RecipientPanel />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
