'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import PostBar from '@/components/PostBar';
import SearchBar from '@/components/SearchBar';
import Subscriptions from '@/components/Subscriptions';
import Post from '@/components/Post';
import { feedAPI, postAPI, Post as PostType } from '@/lib/api';
import { useProfileCache } from '@/hooks/useProfileCache';
// Post as PostType used only for feed — newly created posts are not injected into the feed

export default function Home() {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const { cache: profileCache, loadProfiles } = useProfileCache();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [toast, setToast] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async (pageToLoad: number) => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const data = await feedAPI.get(pageToLoad);
      setPosts(prev => {
        const existingIds = new Set(prev.map(p => p._id));
        const newPosts = data.posts.filter(p => !existingIds.has(p._id));
        return pageToLoad === 1 ? data.posts : [...prev, ...newPosts];
      });
      setHasMore(data.hasMore);
      loadProfiles(data.posts.map(p => p.authorUsername));
      setPage(pageToLoad + 1);

      const likeResults = await Promise.allSettled(data.posts.map(p => postAPI.getLikeStatus(p._id)));
      setLikedPostIds(prev => {
        const next = new Set(prev);
        likeResults.forEach((r, i) => {
          if (r.status === 'fulfilled' && r.value.liked) next.add(data.posts[i]._id);
        });
        return next;
      });
    } catch {
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setIsInitialized(true);
    }
  }, [isLoading]);

  useEffect(() => {
    loadMore(1);
  }, []);

  useEffect(() => {
    if (!hasMore || isLoading || !isInitialized) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage(prev => {
            loadMore(prev);
            return prev;
          });
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [hasMore, isLoading, isInitialized, loadMore]);

  const handlePostCreated = () => {
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#F4F5F4',
        paddingTop: '20px',
        paddingRight: '20px',
        paddingBottom: '80px',
        paddingLeft: '320px',
      }}
      className="home-container"
    >
      {/* Center Column */}
      <div
        style={{ flex: '0 0 80%', paddingRight: '20px', paddingLeft: '20px' }}
        className="home-center"
      >
        <PostBar onPostCreated={handlePostCreated} />

        {/* Toast desktop */}
        {toast && (
          <div style={{
            position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
            backgroundColor: '#1A4731', color: 'white', padding: '10px 24px',
            borderRadius: '999px', fontFamily: 'var(--font-alata)', fontSize: '14px',
            zIndex: 200, whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}>
            Post publié !
          </div>
        )}

        {isInitialized && posts.length === 0 && !isLoading && (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              fontFamily: 'var(--font-alata)',
              color: '#999',
            }}
          >
            Aucun post à afficher. Suivez des utilisateurs pour voir leur contenu ici.
          </div>
        )}

        {posts.map((post) => (
          <Post
            key={post._id}
            id={post._id}
            username={post.authorUsername}
            displayName={profileCache[post.authorUsername]?.displayName || post.authorUsername}
            avatarUrl={profileCache[post.authorUsername]?.avatarUrl}
            content={post.content}
            createdAt={new Date(post.created_at)}
            initialLikes={post.likeCount}
            initialComments={post.replyCount}
            edited={post.edited}
            initialIsLiked={likedPostIds.has(post._id)}
          />
        ))}

        {isLoading && (
          <div style={{ textAlign: 'center', padding: '20px', fontFamily: 'var(--font-alata)', color: '#999' }}>
            Chargement...
          </div>
        )}

        {!hasMore && posts.length > 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '24px',
              fontFamily: 'var(--font-alata)',
              color: '#999',
              fontSize: '14px',
              borderTop: '1px solid #E0E0E0',
              marginTop: '8px',
            }}
          >
            Vous êtes à jour
          </div>
        )}

        <div ref={sentinelRef} style={{ height: '1px' }} />
      </div>

      {/* Right Sidebar */}
      <div style={{ flex: '0 0 20%' }} className="home-sidebar">
        <SearchBar />
        <Subscriptions />

        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '24px',
            marginTop: '16px',
            justifyContent: 'center',
          }}
        >
          <Link href="/privacy-policy" style={{ fontFamily: 'var(--font-alata)', color: '#1A4731', fontSize: '12px', textDecoration: 'none' }}>
            Privacy Policy
          </Link>
          <span style={{ color: '#E0E0E0' }}>•</span>
          <Link href="/terms-of-service" style={{ fontFamily: 'var(--font-alata)', color: '#1A4731', fontSize: '12px', textDecoration: 'none' }}>
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}
