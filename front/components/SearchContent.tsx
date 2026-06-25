'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, UserCheck, UserPlus } from 'lucide-react';
import Post from '@/components/Post';
import { postAPI, Post as PostType, SearchProfile, userAPI } from '@/lib/api';
import { useProfileCache } from '@/hooks/useProfileCache';
import { useLanguage } from '@/contexts/LanguageContext';

interface SearchContentProps {
  initialTag?: string;
}

export default function SearchContent({ initialTag = '' }: SearchContentProps) {
  const [query, setQuery] = useState(initialTag ? `#${initialTag}` : '');
  const [results, setResults] = useState<SearchProfile[]>([]);
  const [postResults, setPostResults] = useState<PostType[]>([]);
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { cache: profileCache, loadProfiles } = useProfileCache();
  const { t } = useLanguage();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setQuery(initialTag ? `#${initialTag}` : '');
  }, [initialTag]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const q = query.trim();
    if (q.length === 0) {
      setPostResults([]);
      setLikedPostIds(new Set());
      setSearched(false);
      setIsLoading(true);
      userAPI.search('', 12)
        .then(data => setResults(data))
        .catch(() => setResults([]))
        .finally(() => setIsLoading(false));
      return;
    }

    if (q.length < 2) {
      setResults([]);
      setPostResults([]);
      setSearched(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        if (q.startsWith('#')) {
          const tag = q.slice(1).trim();
          if (!tag) {
            setPostResults([]);
            setResults([]);
            setSearched(true);
            return;
          }

          const posts = await postAPI.getByTag(tag);
          setPostResults(posts);
          setResults([]);
          loadProfiles(posts.map(post => post.authorUsername));

          const likeStatuses = await Promise.allSettled(posts.map(post => postAPI.getLikeStatus(post._id)));
          const liked = new Set<string>();
          likeStatuses.forEach((result, index) => {
            if (result.status === 'fulfilled' && result.value.liked) liked.add(posts[index]._id);
          });
          setLikedPostIds(liked);
        } else {
          const data = await userAPI.search(q, 20);
          setResults(data);
          setPostResults([]);
          setLikedPostIds(new Set());
        }
        setSearched(true);
      } catch {
        setResults([]);
        setPostResults([]);
        setSearched(true);
      } finally {
        setIsLoading(false);
      }
    }, 300);
  }, [query, loadProfiles]);

  const handleFollowToggle = async (user: SearchProfile, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (actionLoading) return;

    setActionLoading(user.username);
    try {
      if (user.isFollowing) {
        await userAPI.unfollow(user.username);
      } else {
        await userAPI.follow(user.username);
      }
      setResults(current => current.map(item => (
        item.username === user.username ? { ...item, isFollowing: !user.isFollowing } : item
      )));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F4F5F4', paddingBottom: '80px' }} className="search-container">
      <div style={{ flex: 1, padding: '20px' }} className="search-inner">
        <h1 style={{ fontFamily: 'var(--font-rubik)', color: '#1A4731', margin: '0 0 16px 0', fontSize: '28px' }}>
          {t('search.title')}
        </h1>

        <div style={{ backgroundColor: '#ffffff', border: '2px solid #1A4731', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Search size={20} style={{ color: '#1A4731', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            style={{ flex: 1, border: 'none', outline: 'none', fontFamily: 'var(--font-alata)', color: '#1A4731', fontSize: '16px', backgroundColor: 'transparent' }}
          />
          {isLoading && (
            <div style={{ width: '16px', height: '16px', border: '2px solid #1A4731', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite', flexShrink: 0 }} />
          )}
        </div>

        {!searched && !isLoading && results.length === 0 && (
          <p style={{ textAlign: 'center', paddingTop: '60px', fontFamily: 'var(--font-alata)', color: '#999', fontSize: '14px' }}>
            {t('search.start')}
          </p>
        )}

        {searched && results.length === 0 && postResults.length === 0 && !isLoading && (
          <p style={{ textAlign: 'center', paddingTop: '40px', fontFamily: 'var(--font-alata)', color: '#999', fontSize: '14px' }}>
            {t('search.none', { query })}
          </p>
        )}

        {results.length > 0 && (
          <div>
            <p style={{ margin: '0 0 10px 0', fontFamily: 'var(--font-rubik)', color: '#1A4731', fontSize: '16px' }}>
              {query.trim() ? t('search.users') : t('search.suggestions')}
            </p>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #1A4731', borderRadius: '8px', overflow: 'hidden' }}>
            {results.map((u, i) => (
              <div
                key={u.username}
                onClick={() => router.push(`/profile/${u.username}`)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', cursor: 'pointer', borderBottom: i < results.length - 1 ? '1px solid #F4F5F4' : 'none', flexWrap: 'wrap' }}
              >
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#1A4731', flexShrink: 0, overflow: 'hidden' }}>
                  {u.avatarUrl ? (
                    <img src={u.avatarUrl} alt={u.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: 'white', fontFamily: 'var(--font-alata)', fontSize: '16px' }}>
                        {u.username[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: '140px' }}>
                  <p style={{ margin: 0, fontFamily: 'var(--font-rubik)', fontSize: '15px', fontWeight: 600, color: '#1A4731' }}>
                    {u.displayName ?? u.username}
                  </p>
                  <p style={{ margin: 0, fontFamily: 'var(--font-alata)', fontSize: '13px', color: '#999' }}>
                    @{u.username}
                  </p>
                  {u.bio && (
                    <p style={{ margin: '4px 0 0 0', fontFamily: 'var(--font-alata)', fontSize: '12px', color: '#666', lineHeight: 1.35 }}>
                      {u.bio}
                    </p>
                  )}
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
                  {u.isFollowing && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '999px', backgroundColor: '#EAF6EE', color: '#1A4731', fontFamily: 'var(--font-alata)', fontSize: '12px', whiteSpace: 'nowrap' }}>
                      <UserCheck size={13} />
                      {t('search.followingBadge')}
                    </span>
                  )}
                  <button
                    onClick={(e) => handleFollowToggle(u, e)}
                    disabled={actionLoading === u.username}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 10px', border: '1px solid #1A4731', borderRadius: '6px', backgroundColor: u.isFollowing ? '#ffffff' : '#1A4731', color: u.isFollowing ? '#1A4731' : '#ffffff', fontFamily: 'var(--font-alata)', fontSize: '13px', cursor: actionLoading === u.username ? 'not-allowed' : 'pointer', opacity: actionLoading === u.username ? 0.65 : 1 }}
                  >
                    {u.isFollowing ? <UserCheck size={14} /> : <UserPlus size={14} />}
                    <span>{actionLoading === u.username ? '...' : u.isFollowing ? t('profile.unfollow') : t('profile.follow')}</span>
                  </button>
                </div>
              </div>
            ))}
            </div>
          </div>
        )}

        {postResults.length > 0 && (
          <div>
            {postResults.map(post => (
              <Post
                key={post._id}
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
                initialIsLiked={likedPostIds.has(post._id)}
                onDeleted={(deletedId) => setPostResults(prev => prev.filter(post => post._id !== deletedId))}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
