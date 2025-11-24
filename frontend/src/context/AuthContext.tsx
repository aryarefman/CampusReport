// src/context/AuthContext.tsx

import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { apiService } from '../services/api';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  createdAt?: string;
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
    const initAuth = async () => {
      try {
        const savedToken = apiService.getToken();
        const savedUser = apiService.getUser();

        if (savedToken) {
          setToken(savedToken);
          // Optimistically set saved user first
          if (savedUser) {
            setUser(savedUser);
            setIsAuthenticated(true);
          }

          // Fetch fresh user data
          try {
            const response = await apiService.getMe();
            if (response.data && response.data.user) {
              const freshUser = response.data.user;
              setUser(freshUser);
              setIsAuthenticated(true);
              localStorage.setItem('user', JSON.stringify(freshUser));
            }
          } catch (err) {
            console.error("Failed to refresh user data:", err);
            // If fetch fails but we have a token, we might want to logout if it's a 401, 
            // but apiService.get handles 401 by reloading, so we just keep the savedUser if possible
            if (!savedUser) {
              apiService.logout();
              setToken(null);
              setUser(null);
              setIsAuthenticated(false);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load session:", error);
        apiService.logout();
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
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