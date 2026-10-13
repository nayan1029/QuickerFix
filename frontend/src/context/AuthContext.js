import React, { createContext, useContext, useEffect, useState } from 'react';
import * as api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('qf_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchCurrentUser = async () => {
      if (!token) {
        if (active) setLoading(false);
        return;
      }
      try {
        const response = await api.getMe();
        if (active) setUser(response.data);
      } catch (error) {
        localStorage.removeItem('qf_token');
        if (active) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchCurrentUser();
    return () => { active = false; };
  }, [token]);

  const saveAuth = (response) => {
    const { token: accessToken, user: nestedUser, ...authUser } = response;
    const userData = nestedUser || { ...authUser, id: authUser.userId };
    localStorage.setItem('qf_token', accessToken);
    setToken(accessToken);
    setUser(userData);
    return userData;
  };

  const login = async (email, password) => saveAuth((await api.login({ email, password })).data);
  const register = async (data) => saveAuth((await api.register(data)).data);
  const googleLogin = async (idToken) => saveAuth((await api.googleLogin(idToken)).data);

  const logout = () => {
    localStorage.removeItem('qf_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, googleLogin, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
