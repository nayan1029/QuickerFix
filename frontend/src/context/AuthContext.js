import React, { createContext, useState, useEffect, useContext } from 'react';
import * as api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('qf_token'));
  const [previewMode, setPreviewMode] = useState(localStorage.getItem('qf_preview_mode') === 'true');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (token && !previewMode) {
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
  }, [token, previewMode]);

  useEffect(() => {
    if (previewMode) {
      const savedUser = localStorage.getItem('qf_preview_user');
      if (savedUser) setUser(JSON.parse(savedUser));
      setLoading(false);
    }
  }, [previewMode]);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    const { token, user: nestedUser, ...authUser } = res.data;
    const userData = nestedUser || { ...authUser, id: authUser.userId };
    localStorage.setItem('qf_token', token);
    localStorage.removeItem('qf_preview_mode');
    localStorage.removeItem('qf_preview_user');
    setPreviewMode(false);
    setToken(token);
    setUser(userData);
  };

  const googleLogin = async (idToken) => {
    const res = await api.googleLogin(idToken);
    const { token, user: nestedUser, ...authUser } = res.data;
    const userData = nestedUser || { ...authUser, id: authUser.userId };
    localStorage.setItem('qf_token', token);
    localStorage.removeItem('qf_preview_mode');
    localStorage.removeItem('qf_preview_user');
    setPreviewMode(false);
    setToken(token);
    setUser(userData);
    return userData;
  };

  const register = async (data) => {
    const res = await api.register(data);
    const { token, user: nestedUser, ...authUser } = res.data;
    const userData = nestedUser || { ...authUser, id: authUser.userId };
    localStorage.setItem('qf_token', token);
    localStorage.removeItem('qf_preview_mode');
    localStorage.removeItem('qf_preview_user');
    setPreviewMode(false);
    setToken(token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('qf_token');
    localStorage.removeItem('qf_preview_mode');
    localStorage.removeItem('qf_preview_user');
    setToken(null);
    setUser(null);
    setPreviewMode(false);
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
    try {
      await login(email, password);
    } catch (error) {
      const previewUser = {
        id: role === 'ADMIN' ? 1 : role === 'WORKER' ? 2 : 3,
        name: role === 'ADMIN' ? 'Admin User' : role === 'WORKER' ? 'Roads Worker' : 'Demo Citizen',
        email,
        role
      };
      localStorage.setItem('qf_preview_mode', 'true');
      localStorage.setItem('qf_preview_user', JSON.stringify(previewUser));
      setToken(null);
      setUser(previewUser);
      setPreviewMode(true);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, previewMode, login, googleLogin, register, logout, demoLogin }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
