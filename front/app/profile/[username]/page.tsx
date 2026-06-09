'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import ProfileHeader from '@/components/ProfileHeader';
import Post from '@/components/Post';

interface ProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const router = useRouter();
  const { username } = use(params);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#F4F5F4',
      }}
      className="profile-container"
    >
      {/* Center Column */}
      <div
        style={{ flex: '0 0 100%', paddingRight: '20px', paddingLeft: '20px' }}
      >
        <div className="profile-header" style={{ marginTop: '20px' }}>
          <ProfileHeader
            displayName="User Name"
            username={username}
            bio="User bio will be displayed here"
            followers={0}
            following={0}
          />
        </div>

        {/* User Posts */}
        <div style={{ marginBottom: '24px' }}>
          <h2
            style={{
              fontFamily: 'var(--font-rubik)',
              color: '#1A4731',
              marginBottom: '16px',
            }}
          >
            Posts
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-alata)',
              color: '#999',
              textAlign: 'center',
              padding: '40px',
            }}
          >
            No posts yet
          </p>
        </div>
      </div>
    </div>
  );
}
