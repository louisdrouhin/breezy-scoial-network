'use client';

import { useState, useRef, useEffect } from 'react';
import { Film, ImagePlus, Link2, X } from 'lucide-react';
import { postAPI, type MediaItem } from '@/lib/api';
import GifPickerModal from '@/components/GifPickerModal';
import { ALLOWED_MEDIA_TYPES, MAX_MEDIA_SIZE, mediaItemFromUrl } from '@/lib/media';

interface MobilePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
}

export default function MobilePostModal({ isOpen, onClose, onPostCreated }: MobilePostModalProps) {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [remoteMedia, setRemoteMedia] = useState<MediaItem | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState('');
  const [isMediaUrlOpen, setIsMediaUrlOpen] = useState(false);
  const [isGifPickerOpen, setIsGifPickerOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const charLimit = 280;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '100px';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [content]);

  const extractTags = (text: string): string[] =>
    [...new Set(text.match(/#(\w+)/g)?.map(t => t.slice(1)) ?? [])];

  const revokeObjectUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  useEffect(() => {
    return revokeObjectUrl;
  }, []);

  const clearMedia = () => {
    revokeObjectUrl();
    setMediaFile(null);
    setRemoteMedia(null);
    setMediaPreview(null);
    setMediaUrl('');
    setIsMediaUrlOpen(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!ALLOWED_MEDIA_TYPES.includes(file.type)) {
      setError('Format non supporté (jpeg, png, webp, gif uniquement)');
      return;
    }
    if (file.size > MAX_MEDIA_SIZE) {
      setError('Fichier trop volumineux (10 Mo max)');
      return;
    }

    revokeObjectUrl();
    const previewUrl = URL.createObjectURL(file);
    objectUrlRef.current = previewUrl;
    setError(null);
    setMediaFile(file);
    setRemoteMedia(null);
    setMediaPreview(previewUrl);
    setIsMediaUrlOpen(false);
  };

  const handleMediaUrlChange = (value: string) => {
    const media = mediaItemFromUrl(value);
    revokeObjectUrl();
    setError(null);
    setMediaFile(null);
    setMediaUrl(value);
    setRemoteMedia(media);
    setMediaPreview(media?.url ?? null);
  };

  const handleGifSelect = (gif: { url: string; preview: string }) => {
    revokeObjectUrl();
    setError(null);
    setMediaFile(null);
    setRemoteMedia({ url: gif.url, type: 'gif' });
    setMediaPreview(gif.preview);
    setIsMediaUrlOpen(false);
    setIsGifPickerOpen(false);
  };

  const handlePost = async () => {
    if ((!content.trim() && !mediaFile && !remoteMedia) || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const media = remoteMedia
        ? [remoteMedia]
        : mediaFile
          ? [await postAPI.uploadMedia(mediaFile)]
          : undefined;
      const tags = extractTags(content);
      await postAPI.create(content.trim(), tags, undefined, media);
      setContent('');
      clearMedia();
      onClose();
      onPostCreated?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to publish post');
    } finally {
      setIsLoading(false);
    }
  };

  const getRatio = content.length / charLimit;
  const color = getRatio < 0.7
    ? '#1A4731'
    : `rgb(${Math.round(26 + (220 - 26) * (getRatio - 0.7) / 0.3)}, ${Math.round(71 + (38 - 71) * (getRatio - 0.7) / 0.3)}, ${Math.round(49 + (38 - 49) * (getRatio - 0.7) / 0.3)})`;
  const hasMedia = mediaFile !== null || remoteMedia !== null;
  const canPost = (content.trim() !== '' || hasMedia) && content.length <= charLimit && !isLoading;

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

        {mediaPreview && (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <img
              src={mediaPreview}
              alt=""
              style={{ maxWidth: '100%', maxHeight: '260px', borderRadius: '8px', border: '1px solid #1A4731', display: 'block' }}
            />
            <button
              onClick={clearMedia}
              title="Retirer"
              style={{ position: 'absolute', top: '8px', right: '8px', width: '30px', height: '30px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {isMediaUrlOpen && mediaFile === null && (
          <input
            value={mediaUrl}
            onChange={e => handleMediaUrlChange(e.target.value)}
            placeholder="Coller un lien média"
            style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid #1A4731', borderRadius: '8px', fontFamily: 'var(--font-alata)', fontSize: '14px', color: '#1A4731', outline: 'none' }}
          />
        )}

        {error && (
          <p style={{ margin: 0, color: '#dc2626', fontFamily: 'var(--font-alata)', fontSize: '13px' }}>{error}</p>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || hasMedia}
              title="Ajouter une image ou un GIF"
              style={{ background: 'none', border: 'none', cursor: isLoading || hasMedia ? 'not-allowed' : 'pointer', color: '#1A4731', padding: '4px', display: 'flex', opacity: isLoading || hasMedia ? 0.4 : 1 }}
            >
              <ImagePlus size={20} />
            </button>
            <button
              onClick={() => setIsMediaUrlOpen(prev => !prev)}
              disabled={isLoading || mediaFile !== null}
              title="Ajouter un média par URL"
              style={{ background: 'none', border: 'none', cursor: isLoading || mediaFile !== null ? 'not-allowed' : 'pointer', color: '#1A4731', padding: '4px', display: 'flex', opacity: isLoading || mediaFile !== null ? 0.4 : 1 }}
            >
              <Link2 size={20} />
            </button>
            <button
              onClick={() => setIsGifPickerOpen(true)}
              disabled={isLoading || hasMedia}
              title="Choisir un GIF Klipy"
              style={{ background: 'none', border: 'none', cursor: isLoading || hasMedia ? 'not-allowed' : 'pointer', color: '#1A4731', padding: '4px', display: 'flex', opacity: isLoading || hasMedia ? 0.4 : 1 }}
            >
              <Film size={20} />
            </button>
            <span style={{ fontFamily: 'var(--font-alata)', fontSize: '12px', color }}>{content.length}/{charLimit}</span>
          </div>
          <button
            onClick={handlePost}
            disabled={!canPost}
            style={{
              padding: '10px 24px', backgroundColor: '#1A4731', color: 'white', border: 'none',
              borderRadius: '6px', fontFamily: 'var(--font-rubik)', fontSize: '14px', fontWeight: 'bold',
              cursor: canPost ? 'pointer' : 'not-allowed',
              opacity: canPost ? 1 : 0.5,
            }}
          >
            {isLoading ? '...' : 'Post'}
          </button>
        </div>
      </div>

      {isGifPickerOpen && (
        <GifPickerModal
          onSelect={handleGifSelect}
          onClose={() => setIsGifPickerOpen(false)}
        />
      )}
    </>
  );
}
