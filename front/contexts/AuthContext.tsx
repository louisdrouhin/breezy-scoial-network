'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { authAPI, RegisterPayload, LoginPayload } from '@/lib/api';

export interface User {
  username: string;
  email: string;
  role: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<boolean>;
  register: (payload: RegisterPayload) => Promise<boolean>;
  logout: () => Promise<void>;
  setError: (e: string | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initDone = useRef(false);

  const base = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost');

  useEffect(() => {
    if (initDone.current) return;
    initDone.current = true;

    const init = async () => {
      try {
        const res = await fetch(`${base}/api/auth/validate-cookie`, { method: 'GET', credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(true);
          setUser({ username: data.username, email: '', role: data.role });
          setIsInitialized(true);
          return;
        }

        const refreshRes = await fetch(`${base}/api/auth/refresh`, { method: 'POST', credentials: 'include' });
        if (refreshRes.ok) {
          const validateRes = await fetch(`${base}/api/auth/validate-cookie`, { method: 'GET', credentials: 'include' });
          if (validateRes.ok) {
            const data = await validateRes.json();
            setIsAuthenticated(true);
            setUser({ username: data.username, email: '', role: data.role });
            setIsInitialized(true);
            return;
          }
        }
      } catch { /* réseau indisponible */ }

      setIsAuthenticated(false);
      setUser(null);
      setIsInitialized(true);
    };

    init();
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authAPI.login(payload);
      setIsAuthenticated(true);
      setUser({ username: response.username, email: response.email, role: response.role });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authAPI.register(payload);
      setUser({ username: response.username!, email: response.email!, role: response.role! });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authAPI.logout();
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setError(null);
      setIsLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isInitialized, isLoading, error, login, register, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
