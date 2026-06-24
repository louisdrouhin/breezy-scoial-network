'use client';

import { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { postAPI, GifItem } from '@/lib/api';
import { useLanguage } from '@/contexts/LanguageContext';

interface GifPickerModalProps {
  onSelect: (gif: GifItem) => void;
  onClose: () => void;
}

export default function GifPickerModal({ onSelect, onClose }: GifPickerModalProps) {
  const [query, setQuery] = useState('');
  const [gifs, setGifs] = useState<GifItem[]>([]);
  const [next, setNext] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  // Recherche debouncée (sans query -> tendances Klipy).
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      setLoading(true);
      const data = await postAPI.searchGifs(query);
      if (cancelled) return;
      setGifs(data.results);
      setNext(data.next);
      setLoading(false);
    }, 350);
    return () => { cancelled = true; clearTimeout(t); };
  }, [query]);

  const loadMore = async () => {
    if (!next || loading) return;
    setLoading(true);
    const data = await postAPI.searchGifs(query, next);
    setGifs(prev => [...prev, ...data.results]);
    setNext(data.next);
    setLoading(false);
  };

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ backgroundColor: '#ffffff', border: '2px solid #1A4731', borderRadius: '12px', width: '100%', maxWidth: '480px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px', borderBottom: '1px solid #E0E0E0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, border: '1px solid #1A4731', borderRadius: '8px', padding: '8px 12px' }}>
            <Search size={16} style={{ color: '#999', flexShrink: 0 }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t('gif.search')}
              autoFocus
              style={{ flex: 1, border: 'none', outline: 'none', fontFamily: 'var(--font-alata)', fontSize: '14px', color: '#1A4731' }}
            />
          </div>
          <button onClick={onClose} title={t('common.close')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: '4px', display: 'flex' }}>
            <X size={20} />
          </button>
        </div>

        {/* Grille */}
        <div style={{ overflowY: 'auto', padding: '12px' }}>
          {gifs.length === 0 && !loading ? (
            <p style={{ textAlign: 'center', color: '#999', fontFamily: 'var(--font-alata)', fontSize: '14px', padding: '40px 0' }}>
              {t('gif.none')}
            </p>
          ) : (
            <div style={{ columnCount: 2, columnGap: '8px' }}>
              {gifs.map(gif => (
                <button
                  key={gif.id}
                  onClick={() => onSelect(gif)}
                  style={{ display: 'block', width: '100%', marginBottom: '8px', padding: 0, border: 'none', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', background: '#F4F5F4' }}
                >
                  <img src={gif.preview} alt="" loading="lazy" style={{ width: '100%', display: 'block' }} />
                </button>
              ))}
            </div>
          )}

          {loading && (
            <p style={{ textAlign: 'center', color: '#999', fontFamily: 'var(--font-alata)', fontSize: '13px', padding: '12px 0' }}>
              {t('gif.loading')}
            </p>
          )}

          {next && !loading && gifs.length > 0 && (
            <button
              onClick={loadMore}
              style={{ display: 'block', margin: '8px auto', padding: '8px 16px', background: 'none', border: '1px solid #1A4731', borderRadius: '6px', color: '#1A4731', fontFamily: 'var(--font-alata)', fontSize: '13px', cursor: 'pointer' }}
            >
              {t('gif.more')}
            </button>
          )}
        </div>

        {/* Attribution Klipy (requise par les conditions d'utilisation) */}
        <div style={{ padding: '8px 16px', borderTop: '1px solid #E0E0E0', textAlign: 'center', fontFamily: 'var(--font-alata)', fontSize: '11px', color: '#bbb' }}>
          {t('gif.powered')}
        </div>
      </div>
    </div>
  );
}
