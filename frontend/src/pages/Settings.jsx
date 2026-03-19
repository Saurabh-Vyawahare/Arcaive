import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

const EMOJI_OPTIONS = ['😊', '🚀', '🧠', '🔥', '💡', '🎯', '🌟', '🦾', '⚡', '🎨', '🏎️', '📖', '🌲', '🎮', '🧪', '🛡️'];

export default function Settings() {
  const username = localStorage.getItem('arcaive_username') || 'User';
  const [selectedEmoji, setSelectedEmoji] = useState(localStorage.getItem('arcaive_emoji') || '🧠');
  const [displayName, setDisplayName] = useState(localStorage.getItem('arcaive_display_name') || username);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const saveEmoji = (emoji) => {
    setSelectedEmoji(emoji);
    localStorage.setItem('arcaive_emoji', emoji);
    setSuccess('Avatar updated!');
    setTimeout(() => setSuccess(''), 2000);
  };

  const saveDisplayName = () => {
    if (displayName.trim().length < 2) {
      setError('Display name must be at least 2 characters'); return;
    }
    localStorage.setItem('arcaive_display_name', displayName.trim());
    setSuccess('Display name updated!');
    setError('');
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

      {/* Avatar */}
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
            <div style={{ fontSize: 18, fontWeight: 600, color: '#111827' }}>{displayName}</div>
            <div style={{ fontSize: 12, color: '#9CA3AF', fontFamily: "'JetBrains Mono', monospace" }}>@{username}</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {EMOJI_OPTIONS.map(e => (
            <button key={e} onClick={() => saveEmoji(e)} style={{
              width: 44, height: 44, borderRadius: 10, fontSize: 22,
              border: selectedEmoji === e ? '2px solid #4A6FA5' : '1.5px solid #E5E7EB',
              background: selectedEmoji === e ? '#EFF4FB' : '#fff',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
            }}>
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Display Name */}
      <div style={{ background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 4 }}>Display Name</div>
        <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16 }}>This is the name shown across the app. Your login username stays the same.</p>

        <div style={{ display: 'flex', gap: 10 }}>
          <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} style={{ ...inputStyle, flex: 1 }}
            onFocus={(e) => { e.target.style.borderColor = '#4A6FA5'; e.target.style.boxShadow = '0 0 0 3px rgba(74,111,165,0.1)'; }}
            onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
          />
          <button onClick={saveDisplayName} style={{
            padding: '11px 20px', background: '#4A6FA5', color: '#fff',
            border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600,
            cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif",
          }}>Save</button>
        </div>
      </div>

      {/* Account Info */}
      <div style={{ background: '#fff', border: '1.5px solid #E5E7EB', borderRadius: 16, padding: 24, marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 4 }}>Account</div>
        <p style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16 }}>Your login credentials. Username cannot be changed after registration.</p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: '#F9FAFB', borderRadius: 10, marginBottom: 12 }}>
          <Info style={{ width: 14, height: 14, color: '#6B7280' }} />
          <span style={{ fontSize: 13, color: '#6B7280' }}>Login username: <strong style={{ color: '#111827' }}>{username}</strong></span>
        </div>

        <div style={{ fontSize: 12, color: '#9CA3AF' }}>
          To change your password, please contact support or re-register with a new account.
        </div>
      </div>

      {/* Version */}
      <div style={{ textAlign: 'center', fontSize: 11, color: '#9CA3AF', marginTop: 24 }}>
        Arcaive v1.0 · Powered by PageIndex · GPT-5.1 (trees) + GPT-5.4 (queries)
      </div>
    </div>
  );
}
