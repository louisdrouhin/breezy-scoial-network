'use client';

import { useState, useCallback, useEffect } from 'react';
import { authAPI, RegisterPayload, LoginPayload } from '@/lib/api';

export interface User {
  username: string;
  email: string;
  role: string;
}

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth state on mount by checking if user has valid httpOnly cookie
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Validate using httpOnly cookie
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost'}/api/auth/validate-cookie`, {
          method: 'GET',
          credentials: 'include', // Send cookies with request
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (err) {
        console.error('Auth initialization failed:', err);
        setIsAuthenticated(false);
        setUser(null);
      }
      setIsInitialized(true);
    };

    initializeAuth();
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
      setIsAuthenticated(true);
      setUser({
        username: response.username,
        email: response.email,
        role: response.role,
      });
      setIsLoading(false);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setIsLoading(false);
      return false;
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      await authAPI.refresh();
      // Token is refreshed in httpOnly cookie
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Token refresh failed');
      // If refresh fails, user must login again
      setIsAuthenticated(false);
      setUser(null);
      return false;
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

  return {
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
