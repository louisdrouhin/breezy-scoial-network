'use client';

import { useState, useRef, useCallback } from 'react';
import { userAPI } from '@/lib/api';

type ProfileEntry = { avatarUrl: string | null; displayName: string | null };
type ProfileCache = Record<string, ProfileEntry>;

// Cache module-level : survit aux navigations
const globalCache: ProfileCache = {};
const fetched = new Set<string>();

export function useProfileCache() {
  const [, forceUpdate] = useState(0);

  const loadProfiles = useCallback(async (usernames: string[]) => {
    const toFetch = [...new Set(usernames)].filter(u => !fetched.has(u));
    if (toFetch.length === 0) return;

    toFetch.forEach(u => fetched.add(u));

    const results = await Promise.allSettled(toFetch.map(u => userAPI.getProfile(u)));
    results.forEach((r, i) => {
      globalCache[toFetch[i]] = r.status === 'fulfilled'
        ? { avatarUrl: r.value.avatarUrl, displayName: r.value.displayName }
        : { avatarUrl: null, displayName: null };
    });

    forceUpdate(n => n + 1);
  }, []);

  return { cache: globalCache, loadProfiles };
}
