'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Film, Heart, ImagePlus, Link2, MessageCircle, Pencil, Share2, Trash2, X } from 'lucide-react';
import { postAPI, MediaItem } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import ConfirmModal from '@/components/ConfirmModal';
import GifPickerModal from '@/components/GifPickerModal';
import { ALLOWED_MEDIA_TYPES, MAX_MEDIA_SIZE, mediaItemFromUrl } from '@/lib/media';

interface PostProps {
  id?: string;
  displayName?: string;
  username?: string;
  avatarUrl?: string | null;
  content: string;
  media?: MediaItem[];
  createdAt: Date;
  initialLikes?: number;
  initialComments?: number;
  edited?: boolean;
  initialIsLiked?: boolean;
  onDeleted?: (id: string) => void;
}

export default function Post({
  id = '1',
  displayName = 'User Name',
  username = 'username',
  avatarUrl = null,
  content = 'This is a sample post content',
  media = [],
  createdAt = new Date(),
  initialLikes = 0,
  initialComments = 0,
  edited = false,
  initialIsLiked = false,
  onDeleted,
}: PostProps) {
  const { user } = useAuth();
  const isOwner = user?.username === username;

  const [likes, setLikes] = useState(initialLikes);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [comments, setComments] = useState(initialComments);
  const [copied, setCopied] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(content);
  const [currentContent, setCurrentContent] = useState(content);
  const [currentMedia, setCurrentMedia] = useState<MediaItem[]>(media);
  const [isEdited, setIsEdited] = useState(edited);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editMediaFile, setEditMediaFile] = useState<File | null>(null);
  const [editRemoteMedia, setEditRemoteMedia] = useState<MediaItem | null>(media[0] ?? null);
  const [editMediaPreview, setEditMediaPreview] = useState<string | null>(media[0]?.url ?? null);
  const [editMediaUrl, setEditMediaUrl] = useState('');
  const [isEditMediaUrlOpen, setIsEditMediaUrlOpen] = useState(false);
  const [isEditGifPickerOpen, setIsEditGifPickerOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const editObjectUrlRef = useRef<string | null>(null);

  // Le statut « liké » est récupéré côté page de façon asynchrone, après le
  // premier rendu : useState ne prend sa valeur initiale qu'au montage, donc on
  // resynchronise l'état quand la prop change réellement (hydratation du like).
  useEffect(() => {
    setIsLiked(initialIsLiked);
  }, [initialIsLiked]);

  const revokeEditObjectUrl = () => {
    if (editObjectUrlRef.current) {
      URL.revokeObjectURL(editObjectUrlRef.current);
      editObjectUrlRef.current = null;
    }
  };

  useEffect(() => {
    return revokeEditObjectUrl;
  }, []);

  const handleLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      if (isLiked) {
        const res = await postAPI.unlike(id);
        setLikes(res.count);
      } else {
        const res = await postAPI.like(id);
        setLikes(res.count);
      }
      setIsLiked(!isLiked);
    } catch {
      // silently ignore (ex: non authentifié)
    } finally {
      setLikeLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const beginEdit = () => {
    revokeEditObjectUrl();
    const existingMedia = currentMedia[0] ?? null;
    setEditText(currentContent);
    setEditMediaFile(null);
    setEditRemoteMedia(existingMedia);
    setEditMediaPreview(existingMedia?.url ?? null);
    setEditMediaUrl('');
    setEditError(null);
    setIsEditMediaUrlOpen(false);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    revokeEditObjectUrl();
    setEditText(currentContent);
    setEditMediaFile(null);
    setEditRemoteMedia(currentMedia[0] ?? null);
    setEditMediaPreview(null);
    setEditMediaUrl('');
    setEditError(null);
    setIsEditMediaUrlOpen(false);
    setIsEditGifPickerOpen(false);
    setIsEditing(false);
  };

  const clearEditMedia = () => {
    revokeEditObjectUrl();
    setEditMediaFile(null);
    setEditRemoteMedia(null);
    setEditMediaPreview(null);
    setEditMediaUrl('');
    setIsEditMediaUrlOpen(false);
  };

  const handleEditFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!ALLOWED_MEDIA_TYPES.includes(file.type)) {
      setEditError('Format non supporté (jpeg, png, webp, gif uniquement)');
      return;
    }
    if (file.size > MAX_MEDIA_SIZE) {
      setEditError('Fichier trop volumineux (10 Mo max)');
      return;
    }

    revokeEditObjectUrl();
    const previewUrl = URL.createObjectURL(file);
    editObjectUrlRef.current = previewUrl;
    setEditError(null);
    setEditMediaFile(file);
    setEditRemoteMedia(null);
    setEditMediaPreview(previewUrl);
    setIsEditMediaUrlOpen(false);
  };

  const handleEditGifSelect = (gif: { url: string; preview: string }) => {
    revokeEditObjectUrl();
    setEditError(null);
    setEditMediaFile(null);
    setEditRemoteMedia({ url: gif.url, type: 'gif' });
    setEditMediaPreview(gif.preview);
    setIsEditMediaUrlOpen(false);
    setIsEditGifPickerOpen(false);
  };

  const handleEditMediaUrlChange = (value: string) => {
    const media = mediaItemFromUrl(value);
    revokeEditObjectUrl();
    setEditError(null);
    setEditMediaFile(null);
    setEditMediaUrl(value);
    setEditRemoteMedia(media);
    setEditMediaPreview(media?.url ?? null);
  };

  const mediaEquals = (a: MediaItem[], b: MediaItem[]) => {
    return a.length === b.length && a.every((item, index) => item.url === b[index]?.url && item.type === b[index]?.type);
  };

  const handleEditSave = async () => {
    const nextMediaBeforeUpload = editRemoteMedia ? [editRemoteMedia] : [];
    if (editLoading || (!editText.trim() && !editMediaFile && nextMediaBeforeUpload.length === 0)) {
      setEditError('Le contenu ou un média est requis');
      return;
    }
    if (!editMediaFile && editText.trim() === currentContent && mediaEquals(nextMediaBeforeUpload, currentMedia)) {
      setIsEditing(false);
      return;
    }

    setEditLoading(true);
    setEditError(null);
    try {
      const nextMedia = editMediaFile
        ? [await postAPI.uploadMedia(editMediaFile)]
        : nextMediaBeforeUpload;
      const updated = await postAPI.update(id, editText.trim(), nextMedia);
      setCurrentContent(updated.content);
      setEditText(updated.content);
      setCurrentMedia(updated.media ?? []);
      setEditRemoteMedia(updated.media?.[0] ?? null);
      setEditMediaPreview(null);
      setEditMediaFile(null);
      revokeEditObjectUrl();
      setIsEdited(true);
      setIsEditing(false);
    } catch (e) {
      setEditError(e instanceof Error ? e.message : 'Failed to update post');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteLoading) return;
    setDeleteLoading(true);
    try {
      await postAPI.delete(id);
      onDeleted?.(id); // le parent retire le post de la liste
    } catch {
      setDeleteLoading(false); // on ne reset qu'en cas d'échec (sinon démonté)
      setShowDeleteModal(false);
    }
  };

  const copyToClipboard = (id: string, author: string) => {
    const url = `${window.location.origin}/${author}/status/${id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasEditMedia = editMediaFile !== null || editRemoteMedia !== null;
  const canSaveEdit = (editText.trim() !== '' || hasEditMedia) && !editLoading;

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #1A4731',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
      }}
    >
      {showDeleteModal && (
        <ConfirmModal
          title="Delete post"
          message="This post will be permanently deleted. This action cannot be undone."
          confirmLabel="Delete"
          danger
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {/* Header with avatar and user info */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px',
        }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={username}
            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
          />
        ) : (
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#1A4731', flexShrink: 0 }} />
        )}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Link href={`/profile/${username}`} style={{ textDecoration: 'none' }}>
              <p style={{ margin: 0, fontFamily: 'var(--font-rubik)', color: '#1A4731', fontWeight: 'bold', cursor: 'pointer' }}>
                {displayName}
              </p>
            </Link>
            <Link href={`/profile/${username}`} style={{ textDecoration: 'none' }}>
              <p style={{ margin: 0, fontFamily: 'var(--font-alata)', color: '#999', fontSize: '12px', cursor: 'pointer' }}>
                @{username}
              </p>
            </Link>
            {isEdited && (
              <span style={{ fontFamily: 'var(--font-alata)', color: '#999', fontSize: '11px' }}>· edited</span>
            )}
          </div>
          <p style={{ margin: 0, fontFamily: 'var(--font-alata)', color: '#666', fontSize: '12px' }}>
            {formatDate(createdAt)}
          </p>
        </div>
        {isOwner && !isEditing && (
          <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
            <button
              onClick={beginEdit}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#999' }}
              title="Edit"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#999' }}
              title="Delete"
              onMouseEnter={e => (e.currentTarget.style.color = '#dc2626')}
              onMouseLeave={e => (e.currentTarget.style.color = '#999')}
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Post content */}
      {isEditing ? (
        <div style={{ marginBottom: '16px' }}>
          <textarea
            value={editText}
            onChange={e => { if (e.target.value.length <= 280) setEditText(e.target.value); }}
            style={{ width: '100%', padding: '8px', border: '1px solid #1A4731', borderRadius: '4px', fontFamily: 'var(--font-alata)', fontSize: '14px', resize: 'none', minHeight: '60px', boxSizing: 'border-box', outline: 'none' }}
            autoFocus
          />

          {editMediaPreview && (
            <div style={{ position: 'relative', display: 'inline-block', marginTop: '10px' }}>
              <img
                src={editMediaPreview}
                alt=""
                style={{ maxWidth: '100%', maxHeight: '240px', borderRadius: '8px', border: '1px solid #1A4731', display: 'block' }}
              />
              <button
                onClick={clearEditMedia}
                title="Retirer"
                style={{ position: 'absolute', top: '8px', right: '8px', width: '28px', height: '28px', borderRadius: '50%', border: 'none', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={16} />
              </button>
            </div>
          )}

          {isEditMediaUrlOpen && editMediaFile === null && (
            <div style={{ marginTop: '10px' }}>
              <input
                value={editMediaUrl}
                onChange={e => handleEditMediaUrlChange(e.target.value)}
                placeholder="Coller un lien média"
                style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', border: '1px solid #1A4731', borderRadius: '6px', fontFamily: 'var(--font-alata)', fontSize: '13px', color: '#1A4731', outline: 'none' }}
              />
            </div>
          )}

          {editError && (
            <div style={{ color: '#dc2626', fontFamily: 'var(--font-alata)', fontSize: '13px', marginTop: '8px' }}>
              {editError}
            </div>
          )}

          <input
            ref={editFileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleEditFileSelect}
            style={{ display: 'none' }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
            <button
              onClick={() => editFileInputRef.current?.click()}
              disabled={editLoading || hasEditMedia}
              title="Ajouter une image ou un GIF"
              style={{ background: 'none', border: 'none', cursor: editLoading || hasEditMedia ? 'not-allowed' : 'pointer', color: '#1A4731', padding: '4px', display: 'flex', opacity: editLoading || hasEditMedia ? 0.4 : 1 }}
            >
              <ImagePlus size={18} />
            </button>
            <button
              onClick={() => setIsEditMediaUrlOpen(prev => !prev)}
              disabled={editLoading || hasEditMedia}
              title="Ajouter un média par URL"
              style={{ background: 'none', border: 'none', cursor: editLoading || hasEditMedia ? 'not-allowed' : 'pointer', color: '#1A4731', padding: '4px', display: 'flex', opacity: editLoading || hasEditMedia ? 0.4 : 1 }}
            >
              <Link2 size={18} />
            </button>
            <button
              onClick={() => setIsEditGifPickerOpen(true)}
              disabled={editLoading || hasEditMedia}
              title="Choisir un GIF Klipy"
              style={{ background: 'none', border: 'none', cursor: editLoading || hasEditMedia ? 'not-allowed' : 'pointer', color: '#1A4731', padding: '4px', display: 'flex', opacity: editLoading || hasEditMedia ? 0.4 : 1 }}
            >
              <Film size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'flex-end' }}>
            <button
              onClick={cancelEdit}
              style={{ padding: '6px 14px', background: 'none', border: '1px solid #1A4731', borderRadius: '4px', fontFamily: 'var(--font-alata)', color: '#1A4731', cursor: 'pointer', fontSize: '13px' }}
            >
              Cancel
            </button>
            <button
              onClick={handleEditSave}
              disabled={!canSaveEdit}
              style={{ padding: '6px 14px', backgroundColor: '#1A4731', border: 'none', borderRadius: '4px', fontFamily: 'var(--font-alata)', color: 'white', cursor: !canSaveEdit ? 'not-allowed' : 'pointer', fontSize: '13px', opacity: !canSaveEdit ? 0.6 : 1 }}
            >
              {editLoading ? '...' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <Link href={`/${username}/status/${id}`} style={{ textDecoration: 'none' }}>
          <p style={{ fontFamily: 'var(--font-alata)', color: '#1A4731', marginBottom: '16px', lineHeight: '1.5', cursor: 'pointer', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
            {currentContent}
          </p>
        </Link>
      )}

      {/* Médias (images / GIF) */}
      {!isEditing && currentMedia.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          {currentMedia.map((m, i) => (
            <img
              key={i}
              src={m.url}
              alt=""
              loading="lazy"
              style={{ maxWidth: '100%', maxHeight: '500px', borderRadius: '8px', border: '1px solid #1A4731', display: 'block' }}
            />
          ))}
        </div>
      )}

      {isEditGifPickerOpen && (
        <GifPickerModal
          onSelect={handleEditGifSelect}
          onClose={() => setIsEditGifPickerOpen(false)}
        />
      )}

      {/* Actions */}
      <div
        style={{
          display: 'flex',
          gap: '24px',
          marginTop: '12px',
          justifyContent: 'flex-end',
        }}
      >
        <button
          onClick={handleLike}
          disabled={likeLoading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: likeLoading ? 'default' : 'pointer',
            padding: 0,
            opacity: likeLoading ? 0.6 : 1,
          }}
        >
          <Heart
            size={18}
            style={{ color: isLiked ? '#dc2626' : '#1A4731', fill: isLiked ? '#dc2626' : 'none' }}
          />
          <span style={{ fontFamily: 'var(--font-alata)', color: '#1A4731', fontSize: '14px' }}>
            {likes}
          </span>
        </button>

        <Link href={`/${username}/status/${id}`} style={{ textDecoration: 'none' }}>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              color: '#1A4731',
            }}
          >
            <MessageCircle size={18} style={{ color: '#1A4731' }} />
            <span style={{ fontFamily: 'var(--font-alata)', color: '#1A4731', fontSize: '14px' }}>
              {comments}
            </span>
          </button>
        </Link>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => copyToClipboard(id, username)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              color: '#1A4731',
            }}
          >
            <Share2 size={18} style={{ color: '#1A4731' }} />
          </button>
          {copied && (
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
  );
}
