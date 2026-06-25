'use client';

import { create } from 'zustand';

export type AccessRole = 'USER' | 'MODERATOR' | 'ADMIN';

export interface AccessUser {
  username: string;
  role: AccessRole | null;
}

interface SyncAuthInput {
  user: {
    username?: string | null;
    role?: string | null;
  } | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

interface AccessState {
  user: AccessUser | null;
  role: AccessRole | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  syncFromAuth: (input: SyncAuthInput) => void;
  clearAccess: () => void;
  isOwner: (username?: string | null) => boolean;
  isAdmin: () => boolean;
  isModerator: () => boolean;
  canEditPost: (authorUsername?: string | null) => boolean;
  canDeletePost: (authorUsername?: string | null) => boolean;
  canFollow: (username?: string | null) => boolean;
}

export function normalizeRole(role?: string | null): AccessRole | null {
  if (!role) return null;

  const normalized = role.trim().toUpperCase();
  if (normalized === 'MOD') return 'MODERATOR';
  if (normalized === 'USER' || normalized === 'MODERATOR' || normalized === 'ADMIN') {
    return normalized;
  }

  return null;
}

export const useAccessStore = create<AccessState>((set, get) => ({
  user: null,
  role: null,
  isAuthenticated: false,
  isInitialized: false,

  syncFromAuth: ({ user, isAuthenticated, isInitialized }) => {
    const username = user?.username ?? null;
    const role = normalizeRole(user?.role);
    const hasUser = Boolean(isAuthenticated && username);

    set({
      user: hasUser ? { username: username!, role } : null,
      role: hasUser ? role : null,
      isAuthenticated: hasUser,
      isInitialized,
    });
  },

  clearAccess: () => set({
    user: null,
    role: null,
    isAuthenticated: false,
    isInitialized: true,
  }),

  isOwner: (username) => {
    const currentUsername = get().user?.username;
    return Boolean(currentUsername && username && currentUsername === username);
  },

  isAdmin: () => get().role === 'ADMIN',

  isModerator: () => get().role === 'MODERATOR',

  canEditPost: (authorUsername) => get().isOwner(authorUsername),

  canDeletePost: (authorUsername) => {
    return get().isOwner(authorUsername) || get().isAdmin() || get().isModerator();
  },

  canFollow: (username) => {
    const state = get();
    return Boolean(state.isAuthenticated && username && !state.isOwner(username));
  },
}));
