import React, { createContext, useState, useEffect, useContext } from 'react';
import * as api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('qf_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const res = await api.getMe();
          setUser(res.data);
        } catch (error) {
          console.error("Failed to fetch user", error);
          logout();
        }
      }
      setLoading(false);
    };
    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    const { token, user: userData } = res.data;
    localStorage.setItem('qf_token', token);
    setToken(token);
    setUser(userData);
  };

  const register = async (data) => {
    const res = await api.register(data);
    const { token, user: userData } = res.data;
    localStorage.setItem('qf_token', token);
    setToken(token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('qf_token');
    setToken(null);
    setUser(null);
  };

  const demoLogin = async (role) => {
    let email, password;
    if (role === 'ADMIN') {
      email = 'admin@quickerfix.com';
      password = 'admin123';
    } else if (role === 'WORKER') {
      email = 'worker.roads@quickerfix.com';
      password = 'worker123';
    } else {
      email = 'citizen@quickerfix.com';
      password = 'citizen123';
    }
    await login(email, password);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, demoLogin }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
