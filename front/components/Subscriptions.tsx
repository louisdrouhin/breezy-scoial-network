'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { userAPI } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';

interface FollowingUser {
  username: string;
  avatarUrl: string | null;
}

export default function Subscriptions() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [following, setFollowing] = useState<FollowingUser[]>([]);

  useEffect(() => {
    if (!user?.username) return;
    userAPI.getFollowing(user.username)
      .then(data => setFollowing(
        data.map(e => ({
          username: e['followed.username'],
          avatarUrl: e['followed.avatarUrl'],
        }))
      ))
      .catch(() => {});
  }, [user?.username]);

  if (following.length === 0) return null;

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '2px solid #1A4731',
        borderRadius: '8px',
        padding: '16px',
        marginTop: '16px',
      }}
    >
      <h3
        style={{
          fontFamily: 'var(--font-alata)',
          color: '#1A4731',
          marginBottom: '16px',
          fontSize: '18px',
        }}
      >
        {t('profile.following')}
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {following.map((u) => (
          <a
            key={u.username}
            href={`/profile/${u.username}`}
            style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid #F4F5F4', cursor: 'pointer' }}
          >
            {u.avatarUrl ? (
              <img
                src={u.avatarUrl}
                alt={u.username}
                style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
              />
            ) : (
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#1A4731', flexShrink: 0 }} />
            )}
            <p style={{ fontFamily: 'var(--font-alata)', color: '#1A4731', margin: 0, fontSize: '14px' }}>
              @{u.username}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
