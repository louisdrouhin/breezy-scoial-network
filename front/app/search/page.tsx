'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { userAPI } from '@/lib/api';

interface SearchResult {
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await userAPI.search(q);
        setResults(data);
        setSearched(true);
      } catch {
        setResults([]);
        setSearched(true);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, [query]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F4F5F4', paddingBottom: '80px' }} className="search-container">
      <div style={{ flex: 1, padding: '20px' }} className="search-inner">

        <h1 style={{ fontFamily: 'var(--font-rubik)', color: '#1A4731', margin: '0 0 16px 0', fontSize: '28px' }}>
          Search
        </h1>

        {/* Input */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '2px solid #1A4731',
          borderRadius: '8px',
          padding: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '16px',
        }}>
          <Search size={20} style={{ color: '#1A4731', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a user..."
            style={{
              flex: 1, border: 'none', outline: 'none',
              fontFamily: 'var(--font-alata)', color: '#1A4731',
              fontSize: '16px', backgroundColor: 'transparent',
            }}
          />
          {isLoading && (
            <div style={{ width: '16px', height: '16px', border: '2px solid #1A4731', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite', flexShrink: 0 }} />
          )}
        </div>

        {/* État vide */}
        {!searched && !isLoading && (
          <p style={{ textAlign: 'center', paddingTop: '60px', fontFamily: 'var(--font-alata)', color: '#999', fontSize: '14px' }}>
            Start typing to search
          </p>
        )}

        {/* Aucun résultat */}
        {searched && results.length === 0 && !isLoading && (
          <p style={{ textAlign: 'center', paddingTop: '40px', fontFamily: 'var(--font-alata)', color: '#999', fontSize: '14px' }}>
            No users found for &quot;{query}&quot;
          </p>
        )}

        {/* Résultats */}
        {results.length > 0 && (
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #1A4731', borderRadius: '8px', overflow: 'hidden' }}>
            {results.map((u, i) => (
              <div
                key={u.username}
                onClick={() => router.push(`/profile/${u.username}`)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '14px 16px', cursor: 'pointer',
                  borderBottom: i < results.length - 1 ? '1px solid #F4F5F4' : 'none',
                }}
              >
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#1A4731', flexShrink: 0, overflow: 'hidden' }}>
                  {u.avatarUrl ? (
                    <img src={u.avatarUrl} alt={u.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: 'white', fontFamily: 'var(--font-alata)', fontSize: '16px' }}>
                        {u.username[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <p style={{ margin: 0, fontFamily: 'var(--font-rubik)', fontSize: '15px', fontWeight: 600, color: '#1A4731' }}>
                    {u.displayName ?? u.username}
                  </p>
                  <p style={{ margin: 0, fontFamily: 'var(--font-alata)', fontSize: '13px', color: '#999' }}>
                    @{u.username}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
