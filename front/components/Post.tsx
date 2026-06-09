'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle, Share2 } from 'lucide-react';

interface PostProps {
  id?: string;
  displayName?: string;
  username?: string;
  content: string;
  createdAt: Date;
  initialLikes?: number;
  initialComments?: number;
}

export default function Post({
  id = '1',
  displayName = 'User Name',
  username = 'username',
  content = 'This is a sample post content',
  createdAt = new Date(),
  initialLikes = 0,
  initialComments = 0,
}: PostProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState(initialComments);
  const [copied, setCopied] = useState(false);

  const handleLike = () => {
    if (isLiked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setIsLiked(!isLiked);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const copyToClipboard = (id: string, author: string) => {
    const url = `${window.location.origin}/${author}/status/${id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #1A4731',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
      }}
    >
      {/* Header with avatar and user info */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: '#1A4731',
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Link href={`/profile/${username}`} style={{ textDecoration: 'none' }}>
              <p
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-rubik)',
                  color: '#1A4731',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                {displayName}
              </p>
            </Link>
            <Link href={`/profile/${username}`} style={{ textDecoration: 'none' }}>
              <p
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-alata)',
                  color: '#999',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                @{username}
              </p>
            </Link>
          </div>
          <p
            style={{
              margin: 0,
              fontFamily: 'var(--font-alata)',
              color: '#666',
              fontSize: '12px',
            }}
          >
            {formatDate(createdAt)}
          </p>
        </div>
      </div>

      {/* Post content - clickable */}
      <Link href={`/${username}/status/${id}`} style={{ textDecoration: 'none' }}>
        <p
          style={{
            fontFamily: 'var(--font-alata)',
            color: '#1A4731',
            marginBottom: '16px',
            lineHeight: '1.5',
            cursor: 'pointer',
          }}
        >
          {content}
        </p>
      </Link>

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          gap: '24px',
          marginTop: '12px',
          justifyContent: 'flex-end',
        }}
      >
        <button
          onClick={handleLike}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <Heart
            size={18}
            style={{ color: isLiked ? '#dc2626' : '#1A4731', fill: isLiked ? '#dc2626' : 'none' }}
          />
          <span style={{ fontFamily: 'var(--font-alata)', color: '#1A4731', fontSize: '14px' }}>
            {likes}
          </span>
        </button>

        <Link href={`/${username}/status/${id}`} style={{ textDecoration: 'none' }}>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              color: '#1A4731',
            }}
          >
            <MessageCircle size={18} style={{ color: '#1A4731' }} />
            <span style={{ fontFamily: 'var(--font-alata)', color: '#1A4731', fontSize: '14px' }}>
              {comments}
            </span>
          </button>
        </Link>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => copyToClipboard(id, username)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              color: '#1A4731',
            }}
          >
            <Share2 size={18} style={{ color: '#1A4731' }} />
          </button>
          {copied && (
            <div
              style={{
                position: 'absolute',
                top: '-35px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: '#6CB583',
                color: '#ffffff',
                padding: '8px 14px',
                borderRadius: '4px',
                fontSize: '12px',
                fontFamily: 'var(--font-alata)',
                fontWeight: 'bold',
                whiteSpace: 'nowrap',
                zIndex: 9999,
                pointerEvents: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              Copied!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
