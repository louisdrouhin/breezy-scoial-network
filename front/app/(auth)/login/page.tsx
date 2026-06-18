'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';

export default function Login() {
  const router = useRouter();
  const { login, register, isLoading, error, isAuthenticated, isInitialized } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect immediately if authenticated, even before initialization completes
    console.log('Login page - isAuthenticated:', isAuthenticated, 'isInitialized:', isInitialized);
    if (isAuthenticated) {
      console.log('Redirecting to home');
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (isLogin) {
      const success = await login({ email, password });
      if (success) {
        // Redirect immediately after successful login
        // The httpOnly cookie is already set by the server
        setTimeout(() => router.push('/'), 100);
      }
    } else {
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match');
        return;
      }
      const success = await register({ username, email, password });
      if (success) {
        setLocalError(null);
        setIsLogin(true);
        setEmail('');
        setPassword('');
        setUsername('');
        setConfirmPassword('');
      }
    }
  };

  const displayError = error || localError;

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F4F5F4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '2px solid #1A4731',
          borderRadius: '12px',
          padding: '40px',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Image src="/Breezy-Logo.svg" alt="Breezy Logo" width={60} height={60} />
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: 'var(--font-rubik)',
            color: '#1A4731',
            textAlign: 'center',
            marginBottom: '8px',
            fontSize: '28px',
          }}
        >
          {isLogin ? 'Login' : 'Sign Up'}
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-alata)',
            color: '#666',
            textAlign: 'center',
            marginBottom: '32px',
            fontSize: '14px',
          }}
        >
          {isLogin ? 'Welcome back!' : 'Join our community!'}
        </p>

        {/* Error Message */}
        {displayError && (
          <div
            style={{
              backgroundColor: '#fee',
              border: '1px solid #f88',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '16px',
              color: '#c00',
              fontSize: '14px',
              fontFamily: 'var(--font-alata)',
            }}
          >
            {displayError}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {!isLogin && (
            <div>
              <label
                style={{
                  fontFamily: 'var(--font-alata)',
                  color: '#1A4731',
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                }}
              >
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #1A4731',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-alata)',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>
          )}

          <div>
            <label
              style={{
                fontFamily: 'var(--font-alata)',
                color: '#1A4731',
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #1A4731',
                borderRadius: '6px',
                fontFamily: 'var(--font-alata)',
                fontSize: '14px',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label
              style={{
                fontFamily: 'var(--font-alata)',
                color: '#1A4731',
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #1A4731',
                borderRadius: '6px',
                fontFamily: 'var(--font-alata)',
                fontSize: '14px',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          {!isLogin && (
            <div>
              <label
                style={{
                  fontFamily: 'var(--font-alata)',
                  color: '#1A4731',
                  display: 'block',
                  marginBottom: '6px',
                  fontSize: '14px',
                }}
              >
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #1A4731',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-alata)',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none',
                }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: isLoading ? '#999' : '#1A4731',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontFamily: 'var(--font-rubik)',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              marginTop: '8px',
            }}
          >
            {isLoading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>

        {/* Toggle */}
        <p
          style={{
            textAlign: 'center',
            fontFamily: 'var(--font-alata)',
            color: '#666',
            marginTop: '24px',
            fontSize: '14px',
          }}
        >
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setLocalError(null);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#1A4731',
              cursor: 'pointer',
              fontFamily: 'var(--font-alata)',
              textDecoration: 'underline',
              fontSize: '14px',
            }}
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}
