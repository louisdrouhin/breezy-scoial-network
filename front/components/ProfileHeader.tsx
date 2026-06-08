'use client';

import { useState } from 'react';
import { MoreVertical } from 'lucide-react';

interface ProfileHeaderProps {
  displayName?: string;
  username?: string;
  bio?: string;
  followers?: number;
  following?: number;
}

export default function ProfileHeader({
  displayName = 'John Doe',
  username = 'johndoe',
  bio = 'This is my bio',
  followers = 1234,
  following = 567,
}: ProfileHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div style={{ marginBottom: '32px' }}>
      {/* Banner */}
      <div
        style={{
          width: '100%',
          height: '200px',
          backgroundColor: '#1A4731',
          borderRadius: '8px',
          marginBottom: '-50px',
          position: 'relative',
          zIndex: 1,
        }}
      />

      {/* Profile Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #1A4731',
          borderRadius: '8px',
          padding: '32px 24px',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* 3 dots menu - Top right */}
        <div style={{ position: 'absolute', top: '16px', right: '16px' }}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MoreVertical size={20} style={{ color: '#1A4731' }} />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                backgroundColor: '#ffffff',
                border: '1px solid #1A4731',
                borderRadius: '6px',
                minWidth: '150px',
                zIndex: 10,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                marginTop: '8px',
              }}
            >
              <button
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  background: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-alata)',
                  color: '#1A4731',
                  borderBottom: '1px solid #F4F5F4',
                }}
              >
                Edit Banner
              </button>
              <button
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  background: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-alata)',
                  color: '#1A4731',
                  borderBottom: '1px solid #F4F5F4',
                }}
              >
                Edit Photo
              </button>
              <button
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  background: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-alata)',
                  color: '#1A4731',
                }}
              >
                Edit Bio
              </button>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '24px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              backgroundColor: '#1A4731',
              border: '4px solid #ffffff',
              flexShrink: 0,
            }}
          />

          {/* User Info */}
          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: '8px' }}>
              <h1
                style={{
                  fontFamily: 'var(--font-rubik)',
                  color: '#1A4731',
                  margin: 0,
                  marginBottom: '4px',
                  fontSize: '24px',
                }}
              >
                {displayName}
              </h1>
              <p
                style={{
                  fontFamily: 'var(--font-alata)',
                  color: '#999',
                  margin: 0,
                  fontSize: '14px',
                }}
              >
                @{username}
              </p>
            </div>

            <p
              style={{
                fontFamily: 'var(--font-alata)',
                color: '#666',
                margin: 0,
                marginBottom: '16px',
              }}
            >
              {bio}
            </p>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '32px' }}>
              <div>
                <p
                  style={{
                    fontFamily: 'var(--font-rubik)',
                    color: '#1A4731',
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: 'bold',
                  }}
                >
                  {followers}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-alata)',
                    color: '#666',
                    margin: 0,
                    fontSize: '12px',
                  }}
                >
                  Followers
                </p>
              </div>
              <div>
                <p
                  style={{
                    fontFamily: 'var(--font-rubik)',
                    color: '#1A4731',
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: 'bold',
                  }}
                >
                  {following}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-alata)',
                    color: '#666',
                    margin: 0,
                    fontSize: '12px',
                  }}
                >
                  Following
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
