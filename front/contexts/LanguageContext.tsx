'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { userAPI } from '@/lib/api';
import { isLanguage, translate } from '@/lib/i18n';
import type { Language } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const STORAGE_KEY = 'breezy-language';
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isInitialized, user } = useAuth();
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isLanguage(stored)) setLanguageState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    if (!isInitialized || !isAuthenticated || !user?.username) return;
    userAPI.getMe()
      .then(profile => {
        if (isLanguage(profile.language)) setLanguageState(profile.language);
      })
      .catch(() => {});
  }, [isAuthenticated, isInitialized, user?.username]);

  const setLanguage = (next: Language) => setLanguageState(next);

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage,
    t: (key, vars) => translate(language, key, vars),
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
