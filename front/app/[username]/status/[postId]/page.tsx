'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import Subscriptions from '@/components/Subscriptions';
import { Heart, MessageCircle, ChevronLeft, Share2 } from 'lucide-react';
import { mockComments, findCommentById, getParentChain, type Comment } from '@/lib/commentsData';

interface StatusPageProps {
  params: Promise<{
    username: string;
    postId: string;
  }>;
}

export default function StatusPage({ params }: StatusPageProps) {
  const router = useRouter();
  const { username, postId } = use(params);
  const [mainReplyText, setMainReplyText] = useState('');
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [comment, setComment] = useState<Comment | null>(null);
  const [parentChain, setParentChain] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getCounterColor = (length: number) => {
    const ratio = length / 280;
    if (ratio === 0) return 'rgb(26, 71, 49)';
    if (ratio <= 0.5) {
      const g = Math.round(26 + (179 - 26) * ratio * 2);
      return `rgb(26, ${g}, 49)`;
    } else {
      const r = Math.round(26 + (220 - 26) * (ratio - 0.5) * 2);
      const g = Math.round(179 - (179 - 100) * (ratio - 0.5) * 2);
      return `rgb(${r}, ${g}, 49)`;
    }
  };

  useEffect(() => {
    const foundComment = findCommentById(postId, mockComments);
    const chain = getParentChain(postId, mockComments);
    setComment(foundComment);
    setParentChain(chain);
    setIsLoading(false);
  }, [postId]);

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

  const toggleLike = (commentId: string) => {
    const newLiked = new Set(likedComments);
    if (newLiked.has(commentId)) {
      newLiked.delete(commentId);
    } else {
      newLiked.add(commentId);
    }
    setLikedComments(newLiked);
  };

  const handleReply = () => {
    if (mainReplyText.trim()) {
      setMainReplyText('');
    }
  };

  const copyToClipboard = (id: string, author: string) => {
    const url = `${window.location.origin}/${author}/status/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const RenderReplies = ({ replies }: { replies: Comment[] | undefined }) => {
    if (!replies || replies.length === 0) return null;

    return (
      <div>
        {replies.map((reply) => (
          <div
            key={reply.id}
            style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '16px',
              paddingBottom: '16px',
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
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                <Link href={`/profile/${reply.username}`} style={{ textDecoration: 'none' }}>
                  <span style={{ fontFamily: 'var(--font-rubik)', fontSize: '14px', fontWeight: 'bold', color: '#1A4731', cursor: 'pointer' }}>
                    {reply.displayName}
                  </span>
                </Link>
                <Link href={`/profile/${reply.username}`} style={{ textDecoration: 'none' }}>
                  <span style={{ fontFamily: 'var(--font-alata)', fontSize: '13px', color: '#999', cursor: 'pointer' }}>
                    @{reply.username}
                  </span>
                </Link>
                <span style={{ fontFamily: 'var(--font-alata)', fontSize: '12px', color: '#999' }}>
                  · {formatTime(reply.createdAt)}
                </span>
              </div>
              <p style={{ fontFamily: 'var(--font-alata)', fontSize: '14px', color: '#333', margin: '0 0 12px 0', lineHeight: '1.5' }}>
                {reply.content}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button
                  onClick={() => toggleLike(reply.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    color: likedComments.has(reply.id) ? '#dc2626' : '#999',
                  }}
                >
                  <Heart
                    size={16}
                    fill={likedComments.has(reply.id) ? '#dc2626' : 'none'}
                  />
                  <span style={{ fontFamily: 'var(--font-alata)', fontSize: '12px' }}>
                    {reply.likes}
                  </span>
                </button>
                <Link href={`/${reply.username}/status/${reply.id}`}>
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
                    <span style={{ fontFamily: 'var(--font-alata)', fontSize: '12px' }}>
                      {(reply.replies && reply.replies.length) || 0}
                    </span>
                  </button>
                </Link>
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => copyToClipboard(reply.id, reply.username)}
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
                    <Share2 size={16} />
                  </button>
                  {copiedId === reply.id && (
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
              {/* Recursive replies */}
              <div style={{ marginLeft: '20px', marginTop: '12px' }}>
                <RenderReplies replies={reply.replies} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!comment) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Post not found</p>
        <Link href="/">
          <button style={{ color: '#1A4731', cursor: 'pointer' }}>
            Back to home
          </button>
        </Link>
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
      className="comment-detail-container"
    >
      {/* Center Column */}
      <div
        style={{ flex: '0 0 80%' }}
        className="comment-detail-center"
      >
        <div style={{ padding: '20px' }}>
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#1A4731',
              fontFamily: 'var(--font-rubik)',
              fontSize: '14px',
              marginBottom: '16px',
            }}
          >
            <ChevronLeft size={20} />
            Back
          </button>

          {/* Parent Chain */}
          {parentChain.length > 1 && (
            <div style={{ marginBottom: '24px' }}>
              {parentChain.slice(0, -1).map((parent, index) => (
                <div
                  key={parent.id}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #1A4731',
                    borderRadius: '8px',
                    padding: '16px',
                    marginBottom: '8px',
                    opacity: 0.7,
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: '#1A4731',
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                        <Link href={`/profile/${parent.username}`} style={{ textDecoration: 'none' }}>
                          <span style={{ fontFamily: 'var(--font-rubik)', fontSize: '12px', fontWeight: 'bold', color: '#1A4731', cursor: 'pointer' }}>
                            {parent.displayName}
                          </span>
                        </Link>
                        <Link href={`/profile/${parent.username}`} style={{ textDecoration: 'none' }}>
                          <span style={{ fontFamily: 'var(--font-alata)', fontSize: '11px', color: '#999', cursor: 'pointer' }}>
                            @{parent.username}
                          </span>
                        </Link>
                      </div>
                      <p style={{ fontFamily: 'var(--font-alata)', fontSize: '13px', color: '#333', margin: 0, lineHeight: '1.4' }}>
                        {parent.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Main Comment */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #1A4731',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '24px',
            }}
          >
            <div style={{ display: 'flex', gap: '12px' }}>
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
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                  <Link href={`/profile/${comment.username}`} style={{ textDecoration: 'none' }}>
                    <span style={{ fontFamily: 'var(--font-rubik)', fontSize: '14px', fontWeight: 'bold', color: '#1A4731', cursor: 'pointer' }}>
                      {comment.displayName}
                    </span>
                  </Link>
                  <Link href={`/profile/${comment.username}`} style={{ textDecoration: 'none' }}>
                    <span style={{ fontFamily: 'var(--font-alata)', fontSize: '13px', color: '#999', cursor: 'pointer' }}>
                      @{comment.username}
                    </span>
                  </Link>
                  <span style={{ fontFamily: 'var(--font-alata)', fontSize: '12px', color: '#999' }}>
                    · {formatTime(comment.createdAt)}
                  </span>
                </div>
                <p style={{ fontFamily: 'var(--font-alata)', fontSize: '14px', color: '#333', margin: '0 0 12px 0', lineHeight: '1.5' }}>
                  {comment.content}
                </p>
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
                    <span style={{ fontFamily: 'var(--font-alata)', fontSize: '12px' }}>
                      {comment.likes}
                    </span>
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#999', padding: '4px 8px' }}>
                    <MessageCircle size={16} />
                    <span style={{ fontFamily: 'var(--font-alata)', fontSize: '12px' }}>
                      {(comment.replies && comment.replies.length) || 0}
                    </span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => copyToClipboard(comment.id, comment.username)}
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
                      <Share2 size={16} />
                    </button>
                    {copiedId === comment.id && (
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
            </div>
          </div>

          {/* Reply Input */}
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
                value={mainReplyText}
                onChange={(e) => {
                  if (e.target.value.length <= 280) {
                    setMainReplyText(e.target.value);
                  }
                }}
                placeholder="Write a reply..."
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
                  overflow: 'hidden',
                }}
              />
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '8px',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-alata)',
                    fontSize: '12px',
                    color: getCounterColor(mainReplyText.length),
                    fontWeight: 'bold',
                  }}
                >
                  {mainReplyText.length}/280
                </span>
                <button
                  onClick={handleReply}
                  disabled={mainReplyText.trim().length === 0 || mainReplyText.length > 280}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#1A4731',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontFamily: 'var(--font-rubik)',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: mainReplyText.trim().length > 0 && mainReplyText.length <= 280 ? 'pointer' : 'not-allowed',
                    opacity: mainReplyText.trim().length > 0 && mainReplyText.length <= 280 ? 1 : 0.5,
                  }}
                >
                  Reply
                </button>
              </div>
            </div>
          </div>

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div>
              <h3 style={{ fontFamily: 'var(--font-rubik)', color: '#1A4731', fontSize: '14px', margin: '0 0 16px 0' }}>
                Replies ({comment.replies.length})
              </h3>
              <RenderReplies replies={comment.replies} />
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar (Desktop only) */}
      <div style={{ flex: '0 0 20%' }} className="comment-detail-sidebar">
        <div style={{ padding: '20px' }}>
          <SearchBar />
          <Subscriptions />
        </div>
      </div>
    </div>
  );
}
