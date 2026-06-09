'use client';

import { useState } from 'react';

export default function SettingsContent() {
  const [displayName, setDisplayName] = useState('John Doe');
  const [username, setUsername] = useState('johndoe');
  const [email, setEmail] = useState('john@example.com');
  const [password, setPassword] = useState('');
  const [notificationsLikes, setNotificationsLikes] = useState(true);
  const [notificationsFollows, setNotificationsFollows] = useState(true);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1
          style={{
            fontFamily: 'var(--font-rubik)',
            color: '#1A4731',
            margin: 0,
            fontSize: '28px',
            marginBottom: '8px',
          }}
        >
          Settings
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-alata)',
            color: '#666',
            margin: 0,
          }}
        >
          Manage your account and preferences
        </p>
      </div>

      {/* Account Section */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #1A4731',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '24px',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-rubik)',
            color: '#1A4731',
            margin: '0 0 20px 0',
            fontSize: '20px',
          }}
        >
          Account
        </h2>

        {/* Display Name */}
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              fontFamily: 'var(--font-alata)',
              color: '#1A4731',
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
            }}
          >
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
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

        {/* Username (read-only) */}
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              fontFamily: 'var(--font-alata)',
              color: '#1A4731',
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
            }}
          >
            Username
          </label>
          <input
            type="text"
            value={username}
            disabled
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #E0E0E0',
              borderRadius: '6px',
              fontFamily: 'var(--font-alata)',
              fontSize: '14px',
              boxSizing: 'border-box',
              backgroundColor: '#F4F5F4',
              color: '#999',
              cursor: 'not-allowed',
              outline: 'none',
            }}
          />
          <p
            style={{
              fontFamily: 'var(--font-alata)',
              color: '#999',
              fontSize: '12px',
              margin: '6px 0 0 0',
            }}
          >
            Username cannot be changed
          </p>
        </div>

        {/* Email */}
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              fontFamily: 'var(--font-alata)',
              color: '#1A4731',
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
            }}
          >
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

        {/* Password */}
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              fontFamily: 'var(--font-alata)',
              color: '#1A4731',
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
            }}
          >
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
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
      </div>

      {/* Notifications Section */}
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #1A4731',
          borderRadius: '8px',
          padding: '24px',
          marginBottom: '24px',
        }}
      >
        <h2
          style={{
            fontFamily: 'var(--font-rubik)',
            color: '#1A4731',
            margin: '0 0 20px 0',
            fontSize: '20px',
          }}
        >
          Notifications
        </h2>

        {/* Likes notification toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            paddingBottom: '16px',
            borderBottom: '1px solid #F4F5F4',
          }}
        >
          <div>
            <p
              style={{
                fontFamily: 'var(--font-rubik)',
                color: '#1A4731',
                margin: '0 0 4px 0',
                fontSize: '14px',
              }}
            >
              Likes
            </p>
            <p
              style={{
                fontFamily: 'var(--font-alata)',
                color: '#999',
                margin: 0,
                fontSize: '12px',
              }}
            >
              Get notified when someone likes your post
            </p>
          </div>
          <label
            style={{
              position: 'relative',
              display: 'inline-block',
              width: '50px',
              height: '24px',
            }}
          >
            <input
              type="checkbox"
              checked={notificationsLikes}
              onChange={(e) => setNotificationsLikes(e.target.checked)}
              style={{
                opacity: 0,
                width: 0,
                height: 0,
              }}
            />
            <span
              style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: notificationsLikes ? '#1A4731' : '#E0E0E0',
                transition: 'background-color 0.3s',
                borderRadius: '24px',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  content: '""',
                  height: '18px',
                  width: '18px',
                  left: notificationsLikes ? '29px' : '3px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'white',
                  transition: 'left 0.3s',
                  borderRadius: '50%',
                }}
              />
            </span>
          </label>
        </div>

        {/* Follows notification toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <p
              style={{
                fontFamily: 'var(--font-rubik)',
                color: '#1A4731',
                margin: '0 0 4px 0',
                fontSize: '14px',
              }}
            >
              Follows
            </p>
            <p
              style={{
                fontFamily: 'var(--font-alata)',
                color: '#999',
                margin: 0,
                fontSize: '12px',
              }}
            >
              Get notified when someone follows you
            </p>
          </div>
          <label
            style={{
              position: 'relative',
              display: 'inline-block',
              width: '50px',
              height: '24px',
            }}
          >
            <input
              type="checkbox"
              checked={notificationsFollows}
              onChange={(e) => setNotificationsFollows(e.target.checked)}
              style={{
                opacity: 0,
                width: 0,
                height: 0,
              }}
            />
            <span
              style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: notificationsFollows ? '#1A4731' : '#E0E0E0',
                transition: 'background-color 0.3s',
                borderRadius: '24px',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  content: '""',
                  height: '18px',
                  width: '18px',
                  left: notificationsFollows ? '29px' : '3px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'white',
                  transition: 'left 0.3s',
                  borderRadius: '50%',
                }}
              />
            </span>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <button
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#1A4731',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontFamily: 'var(--font-rubik)',
          fontSize: '16px',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}
      >
        Save All
      </button>
    </div>
  );
}
