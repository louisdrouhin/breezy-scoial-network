import type { Language } from '@/lib/i18n';

// En browser, on utilise l'origine courante (protocole+host+port) pour passer par le proxy Next.js
// En SSR, on appelle Nginx directement via variable d'env ou fallback interne
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://nginx');

// ----------------------------------------------------------------
// Fetch avec refresh automatique sur 401
// ----------------------------------------------------------------

let isRefreshing = false;
let refreshQueue: Array<() => void> = [];

async function fetchWithAuth(input: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, { credentials: 'include', ...init });

  if (res.status !== 401) return res;

  // Évite plusieurs refreshs simultanés
  if (isRefreshing) {
    await new Promise<void>(resolve => refreshQueue.push(resolve));
    return fetch(input, { credentials: 'include', ...init });
  }

  isRefreshing = true;
  try {
    const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!refreshRes.ok) {
      // Refresh échoué → on laisse passer le 401 original
      return res;
    }

    refreshQueue.forEach(r => r());
    refreshQueue = [];

    return fetch(input, { credentials: 'include', ...init });
  } finally {
    isRefreshing = false;
  }
}

// ----------------------------------------------------------------
// Types
// ----------------------------------------------------------------

export interface RegisterPayload { username: string; displayName: string; email: string; password: string }
export interface LoginPayload { email: string; password: string }
export interface RegisterResponse { username: string; email: string; role: string }
export interface LoginResponse { username: string; email: string; role: string }
export interface RefreshResponse { message: string }

export interface MediaItem {
  url: string;
  type: 'image' | 'gif';
}

export interface GifItem {
  id: string;
  preview: string;
  url: string;
}

export interface Post {
  _id: string;
  authorUsername: string;
  content: string;
  media?: MediaItem[];
  tags: string[];
  parent: string | null;
  likeCount: number;
  replyCount: number;
  edited: boolean;
  deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  notifLikes: boolean;
  notifMentions: boolean;
  notifFollows: boolean;
  language?: Language;
  createdAt: string;
  updatedAt: string;
}

export interface FollowEntry {
  'followed.username': string;
  'followed.avatarUrl': string | null;
}

export interface FollowerEntry {
  'follower.username': string;
  'follower.avatarUrl': string | null;
}

export interface Notif {
  _id: string;
  recipientUsername: string;
  actorUsername: string | null;
  type: 'MENTION' | 'LIKE' | 'NEW_FOLLOWER' | 'COMMENT';
  relatedPostId: string | null;
  read: boolean;
  created_at: string;
}

export interface FeedResponse {
  posts: Post[];
  hasMore: boolean;
}

export interface LikeResponse {
  liked: boolean;
  count: number;
}

// ----------------------------------------------------------------
// Auth API  (fetch natif — pas de fetchWithAuth pour éviter les boucles)
// ----------------------------------------------------------------

export const authAPI = {
  register: async (payload: RegisterPayload): Promise<RegisterResponse> => {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Registration failed') }
    return res.json();
  },

  login: async (payload: LoginPayload): Promise<LoginResponse> => {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include',
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Login failed') }
    return res.json();
  },

  refresh: async (): Promise<RefreshResponse> => {
    const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Token refresh failed');
    return res.json();
  },

  updateAccount: async (payload: { email?: string; password?: string; currentPassword: string }): Promise<{ username: string; email: string }> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/api/auth/me`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Échec de la mise à jour') }
    return res.json();
  },

  logout: async (): Promise<void> => {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
  },

  validate: async (token: string): Promise<boolean> => {
    const res = await fetch(`${API_BASE_URL}/api/auth/validate`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return res.ok;
  },
};

// ----------------------------------------------------------------
// Post API
// ----------------------------------------------------------------

export const postAPI = {
  create: async (content: string, tags?: string[], parentId?: string, media?: MediaItem[]): Promise<Post> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/api/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, tags, parentId, media }),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Failed to create post') }
    const data = await res.json();
    return data.post;
  },

  // Recherche de GIF via le proxy Klipy de post-svc (sans query -> tendances).
  searchGifs: async (q: string, pos?: string): Promise<{ results: GifItem[]; next: string | null }> => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (pos) params.set('pos', pos);
    const res = await fetchWithAuth(`${API_BASE_URL}/api/gifs?${params}`);
    if (!res.ok) return { results: [], next: null };
    return res.json();
  },

  // Upload d'un média (image / GIF) attaché ensuite à un post via create().
  uploadMedia: async (file: File): Promise<MediaItem> => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetchWithAuth(`${API_BASE_URL}/api/posts/media`, {
      method: 'POST',
      body: form,
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.message || 'Failed to upload media') }
    return res.json();
  },

  getById: async (id: string): Promise<Post> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/api/posts/${id}`);
    if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Post not found') }
    const data = await res.json();
    return data.post;
  },

  getReplies: async (id: string, page = 1, limit = 20): Promise<Post[]> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/api/posts/${id}/replies?page=${page}&limit=${limit}`);
    if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Failed to fetch replies') }
    return res.json();
  },

  // Chaîne des posts parents (racine -> parent direct) du post donné.
  getAncestors: async (id: string): Promise<Post[]> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/api/posts/${id}/ancestors`);
    if (!res.ok) return [];
    return res.json();
  },

  getByUser: async (username: string, page = 1, limit = 20, type?: 'posts' | 'replies'): Promise<Post[]> => {
    const typeParam = type ? `&type=${type}` : '';
    const res = await fetchWithAuth(`${API_BASE_URL}/api/posts/user/${username}?page=${page}&limit=${limit}${typeParam}`);
    if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Failed to fetch posts') }
    return res.json();
  },

  update: async (id: string, content: string, media?: MediaItem[]): Promise<Post> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/api/posts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(media === undefined ? { content } : { content, media }),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Failed to update post') }
    const data = await res.json();
    return data.post;
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/api/posts/${id}`, { method: 'DELETE' });
    if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Failed to delete post') }
  },

  getLikeStatus: async (id: string): Promise<{ liked: boolean }> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/api/posts/${id}/like`);
    if (!res.ok) return { liked: false };
    return res.json();
  },

  like: async (id: string): Promise<LikeResponse> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/api/posts/${id}/like`, { method: 'POST' });
    if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Failed to like post') }
    return res.json();
  },

  unlike: async (id: string): Promise<LikeResponse> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/api/posts/${id}/like`, { method: 'DELETE' });
    if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Failed to unlike post') }
    return res.json();
  },

  getByTag: async (tag: string, page = 1, limit = 20): Promise<Post[]> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/api/posts/tags/${encodeURIComponent(tag)}?page=${page}&limit=${limit}`);
    if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Failed to fetch posts') }
    return res.json();
  },
};

// ----------------------------------------------------------------
// Feed API
// ----------------------------------------------------------------

export const feedAPI = {
  get: async (page = 1): Promise<FeedResponse> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/api/feed?page=${page}`);
    if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Failed to fetch feed') }
    return res.json();
  },
};

// ----------------------------------------------------------------
// Notif API
// ----------------------------------------------------------------

export const notifAPI = {
  getAll: async (): Promise<Notif[]> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/api/notifs`);
    if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Failed to fetch notifications') }
    return res.json();
  },

  markAsRead: async (id: string): Promise<void> => {
    await fetchWithAuth(`${API_BASE_URL}/api/notifs/${id}/read`, { method: 'PATCH' });
  },

  markAllAsRead: async (): Promise<void> => {
    await fetchWithAuth(`${API_BASE_URL}/api/notifs/read-all`, { method: 'PATCH' });
  },

  delete: async (id: string): Promise<void> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/api/notifs/${id}`, { method: 'DELETE' });
    if (!res.ok && res.status !== 204) { const e = await res.json().catch(() => ({})); throw new Error(e.message || 'Failed to delete notification') }
  },
};

// ----------------------------------------------------------------
// User API
// ----------------------------------------------------------------

export const userAPI = {
  search: async (q: string): Promise<Pick<Profile, 'username' | 'displayName' | 'avatarUrl'>[]> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/api/users/search?q=${encodeURIComponent(q)}`);
    if (!res.ok) return [];
    return res.json();
  },

  getProfile: async (username: string): Promise<Profile> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/api/users/${username}`);
    if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Profile not found') }
    return res.json();
  },

  getMe: async (): Promise<Profile> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/api/users/me`);
    if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Failed to fetch profile') }
    return res.json();
  },

  updateMe: async (data: { displayName?: string | null; bio?: string | null; notifLikes?: boolean; notifMentions?: boolean; notifFollows?: boolean; language?: Language }): Promise<Profile> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/api/users/me`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Failed to update profile') }
    return res.json();
  },

  uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetchWithAuth(`${API_BASE_URL}/api/users/me/avatar`, {
      method: 'POST',
      body: form,
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to upload avatar') }
    return res.json();
  },

  uploadBanner: async (file: File): Promise<{ bannerUrl: string }> => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetchWithAuth(`${API_BASE_URL}/api/users/me/banner`, {
      method: 'POST',
      body: form,
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Failed to upload banner') }
    return res.json();
  },

  getFollowers: async (username: string): Promise<FollowerEntry[]> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/api/users/${username}/followers`);
    if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Failed to fetch followers') }
    return res.json();
  },

  getFollowing: async (username: string): Promise<FollowEntry[]> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/api/users/${username}/following`);
    if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Failed to fetch following') }
    return res.json();
  },

  follow: async (username: string): Promise<void> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/api/users/${username}/follow`, { method: 'POST' });
    if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Failed to follow user') }
  },

  unfollow: async (username: string): Promise<void> => {
    const res = await fetchWithAuth(`${API_BASE_URL}/api/users/${username}/follow`, { method: 'DELETE' });
    if (!res.ok) { const e = await res.json(); throw new Error(e.message || 'Failed to unfollow user') }
  },
};
