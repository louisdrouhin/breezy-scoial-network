'use client';

import { useState } from 'react';
import SearchBar from '@/components/SearchBar';

export default function Search() {
  const [query, setQuery] = useState('');

  return (
    <div style={{ backgroundColor: '#F4F5F4', minHeight: '100vh' }}>

      <div
        style={{
          display: 'flex',
          minHeight: '100vh',
          backgroundColor: '#F4F5F4',
          paddingTop: '20px',
          paddingRight: '20px',
          paddingBottom: '20px',
          paddingLeft: '320px',
        }}
        className="search-container"
      >
        <div
          style={{
            flex: '1',
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          {/* Search Header */}
          <div style={{ marginBottom: '24px' }}>
            <h1
              style={{
                fontFamily: 'var(--font-rubik)',
                color: '#1A4731',
                margin: '0 0 16px 0',
                fontSize: '28px',
              }}
            >
              Search
            </h1>

            {/* Search Input */}
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '2px solid #1A4731',
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search users, posts..."
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
          </div>

          {/* Empty state */}
          {!query && (
            <div
              style={{
                textAlign: 'center',
                paddingTop: '60px',
                color: '#999',
              }}
            >
              <p style={{ fontFamily: 'var(--font-alata)', fontSize: '14px' }}>
                Start typing to search
              </p>
            </div>
          )}

          {/* Results placeholder */}
          {query && (
            <div
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #F4F5F4',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
              }}
            >
              <p style={{ fontFamily: 'var(--font-alata)', color: '#999' }}>
                No results found for "{query}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
