'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { House, Search, Bell, CircleUser } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
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
  );
}
