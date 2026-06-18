'use client';

import { useState, useCallback, useEffect } from 'react';
import { authAPI, RegisterPayload, LoginPayload } from '@/lib/api';

export interface User {
  username: string;
  email: string;
  role: string;
}

export const useAuth = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize auth state on mount by calling server-side validate endpoint
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Try to validate with the server (uses httpOnly cookie automatically)
        const isValid = await authAPI.validate('');
        if (isValid) {
          // If cookie exists and is valid, we're authenticated
          // Access token is secure in httpOnly cookie, so we set a flag for the frontend
          setAccessToken('__httpOnly__');
          // We can't extract user info from httpOnly token, so we need another endpoint
          // For now, we'll trust the server's validation
        }
      } catch (err) {
        console.error('Auth initialization failed:', err);
        setAccessToken(null);
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
      // Access token is now in httpOnly cookie, so we set a flag
      setAccessToken('__httpOnly__');
      setUser({
        username: response.username,
        email: response.email,
        role: response.role,
      });
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
      await authAPI.refresh();
      // Token is now in httpOnly cookie, no need to update state
      setAccessToken('__httpOnly__');
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
