'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, Search, Bell, CircleUser, Plus } from 'lucide-react';
import { useState } from 'react';
import MobilePostModal from './MobilePostModal';
import { useNotifCount } from '@/contexts/NotifContext';
import { useAuth } from '@/hooks/useAuth';

export default function MobileBottomBar() {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState(false);
  const { unreadCount } = useNotifCount();
  const { user } = useAuth();

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');
  const profileHref = user ? `/profile/${user.username}` : '/profile';

  const handlePostCreated = () => {
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  return (
    <>
      <MobilePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onPostCreated={handlePostCreated} />

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: '#1A4731', color: 'white', padding: '10px 20px',
          borderRadius: '999px', fontFamily: 'var(--font-alata)', fontSize: '14px',
          zIndex: 200, whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          animation: 'slideUp 0.2s ease',
        }}>
          Post published!
        </div>
      )}

      <style>{`@keyframes slideUp { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }`}</style>

      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '8px 0',
          backgroundColor: '#ffffff',
          borderTop: '1px solid #E0E0E0',
          zIndex: 100,
        }}
      >
        <Link
          href="/"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            color: isActive('/') ? '#1A4731' : '#999',
            textDecoration: 'none',
          }}
        >
          <House size={24} />
        </Link>

        <Link
          href="/search"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            color: isActive('/search') ? '#1A4731' : '#999',
            textDecoration: 'none',
          }}
        >
          <Search size={24} />
        </Link>

        {/* FAB Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#1A4731',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '8px',
            boxShadow: '0 4px 12px rgba(26, 71, 49, 0.3)',
          }}
        >
          <Plus size={28} />
        </button>

        <Link
          href="/notifications"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            color: isActive('/notifications') ? '#1A4731' : '#999',
            textDecoration: 'none',
            position: 'relative',
          }}
        >
          <div style={{ position: 'relative', display: 'flex' }}>
            <Bell size={24} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-6px',
                right: '-6px',
                backgroundColor: '#dc2626',
                color: 'white',
                borderRadius: '999px',
                fontSize: '10px',
                fontFamily: 'var(--font-alata)',
                fontWeight: 'bold',
                minWidth: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 3px',
                lineHeight: '1',
              }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </div>
        </Link>

        <Link
          href={profileHref}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            color: isActive('/profile') ? '#1A4731' : '#999',
            textDecoration: 'none',
          }}
        >
          <CircleUser size={24} />
        </Link>
      </div>
    </>
  );
}
