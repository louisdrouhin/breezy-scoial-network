'use client';

import { useState, useEffect, useRef } from 'react';
import Notification from '@/components/Notification';
import { notifAPI, Notif } from '@/lib/api';
import { useNotifCount } from '@/contexts/NotifContext';

// Cache module-level : survit aux navigations sans remonter le composant
let notifsCache: Notif[] | null = null;

export default function Notifications() {
  const [notifs, setNotifs] = useState<Notif[]>(notifsCache ?? []);
  const [isLoading, setIsLoading] = useState(notifsCache === null);
  const [markingAll, setMarkingAll] = useState(false);
  const fetchedRef = useRef(false);
  const { decrementUnread, clearUnread } = useNotifCount();

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    // Si on a déjà un cache, on rafraîchit en arrière-plan sans spinner
    if (notifsCache !== null) {
      notifAPI.getAll()
        .then(data => { notifsCache = data; setNotifs(data); })
        .catch(() => {});
      return;
    }

    notifAPI.getAll()
      .then(data => { notifsCache = data; setNotifs(data); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleMarkAsRead = (id: string) => {
    setNotifs(prev => {
      const notif = prev.find(n => n._id === id);
      if (notif && !notif.read) decrementUnread(1);
      const updated = prev.map(n => n._id === id ? { ...n, read: true } : n);
      notifsCache = updated;
      return updated;
    });
    notifAPI.markAsRead(id).catch(() => {});
  };

  const handleDelete = (id: string) => {
    setNotifs(prev => {
      const notif = prev.find(n => n._id === id);
      if (notif && !notif.read) decrementUnread(1);
      const updated = prev.filter(n => n._id !== id);
      notifsCache = updated;
      return updated;
    });
    notifAPI.delete(id).catch(() => {});
  };

  const handleMarkAllAsRead = async () => {
    if (markingAll) return;
    setMarkingAll(true);
    try {
      await notifAPI.markAllAsRead();
      clearUnread();
      setNotifs(prev => {
        const updated = prev.map(n => ({ ...n, read: true }));
        notifsCache = updated;
        return updated;
      });
    } catch { /* silently ignore */ }
    finally { setMarkingAll(false); }
  };

  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <div
      style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F4F5F4', paddingTop: '20px', paddingRight: '20px', paddingBottom: '80px', paddingLeft: '320px' }}
      className="notifications-container"
    >
      <div style={{ flex: '0 0 100%', paddingRight: '20px', paddingLeft: '20px' }}>

        {/* Header */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #1A4731', borderRadius: '8px', padding: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontFamily: 'var(--font-rubik)', color: '#1A4731', margin: 0, fontSize: '28px' }}>Notifications</h1>
            {unreadCount > 0 && (
              <span style={{ backgroundColor: '#1A4731', color: 'white', fontFamily: 'var(--font-alata)', fontSize: '12px', borderRadius: '999px', padding: '2px 10px' }}>
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
              style={{ background: 'none', border: '1px solid #1A4731', borderRadius: '6px', padding: '8px 16px', fontFamily: 'var(--font-alata)', color: '#1A4731', cursor: markingAll ? 'not-allowed' : 'pointer', fontSize: '13px', opacity: markingAll ? 0.6 : 1 }}
            >
              Tout marquer comme lu
            </button>
          )}
        </div>

        {/* Liste */}
        {isLoading ? (
          <p style={{ fontFamily: 'var(--font-alata)', color: '#999', textAlign: 'center', padding: '40px' }}>Chargement...</p>
        ) : notifs.length === 0 ? (
          <p style={{ fontFamily: 'var(--font-alata)', color: '#999', textAlign: 'center', padding: '60px' }}>Aucune notification pour le moment.</p>
        ) : (
          notifs.map(notif => (
            <Notification
              key={notif._id}
              id={notif._id}
              type={notif.type}
              actorUsername={notif.actorUsername}
              relatedPostId={notif.relatedPostId}
              read={notif.read}
              createdAt={notif.created_at}
              onMarkAsRead={handleMarkAsRead}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
