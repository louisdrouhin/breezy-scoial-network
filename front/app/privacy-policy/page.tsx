export default function PrivacyPolicy() {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#F4F5F4',
      }}
      className="privacy-container"
    >
      {/* Center Column */}
      <div
        style={{ flex: '0 0 100%' }}
        className="privacy-content"
      >
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
              Privacy Policy
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-alata)',
                color: '#666',
                margin: 0,
              }}
            >
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Content */}
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #1A4731',
              borderRadius: '8px',
              padding: '24px',
              fontFamily: 'var(--font-alata)',
              color: '#333',
              lineHeight: '1.6',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-rubik)',
                color: '#1A4731',
                fontSize: '20px',
                marginBottom: '16px',
                marginTop: '24px',
              }}
            >
              1. Introduction
            </h2>
            <p>
              Breezy ("we", "our", or "us") operates the Breezy website and mobile application. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
            </p>

            <h2
              style={{
                fontFamily: 'var(--font-rubik)',
                color: '#1A4731',
                fontSize: '20px',
                marginBottom: '16px',
                marginTop: '24px',
              }}
            >
              2. Information Collection and Use
            </h2>
            <p>
              We collect several different types of information for various purposes to provide and improve our Service to you.
            </p>
            <h3
              style={{
                fontFamily: 'var(--font-rubik)',
                color: '#1A4731',
                fontSize: '16px',
                marginBottom: '12px',
                marginTop: '16px',
              }}
            >
              Personal Data
            </h3>
            <p>
              While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). This may include, but is not limited to:
            </p>
            <ul style={{ marginLeft: '20px' }}>
              <li>Email address</li>
              <li>First name and last name</li>
              <li>Phone number</li>
              <li>Profile picture</li>
              <li>Usage Data</li>
            </ul>

            <h2
              style={{
                fontFamily: 'var(--font-rubik)',
                color: '#1A4731',
                fontSize: '20px',
                marginBottom: '16px',
                marginTop: '24px',
              }}
            >
              3. Use of Data
            </h2>
            <p>
              Breezy uses the collected data for various purposes:
            </p>
            <ul style={{ marginLeft: '20px' }}>
              <li>To provide and maintain our Service</li>
              <li>To notify you about changes to our Service</li>
              <li>To allow you to participate in interactive features of our Service</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information so that we can improve our Service</li>
              <li>To monitor the usage of our Service</li>
              <li>To detect, prevent and address technical issues</li>
            </ul>

            <h2
              style={{
                fontFamily: 'var(--font-rubik)',
                color: '#1A4731',
                fontSize: '20px',
                marginBottom: '16px',
                marginTop: '24px',
              }}
            >
              4. Security of Data
            </h2>
            <p>
              The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
            </p>

            <h2
              style={{
                fontFamily: 'var(--font-rubik)',
                color: '#1A4731',
                fontSize: '20px',
                marginBottom: '16px',
                marginTop: '24px',
              }}
            >
              5. Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at: privacy@breezy.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
