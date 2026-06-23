'use client';

import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { userAPI } from '@/lib/api';

interface SearchResult {
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await userAPI.search(q);
        setResults(data);
        setIsOpen(true);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, [query]);

  // Fermer le dropdown si clic extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = () => {
    setQuery('');
    setIsOpen(false);
    setResults([]);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', marginBottom: '20px' }}>
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '2px solid #1A4731',
          borderRadius: isOpen && results.length > 0 ? '8px 8px 0 0' : '8px',
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <Search size={20} style={{ color: '#1A4731', flexShrink: 0 }} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un utilisateur..."
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
        {isLoading && (
          <div style={{ width: '14px', height: '14px', border: '2px solid #1A4731', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite', flexShrink: 0 }} />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: '#ffffff',
            border: '2px solid #1A4731',
            borderTop: 'none',
            borderRadius: '0 0 8px 8px',
            zIndex: 100,
            maxHeight: '280px',
            overflowY: 'auto',
          }}
        >
          {results.map((u) => (
            <Link
              key={u.username}
              href={`/profile/${u.username}`}
              onClick={handleSelect}
              style={{ textDecoration: 'none' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #F4F5F4',
                  transition: 'background-color 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#f0f7f3')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {u.avatarUrl ? (
                  <img src={u.avatarUrl} alt={u.username} style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#1A4731', flexShrink: 0 }} />
                )}
                <div>
                  {u.displayName && (
                    <p style={{ margin: 0, fontFamily: 'var(--font-rubik)', fontSize: '13px', fontWeight: 'bold', color: '#1A4731' }}>{u.displayName}</p>
                  )}
                  <p style={{ margin: 0, fontFamily: 'var(--font-alata)', fontSize: '12px', color: '#999' }}>@{u.username}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {isOpen && !isLoading && results.length === 0 && query.trim().length >= 2 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: '#ffffff',
            border: '2px solid #1A4731',
            borderTop: 'none',
            borderRadius: '0 0 8px 8px',
            padding: '12px 14px',
            zIndex: 100,
          }}
        >
          <p style={{ margin: 0, fontFamily: 'var(--font-alata)', fontSize: '13px', color: '#999' }}>Aucun utilisateur trouvé</p>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
