'use client';

import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { postAPI } from '@/lib/api';

interface MobilePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
}

export default function MobilePostModal({ isOpen, onClose, onPostCreated }: MobilePostModalProps) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const charLimit = 280;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '100px';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [content]);

  const extractTags = (text: string): string[] =>
    [...new Set(text.match(/#(\w+)/g)?.map(t => t.slice(1)) ?? [])];

  const handlePost = async () => {
    if (!content.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const tags = extractTags(content);
      await postAPI.create(content.trim(), tags);
      setContent('');
      onClose();
      onPostCreated?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur lors de la publication');
    } finally {
      setIsLoading(false);
    }
  };

  const getRatio = content.length / charLimit;
  const color = getRatio < 0.7
    ? '#1A4731'
    : `rgb(${Math.round(26 + (220 - 26) * (getRatio - 0.7) / 0.3)}, ${Math.round(71 + (38 - 71) * (getRatio - 0.7) / 0.3)}, ${Math.round(49 + (38 - 49) * (getRatio - 0.7) / 0.3)})`;

  return (
    <>
      {isOpen && (
        <div
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 998 }}
          onClick={onClose}
        />
      )}

      <div
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: '#ffffff',
          zIndex: 999,
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '20px',
          overflowY: 'auto',
        }}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', padding: '8px', zIndex: 1000 }}
        >
          <X size={24} color="#1A4731" />
        </button>

        <div style={{ marginBottom: '16px', marginTop: '8px' }}>
          <h2 style={{ fontFamily: 'var(--font-rubik)', color: '#1A4731', fontSize: '20px', margin: 0 }}>
            Create Post
          </h2>
        </div>

        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => { if (e.target.value.length <= charLimit) setContent(e.target.value); }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handlePost();
            }
          }}
          placeholder="What's on your mind?"
          style={{
            width: '100%', padding: '12px', border: '1px solid #1A4731', borderRadius: '8px',
            fontFamily: 'var(--font-alata)', fontSize: '14px', boxSizing: 'border-box',
            outline: 'none', minHeight: '100px', maxHeight: '200px', overflow: 'hidden', resize: 'none',
          }}
        />

        {error && (
          <p style={{ margin: 0, color: '#dc2626', fontFamily: 'var(--font-alata)', fontSize: '13px' }}>{error}</p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-alata)', fontSize: '12px', color }}>{content.length}/{charLimit}</span>
          <button
            onClick={handlePost}
            disabled={content.length === 0 || content.length > charLimit || isLoading}
            style={{
              padding: '10px 24px', backgroundColor: '#1A4731', color: 'white', border: 'none',
              borderRadius: '6px', fontFamily: 'var(--font-rubik)', fontSize: '14px', fontWeight: 'bold',
              cursor: content.length > 0 && content.length <= charLimit && !isLoading ? 'pointer' : 'not-allowed',
              opacity: content.length > 0 && content.length <= charLimit && !isLoading ? 1 : 0.5,
            }}
          >
            {isLoading ? '...' : 'Post'}
          </button>
        </div>
      </div>
    </>
  );
}
