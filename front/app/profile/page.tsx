import ProfileHeader from '@/components/ProfileHeader';
import Post from '@/components/Post';

export default function Profile() {
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
      className="profile-container"
    >
      {/* Center Column */}
      <div
        style={{ flex: '0 0 100%', paddingRight: '20px', paddingLeft: '20px' }}
      >
        <ProfileHeader
          displayName="John Doe"
          username="johndoe"
          bio="Creative developer & digital enthusiast. Building amazing things on the web 🚀"
          followers={2345}
          following={876}
        />

        {/* User Posts */}
        <div style={{ marginBottom: '24px' }}>
          <h2
            style={{
              fontFamily: 'var(--font-rubik)',
              color: '#1A4731',
              marginBottom: '16px',
            }}
          >
            Posts
          </h2>
          <Post
            displayName="John Doe"
            username="johndoe"
            content="Just launched my new project! Really excited about it 🚀"
            createdAt={new Date(Date.now() - 2 * 60 * 60 * 1000)}
            initialLikes={42}
            initialComments={8}
          />
          <Post
            displayName="John Doe"
            username="johndoe"
            content="Had an amazing time at the tech conference today. Learned so much!"
            createdAt={new Date(Date.now() - 8 * 60 * 60 * 1000)}
            initialLikes={156}
            initialComments={32}
          />
          <Post
            displayName="John Doe"
            username="johndoe"
            content="New blog post live! Check out my latest article on web development best practices"
            createdAt={new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)}
            initialLikes={89}
            initialComments={21}
          />
        </div>
      </div>
    </div>
  );
}
