'use client';

import { useState, useCallback, useEffect } from 'react';
import { authAPI, RegisterPayload, LoginPayload } from '@/lib/api';

export interface User {
  username: string;
  email: string;
  role: string;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export const useAuth = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const token = getCookie('accessToken');
    if (token) {
      setAccessToken(token);
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const decoded = JSON.parse(atob(parts[1]));
          setUser({
            username: decoded.username,
            email: decoded.email,
            role: decoded.role,
          });
        }
      } catch (err) {
        console.error('Failed to decode token:', err);
        setAccessToken(null);
        setUser(null);
      }
    }
    setIsInitialized(true);
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authAPI.register(payload);
      setUser({
        username: response.username!,
        email: response.email!,
        role: response.role!,
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authAPI.login(payload);
      setAccessToken(response.accessToken);

      // Decode JWT to get user info
      const parts = response.accessToken.split('.');
      if (parts.length === 3) {
        const decoded = JSON.parse(atob(parts[1]));
        setUser({
          username: decoded.username,
          email: decoded.email,
          role: decoded.role,
        });
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const response = await authAPI.refresh();
      setAccessToken(response.accessToken);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Token refresh failed');
      // If refresh fails, user must login again
      setAccessToken(null);
      setUser(null);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authAPI.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
      setError(null);
      setIsLoading(false);
    }
  }, []);

  const isAuthenticated = !!accessToken && !!user;

  return {
    accessToken,
    user,
    error,
    isLoading,
    isInitialized,
    isAuthenticated,
    register,
    login,
    refresh,
    logout,
    setError,
  };
};
