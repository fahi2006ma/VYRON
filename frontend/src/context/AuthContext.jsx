import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('vyron_access_token'));
  const [loading, setLoading] = useState(true);

  // Initialize and check existing session
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (token) {
          api.setToken(token);
          const profile = await api.getProfile();
          setUser(profile);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.warn('Session expired or invalid, requiring login:', err.message);
        setToken(null);
        setUser(null);
        localStorage.removeItem('vyron_access_token');
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const handleExpired = () => {
      setToken(null);
      setUser(null);
      localStorage.removeItem('vyron_access_token');
    };
    window.addEventListener('vyron_auth_expired', handleExpired);
    return () => window.removeEventListener('vyron_auth_expired', handleExpired);
  }, [token]);

  const login = async (emailOrUsername, password) => {
    const data = await api.login({ email: emailOrUsername, password });
    setToken(data.access);
    setUser(data.user);
    return data;
  };

  const register = async (username, email, password, fullName) => {
    const data = await api.register({
      username,
      email,
      password,
      full_name: fullName
    });
    setToken(data.access);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await api.logout();
    setToken(null);
    setUser(null);
    localStorage.removeItem('vyron_access_token');
  };

  const refreshUser = async () => {
    try {
      const updated = await api.getProfile();
      setUser(updated);
      return updated;
    } catch (e) {
      console.error('Error refreshing user:', e);
    }
  };

  const updateUserState = (updatedFields) => {
    setUser(prev => ({ ...prev, ...updatedFields }));
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshUser,
      updateUserState
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
