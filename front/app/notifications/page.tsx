import Notification from '@/components/Notification';

export default function Notifications() {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#F4F5F4',
        paddingTop: '20px',
        paddingRight: '20px',
        paddingBottom: '80px',
        paddingLeft: '320px',
      }}
      className="notifications-container"
    >
      {/* Center Column */}
      <div
        style={{ flex: '0 0 100%', paddingRight: '20px', paddingLeft: '20px' }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #1A4731',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '24px',
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-rubik)',
              color: '#1A4731',
              margin: 0,
              fontSize: '28px',
            }}
          >
            Notifications
          </h1>
        </div>

        {/* Notifications List */}
        <div>
          <Notification
            type="like"
            displayName="John Doe"
            username="johndoe"
            action="liked your post"
            timestamp={new Date(Date.now() - 2 * 60 * 60 * 1000)}
          />
          <Notification
            type="comment"
            displayName="Jane Smith"
            username="janesmith"
            action="commented on your post"
            timestamp={new Date(Date.now() - 5 * 60 * 60 * 1000)}
          />
          <Notification
            type="follow"
            displayName="Alex Johnson"
            username="alexjohnson"
            action="started following you"
            timestamp={new Date(Date.now() - 8 * 60 * 60 * 1000)}
          />
          <Notification
            type="like"
            displayName="Sarah Williams"
            username="sarahwilliams"
            action="liked your post"
            timestamp={new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)}
          />
          <Notification
            type="comment"
            displayName="Mike Brown"
            username="mikebrown"
            action="commented on your post"
            timestamp={new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)}
          />
          <Notification
            type="follow"
            displayName="Emma Davis"
            username="emmadavis"
            action="started following you"
            timestamp={new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)}
          />
        </div>
      </div>
    </div>
  );
}
