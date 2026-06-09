export default function TermsOfService() {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#F4F5F4',
      }}
      className="terms-container"
    >
      {/* Center Column */}
      <div
        style={{ flex: '0 0 100%' }}
        className="terms-content"
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
              Terms of Service
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
              1. Terms
            </h2>
            <p>
              By accessing and using Breezy, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
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
              2. Use License
            </h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on Breezy for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul style={{ marginLeft: '20px' }}>
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to decompile or reverse engineer any software contained on Breezy</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              <li>Violate any applicable laws or regulations related to access to or use of Breezy</li>
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
              3. Disclaimer
            </h2>
            <p>
              The materials on Breezy are provided on an 'as is' basis. Breezy makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
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
              4. Limitations
            </h2>
            <p>
              In no event shall Breezy or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Breezy, even if Breezy or an authorized representative has been notified orally or in writing of the possibility of such damage.
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
              5. Accuracy of Materials
            </h2>
            <p>
              The materials appearing on Breezy could include technical, typographical, or photographic errors. Breezy does not warrant that any of the materials on its website are accurate, complete, or current. Breezy may make changes to the materials contained on its website at any time without notice.
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
              6. Links
            </h2>
            <p>
              Breezy has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by Breezy of the site. Use of any such linked website is at the user's own risk.
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
              7. Modifications
            </h2>
            <p>
              Breezy may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
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
              8. Governing Law
            </h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction where Breezy is located, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
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
              9. Contact Us
            </h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at: legal@breezy.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
