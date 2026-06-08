'use client';

import Image from 'next/image';

export default function MobileHeader() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: '#F4F5F4',
        borderBottom: '1px solid #E0E0E0',
      }}
    >
      {/* Avatar left */}
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#1A4731',
        }}
      />

      {/* Logo center */}
      <Image src="/Breezy-Logo.svg" alt="Logo" width={70} height={70} />

      {/* Empty right for balance */}
      <div style={{ width: '40px' }} />
    </div>
  );
}
