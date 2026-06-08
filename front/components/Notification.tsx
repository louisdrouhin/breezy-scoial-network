'use client';

import { Trash2 } from 'lucide-react';
import { useState } from 'react';

interface NotificationProps {
  id?: string;
  type?: 'like' | 'comment' | 'follow';
  displayName?: string;
  username?: string;
  action?: string;
  timestamp?: Date;
}

export default function Notification({
  id = '1',
  type = 'like',
  displayName = 'John Doe',
  username = 'johndoe',
  action = 'liked your post',
  timestamp = new Date(),
}: NotificationProps) {
  const [isDeleted, setIsDeleted] = useState(false);

  if (isDeleted) {
    return null;
  }
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

  const getTypeColor = () => {
    switch (type) {
      case 'like':
        return '#dc2626';
      case 'comment':
        return '#1A4731';
      case 'follow':
        return '#1A4731';
      default:
        return '#1A4731';
    }
  };

  const getTypeText = () => {
    switch (type) {
      case 'like':
        return '❤️';
      case 'comment':
        return '💬';
      case 'follow':
        return '👤';
      default:
        return '📢';
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #F4F5F4',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
        position: 'relative',
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: '#1A4731',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
        }}
      >
        {getTypeText()}
      </div>

      {/* Notification Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '6px',
            marginBottom: '4px',
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: 'var(--font-rubik)',
              color: '#1A4731',
              fontWeight: 'bold',
              fontSize: '14px',
            }}
          >
            {displayName}
          </p>
          <p
            style={{
              margin: 0,
              fontFamily: 'var(--font-alata)',
              color: '#666',
              fontSize: '14px',
            }}
          >
            {action}
          </p>
        </div>

        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-alata)',
            color: '#999',
            fontSize: '12px',
          }}
        >
          {formatDate(timestamp)}
        </p>
      </div>

      {/* Bottom right: unread dot and delete button */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0,
        }}
      >
        {/* Unread indicator */}
        <div
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: '#1A4731',
          }}
        />

        {/* Delete button */}
        <button
          onClick={() => setIsDeleted(true)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#dc2626')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#999')}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
