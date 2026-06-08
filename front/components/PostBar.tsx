'use client';

import { useState, useRef, useEffect } from 'react';

export default function PostBar() {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [text]);

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '2px solid #1A4731',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
      }}
    >
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#1A4731',
            flexShrink: 0,
          }}
        />
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            if (e.target.value.length <= 280) {
              setText(e.target.value);
            }
          }}
          placeholder="Something to say?"
          maxLength={280}
          style={{
            flex: 1,
            minHeight: '100px',
            padding: '12px',
            border: 'none',
            borderRadius: '4px',
            fontFamily: 'var(--font-alata)',
            color: '#1A4731',
            fontSize: '16px',
            resize: 'none',
            outline: 'none',
            overflow: 'hidden',
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
        {(() => {
          const remaining = 280 - text.length;
          const percentRemaining = remaining / 28; // 10% = 28 chars remaining

          let color = '#1A4731'; // Green
          if (percentRemaining < 1) {
            // Calculate gradient from green to red
            const ratio = Math.max(0, percentRemaining);
            const red = Math.round(26 + (220 - 26) * (1 - ratio)); // 26 -> 220
            const green = Math.round(71 - 71 * (1 - ratio)); // 71 -> 0
            const blue = Math.round(49 - 49 * (1 - ratio)); // 49 -> 0
            color = `rgb(${red}, ${green}, ${blue})`;
          }

          return (
            <div style={{ fontSize: '12px', color, fontFamily: 'var(--font-alata)' }}>
              {text.length}/280
            </div>
          );
        })()}

        <button
          style={{
            padding: '10px 20px',
            backgroundColor: '#1A4731',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontFamily: 'var(--font-alata)',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          Post
        </button>
      </div>
    </div>
  );
}
