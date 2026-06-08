'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

export default function SearchBar() {
  const [query, setQuery] = useState('');

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '2px solid #1A4731',
        borderRadius: '8px',
        padding: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '20px',
      }}
    >
      <Search size={20} style={{ color: '#1A4731' }} />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search users..."
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          fontFamily: 'var(--font-alata)',
          color: '#1A4731',
          fontSize: '14px',
          backgroundColor: 'transparent',
        }}
      />
    </div>
  );
}
