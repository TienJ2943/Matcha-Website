/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('user_token') || '');
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('user_refresh') || '');
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user_data');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initialize() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data);
          setLoading(false);
          return;
        }

        if (!refreshToken) {
          clearAuth();
          setLoading(false);
          return;
        }

        const refreshRes = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });

        if (refreshRes.ok) {
          const refreshed = await refreshRes.json();
          setAuthState(refreshed);
        } else {
          clearAuth();
        }
      } catch (err) {
        console.error('Auth initialization failed', err);
        clearAuth();
      } finally {
        setLoading(false);
      }
    }

    initialize();
  }, [token, refreshToken]);

  const setAuthState = (data) => {
    setToken(data.token);
    setRefreshToken(data.refreshToken || '');
    setUser(data.user || null);
    localStorage.setItem('user_token', data.token);
    localStorage.setItem('user_refresh', data.refreshToken || '');
    localStorage.setItem('user_data', JSON.stringify(data.user || null));
  };

  const clearAuth = () => {
    setToken('');
    setRefreshToken('');
    setUser(null);
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_refresh');
    localStorage.removeItem('user_data');
  };

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
      setAuthState(data);
      return { success: true };
    }
    return { success: false, error: data.error || 'Login failed' };
  };

  const signup = async (name, email, password) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (res.ok) {
      setAuthState(data);
      return { success: true };
    }
    return { success: false, error: data.error || 'Signup failed' };
  };

  const logout = () => {
    clearAuth();
  };

  return (
    <AuthContext.Provider value={{ user, token, refreshToken, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
