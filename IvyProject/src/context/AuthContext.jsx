import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getStoredToken,
  getStoredUser,
  getLoginTimestamp,
  loginUser,
  logoutUser
} from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(getStoredToken);
  const [loginTime, setLoginTime] = useState(getLoginTimestamp);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Listen for background token renewals and session expirations
  useEffect(() => {
    const handleRefreshed = () => {
      setToken(getStoredToken());
      setUser(getStoredUser());
    };

    const handleExpired = (e) => {
      setToken(null);
      setUser(null);
      setLoginTime(null);
      setElapsedMinutes(0);
      setError(e?.detail?.reason || 'Your session has expired. Please log in again.');
      setIsAuthModalOpen(true);
    };

    window.addEventListener('ivy_token_refreshed', handleRefreshed);
    window.addEventListener('ivy_session_expired', handleExpired);
    return () => {
      window.removeEventListener('ivy_token_refreshed', handleRefreshed);
      window.removeEventListener('ivy_session_expired', handleExpired);
    };
  }, []);

  // Timer to track session duration across page refresh
  useEffect(() => {
    if (!loginTime) return;

    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - loginTime) / (1000 * 60));
      setElapsedMinutes(elapsed);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 30000); // every 30s
    return () => clearInterval(interval);
  }, [loginTime]);

  const handleLogin = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginUser(email, password);
      setToken(res.token);
      setUser(res.user || { email, name: email.split('@')[0] });
      setLoginTime(Date.now());
      setIsAuthModalOpen(false);
      return res;
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setToken(null);
    setLoginTime(null);
    setElapsedMinutes(0);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        elapsedMinutes,
        isAuthModalOpen,
        setIsAuthModalOpen,
        login: handleLogin,
        logout: handleLogout,
        loading,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
