'use client';

import { useState, useEffect } from 'react';
import { userAPI, authAPI } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '24px', flexShrink: 0 }}>
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
      <span style={{ position: 'absolute', cursor: 'pointer', inset: 0, backgroundColor: checked ? '#1A4731' : '#E0E0E0', transition: 'background-color 0.3s', borderRadius: '24px' }}>
        <span style={{ position: 'absolute', height: '18px', width: '18px', left: checked ? '29px' : '3px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'white', transition: 'left 0.3s', borderRadius: '50%' }} />
      </span>
    </label>
  );
}

function Field({ label, note, children }: { label: string; note?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ fontFamily: 'var(--font-alata)', color: '#1A4731', display: 'block', marginBottom: '8px', fontSize: '14px' }}>{label}</label>
      {children}
      {note && <p style={{ fontFamily: 'var(--font-alata)', color: '#999', fontSize: '12px', margin: '6px 0 0 0' }}>{note}</p>}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px', border: '1px solid #1A4731', borderRadius: '6px',
  fontFamily: 'var(--font-alata)', fontSize: '14px', boxSizing: 'border-box', outline: 'none',
};

const disabledInputStyle: React.CSSProperties = {
  ...inputStyle, border: '1px solid #E0E0E0', backgroundColor: '#F4F5F4', color: '#999', cursor: 'not-allowed',
};

export default function SettingsContent() {
  const { user } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const [email, setEmail] = useState('');
  const [emailCurrentPassword, setEmailCurrentPassword] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [emailError, setEmailError] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdCurrentPassword, setPwdCurrentPassword] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdStatus, setPwdStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [pwdError, setPwdError] = useState('');

  const [notifLikes, setNotifLikes] = useState(true);
  const [notifFollows, setNotifFollows] = useState(true);

  useEffect(() => {
    if (!user?.username) return;
    userAPI.getProfile(user.username)
      .then(p => {
        setDisplayName(p.displayName ?? '');
        setBio(p.bio ?? '');
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [user?.username]);

  const handleEmailSave = async () => {
    if (emailSaving) return;
    setEmailError('');
    if (!email) { setEmailError('Renseignez un nouvel email'); return; }
    if (!emailCurrentPassword) { setEmailError('Le mot de passe actuel est requis'); return; }
    setEmailSaving(true);
    setEmailStatus('idle');
    try {
      await authAPI.updateAccount({ email, currentPassword: emailCurrentPassword });
      setEmailStatus('success');
      setEmailCurrentPassword('');
      setTimeout(() => setEmailStatus('idle'), 3000);
    } catch (e) {
      setEmailError(e instanceof Error ? e.message : 'Erreur');
      setEmailStatus('error');
    } finally {
      setEmailSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    if (pwdSaving) return;
    setPwdError('');
    if (!newPassword) { setPwdError('Renseignez un nouveau mot de passe'); return; }
    if (newPassword.length < 8) { setPwdError('Le mot de passe doit faire au moins 8 caractères'); return; }
    if (newPassword !== confirmPassword) { setPwdError('Les mots de passe ne correspondent pas'); return; }
    if (!pwdCurrentPassword) { setPwdError('Le mot de passe actuel est requis'); return; }
    setPwdSaving(true);
    setPwdStatus('idle');
    try {
      await authAPI.updateAccount({ password: newPassword, currentPassword: pwdCurrentPassword });
      setPwdStatus('success');
      setNewPassword('');
      setConfirmPassword('');
      setPwdCurrentPassword('');
      setTimeout(() => setPwdStatus('idle'), 3000);
    } catch (e) {
      setPwdError(e instanceof Error ? e.message : 'Erreur');
      setPwdStatus('error');
    } finally {
      setPwdSaving(false);
    }
  };

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      await userAPI.updateMe({ displayName: displayName || null, bio: bio || null });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ padding: '32px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: 'var(--font-rubik)', color: '#1A4731', margin: '0 0 8px 0', fontSize: '28px' }}>Settings</h1>
        <p style={{ fontFamily: 'var(--font-alata)', color: '#666', margin: 0 }}>Gérez votre compte et vos préférences</p>
      </div>

      {/* Profil */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #1A4731', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-rubik)', color: '#1A4731', margin: '0 0 20px 0', fontSize: '20px' }}>Profil</h2>

        {isLoading ? (
          <p style={{ fontFamily: 'var(--font-alata)', color: '#999', fontSize: '14px' }}>Chargement...</p>
        ) : (
          <>
            <Field label="Nom affiché">
              <input
                type="text"
                value={displayName}
                onChange={e => { if (e.target.value.length <= 50) setDisplayName(e.target.value); }}
                placeholder="Votre nom public"
                maxLength={50}
                style={inputStyle}
              />
              <p style={{ fontFamily: 'var(--font-alata)', color: '#999', fontSize: '12px', margin: '4px 0 0 0' }}>{displayName.length}/50</p>
            </Field>

            <Field label="Username" note="Le username est permanent et ne peut pas être modifié.">
              <input type="text" value={user?.username ?? ''} disabled style={disabledInputStyle} />
            </Field>

            <Field label="Bio">
              <textarea
                value={bio}
                onChange={e => { if (e.target.value.length <= 160) setBio(e.target.value); }}
                placeholder="Parlez de vous en quelques mots..."
                maxLength={160}
                style={{ ...inputStyle, resize: 'none', minHeight: '80px' }}
              />
              <p style={{ fontFamily: 'var(--font-alata)', color: '#999', fontSize: '12px', margin: '4px 0 0 0' }}>{bio.length}/160</p>
            </Field>
          </>
        )}
      </div>

      {/* Changer l'email */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #1A4731', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-rubik)', color: '#1A4731', margin: '0 0 20px 0', fontSize: '20px' }}>Changer l'email</h2>

        <Field label="Nouvel email">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="nouvelle@adresse.com" style={inputStyle} />
        </Field>
        <Field label="Mot de passe actuel" note="Requis pour confirmer la modification.">
          <input type="password" value={emailCurrentPassword} onChange={e => setEmailCurrentPassword(e.target.value)} placeholder="Votre mot de passe actuel" style={inputStyle} />
        </Field>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={handleEmailSave} disabled={emailSaving} style={{ padding: '10px 24px', backgroundColor: '#1A4731', color: 'white', border: 'none', borderRadius: '6px', fontFamily: 'var(--font-rubik)', fontSize: '15px', fontWeight: 'bold', cursor: emailSaving ? 'not-allowed' : 'pointer', opacity: emailSaving ? 0.6 : 1 }}>
            {emailSaving ? 'Enregistrement...' : 'Mettre à jour'}
          </button>
          {emailStatus === 'success' && <span style={{ fontFamily: 'var(--font-alata)', color: '#1A4731', fontSize: '14px' }}>✓ Email mis à jour</span>}
          {emailError && <span style={{ fontFamily: 'var(--font-alata)', color: '#dc2626', fontSize: '14px' }}>{emailError}</span>}
        </div>
      </div>

      {/* Changer le mot de passe */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #1A4731', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-rubik)', color: '#1A4731', margin: '0 0 20px 0', fontSize: '20px' }}>Changer le mot de passe</h2>

        <Field label="Mot de passe actuel">
          <input type="password" value={pwdCurrentPassword} onChange={e => setPwdCurrentPassword(e.target.value)} placeholder="Votre mot de passe actuel" style={inputStyle} />
        </Field>
        <Field label="Nouveau mot de passe">
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="8 caractères minimum" style={inputStyle} />
        </Field>
        <Field label="Confirmer le nouveau mot de passe">
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Répétez le nouveau mot de passe" style={inputStyle} />
        </Field>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={handlePasswordSave} disabled={pwdSaving} style={{ padding: '10px 24px', backgroundColor: '#1A4731', color: 'white', border: 'none', borderRadius: '6px', fontFamily: 'var(--font-rubik)', fontSize: '15px', fontWeight: 'bold', cursor: pwdSaving ? 'not-allowed' : 'pointer', opacity: pwdSaving ? 0.6 : 1 }}>
            {pwdSaving ? 'Enregistrement...' : 'Mettre à jour'}
          </button>
          {pwdStatus === 'success' && <span style={{ fontFamily: 'var(--font-alata)', color: '#1A4731', fontSize: '14px' }}>✓ Mot de passe mis à jour</span>}
          {pwdError && <span style={{ fontFamily: 'var(--font-alata)', color: '#dc2626', fontSize: '14px' }}>{pwdError}</span>}
        </div>
      </div>

      {/* Notifications */}
      <div style={{ backgroundColor: '#ffffff', border: '1px solid #1A4731', borderRadius: '8px', padding: '24px', marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'var(--font-rubik)', color: '#1A4731', margin: '0 0 20px 0', fontSize: '20px' }}>Notifications</h2>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #F4F5F4' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-rubik)', color: '#1A4731', margin: '0 0 4px 0', fontSize: '14px' }}>Likes</p>
            <p style={{ fontFamily: 'var(--font-alata)', color: '#999', margin: 0, fontSize: '12px' }}>Être notifié quand quelqu'un like votre post</p>
          </div>
          <Toggle checked={notifLikes} onChange={setNotifLikes} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-rubik)', color: '#1A4731', margin: '0 0 4px 0', fontSize: '14px' }}>Abonnements</p>
            <p style={{ fontFamily: 'var(--font-alata)', color: '#999', margin: 0, fontSize: '12px' }}>Être notifié quand quelqu'un vous suit</p>
          </div>
          <Toggle checked={notifFollows} onChange={setNotifFollows} />
        </div>
      </div>

      {/* Save */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={handleSave}
          disabled={isSaving || isLoading}
          style={{
            padding: '12px 32px', backgroundColor: '#1A4731', color: 'white', border: 'none',
            borderRadius: '6px', fontFamily: 'var(--font-rubik)', fontSize: '16px', fontWeight: 'bold',
            cursor: isSaving || isLoading ? 'not-allowed' : 'pointer', opacity: isSaving || isLoading ? 0.6 : 1,
          }}
        >
          {isSaving ? 'Enregistrement...' : 'Enregistrer'}
        </button>

        {saveStatus === 'success' && (
          <span style={{ fontFamily: 'var(--font-alata)', color: '#1A4731', fontSize: '14px' }}>✓ Modifications enregistrées</span>
        )}
        {saveStatus === 'error' && (
          <span style={{ fontFamily: 'var(--font-alata)', color: '#dc2626', fontSize: '14px' }}>Erreur lors de la sauvegarde</span>
        )}
      </div>
    </div>
  );
}
