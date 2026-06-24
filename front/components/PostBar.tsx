'use client';

import { useState, useRef, useEffect } from 'react';
import { Film, ImagePlus, X } from 'lucide-react';
import { postAPI, Post, MediaItem } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useProfileCache } from '@/hooks/useProfileCache';
import GifPickerModal from '@/components/GifPickerModal';

const ALLOWED_MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_MEDIA_SIZE = 10 * 1024 * 1024; // 10 Mo, aligné sur post-svc

interface PostBarProps {
  onPostCreated?: (post?: Post) => void;
  parentId?: string;
  placeholder?: string;
}

export default function PostBar({ onPostCreated, parentId, placeholder = 'Something to say?' }: PostBarProps) {
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [remoteMedia, setRemoteMedia] = useState<MediaItem | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isGifPickerOpen, setIsGifPickerOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
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

  const revokeObjectUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  // Libère l'URL d'aperçu locale au démontage pour éviter une fuite mémoire.
  useEffect(() => {
    return revokeObjectUrl;
  }, []);

  const extractTags = (content: string): string[] => {
    return [...new Set(content.match(/#(\w+)/g)?.map(t => t.slice(1)) ?? [])];
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // permet de re-sélectionner le même fichier
    if (!file) return;
    if (!ALLOWED_MEDIA_TYPES.includes(file.type)) {
      setError('Format non supporté (jpeg, png, webp, gif uniquement)');
      return;
    }
    if (file.size > MAX_MEDIA_SIZE) {
      setError('Fichier trop volumineux (10 Mo max)');
      return;
    }
    setError(null);
    revokeObjectUrl();
    const previewUrl = URL.createObjectURL(file);
    objectUrlRef.current = previewUrl;
    setMediaFile(file);
    setRemoteMedia(null);
    setMediaPreview(previewUrl);
  };

  const handleGifSelect = (gif: { url: string; preview: string }) => {
    revokeObjectUrl();
    setError(null);
    setMediaFile(null);
    setRemoteMedia({ url: gif.url, type: 'gif' });
    setMediaPreview(gif.preview);
    setIsGifPickerOpen(false);
  };

  const clearMedia = () => {
    revokeObjectUrl();
    setMediaFile(null);
    setRemoteMedia(null);
    setMediaPreview(null);
  };

  const handleSubmit = async () => {
    // Un post nécessite du texte OU un média.
    if ((!text.trim() && !mediaFile && !remoteMedia) || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const media = remoteMedia
        ? [remoteMedia]
        : mediaFile
          ? [await postAPI.uploadMedia(mediaFile)]
          : undefined;
      const tags = extractTags(text);
      const post = await postAPI.create(text.trim(), tags, parentId, media);
      setText('');
      clearMedia();
      onPostCreated?.(post);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to publish post');
    } finally {
      setIsLoading(false);
    }
  };

  const hasMedia = mediaFile !== null || remoteMedia !== null;
  const canSubmit = (text.trim() !== '' || hasMedia) && !isLoading;

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

      {/* Aperçu du média sélectionné */}
      {mediaPreview && (
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '12px' }}>
          <img
            src={mediaPreview}
            alt="aperçu"
            style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', border: '1px solid #1A4731', display: 'block' }}
          />
          <button
            onClick={clearMedia}
            title="Retirer"
            style={{ position: 'absolute', top: '8px', right: '8px', width: '28px', height: '28px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div style={{ color: '#dc2626', fontFamily: 'var(--font-alata)', fontSize: '13px', marginBottom: '8px' }}>
          {error}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || hasMedia}
            title="Ajouter une image ou un GIF"
            style={{
              background: 'none',
              border: 'none',
              cursor: isLoading || hasMedia ? 'not-allowed' : 'pointer',
              color: '#1A4731',
              padding: '4px',
              display: 'flex',
              opacity: isLoading || hasMedia ? 0.4 : 1,
            }}
          >
            <ImagePlus size={20} />
          </button>
          <button
            onClick={() => setIsGifPickerOpen(true)}
            disabled={isLoading || hasMedia}
            title="Choisir un GIF Klipy"
            style={{
              background: 'none',
              border: 'none',
              cursor: isLoading || hasMedia ? 'not-allowed' : 'pointer',
              color: '#1A4731',
              padding: '4px',
              display: 'flex',
              opacity: isLoading || hasMedia ? 0.4 : 1,
            }}
          >
            <Film size={20} />
          </button>

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
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{
            padding: '10px 20px',
            backgroundColor: '#1A4731',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontFamily: 'var(--font-alata)',
            cursor: !canSubmit ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            opacity: !canSubmit ? 0.6 : 1,
          }}
        >
          {isLoading ? '...' : 'Post'}
        </button>
      </div>

      {isGifPickerOpen && (
        <GifPickerModal
          onSelect={handleGifSelect}
          onClose={() => setIsGifPickerOpen(false)}
        />
      )}
    </div>
  );
}
