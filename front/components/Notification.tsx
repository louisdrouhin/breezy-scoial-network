'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NotificationProps {
  id: string;
  type: 'LIKE' | 'COMMENT' | 'NEW_FOLLOWER' | 'MENTION';
  actorUsername: string | null;
  relatedPostId: string | null;
  read: boolean;
  createdAt: string;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const TYPE_CONFIG = {
  LIKE:         { emoji: '❤️', label: 'liked your post' },
  COMMENT:      { emoji: '💬', label: 'commented on your post' },
  NEW_FOLLOWER: { emoji: '👤', label: 'started following you' },
  MENTION:      { emoji: '🔔', label: 'mentioned you' },
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString('en-US');
}

export default function Notification({ id, type, actorUsername, relatedPostId, read, createdAt, onMarkAsRead, onDelete }: NotificationProps) {
  const router = useRouter();
  const config = TYPE_CONFIG[type];

  const href = relatedPostId && actorUsername
    ? `/${actorUsername}/status/${relatedPostId}`
    : actorUsername && type === 'NEW_FOLLOWER'
    ? `/profile/${actorUsername}`
    : null;

  const handleCardClick = () => {
    if (!read) onMarkAsRead(id);
    if (href) router.push(href);
  };

  return (
    <div
      style={{
        backgroundColor: read ? '#ffffff' : '#f0f7f3',
        border: `1px solid ${read ? '#F4F5F4' : '#1A4731'}`,
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
        cursor: href ? 'pointer' : 'default',
        transition: 'background-color 0.15s',
      }}
    >
      {/* Icône */}
      <div
        onClick={handleCardClick}
        style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#1A4731', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}
      >
        {config.emoji}
      </div>

      {/* Contenu cliquable */}
      <div onClick={handleCardClick} style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: '0 0 4px 0', fontFamily: 'var(--font-alata)', fontSize: '14px', color: '#333' }}>
          {actorUsername ? (
            <span style={{ fontFamily: 'var(--font-rubik)', fontWeight: 'bold', color: '#1A4731' }}>@{actorUsername} </span>
          ) : null}
          <span>{config.label}</span>
        </p>
        <p style={{ margin: 0, fontFamily: 'var(--font-alata)', color: '#999', fontSize: '12px' }}>
          {formatDate(createdAt)}
        </p>
      </div>

      {/* Actions — isolées, ne propagent pas */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {!read && (
          <button
            onClick={() => onMarkAsRead(id)}
            title="Marquer comme lu"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex' }}
          >
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#1A4731' }} />
          </button>
        )}
        <button
          onClick={() => onDelete(id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#999', display: 'flex' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#dc2626')}
          onMouseLeave={e => (e.currentTarget.style.color = '#999')}
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
