import React, { useState } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const EMOJI_OPTIONS = ['😊', '🚀', '🧠', '🔥', '💡', '🎯', '🌟', '🦾', '⚡', '🎨', '🏎️', '📖', '🌲', '🎮', '🧪', '🛡️'];

export default function Settings() {
  const username = localStorage.getItem('arcaive_username') || 'User';
  const [selectedEmoji, setSelectedEmoji] = useState(localStorage.getItem('arcaive_emoji') || '🧠');
  const [newUsername, setNewUsername] = useState(username);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const saveEmoji = (emoji) => {
    setSelectedEmoji(emoji);
    localStorage.setItem('arcaive_emoji', emoji);
    setSuccess('Avatar updated!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const saveUsername = () => {
    if (newUsername.trim().length < 3) {
      setError('Username must be at least 3 characters'); return;
    }
    localStorage.setItem('arcaive_username', newUsername.trim());
    setSuccess('Username updated! Changes will reflect on next login.');
    setError('');
    setTimeout(() => setSuccess(''), 3000);
  };

  const changePassword = () => {
    setError(''); setSuccess('');
    if (!currentPassword || !newPassword) {
      setError('Please fill in all password fields'); return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters'); return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match'); return;
    }
    // Note: backend password change endpoint would go here
    setSuccess('Password change is not yet available in the API. Coming soon!');
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    setTimeout(() => setSuccess(''), 3000);
  };

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    border: '1.5px solid #E5E7EB', borderRadius: 10,
    fontSize: 14, color: '#111827', background: '#FAFAFA',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ padding: '32px', maxWidth: 560, margin: '0 auto', fontFamily: "'DM Sans', sans-serif" }}>
      <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, fontWeight: 600, color: '#111827', marginBottom: 4 }}>Settings</h1>
      <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 32 }}>Manage your profile and preferences.</p>

      {/* Messages */}
      {success && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#059669', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 10 }}>
          <CheckCircle style={{ width: 16, height: 16 }} /> {success}
        </div>
      )}
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10 }}>
          <AlertCircle style={{ width: 16, height: 16 }} /> {error}
        </div>
      )}

      {/* Avatar Section */}
      <div style={{ background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 4 }}>Your Avatar</div>
        <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16 }}>Pick an emoji that represents you.</p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', background: '#F0F4FA',
            border: '3px solid #4A6FA5', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, boxShadow: '0 2px 12px rgba(74,111,165,0.15)',
          }}>
            {selectedEmoji}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>{username}</div>
            <div style={{ fontSize: 12, color: '#9CA3AF', fontFamily: "'JetBrains Mono', monospace" }}>Free Tier</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {EMOJI_OPTIONS.map(e => (
            <button
              key={e}
              onClick={() => saveEmoji(e)}
              style={{
                width: 44, height: 44, borderRadius: 10, fontSize: 22,
                border: selectedEmoji === e ? '2px solid #4A6FA5' : '1.5px solid #E5E7EB',
                background: selectedEmoji === e ? '#EFF4FB' : '#fff',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Username Section */}
      <div style={{ background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 4 }}>Username</div>
        <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16 }}>Change your display name.</p>

        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
            onFocus={(e) => { e.target.style.borderColor = '#4A6FA5'; e.target.style.boxShadow = '0 0 0 3px rgba(74,111,165,0.1)'; }}
            onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
          />
          <button
            onClick={saveUsername}
            style={{
              padding: '11px 20px', background: '#4A6FA5', color: '#fff',
              border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
              cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Save
          </button>
        </div>
      </div>

      {/* Password Section */}
      <div style={{ background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 4 }}>Change Password</div>
        <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16 }}>Update your account password.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Current Password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = '#4A6FA5'; e.target.style.boxShadow = '0 0 0 3px rgba(74,111,165,0.1)'; }}
              onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = '#4A6FA5'; e.target.style.boxShadow = '0 0 0 3px rgba(74,111,165,0.1)'; }}
              onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" style={inputStyle}
              onFocus={(e) => { e.target.style.borderColor = '#4A6FA5'; e.target.style.boxShadow = '0 0 0 3px rgba(74,111,165,0.1)'; }}
              onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
          <button
            onClick={changePassword}
            style={{
              padding: '11px 0', background: '#4A6FA5', color: '#fff',
              border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", marginTop: 4,
            }}
          >
            Update Password
          </button>
        </div>
      </div>

      {/* About */}
      <div style={{ textAlign: 'center', fontSize: 11, color: '#9CA3AF', marginTop: 24 }}>
        Arcaive v1.0 · Powered by PageIndex · GPT-5.1 (trees) + GPT-5.4 (queries)
      </div>
    </div>
  );
}
