'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAccessStore } from '@/stores/accessStore';

export default function AccessStoreBridge() {
  const { user, isAuthenticated, isInitialized } = useAuth();
  const syncFromAuth = useAccessStore(state => state.syncFromAuth);

  useEffect(() => {
    syncFromAuth({ user, isAuthenticated, isInitialized });
  }, [isAuthenticated, isInitialized, syncFromAuth, user]);

  return null;
}
