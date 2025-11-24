// src/context/AuthContext.tsx

import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiService } from '../services/api';

// ... (Interface User dan AuthContextType Anda tetap sama) ...
interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedToken = apiService.getToken();
      const savedUser = apiService.getUser();

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(savedUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Gagal memuat sesi:", error);
      apiService.logout();
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiService.login({ email, password });
    if (response.data) {
      setToken(response.data.token);
      setUser(response.data.user);
      setIsAuthenticated(true);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    await apiService.register({ username, email, password });
  };

  const logout = () => {
    apiService.logout();
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  if (loading) {
    return <div>Loading application...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };