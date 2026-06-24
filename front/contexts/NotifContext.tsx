'use client';

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { notifAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface NotifContextValue {
  unreadCount: number;
  decrementUnread: (by?: number) => void;
  clearUnread: () => void;
}

const NotifContext = createContext<NotifContextValue>({ unreadCount: 0, decrementUnread: () => {}, clearUnread: () => {} });

export function NotifProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || fetchedRef.current) return;
    fetchedRef.current = true;

    notifAPI.getAll()
      .then(notifs => setUnreadCount(notifs.filter(n => !n.read).length))
      .catch(() => {});
  }, [isAuthenticated]);

  const decrementUnread = useCallback((by = 1) => {
    setUnreadCount(prev => Math.max(0, prev - by));
  }, []);

  const clearUnread = useCallback(() => setUnreadCount(0), []);

  return (
    <NotifContext.Provider value={{ unreadCount, decrementUnread, clearUnread }}>
      {children}
    </NotifContext.Provider>
  );
}

export function useNotifCount() {
  return useContext(NotifContext);
}
