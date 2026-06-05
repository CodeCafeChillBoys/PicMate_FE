import { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../services/apiClient';

const AuthContext = createContext(null);

function mapRole(raw) {
  if (!raw) return 'customer';
  const r = String(raw).toLowerCase();
  if (r === 'grapher' || r === 'photographer') return 'photographer';
  if (r === 'admin' || r === 'administrator') return 'admin';
  return 'customer';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('picmate_user');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (parsed && parsed.role) parsed.role = mapRole(parsed.role);
      return parsed;
    } catch (e) {
      return null;
    }
  });

  // authLoading: true while we initialize or perform a login/logout operation
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state. If we have an access token, validate it via /api/auth/me
    const init = async () => {
      try {
        const accessToken = localStorage.getItem('picmate_access_token');
        if (accessToken) {
          // validate token & get fresh user profile
          try {
            const me = await apiClient.me();
            const userData = {
              id: me.id,
              name: me.fullName,
              email: me.email,
              role: mapRole(me.role),
              avatar: me.avatarUrl,
            };
            setUser(userData);
            localStorage.setItem('picmate_user', JSON.stringify(userData));
          } catch (err) {
            // invalid token or other error -> clear stored auth
            console.warn('Token validation failed', err);
            localStorage.removeItem('picmate_user');
            localStorage.removeItem('picmate_access_token');
            localStorage.removeItem('picmate_refresh_token');
            setUser(null);
          }
        } else {
          const saved = localStorage.getItem('picmate_user');
          if (saved) setUser(JSON.parse(saved));
        }
      } catch (e) {
        // ignore malformed data
        console.error('Failed to initialize auth from localStorage', e);
      } finally {
        setAuthLoading(false);
      }
    };
    init();
  }, []);

  const login = async (email, password) => {
    setAuthLoading(true);
    try {
      const response = await apiClient.login(email, password);
      const userData = {
        id: response.id,
        name: response.name,
        email: response.email,
        // normalize role using mapRole so "grapher" → "photographer" etc.
        role: mapRole(response.role),
        avatar: response.avatar,
        redirect: response.redirect,
      };

      // Persist tokens/user first so other code can read them immediately
      localStorage.setItem('picmate_user', JSON.stringify(userData));
      if (response.accessToken) localStorage.setItem('picmate_access_token', response.accessToken);
      if (response.refreshToken) localStorage.setItem('picmate_refresh_token', response.refreshToken);

      setUser(userData);

      return { success: true, redirect: response.redirect || '/' };
    } catch (error) {
      return { success: false, message: error.message || 'Email hoặc mật khẩu không đúng!' };
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('picmate_user');
    localStorage.removeItem('picmate_access_token');
    localStorage.removeItem('picmate_refresh_token');
  };

  const updateUser = (userData) => {
    const updated = { ...user, ...userData };
    setUser(updated);
    localStorage.setItem('picmate_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

