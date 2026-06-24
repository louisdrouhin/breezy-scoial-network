import type { MediaItem } from '@/lib/api';

export const ALLOWED_MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const MAX_MEDIA_SIZE = 10 * 1024 * 1024; // 10 Mo, aligné sur post-svc

const GIF_RE = /\.gif(?:$|[?#])/i;

export const mediaItemFromUrl = (rawUrl: string): MediaItem | null => {
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  return {
    url: trimmed,
    type: GIF_RE.test(trimmed) ? 'gif' : 'image',
  };
};
