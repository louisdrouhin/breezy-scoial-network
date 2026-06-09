'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X, Settings, Shield, LogOut } from 'lucide-react';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Avatar button */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#1A4731',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
        }}
      />

      {/* Overlay */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
          }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Menu */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          width: '250px',
          backgroundColor: '#ffffff',
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          paddingTop: '20px',
        }}
      >
        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          style={{
            alignSelf: 'flex-end',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={24} style={{ color: '#1A4731' }} />
        </button>

        {/* Menu items */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '20px' }}>
          {/* Settings */}
          <Link
            href="/settings"
            onClick={() => setIsOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              backgroundColor: 'transparent',
              textDecoration: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-alata)',
              color: '#1A4731',
              fontSize: '16px',
              textAlign: 'left',
            }}
          >
            <Settings size={20} />
            <span>Settings</span>
          </Link>

          {/* Privacy Policy */}
          <Link
            href="/privacy-policy"
            onClick={() => setIsOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              backgroundColor: 'transparent',
              textDecoration: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-alata)',
              color: '#1A4731',
              fontSize: '16px',
              textAlign: 'left',
            }}
          >
            <Shield size={20} />
            <span>Privacy Policy</span>
          </Link>

          {/* Terms of Service */}
          <Link
            href="/terms-of-service"
            onClick={() => setIsOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              backgroundColor: 'transparent',
              textDecoration: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-alata)',
              color: '#1A4731',
              fontSize: '16px',
              textAlign: 'left',
            }}
          >
            <Shield size={20} />
            <span>Terms of Service</span>
          </Link>
        </div>

        {/* Logout button at bottom */}
        <button
          onClick={() => setIsOpen(false)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            backgroundColor: '#F4F5F4',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'var(--font-alata)',
            color: '#dc2626',
            fontSize: '16px',
            textAlign: 'left',
            borderTop: '1px solid #E0E0E0',
          }}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );
}
