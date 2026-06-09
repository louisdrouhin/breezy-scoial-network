'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, MessageCircle } from 'lucide-react';
import { mockComments, getReplyCount, type Comment } from '@/lib/commentsData';

interface CommentSectionMainProps {
  postId: string;
}

export default function CommentSectionMain({ postId }: CommentSectionMainProps) {
  const [comments] = useState<Comment[]>(mockComments);
  const [mainComment, setMainComment] = useState('');
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const handleAddComment = () => {
    if (mainComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        displayName: 'Your Name',
        username: 'yourusername',
        content: mainComment,
        createdAt: new Date(),
        likes: 0,
        replies: [],
      };
      setComments([...comments, comment]);
      setMainComment('');
    }
  };

  const toggleLike = (commentId: string) => {
    const newLiked = new Set(likedComments);
    if (newLiked.has(commentId)) {
      newLiked.delete(commentId);
    } else {
      newLiked.add(commentId);
    }
    setLikedComments(newLiked);
  };


  return (
    <div>
      {/* Main Comment Input - Top */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          paddingBottom: '24px',
          borderBottom: '1px solid #F4F5F4',
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
          <textarea
            value={mainComment}
            onChange={(e) => setMainComment(e.target.value)}
            placeholder="Add a comment..."
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #E0E0E0',
              borderRadius: '8px',
              fontFamily: 'var(--font-alata)',
              fontSize: '14px',
              boxSizing: 'border-box',
              outline: 'none',
              minHeight: '80px',
              resize: 'none',
            }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '8px',
            }}
          >
            <button
              onClick={handleAddComment}
              disabled={mainComment.trim().length === 0}
              style={{
                padding: '8px 16px',
                backgroundColor: '#1A4731',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontFamily: 'var(--font-rubik)',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: mainComment.trim().length > 0 ? 'pointer' : 'not-allowed',
                opacity: mainComment.trim().length > 0 ? 1 : 0.5,
              }}
            >
              Comment
            </button>
          </div>
        </div>
      </div>

      {/* Comments List - Only main comments */}
      <div>
        <h3
          style={{
            fontFamily: 'var(--font-rubik)',
            color: '#1A4731',
            fontSize: '16px',
            margin: '0 0 16px 0',
          }}
        >
          Comments ({comments.length})
        </h3>

        {comments.map((comment) => (
          <div
            key={comment.id}
            style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '16px',
              paddingBottom: '16px',
              borderBottom: '1px solid #F4F5F4',
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#1A4731',
                flexShrink: 0,
              }}
            />

            {/* Comment Content */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  marginBottom: '4px',
                }}
              >
                <Link href={`/profile/${comment.username}`} style={{ textDecoration: 'none' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-rubik)',
                      color: '#1A4731',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                  >
                    {comment.displayName}
                  </span>
                </Link>
                <Link href={`/profile/${comment.username}`} style={{ textDecoration: 'none' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-alata)',
                      color: '#999',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    @{comment.username}
                  </span>
                </Link>
                <span
                  style={{
                    fontFamily: 'var(--font-alata)',
                    color: '#999',
                    fontSize: '12px',
                  }}
                >
                  · {formatTime(comment.createdAt)}
                </span>
              </div>

              <p
                style={{
                  fontFamily: 'var(--font-alata)',
                  color: '#333',
                  fontSize: '14px',
                  margin: '0 0 12px 0',
                  lineHeight: '1.5',
                }}
              >
                {comment.content}
              </p>

              {/* Comment Actions */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                  onClick={() => toggleLike(comment.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    color: likedComments.has(comment.id) ? '#dc2626' : '#999',
                  }}
                >
                  <Heart
                    size={16}
                    fill={likedComments.has(comment.id) ? '#dc2626' : 'none'}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-alata)',
                      fontSize: '12px',
                    }}
                  >
                    {comment.likes}
                  </span>
                </button>

                <Link href={`/${comment.username}/status/${comment.id}`}>
                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      color: '#999',
                    }}
                  >
                    <MessageCircle size={16} />
                    <span
                      style={{
                        fontFamily: 'var(--font-alata)',
                        fontSize: '12px',
                      }}
                    >
                      {getReplyCount(comment)}
                    </span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
