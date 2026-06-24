'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function ProfileRedirect() {
  const { user, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;
    if (user) {
      router.replace(`/profile/${user.username}`);
    } else {
      router.replace('/login');
    }
  }, [user, isInitialized, router]);

  return null;
}
