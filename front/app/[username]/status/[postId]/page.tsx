'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import Subscriptions from '@/components/Subscriptions';
import PostBar from '@/components/PostBar';
import { Heart, MessageCircle, ChevronLeft, Share2 } from 'lucide-react';
import { postAPI, Post } from '@/lib/api';
import { useProfileCache } from '@/hooks/useProfileCache';

interface StatusPageProps {
  params: Promise<{ username: string; postId: string }>;
}

export default function StatusPage({ params }: StatusPageProps) {
  const router = useRouter();
  const { username, postId } = use(params);
  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Post[]>([]);
  const { cache: profileCache, loadProfiles } = useProfileCache();
  const [isLoading, setIsLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [postData, repliesData] = await Promise.all([
          postAPI.getById(postId),
          postAPI.getReplies(postId),
        ]);
        setPost(postData);
        setReplies(repliesData);
        loadProfiles([postData.authorUsername, ...repliesData.map(r => r.authorUsername)]);

        // Hydrate le statut like pour le post principal + toutes les réponses
        const allIds = [postData._id, ...repliesData.map(r => r._id)];
        const likeStatuses = await Promise.allSettled(allIds.map(id => postAPI.getLikeStatus(id)));
        const liked = new Set<string>();
        likeStatuses.forEach((r, i) => {
          if (r.status === 'fulfilled' && r.value.liked) liked.add(allIds[i]);
        });
        setLikedPosts(liked);
      } catch {
        setPost(null);
      } finally {
        setIsLoading(false);
      }
    };
    load();
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

  const toggleLike = async (id: string) => {
    try {
      if (likedPosts.has(id)) {
        const res = await postAPI.unlike(id);
        setLikedPosts(prev => { const s = new Set(prev); s.delete(id); return s; });
        if (id === postId) setPost(prev => prev ? { ...prev, likeCount: res.count } : prev);
        else setReplies(prev => prev.map(r => r._id === id ? { ...r, likeCount: res.count } : r));
      } else {
        const res = await postAPI.like(id);
        setLikedPosts(prev => new Set(prev).add(id));
        if (id === postId) setPost(prev => prev ? { ...prev, likeCount: res.count } : prev);
        else setReplies(prev => prev.map(r => r._id === id ? { ...r, likeCount: res.count } : r));
      }
    } catch { /* silently ignore */ }
  };

  const copyToClipboard = (id: string, author: string) => {
    const url = `${window.location.origin}/${author}/status/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReplyCreated = (reply?: Post) => {
    if (!reply) return;
    setReplies(prev => [reply, ...prev]);
    if (post) setPost({ ...post, replyCount: post.replyCount + 1 });
    loadProfiles([reply.authorUsername]);
  };

  if (isLoading) {
    return <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'var(--font-alata)' }}>Chargement...</div>;
  }

  if (!post) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-alata)', color: '#999' }}>Post introuvable</p>
        <Link href="/"><button style={{ color: '#1A4731', cursor: 'pointer', border: 'none', background: 'none', fontFamily: 'var(--font-alata)' }}>Retour à l'accueil</button></Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F4F5F4' }} className="comment-detail-container">
      {/* Center Column */}
      <div style={{ flex: '0 0 80%' }} className="comment-detail-center">
        <div style={{ padding: '20px' }}>
          <button
            onClick={() => router.back()}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', cursor: 'pointer', color: '#1A4731', fontFamily: 'var(--font-rubik)', fontSize: '14px', marginBottom: '16px' }}
          >
            <ChevronLeft size={20} />
            Back
          </button>

          {/* Main Post */}
          <div style={{ backgroundColor: '#ffffff', border: '1px solid #1A4731', borderRadius: '8px', padding: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              {profileCache[post.authorUsername]?.avatarUrl ? (
                <img src={profileCache[post.authorUsername].avatarUrl!} alt={post.authorUsername} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
              ) : (
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1A4731', flexShrink: 0 }} />
              )}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                  <Link href={`/profile/${post.authorUsername}`} style={{ textDecoration: 'none' }}>
                    <span style={{ fontFamily: 'var(--font-rubik)', fontSize: '14px', fontWeight: 'bold', color: '#1A4731', cursor: 'pointer' }}>
                      {post.authorUsername}
                    </span>
                  </Link>
                  <Link href={`/profile/${post.authorUsername}`} style={{ textDecoration: 'none' }}>
                    <span style={{ fontFamily: 'var(--font-alata)', fontSize: '13px', color: '#999', cursor: 'pointer' }}>
                      @{post.authorUsername}
                    </span>
                  </Link>
                  <span style={{ fontFamily: 'var(--font-alata)', fontSize: '12px', color: '#999' }}>
                    · {formatTime(post.created_at)}
                  </span>
                </div>
                <p style={{ fontFamily: 'var(--font-alata)', fontSize: '14px', color: '#333', margin: '0 0 12px 0', lineHeight: '1.5' }}>
                  {post.content}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <button onClick={() => toggleLike(post._id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', color: likedPosts.has(post._id) ? '#dc2626' : '#999' }}>
                    <Heart size={16} fill={likedPosts.has(post._id) ? '#dc2626' : 'none'} />
                    <span style={{ fontFamily: 'var(--font-alata)', fontSize: '12px' }}>{post.likeCount}</span>
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#999', padding: '4px 8px' }}>
                    <MessageCircle size={16} />
                    <span style={{ fontFamily: 'var(--font-alata)', fontSize: '12px' }}>{post.replyCount}</span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <button onClick={() => copyToClipboard(post._id, post.authorUsername)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', color: '#999' }}>
                      <Share2 size={16} />
                    </button>
                    {copiedId === post._id && (
                      <div style={{ position: 'absolute', top: '-35px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#6CB583', color: '#ffffff', padding: '8px 14px', borderRadius: '4px', fontSize: '12px', fontFamily: 'var(--font-alata)', fontWeight: 'bold', whiteSpace: 'nowrap', zIndex: 9999, pointerEvents: 'none' }}>
                        Copied!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reply input */}
          <PostBar onPostCreated={handleReplyCreated} parentId={post._id} placeholder="Écrire une réponse..." />

          {/* Replies */}
          {replies.length > 0 && (
            <div>
              <h3 style={{ fontFamily: 'var(--font-rubik)', color: '#1A4731', fontSize: '14px', margin: '0 0 16px 0' }}>
                Réponses ({replies.length})
              </h3>
              {replies.map(reply => (
                <div key={reply._id} style={{ display: 'flex', gap: '12px', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #F4F5F4' }}>
                  {profileCache[reply.authorUsername]?.avatarUrl ? (
                    <img src={profileCache[reply.authorUsername].avatarUrl!} alt={reply.authorUsername} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1A4731', flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                      <Link href={`/profile/${reply.authorUsername}`} style={{ textDecoration: 'none' }}>
                        <span style={{ fontFamily: 'var(--font-rubik)', fontSize: '14px', fontWeight: 'bold', color: '#1A4731', cursor: 'pointer' }}>{reply.authorUsername}</span>
                      </Link>
                      <Link href={`/profile/${reply.authorUsername}`} style={{ textDecoration: 'none' }}>
                        <span style={{ fontFamily: 'var(--font-alata)', fontSize: '13px', color: '#999', cursor: 'pointer' }}>@{reply.authorUsername}</span>
                      </Link>
                      <span style={{ fontFamily: 'var(--font-alata)', fontSize: '12px', color: '#999' }}>· {formatTime(reply.created_at)}</span>
                    </div>
                    <p style={{ fontFamily: 'var(--font-alata)', fontSize: '14px', color: '#333', margin: '0 0 12px 0', lineHeight: '1.5' }}>
                      {reply.content}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <button onClick={() => toggleLike(reply._id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', color: likedPosts.has(reply._id) ? '#dc2626' : '#999' }}>
                        <Heart size={16} fill={likedPosts.has(reply._id) ? '#dc2626' : 'none'} />
                        <span style={{ fontFamily: 'var(--font-alata)', fontSize: '12px' }}>{reply.likeCount}</span>
                      </button>
                      <Link href={`/${reply.authorUsername}/status/${reply._id}`}>
                        <button style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', color: '#999' }}>
                          <MessageCircle size={16} />
                          <span style={{ fontFamily: 'var(--font-alata)', fontSize: '12px' }}>{reply.replyCount}</span>
                        </button>
                      </Link>
                      <div style={{ position: 'relative' }}>
                        <button onClick={() => copyToClipboard(reply._id, reply.authorUsername)} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', color: '#999' }}>
                          <Share2 size={16} />
                        </button>
                        {copiedId === reply._id && (
                          <div style={{ position: 'absolute', top: '-35px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#6CB583', color: '#ffffff', padding: '8px 14px', borderRadius: '4px', fontSize: '12px', fontFamily: 'var(--font-alata)', fontWeight: 'bold', whiteSpace: 'nowrap', zIndex: 9999, pointerEvents: 'none' }}>
                            Copied!
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar */}
      <div style={{ flex: '0 0 20%' }} className="comment-detail-sidebar">
        <div style={{ padding: '20px' }}>
          <SearchBar />
          <Subscriptions />
        </div>
      </div>
    </div>
  );
}
