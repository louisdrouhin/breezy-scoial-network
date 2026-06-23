'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { X, Upload, Image as ImageIcon } from 'lucide-react';

interface UploadImageModalProps {
  type: 'avatar' | 'banner';
  onUpload: (file: File) => Promise<void>;
  onClose: () => void;
}

const CANVAS_W = { avatar: 400, banner: 1200 };
const CANVAS_H = { avatar: 400, banner: 300 };
const PREVIEW_W = { avatar: 260, banner: 440 };
const PREVIEW_H = { avatar: 260, banner: 110 };

export default function UploadImageModal({ type, onUpload, onClose }: UploadImageModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // position de l'image dans le cadre (en px relatif au cadre)
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [imgNaturalSize, setImgNaturalSize] = useState({ w: 0, h: 0 });

  const isDraggingImg = useRef(false);
  const dragStart = useRef({ mx: 0, my: 0, ox: 0, oy: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const pw = PREVIEW_W[type];
  const ph = PREVIEW_H[type];

  const handleFile = (f: File) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(f.type)) { setError('Unsupported format. Use JPG, PNG, WEBP or GIF.'); return; }
    if (f.size > 5 * 1024 * 1024) { setError('File too large (max 5 MB).'); return; }
    setError(null);
    const url = URL.createObjectURL(f);
    setImageSrc(url);
  };

  // Quand l'image est chargée, on la centre et on calcule un scale minimal pour remplir le cadre
  const handleImageLoad = () => {
    if (!imgRef.current) return;
    const { naturalWidth: nw, naturalHeight: nh } = imgRef.current;
    setImgNaturalSize({ w: nw, h: nh });
    const minScale = Math.max(pw / nw, ph / nh);
    setScale(minScale);
    setOffset({ x: (pw - nw * minScale) / 2, y: (ph - nh * minScale) / 2 });
  };

  // Drag pour repositionner
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingImg.current = true;
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y };
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDraggingImg.current) return;
      const dx = e.clientX - dragStart.current.mx;
      const dy = e.clientY - dragStart.current.my;
      const imgW = imgNaturalSize.w * scale;
      const imgH = imgNaturalSize.h * scale;
      const newX = Math.min(0, Math.max(pw - imgW, dragStart.current.ox + dx));
      const newY = Math.min(0, Math.max(ph - imgH, dragStart.current.oy + dy));
      setOffset({ x: newX, y: newY });
    };
    const onUp = () => { isDraggingImg.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [imgNaturalSize, scale, pw, ph]);

  // Zoom avec la molette
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    const minScale = Math.max(pw / imgNaturalSize.w, ph / imgNaturalSize.h);
    const newScale = Math.max(minScale, Math.min(5, scale + delta));
    // Recalcul offset pour garder le centre
    const ratio = newScale / scale;
    const cx = pw / 2;
    const cy = ph / 2;
    const newX = cx - (cx - offset.x) * ratio;
    const newY = cy - (cy - offset.y) * ratio;
    const imgW = imgNaturalSize.w * newScale;
    const imgH = imgNaturalSize.h * newScale;
    setOffset({
      x: Math.min(0, Math.max(pw - imgW, newX)),
      y: Math.min(0, Math.max(ph - imgH, newY)),
    });
    setScale(newScale);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const handleSubmit = async () => {
    if (!imageSrc || isUploading) return;
    setIsUploading(true);
    setError(null);
    try {
      // Créer un canvas avec les dimensions finales et dessiner le crop
      const canvas = document.createElement('canvas');
      canvas.width = CANVAS_W[type];
      canvas.height = CANVAS_H[type];
      const ctx = canvas.getContext('2d')!;

      const img = new Image();
      img.src = imageSrc;
      await new Promise(res => { img.onload = res; });

      // Coordonnées source : ce que le preview montre converti en px naturels
      const srcX = -offset.x / scale;
      const srcY = -offset.y / scale;
      const srcW = pw / scale;
      const srcH = ph / scale;

      ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, CANVAS_W[type], CANVAS_H[type]);

      const blob = await new Promise<Blob>((res, rej) =>
        canvas.toBlob(b => b ? res(b) : rej(new Error('canvas error')), 'image/jpeg', 0.92)
      );
      const file = new File([blob], `${type}-${Date.now()}.jpg`, { type: 'image/jpeg' });
      await onUpload(file);
      onClose();
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const label = type === 'avatar' ? 'profile picture' : 'banner';

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '560px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-rubik)', color: '#1A4731', fontSize: '18px' }}>
            Edit {label}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#666' }}>
            <X size={20} />
          </button>
        </div>

        {imageSrc ? (
          <>
            {/* Éditeur de position */}
            <p style={{ margin: '0 0 8px', fontFamily: 'var(--font-alata)', color: '#666', fontSize: '12px', textAlign: 'center' }}>
              Drag to reposition · Scroll to zoom
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div
                onMouseDown={onMouseDown}
                onWheel={onWheel}
                style={{
                  width: `${pw}px`,
                  height: `${ph}px`,
                  borderRadius: type === 'avatar' ? '50%' : '8px',
                  overflow: 'hidden',
                  border: '2px solid #1A4731',
                  cursor: 'grab',
                  userSelect: 'none',
                  position: 'relative',
                  backgroundColor: '#000',
                }}
              >
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="preview"
                  onLoad={handleImageLoad}
                  draggable={false}
                  style={{
                    position: 'absolute',
                    left: `${offset.x}px`,
                    top: `${offset.y}px`,
                    width: `${imgNaturalSize.w * scale}px`,
                    height: `${imgNaturalSize.h * scale}px`,
                    pointerEvents: 'none',
                  }}
                />
              </div>
            </div>

            {/* Changer d'image */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: '1px solid #ccc', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', fontFamily: 'var(--font-alata)', color: '#666', fontSize: '13px' }}
              >
                <Upload size={14} /> Change image
              </button>
            </div>
          </>
        ) : (
          /* Drop zone */
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDraggingFile(true); }}
            onDragLeave={() => setIsDraggingFile(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDraggingFile ? '#1A4731' : '#ccc'}`,
              borderRadius: '8px', padding: '40px', textAlign: 'center', cursor: 'pointer',
              backgroundColor: isDraggingFile ? 'rgba(26,71,49,0.05)' : '#fafafa',
              transition: 'all 0.2s', marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <ImageIcon size={36} color="#ccc" />
              <p style={{ margin: 0, fontFamily: 'var(--font-alata)', color: '#666', fontSize: '14px' }}>
                Drag an image here or click to choose
              </p>
              <p style={{ margin: 0, fontFamily: 'var(--font-alata)', color: '#999', fontSize: '12px' }}>
                JPG, PNG, WEBP, GIF — max 5 MB
              </p>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          style={{ display: 'none' }}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ''; }}
        />

        {error && (
          <p style={{ margin: '0 0 16px', fontFamily: 'var(--font-alata)', color: '#dc2626', fontSize: '13px', textAlign: 'center' }}>
            {error}
          </p>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{ padding: '10px 20px', background: 'none', border: '1px solid #1A4731', borderRadius: '6px', fontFamily: 'var(--font-alata)', color: '#1A4731', cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!imageSrc || isUploading}
            style={{
              padding: '10px 20px', backgroundColor: '#1A4731', border: 'none',
              borderRadius: '6px', fontFamily: 'var(--font-alata)', color: 'white',
              cursor: !imageSrc || isUploading ? 'not-allowed' : 'pointer',
              opacity: !imageSrc || isUploading ? 0.6 : 1,
            }}
          >
            {isUploading ? 'Uploading...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
