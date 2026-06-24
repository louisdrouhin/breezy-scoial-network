'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import Subscriptions from '@/components/Subscriptions';
import PostBar from '@/components/PostBar';
import Post from '@/components/Post';
import RichPostText from '@/components/RichPostText';
import { ChevronLeft } from 'lucide-react';
import { postAPI, Post as PostType } from '@/lib/api';
import { useProfileCache } from '@/hooks/useProfileCache';

interface StatusPageProps {
  params: Promise<{ username: string; postId: string }>;
}

export default function StatusPage({ params }: StatusPageProps) {
  const router = useRouter();
  const { username, postId } = use(params);
  const [post, setPost] = useState<PostType | null>(null);
  const [replies, setReplies] = useState<PostType[]>([]);
  const [ancestors, setAncestors] = useState<PostType[]>([]);
  const { cache: profileCache, loadProfiles } = useProfileCache();
  const [isLoading, setIsLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      try {
        const [postData, repliesData, ancestorsData] = await Promise.all([
          postAPI.getById(postId),
          postAPI.getReplies(postId),
          postAPI.getAncestors(postId),
        ]);
        setPost(postData);
        setReplies(repliesData);
        setAncestors(ancestorsData);
        loadProfiles([
          postData.authorUsername,
          ...repliesData.map(r => r.authorUsername),
          ...ancestorsData.map(a => a.authorUsername),
        ]);

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

  const handleReplyCreated = (reply?: PostType) => {
    if (!reply) return;
    setReplies(prev => [reply, ...prev]);
    if (post) setPost({ ...post, replyCount: post.replyCount + 1 });
    loadProfiles([reply.authorUsername]);
  };

  const handleReplyDeleted = (deletedId: string) => {
    setReplies(prev => prev.map(reply => (
      reply._id === deletedId
        ? { ...reply, content: '', media: [], tags: [], likeCount: 0, deleted: true, edited: true }
        : reply
    )));
  };

  if (isLoading) {
    return <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'var(--font-alata)' }}>Loading...</div>;
  }

  if (!post) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-alata)', color: '#999' }}>Post not found</p>
        <Link href="/"><button style={{ color: '#1A4731', cursor: 'pointer', border: 'none', background: 'none', fontFamily: 'var(--font-alata)' }}>Back to home</button></Link>
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

          {/* Fil ancêtre : posts auxquels ce post répond (racine -> parent direct) */}
          {ancestors.length > 0 && (
            <div style={{ marginBottom: '8px' }}>
              {ancestors.map(ancestor => (
                <div
                  key={ancestor._id}
                  style={{ display: 'block' }}
                >
                  <div style={{ backgroundColor: '#ffffff', border: '1px solid #E0E0E0', borderRadius: '8px', padding: '14px 16px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {profileCache[ancestor.authorUsername]?.avatarUrl ? (
                        <img src={profileCache[ancestor.authorUsername].avatarUrl!} alt={ancestor.authorUsername} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#1A4731', flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '2px' }}>
                          <span style={{ fontFamily: 'var(--font-rubik)', fontSize: '13px', fontWeight: 'bold', color: '#1A4731' }}>{ancestor.authorUsername}</span>
                          <span style={{ fontFamily: 'var(--font-alata)', fontSize: '12px', color: '#999' }}>· {formatTime(ancestor.created_at)}</span>
                          <Link href={`/${ancestor.authorUsername}/status/${ancestor._id}`} style={{ fontFamily: 'var(--font-alata)', fontSize: '12px', color: '#1A4731', textDecoration: 'none' }}>
                            · View
                          </Link>
                        </div>
                        {ancestor.deleted ? (
                          <p style={{ fontFamily: 'var(--font-alata)', fontSize: '13px', color: '#777', margin: 0, lineHeight: '1.4', fontStyle: 'italic' }}>
                            Breeze supprimé
                          </p>
                        ) : (
                          <RichPostText text={ancestor.content} style={{ fontSize: '13px', color: '#555', margin: 0, lineHeight: '1.4' }} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Main Post */}
          <Post
            id={post._id}
            username={post.authorUsername}
            displayName={profileCache[post.authorUsername]?.displayName || post.authorUsername}
            avatarUrl={profileCache[post.authorUsername]?.avatarUrl}
            content={post.content}
            media={post.media}
            createdAt={new Date(post.created_at)}
            initialLikes={post.likeCount}
            initialComments={post.replyCount}
            edited={post.edited}
            deleted={post.deleted}
            initialIsLiked={likedPosts.has(post._id)}
            onDeleted={() => router.push('/')}
          />

          {/* Reply input */}
          <PostBar onPostCreated={handleReplyCreated} parentId={post._id} placeholder="Write a reply..." />

          {/* Replies */}
          {replies.length > 0 && (
            <div>
              <h3 style={{ fontFamily: 'var(--font-rubik)', color: '#1A4731', fontSize: '14px', margin: '0 0 16px 0' }}>
                Replies ({replies.length})
              </h3>
              {replies.map(reply => (
                <Post
                  key={reply._id}
                  id={reply._id}
                  username={reply.authorUsername}
                  displayName={profileCache[reply.authorUsername]?.displayName || reply.authorUsername}
                  avatarUrl={profileCache[reply.authorUsername]?.avatarUrl}
                  content={reply.content}
                  media={reply.media}
                  createdAt={new Date(reply.created_at)}
                  initialLikes={reply.likeCount}
                  initialComments={reply.replyCount}
                  edited={reply.edited}
                  deleted={reply.deleted}
                  initialIsLiked={likedPosts.has(reply._id)}
                  onDeleted={handleReplyDeleted}
                />
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
