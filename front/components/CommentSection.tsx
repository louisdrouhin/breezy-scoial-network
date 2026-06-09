'use client';

import { useState } from 'react';
import { Heart, ChevronDown, ChevronUp } from 'lucide-react';

interface Comment {
  id: string;
  displayName: string;
  username: string;
  content: string;
  createdAt: Date;
  likes: number;
  replies?: Comment[];
}

interface CommentSectionProps {
  postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      displayName: 'Alice Johnson',
      username: 'alicejohnson',
      content: 'This is amazing! Great work! 🎉',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      likes: 12,
      replies: [
        {
          id: '1-1',
          displayName: 'John Doe',
          username: 'johndoe',
          content: 'Thanks Alice!',
          createdAt: new Date(Date.now() - 30 * 60 * 1000),
          likes: 2,
          replies: [],
        },
      ],
    },
    {
      id: '2',
      displayName: 'Bob Smith',
      username: 'bobsmith',
      content: 'Thanks for sharing this!',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      likes: 5,
      replies: [],
    },
  ]);
  const [mainComment, setMainComment] = useState('');
  const [replyTexts, setReplyTexts] = useState<Map<string, string>>(new Map());
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  const formatTime = (date: Date) => {
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

  const addReplyToComment = (parentId: string, replyText: string, commentsList: Comment[]): Comment[] => {
    return commentsList.map((comment) => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [
            ...(comment.replies || []),
            {
              id: `${parentId}-${Date.now()}`,
              displayName: 'Your Name',
              username: 'yourusername',
              content: replyText,
              createdAt: new Date(),
              likes: 0,
              replies: [],
            },
          ],
        };
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: addReplyToComment(parentId, replyText, comment.replies),
        };
      }
      return comment;
    });
  };

  const handleAddComment = (parentId?: string) => {
    const text = parentId ? replyTexts.get(parentId) || '' : mainComment;
    if (text.trim()) {
      if (parentId) {
        const updatedComments = addReplyToComment(parentId, text, comments);
        setComments(updatedComments);
        setExpandedReplies(new Set(expandedReplies).add(parentId));
        const newReplyTexts = new Map(replyTexts);
        newReplyTexts.delete(parentId);
        setReplyTexts(newReplyTexts);
      } else {
        const comment: Comment = {
          id: Date.now().toString(),
          displayName: 'Your Name',
          username: 'yourusername',
          content: text,
          createdAt: new Date(),
          likes: 0,
          replies: [],
        };
        setComments([...comments, comment]);
        setMainComment('');
      }
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

  const toggleReplies = (commentId: string) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedReplies(newExpanded);
  };

  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
    const replyText = replyTexts.get(comment.id) || '';
    const hasReplies = comment.replies && comment.replies.length > 0;

    return (
      <div
        style={{
          backgroundColor: isReply ? '#F4F5F4' : '#ffffff',
          border: '1px solid #E0E0E0',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '12px',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '12px',
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
              <span
                style={{
                  fontFamily: 'var(--font-rubik)',
                  color: '#1A4731',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                {comment.displayName}
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-alata)',
                  color: '#999',
                  fontSize: '13px',
                }}
              >
                @{comment.username}
              </span>
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

              {hasReplies && (
                <button
                  onClick={() => toggleReplies(comment.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    color: '#1A4731',
                    fontFamily: 'var(--font-alata)',
                    fontSize: '13px',
                  }}
                >
                  {expandedReplies.has(comment.id) ? (
                    <>
                      <ChevronUp size={16} />
                      <span>Hide {comment.replies?.length} replies</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown size={16} />
                      <span>Show {comment.replies?.length} replies</span>
                    </>
                  )}
                </button>
              )}

              <button
                onClick={() => toggleReplies(comment.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  color: '#1A4731',
                  fontFamily: 'var(--font-alata)',
                  fontSize: '13px',
                  textDecoration: 'underline',
                }}
              >
                Reply
              </button>
            </div>

            {/* Reply Input - shown when expanded OR when clicking Reply */}
            {expandedReplies.has(comment.id) && (
              <>
                {/* Replies List */}
                {comment.replies && comment.replies.length > 0 && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E0E0E0' }}>
                    {comment.replies.map((reply) => (
                      <CommentItem key={reply.id} comment={reply} isReply={true} />
                    ))}
                  </div>
                )}

                {/* Reply Input */}
                <div
                  style={{
                    display: 'flex',
                    gap: '12px',
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: '1px solid #E0E0E0',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#1A4731',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <textarea
                      value={replyText}
                      onChange={(e) => {
                        const newReplyTexts = new Map(replyTexts);
                        newReplyTexts.set(comment.id, e.target.value);
                        setReplyTexts(newReplyTexts);
                      }}
                      placeholder="Write a reply..."
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #E0E0E0',
                        borderRadius: '6px',
                        fontFamily: 'var(--font-alata)',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                        outline: 'none',
                        minHeight: '60px',
                        resize: 'none',
                      }}
                    />
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        marginTop: '6px',
                        gap: '8px',
                      }}
                    >
                      <button
                        onClick={() => toggleReplies(comment.id)}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#F4F5F4',
                          color: '#666',
                          border: 'none',
                          borderRadius: '4px',
                          fontFamily: 'var(--font-alata)',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          if (replyText.trim()) {
                            handleAddComment(comment.id);
                          }
                        }}
                        disabled={replyText.trim().length === 0}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#1A4731',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontFamily: 'var(--font-rubik)',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          cursor: replyText.trim().length > 0 ? 'pointer' : 'not-allowed',
                          opacity: replyText.trim().length > 0 ? 1 : 0.5,
                        }}
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
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
              onClick={() => handleAddComment()}
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

      {/* Comments List */}
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
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}
