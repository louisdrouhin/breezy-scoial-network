'use client';

import { use, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import ProfileHeader from '@/components/ProfileHeader';
import Post from '@/components/Post';
import { userAPI, postAPI, Profile, Post as PostType, FollowEntry, FollowerEntry } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const router = useRouter();
  const { username } = use(params);
  const { user: currentUser } = useAuth();
  const isOwnProfile = currentUser?.username === username;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const isSelf = currentUser?.username === username;
        const requests: Promise<unknown>[] = [
          userAPI.getProfile(username),
          postAPI.getByUser(username, 1),
          userAPI.getFollowers(username),
          userAPI.getFollowing(username),
        ];
        if (!isSelf && currentUser?.username) {
          requests.push(userAPI.getFollowing(currentUser.username));
        }
        const results = await Promise.all(requests);
        const [profileData, postsData, followers, following, myFollowing] = results as [Profile, PostType[], FollowerEntry[], FollowEntry[], FollowEntry[] | undefined];
        setProfile(profileData);
        setPosts(postsData);
        setHasMore(postsData.length === 20);
        setPage(2);
        setFollowersCount(followers.length);
        setFollowingCount(following.length);
        if (myFollowing) {
          setIsFollowing(myFollowing.some(f => f['followed.username'] === username));
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Erreur');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [username, currentUser?.username]);

  const loadMore = useCallback(async (pageToLoad: number) => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const data = await postAPI.getByUser(username, pageToLoad);
      setPosts(prev => {
        const existingIds = new Set(prev.map(p => p._id));
        return [...prev, ...data.filter(p => !existingIds.has(p._id))];
      });
      setHasMore(data.length === 20);
      setPage(pageToLoad + 1);
    } catch {
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, username]);

  useEffect(() => {
    if (!hasMore || isLoading) return;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage(prev => { loadMore(prev); return prev; });
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasMore, isLoading, loadMore]);

  const handleFollowToggle = async () => {
    if (followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await userAPI.unfollow(username);
        setIsFollowing(false);
        setFollowersCount(c => c - 1);
      } else {
        await userAPI.follow(username);
        setIsFollowing(true);
        setFollowersCount(c => c + 1);
      }
    } catch {
      // silently ignore
    } finally {
      setFollowLoading(false);
    }
  };

  const handleProfileUpdate = (updated: Partial<Profile>) => {
    setProfile(prev => prev ? { ...prev, ...updated } : prev);
  };

  if (isLoading) {
    return <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'var(--font-alata)' }}>Chargement...</div>;
  }

  if (error || !profile) {
    return <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'var(--font-alata)', color: '#999' }}>Profil introuvable</div>;
  }

  return (
    <div
      style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F4F5F4' }}
      className="profile-container"
    >
      <div style={{ flex: '0 0 100%', paddingRight: '20px', paddingLeft: '20px' }}>
        <div className="profile-header" style={{ marginTop: '20px' }}>
          <ProfileHeader
            displayName={profile.displayName || profile.username}
            username={profile.username}
            bio={profile.bio || ''}
            avatarUrl={profile.avatarUrl}
            bannerUrl={profile.bannerUrl}
            followers={followersCount}
            following={followingCount}
            onProfileUpdate={isOwnProfile ? handleProfileUpdate : undefined}
            isFollowing={isFollowing}
            followLoading={followLoading}
            onFollowToggle={!isOwnProfile && currentUser ? handleFollowToggle : undefined}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-rubik)', color: '#1A4731', marginBottom: '16px' }}>
            Posts
          </h2>

          {posts.length === 0 ? (
            <p style={{ fontFamily: 'var(--font-alata)', color: '#999', textAlign: 'center', padding: '40px' }}>
              Aucun post pour le moment
            </p>
          ) : (
            posts.map(post => (
              <Post
                key={post._id}
                id={post._id}
                username={post.authorUsername}
                displayName={profile.displayName || profile.username}
                avatarUrl={profile.avatarUrl}
                content={post.content}
                createdAt={new Date(post.created_at)}
                initialLikes={post.likeCount}
                initialComments={post.replyCount}
                edited={post.edited}
              />
            ))
          )}

          {isLoadingMore && (
            <div style={{ textAlign: 'center', padding: '20px', fontFamily: 'var(--font-alata)', color: '#999' }}>
              Chargement...
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <div style={{ textAlign: 'center', padding: '24px', fontFamily: 'var(--font-alata)', color: '#999', fontSize: '14px', borderTop: '1px solid #E0E0E0', marginTop: '8px' }}>
              Tous les posts ont été chargés
            </div>
          )}

          <div ref={sentinelRef} style={{ height: '1px' }} />
        </div>
      </div>
    </div>
  );
}
