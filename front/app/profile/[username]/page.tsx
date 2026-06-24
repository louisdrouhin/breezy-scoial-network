'use client';

import { use, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import ProfileHeader from '@/components/ProfileHeader';
import Post from '@/components/Post';
import { userAPI, postAPI, Profile, Post as PostType, FollowEntry, FollowerEntry } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const [activeTab, setActiveTab] = useState<'posts' | 'replies'>('posts');
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
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
  const { t } = useLanguage();

  // Récupère le statut « liké » des posts donnés et l'ajoute au set existant.
  const hydrateLikes = useCallback(async (list: PostType[]) => {
    const results = await Promise.allSettled(list.map(p => postAPI.getLikeStatus(p._id)));
    setLikedPostIds(prev => {
      const next = new Set(prev);
      results.forEach((r, i) => {
        if (r.status === 'fulfilled' && r.value.liked) next.add(list[i]._id);
      });
      return next;
    });
  }, []);

  // Métadonnées du profil (séparées du chargement des posts, qui dépend de l'onglet).
  useEffect(() => {
    const load = async () => {
      try {
        const isSelf = currentUser?.username === username;
        const requests: Promise<unknown>[] = [
          userAPI.getProfile(username),
          userAPI.getFollowers(username),
          userAPI.getFollowing(username),
        ];
        if (!isSelf && currentUser?.username) {
          requests.push(userAPI.getFollowing(currentUser.username));
        }
        const results = await Promise.all(requests);
        const [profileData, followers, following, myFollowing] = results as [Profile, FollowerEntry[], FollowEntry[], FollowEntry[] | undefined];
        setProfile(profileData);
        setFollowersCount(followers.length);
        setFollowingCount(following.length);
        if (myFollowing) {
          setIsFollowing(myFollowing.some(f => f['followed.username'] === username));
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : t('settings.saveError'));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [username, currentUser?.username]);

  // Charge la première page de l'onglet actif (et à chaque changement d'onglet).
  useEffect(() => {
    let cancelled = false;
    const loadPosts = async () => {
      setPosts([]);
      setHasMore(true);
      setIsLoadingMore(true);
      try {
        const data = await postAPI.getByUser(username, 1, 20, activeTab);
        if (cancelled) return;
        setPosts(data);
        hydrateLikes(data);
        setHasMore(data.length === 20);
        setPage(2);
      } catch {
        if (!cancelled) setHasMore(false);
      } finally {
        if (!cancelled) setIsLoadingMore(false);
      }
    };
    loadPosts();
    return () => { cancelled = true; };
  }, [username, activeTab, hydrateLikes]);

  const loadMore = useCallback(async (pageToLoad: number) => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const data = await postAPI.getByUser(username, pageToLoad, 20, activeTab);
      setPosts(prev => {
        const existingIds = new Set(prev.map(p => p._id));
        return [...prev, ...data.filter(p => !existingIds.has(p._id))];
      });
      hydrateLikes(data);
      setHasMore(data.length === 20);
      setPage(pageToLoad + 1);
    } catch {
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, username, activeTab, hydrateLikes]);

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
    return <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'var(--font-alata)' }}>{t('common.loading')}</div>;
  }

  if (error || !profile) {
    return <div style={{ padding: '20px', textAlign: 'center', fontFamily: 'var(--font-alata)', color: '#999' }}>{t('profile.notFound')}</div>;
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
          {/* Onglets : sépare les posts racines des réponses (commentaires) */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid #E0E0E0' }}>
            {(['posts', 'replies'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: 'none',
                  border: 'none',
                  borderBottom: activeTab === tab ? '2px solid #1A4731' : '2px solid transparent',
                  padding: '10px 16px',
                  marginBottom: '-1px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-rubik)',
                  fontSize: '15px',
                  fontWeight: activeTab === tab ? 'bold' : 'normal',
                  color: activeTab === tab ? '#1A4731' : '#999',
                }}
              >
                {tab === 'posts' ? t('profile.posts') : t('profile.replies')}
              </button>
            ))}
          </div>

          {posts.length === 0 && !isLoadingMore ? (
            <p style={{ fontFamily: 'var(--font-alata)', color: '#999', textAlign: 'center', padding: '40px' }}>
              {activeTab === 'posts' ? t('profile.noPosts') : t('profile.noReplies')}
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
                media={post.media}
                createdAt={new Date(post.created_at)}
                initialLikes={post.likeCount}
                initialComments={post.replyCount}
                edited={post.edited}
                deleted={post.deleted}
                initialIsLiked={likedPostIds.has(post._id)}
                onDeleted={(deletedId) => setPosts(prev => prev.filter(p => p._id !== deletedId))}
              />
            ))
          )}

          {isLoadingMore && (
            <div style={{ textAlign: 'center', padding: '20px', fontFamily: 'var(--font-alata)', color: '#999' }}>
              {t('common.loading')}
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <div style={{ textAlign: 'center', padding: '24px', fontFamily: 'var(--font-alata)', color: '#999', fontSize: '14px', borderTop: '1px solid #E0E0E0', marginTop: '8px' }}>
              {t('profile.allLoaded')}
            </div>
          )}

          <div ref={sentinelRef} style={{ height: '1px' }} />
        </div>
      </div>
    </div>
  );
}
