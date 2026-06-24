'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';

interface RichPostTextProps {
  text: string;
  style?: CSSProperties;
}

const TOKEN_RE = /(https?:\/\/[^\s]+|[@#][A-Za-z0-9_]+)/g;

export default function RichPostText({ text, style }: RichPostTextProps) {
  const parts = text.split(TOKEN_RE);

  return (
    <p
      style={{
        fontFamily: 'var(--font-alata)',
        color: '#1A4731',
        marginBottom: '16px',
        lineHeight: '1.5',
        wordBreak: 'break-word',
        overflowWrap: 'anywhere',
        whiteSpace: 'pre-wrap',
        ...style,
      }}
    >
      {parts.map((part, index) => {
        if (!part) return null;

        if (part.startsWith('#') && part.length > 1) {
          const tag = part.slice(1);
          return (
            <Link key={index} href={`/search?tag=${encodeURIComponent(tag)}`} style={{ color: '#1A4731', fontWeight: 700, textDecoration: 'none' }}>
              {part}
            </Link>
          );
        }

        if (part.startsWith('@') && part.length > 1) {
          const username = part.slice(1);
          return (
            <Link key={index} href={`/profile/${username}`} style={{ color: '#1A4731', fontWeight: 700, textDecoration: 'none' }}>
              {part}
            </Link>
          );
        }

        if (part.startsWith('http')) {
          return (
            <a key={index} href={part} target="_blank" rel="noreferrer" style={{ color: '#1A4731', textDecoration: 'underline' }}>
              {part}
            </a>
          );
        }

        return <span key={index}>{part}</span>;
      })}
    </p>
  );
}
