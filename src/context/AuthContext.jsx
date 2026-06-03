import { createContext, useContext, useState } from 'react';
import { useAppData } from './AppDataContext';
import { apiClient } from '../services/apiClient';

const AuthContext = createContext(null);

const fallbackDemoAccounts = [
  { email: 'khach@picmate.vn', password: '123456', role: 'customer' },
  { email: 'photographer@picmate.vn', password: '123456', role: 'photographer' },
  { email: 'admin@picmate.vn', password: 'admin123', role: 'admin' },
];

export function AuthProvider({ children }) {
  const { data } = useAppData();
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('picmate_user');
    return saved ? JSON.parse(saved) : null;
  });

  const demoAccounts = data.demoAccounts?.length ? data.demoAccounts : fallbackDemoAccounts;

  const login = async (email, password) => {
    try {
      const response = await apiClient.login(email, password);
      const userData = {
        name: response.name,
        email: response.email,
        role: response.role,
        avatar: response.avatar,
        redirect: response.redirect,
      };
      setUser(userData);
      localStorage.setItem('picmate_user', JSON.stringify(userData));
      localStorage.setItem('picmate_access_token', response.accessToken);
      localStorage.setItem('picmate_refresh_token', response.refreshToken);
      return { success: true, redirect: response.redirect };
    } catch (error) {
      return { success: false, message: error.message || 'Email ho?c m?t kh?u không dúng!' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('picmate_user');
    localStorage.removeItem('picmate_access_token');
    localStorage.removeItem('picmate_refresh_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, demoAccounts }}>
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

