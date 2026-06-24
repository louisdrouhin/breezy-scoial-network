'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Film, Heart, ImagePlus, Link2, MessageCircle, Pencil, Share2, Trash2, X } from 'lucide-react';
import { postAPI, MediaItem } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import ConfirmModal from '@/components/ConfirmModal';
import GifPickerModal from '@/components/GifPickerModal';
import RichPostText from '@/components/RichPostText';
import { ALLOWED_MEDIA_TYPES, MAX_MEDIA_SIZE, mediaItemFromUrl } from '@/lib/media';
import { useLanguage } from '@/contexts/LanguageContext';

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
  deleted?: boolean;
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
  deleted = false,
  initialIsLiked = false,
  onDeleted,
}: PostProps) {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [currentDeleted, setCurrentDeleted] = useState(deleted);
  const isOwner = user?.username === username && !currentDeleted;

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
    if (likeLoading || currentDeleted) return;
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

    if (diffMins < 1) return t('time.now');
    if (diffMins < 60) return t('time.minutesAgo', { count: diffMins });
    if (diffHours < 24) return t('time.hoursAgo', { count: diffHours });
    if (diffDays < 7) return t('time.daysAgo', { count: diffDays });

    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US');
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
      setEditError(t('post.unsupportedFormat'));
      return;
    }
    if (file.size > MAX_MEDIA_SIZE) {
      setEditError(t('post.fileTooLarge'));
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
      setEditError(t('post.required'));
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
      setEditError(e instanceof Error ? e.message : t('post.updateFailed'));
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteLoading) return;
    setDeleteLoading(true);
    try {
      await postAPI.delete(id);
      setCurrentDeleted(true);
      setCurrentContent('');
      setCurrentMedia([]);
      setLikes(0);
      setIsLiked(false);
      setShowDeleteModal(false);
      setDeleteLoading(false);
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
          title={t('post.deleteTitle')}
          message={t('post.deleteMessage')}
          confirmLabel={t('common.delete')}
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
            {isEdited && !currentDeleted && (
              <span style={{ fontFamily: 'var(--font-alata)', color: '#999', fontSize: '11px' }}>· {t('post.edited')}</span>
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
              title={t('post.edit')}
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#999' }}
              title={t('common.delete')}
              onMouseEnter={e => (e.currentTarget.style.color = '#dc2626')}
              onMouseLeave={e => (e.currentTarget.style.color = '#999')}
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Post content */}
      {currentDeleted ? (
        <p style={{ fontFamily: 'var(--font-alata)', color: '#777', marginBottom: '16px', lineHeight: '1.5', fontStyle: 'italic' }}>
          {t('post.deleted')}
        </p>
      ) : isEditing ? (
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
                title={t('post.removeMedia')}
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
                placeholder={t('post.pasteMediaUrl')}
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
              title={t('post.addImage')}
              style={{ background: 'none', border: 'none', cursor: editLoading || hasEditMedia ? 'not-allowed' : 'pointer', color: '#1A4731', padding: '4px', display: 'flex', opacity: editLoading || hasEditMedia ? 0.4 : 1 }}
            >
              <ImagePlus size={18} />
            </button>
            <button
              onClick={() => setIsEditMediaUrlOpen(prev => !prev)}
              disabled={editLoading || hasEditMedia}
              title={t('post.addMediaUrl')}
              style={{ background: 'none', border: 'none', cursor: editLoading || hasEditMedia ? 'not-allowed' : 'pointer', color: '#1A4731', padding: '4px', display: 'flex', opacity: editLoading || hasEditMedia ? 0.4 : 1 }}
            >
              <Link2 size={18} />
            </button>
            <button
              onClick={() => setIsEditGifPickerOpen(true)}
              disabled={editLoading || hasEditMedia}
              title={t('post.pickGif')}
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
              {t('common.cancel')}
            </button>
            <button
              onClick={handleEditSave}
              disabled={!canSaveEdit}
              style={{ padding: '6px 14px', backgroundColor: '#1A4731', border: 'none', borderRadius: '4px', fontFamily: 'var(--font-alata)', color: 'white', cursor: !canSaveEdit ? 'not-allowed' : 'pointer', fontSize: '13px', opacity: !canSaveEdit ? 0.6 : 1 }}
            >
              {editLoading ? '...' : t('common.save')}
            </button>
          </div>
        </div>
      ) : (
        currentContent ? <RichPostText text={currentContent} /> : null
      )}

      {/* Médias (images / GIF) */}
      {!currentDeleted && !isEditing && currentMedia.length > 0 && (
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
          disabled={likeLoading || currentDeleted}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: likeLoading || currentDeleted ? 'default' : 'pointer',
            padding: 0,
            opacity: likeLoading || currentDeleted ? 0.6 : 1,
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
              {t('post.copy')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
