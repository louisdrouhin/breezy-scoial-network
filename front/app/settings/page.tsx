import SettingsContent from '@/components/SettingsContent';

export default function Settings() {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#F4F5F4',
      }}
      className="settings-container"
    >
      {/* Center Column */}
      <div
        style={{ flex: 1, minWidth: 0 }}
        className="settings-content"
      >
        <SettingsContent />
      </div>
    </div>
  );
}
