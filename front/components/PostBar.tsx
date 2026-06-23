'use client';

import { useState, useRef, useEffect } from 'react';
import { postAPI, Post } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useProfileCache } from '@/hooks/useProfileCache';

interface PostBarProps {
  onPostCreated?: (post?: Post) => void;
  parentId?: string;
  placeholder?: string;
}

export default function PostBar({ onPostCreated, parentId, placeholder = 'Something to say?' }: PostBarProps) {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();
  const { cache, loadProfiles } = useProfileCache();

  useEffect(() => {
    if (user) loadProfiles([user.username]);
  }, [user?.username]);

  const avatarUrl = user ? cache[user.username]?.avatarUrl : null;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [text]);

  const extractTags = (content: string): string[] => {
    return [...new Set(content.match(/#(\w+)/g)?.map(t => t.slice(1)) ?? [])];
  };

  const handleSubmit = async () => {
    if (!text.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const tags = extractTags(text);
      const post = await postAPI.create(text.trim(), tags, parentId);
      setText('');
      onPostCreated?.(post);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la publication');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '2px solid #1A4731',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
      }}
    >
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#1A4731', flexShrink: 0, overflow: 'hidden' }}>
          {avatarUrl ? (
            <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : user ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: 'white', fontFamily: 'var(--font-alata)', fontSize: '18px' }}>
                {user.username[0].toUpperCase()}
              </span>
            </div>
          ) : null}
        </div>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            if (e.target.value.length <= 280) setText(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder={placeholder}
          maxLength={280}
          style={{
            flex: 1,
            minHeight: '100px',
            padding: '12px',
            border: 'none',
            borderRadius: '4px',
            fontFamily: 'var(--font-alata)',
            color: '#1A4731',
            fontSize: '16px',
            resize: 'none',
            outline: 'none',
            overflow: 'hidden',
          }}
        />
      </div>
      {error && (
        <div style={{ color: '#dc2626', fontFamily: 'var(--font-alata)', fontSize: '13px', marginBottom: '8px' }}>
          {error}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
        {(() => {
          const remaining = 280 - text.length;
          const percentRemaining = remaining / 28;
          let color = '#1A4731';
          if (percentRemaining < 1) {
            const ratio = Math.max(0, percentRemaining);
            const red = Math.round(26 + (220 - 26) * (1 - ratio));
            const green = Math.round(71 - 71 * (1 - ratio));
            const blue = Math.round(49 - 49 * (1 - ratio));
            color = `rgb(${red}, ${green}, ${blue})`;
          }
          return (
            <div style={{ fontSize: '12px', color, fontFamily: 'var(--font-alata)' }}>
              {text.length}/280
            </div>
          );
        })()}

        <button
          onClick={handleSubmit}
          disabled={!text.trim() || isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#1A4731',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontFamily: 'var(--font-alata)',
            cursor: !text.trim() || isLoading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            opacity: !text.trim() || isLoading ? 0.6 : 1,
          }}
        >
          {isLoading ? '...' : 'Post'}
        </button>
      </div>
    </div>
  );
}
