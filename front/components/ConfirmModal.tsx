'use client';

interface ConfirmModalProps {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  danger?: boolean;
}

// Modale de confirmation générique (overlay + clic extérieur = annuler).
export default function ConfirmModal({
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  danger = false,
}: ConfirmModalProps) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          backgroundColor: '#ffffff',
          border: '2px solid #1A4731',
          borderRadius: '12px',
          padding: '24px',
          width: '100%',
          maxWidth: '360px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        }}
      >
        <h3 style={{ fontFamily: 'var(--font-rubik)', color: '#1A4731', margin: '0 0 8px 0', fontSize: '18px' }}>
          {title}
        </h3>
        <p style={{ fontFamily: 'var(--font-alata)', color: '#666', margin: '0 0 20px 0', fontSize: '14px', lineHeight: '1.5' }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{
              padding: '8px 16px',
              background: 'none',
              border: '1px solid #1A4731',
              borderRadius: '6px',
              fontFamily: 'var(--font-alata)',
              color: '#1A4731',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: danger ? '#dc2626' : '#1A4731',
              border: 'none',
              borderRadius: '6px',
              fontFamily: 'var(--font-alata)',
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? '...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
