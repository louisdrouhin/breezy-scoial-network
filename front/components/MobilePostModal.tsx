'use client';

import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface MobilePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobilePostModal({ isOpen, onClose }: MobilePostModalProps) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const charLimit = 280;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '100px';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [content]);

  const handlePost = () => {
    if (content.trim()) {
      setContent('');
      onClose();
    }
  };

  const getRatio = content.length / charLimit;
  const color = getRatio < 0.7
    ? '#1A4731'
    : `rgb(${Math.round(26 + (220 - 26) * (getRatio - 0.7) / 0.3)}, ${Math.round(71 + (38 - 71) * (getRatio - 0.7) / 0.3)}, ${Math.round(49 + (38 - 49) * (getRatio - 0.7) / 0.3)})`;

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 998,
            animation: 'fadeIn 0.3s ease',
          }}
          onClick={onClose}
        />
      )}

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#ffffff',
          zIndex: 999,
          transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '20px',
          overflowY: 'auto',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <X size={24} color="#1A4731" />
        </button>

        {/* Header */}
        <div
          style={{
            marginBottom: '16px',
            marginTop: '8px',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-rubik)',
              color: '#1A4731',
              fontSize: '20px',
              margin: 0,
            }}
          >
            Create Post
          </h2>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #1A4731',
            borderRadius: '8px',
            fontFamily: 'var(--font-alata)',
            fontSize: '14px',
            boxSizing: 'border-box',
            outline: 'none',
            minHeight: '100px',
            maxHeight: '200px',
            overflow: 'hidden',
            resize: 'none',
          }}
        />

        {/* Character Counter */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-alata)',
              fontSize: '12px',
              color: color,
            }}
          >
            {content.length}/{charLimit}
          </span>
          <button
            onClick={handlePost}
            disabled={content.length === 0 || content.length > charLimit}
            style={{
              padding: '10px 24px',
              backgroundColor: '#1A4731',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontFamily: 'var(--font-rubik)',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: content.length > 0 && content.length <= charLimit ? 'pointer' : 'not-allowed',
              opacity: content.length > 0 && content.length <= charLimit ? 1 : 0.5,
            }}
          >
            Post
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
