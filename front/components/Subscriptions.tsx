'use client';

export default function Subscriptions() {
  const users = [
    { id: 1, name: 'User 1', avatar: null },
    { id: 2, name: 'User 2', avatar: null },
    { id: 3, name: 'User 3', avatar: null },
  ];

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '2px solid #1A4731',
        borderRadius: '8px',
        padding: '16px',
      }}
    >
      <h3
        style={{
          fontFamily: 'var(--font-alata)',
          color: '#1A4731',
          marginBottom: '16px',
          fontSize: '18px',
        }}
      >
        Following
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {users.map((user) => (
          <div
            key={user.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              paddingBottom: '12px',
              borderBottom: '1px solid #F4F5F4',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#1A4731',
              }}
            />
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontFamily: 'var(--font-alata)',
                  color: '#1A4731',
                  margin: 0,
                }}
              >
                {user.name}
              </p>
            </div>
            <button
              style={{
                padding: '6px 12px',
                backgroundColor: '#ffffff',
                color: '#1A4731',
                border: '1px solid #1A4731',
                borderRadius: '4px',
                fontFamily: 'var(--font-alata)',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Unfollow
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
