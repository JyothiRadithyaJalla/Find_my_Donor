import React, { createContext, useState, useEffect } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await API.post('/api/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data;
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    API.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    
    if (userData.role === 'donor') navigate('/donor');
    else navigate('/recipient');
  };

  const register = async (userData) => {
    const res = await API.post('/api/auth/register', userData);
    const { token: newToken, user: newUser } = res.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    API.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    
    if (newUser.role === 'donor') navigate('/donor');
    else navigate('/recipient');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete API.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
