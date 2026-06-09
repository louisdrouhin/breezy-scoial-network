'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, Search, Bell, CircleUser, Plus } from 'lucide-react';
import { useState } from 'react';
import MobilePostModal from './MobilePostModal';

export default function MobileBottomBar() {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <MobilePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

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
          }}
        >
          <Bell size={24} />
        </Link>

        <Link
          href="/profile"
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
