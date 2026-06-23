'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical } from 'lucide-react';
import { userAPI, Profile } from '@/lib/api';
import UploadImageModal from '@/components/UploadImageModal';

interface ProfileHeaderProps {
  displayName?: string;
  username?: string;
  bio?: string;
  avatarUrl?: string | null;
  bannerUrl?: string | null;
  followers?: number;
  following?: number;
  onProfileUpdate?: (updated: Partial<Profile>) => void;
  isFollowing?: boolean;
  followLoading?: boolean;
  onFollowToggle?: () => void;
}

export default function ProfileHeader({
  displayName = 'John Doe',
  username = 'johndoe',
  bio = 'This is my bio',
  avatarUrl = null,
  bannerUrl = null,
  followers = 0,
  following = 0,
  onProfileUpdate,
  isFollowing = false,
  followLoading = false,
  onFollowToggle,
}: ProfileHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [bioText, setBioText] = useState(bio);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadModal, setUploadModal] = useState<'avatar' | 'banner' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleBioSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await userAPI.updateMe({ bio: bioText });
      onProfileUpdate?.({ bio: bioText });
      setEditingBio(false);
    } catch {
      // silently ignore
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    const { avatarUrl: newUrl } = await userAPI.uploadAvatar(file);
    onProfileUpdate?.({ avatarUrl: newUrl });
  };

  const handleBannerUpload = async (file: File) => {
    const { bannerUrl: newUrl } = await userAPI.uploadBanner(file);
    onProfileUpdate?.({ bannerUrl: newUrl });
  };

  return (
    <div style={{ marginBottom: '32px' }}>
      {uploadModal && (
        <UploadImageModal
          type={uploadModal}
          onUpload={uploadModal === 'avatar' ? handleAvatarUpload : handleBannerUpload}
          onClose={() => setUploadModal(null)}
        />
      )}

      {/* Banner */}
      <div
        style={{
          width: '100%',
          height: '200px',
          backgroundColor: '#1A4731',
          backgroundImage: bannerUrl ? `url(${bannerUrl})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '8px',
          marginBottom: '-50px',
          position: 'relative',
          zIndex: 0,
        }}
      />

      {/* Profile Card */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #1A4731',
          borderRadius: '8px',
          padding: '32px 24px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Menu 3 points (own profile) — reste en absolute */}
        <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>
          {onFollowToggle ? null : onProfileUpdate ? (
            <div ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <MoreVertical size={20} style={{ color: '#1A4731' }} />
              </button>

              {showMenu && (
                <div
                  style={{
                    position: 'absolute', top: '100%', right: 0,
                    backgroundColor: '#ffffff', border: '1px solid #1A4731',
                    borderRadius: '6px', minWidth: '150px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', marginTop: '8px', zIndex: 50,
                  }}
                >
                  <button
                    onClick={() => { setShowMenu(false); setUploadModal('banner'); }}
                    style={{ width: '100%', padding: '12px 16px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font-alata)', color: '#1A4731', borderBottom: '1px solid #F4F5F4' }}
                  >
                    Edit Banner
                  </button>
                  <button
                    onClick={() => { setShowMenu(false); setUploadModal('avatar'); }}
                    style={{ width: '100%', padding: '12px 16px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font-alata)', color: '#1A4731', borderBottom: '1px solid #F4F5F4' }}
                  >
                    Edit Photo
                  </button>
                  <button
                    onClick={() => { setShowMenu(false); setEditingBio(true); }}
                    style={{ width: '100%', padding: '12px 16px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontFamily: 'var(--font-alata)', color: '#1A4731' }}
                  >
                    Edit Bio
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>


        {/* Avatar + User Info */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', marginBottom: '24px' }}>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={username}
              style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #ffffff', flexShrink: 0 }}
            />
          ) : (
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#1A4731', border: '4px solid #ffffff', flexShrink: 0 }} />
          )}

          <div style={{ flex: 1 }}>
            <div style={{ marginBottom: '8px' }}>
              <h1 style={{ fontFamily: 'var(--font-rubik)', color: '#1A4731', margin: 0, marginBottom: '4px', fontSize: '24px' }}>
                {displayName}
              </h1>
              <p style={{ fontFamily: 'var(--font-alata)', color: '#999', margin: 0, fontSize: '14px' }}>
                @{username}
              </p>
            </div>

            {editingBio ? (
              <div style={{ marginBottom: '16px' }}>
                <textarea
                  value={bioText}
                  onChange={(e) => { if (e.target.value.length <= 160) setBioText(e.target.value) }}
                  style={{ width: '100%', padding: '8px', border: '1px solid #1A4731', borderRadius: '4px', fontFamily: 'var(--font-alata)', fontSize: '14px', resize: 'none', minHeight: '60px', boxSizing: 'border-box' }}
                />
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button
                    onClick={handleBioSave}
                    disabled={isSaving}
                    style={{ padding: '6px 16px', backgroundColor: '#1A4731', color: 'white', border: 'none', borderRadius: '4px', fontFamily: 'var(--font-alata)', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.6 : 1 }}
                  >
                    {isSaving ? '...' : 'Save'}
                  </button>
                  <button
                    onClick={() => { setEditingBio(false); setBioText(bio); }}
                    style={{ padding: '6px 16px', backgroundColor: 'transparent', color: '#1A4731', border: '1px solid #1A4731', borderRadius: '4px', fontFamily: 'var(--font-alata)', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ fontFamily: 'var(--font-alata)', color: '#666', margin: 0, marginBottom: '16px' }}>
                {bio || <span style={{ color: '#ccc' }}>No bio</span>}
              </p>
            )}

            {/* Stats */}
            <div style={{ display: 'flex', gap: '32px' }}>
              <div>
                <p style={{ fontFamily: 'var(--font-rubik)', color: '#1A4731', margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{followers}</p>
                <p style={{ fontFamily: 'var(--font-alata)', color: '#666', margin: 0, fontSize: '12px' }}>Followers</p>
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-rubik)', color: '#1A4731', margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{following}</p>
                <p style={{ fontFamily: 'var(--font-alata)', color: '#666', margin: 0, fontSize: '12px' }}>Following</p>
              </div>
            </div>

          </div>
        </div>

        {/* Follow/Unfollow button — full width below the avatar+info block */}
        {onFollowToggle && (
          <button
            onClick={onFollowToggle}
            disabled={followLoading}
            style={{
              width: '100%',
              marginTop: '16px',
              padding: '10px',
              backgroundColor: isFollowing ? 'transparent' : '#1A4731',
              color: isFollowing ? '#1A4731' : 'white',
              border: '2px solid #1A4731',
              borderRadius: '8px',
              fontFamily: 'var(--font-alata)',
              fontSize: '14px',
              cursor: followLoading ? 'not-allowed' : 'pointer',
              opacity: followLoading ? 0.6 : 1,
              transition: 'all 0.15s',
            }}
          >
            {followLoading ? '...' : isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        )}
      </div>
    </div>
  );
}
