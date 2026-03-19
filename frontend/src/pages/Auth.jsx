import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Layers, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
  </svg>
);

export default function Auth() {
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(searchParams.get('signup') === 'true');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const resetForm = () => { setUsername(''); setEmail(''); setPassword(''); setConfirmPassword(''); setError(''); setSuccess(''); };
  const toggleMode = () => { setIsSignUp(!isSignUp); resetForm(); };

  const handleSignIn = async (e) => {
    e.preventDefault(); setError(''); setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
      const data = await res.json();
      if (res.ok) { localStorage.setItem('arcaive_auth', 'true'); localStorage.setItem('arcaive_token', data.access_token); localStorage.setItem('arcaive_username', data.username); navigate('/dashboard'); }
      else setError(data.detail || 'Invalid credentials');
    } catch { setError('Connection failed. Is the backend running?'); }
    finally { setIsLoading(false); }
  };

  const handleSignUp = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, email, password }) });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Account created! Signing you in...');
        setTimeout(async () => {
          const lr = await fetch(`${API_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
          const ld = await lr.json();
          if (lr.ok) { localStorage.setItem('arcaive_auth', 'true'); localStorage.setItem('arcaive_token', ld.access_token); localStorage.setItem('arcaive_username', ld.username); navigate('/dashboard'); }
        }, 800);
      } else setError(data.detail || 'Registration failed');
    } catch { setError('Connection failed. Is the backend running?'); }
    finally { setIsLoading(false); }
  };

  const GlassInput = ({ label, type = 'text', placeholder, value, onChange, hasToggle = false }) => (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>{label}</label>
      <div style={{
        borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(8px)', transition: 'all 0.2s', position: 'relative',
      }}>
        <input
          type={hasToggle ? (showPassword ? 'text' : 'password') : type}
          placeholder={placeholder} value={value} onChange={onChange} required
          style={{
            width: '100%', background: 'transparent', fontSize: 14, padding: '16px 18px',
            paddingRight: hasToggle ? 48 : 18, color: '#fff', border: 'none', outline: 'none',
            borderRadius: 16, fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box',
          }}
        />
        {hasToggle && (
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: 4 }}>
            {showPassword ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ height: '100dvh', display: 'flex', fontFamily: "'DM Sans', sans-serif", background: '#0a0a0f' }}>
      {/* Left: Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Brand */}
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#4A6FA5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layers style={{ width: 20, height: 20, color: '#fff' }} />
              </div>
              <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, color: '#fff' }}>Arcaive</span>
            </Link>

            <div>
              <h1 style={{ fontSize: 40, fontWeight: 300, color: '#fff', letterSpacing: '-1px', margin: 0, lineHeight: 1.2 }}>
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </h1>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', marginTop: 8 }}>
                {isSignUp ? 'Start querying documents with reasoning-based intelligence' : 'Sign in to continue building with Arcaive'}
              </p>
            </div>

            {/* Messages */}
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', fontSize: 13, color: '#f87171', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 12 }}>
                <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} /> {error}
              </div>
            )}
            {success && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', fontSize: 13, color: '#34d399', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 12 }}>
                <CheckCircle style={{ width: 16, height: 16, flexShrink: 0 }} /> {success}
              </div>
            )}

            <form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
              <GlassInput label="Username" placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} />
              {isSignUp && <GlassInput label="Email Address" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />}
              <GlassInput label="Password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} hasToggle />
              {isSignUp && <GlassInput label="Confirm Password" placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} hasToggle />}

              <button type="submit" disabled={isLoading} style={{
                width: '100%', padding: '16px 0', borderRadius: 16, border: 'none', fontSize: 15, fontWeight: 600,
                background: isLoading ? 'rgba(74,111,165,0.5)' : '#4A6FA5', color: '#fff', cursor: isLoading ? 'default' : 'pointer',
                fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s', marginTop: 4,
                boxShadow: '0 0 24px rgba(74,111,165,0.3)',
              }}>
                {isLoading ? (isSignUp ? 'Creating Account...' : 'Signing In...') : (isSignUp ? 'Create Account' : 'Sign In')}
              </button>
            </form>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Or continue with</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            </div>

            {/* Google */}
            <button style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '14px 0', borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
              color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
              fontFamily: "'DM Sans', sans-serif",
            }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.target.style.background = 'transparent'}
            >
              <GoogleIcon /> Continue with Google
            </button>

            <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button onClick={toggleMode} style={{ color: '#6B9FD4', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
                {isSignUp ? 'Sign In' : 'Create Account'}
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Right: Hero Image */}
      <div style={{ flex: 1, padding: 16, display: 'none' }} className="md:!block">
        <div style={{
          width: '100%', height: '100%', borderRadius: 24,
          backgroundImage: 'url(https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80)',
          backgroundSize: 'cover', backgroundPosition: 'center',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.3) 100%)' }} />
          {/* Text at bottom */}
          <div style={{ position: 'absolute', bottom: 40, left: 40, right: 40, zIndex: 10 }}>
            <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 32, fontWeight: 500, color: '#fff', lineHeight: 1.3, marginBottom: 12 }}>
              Document intelligence, reimagined.
            </div>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
              Upload any PDF. Ask anything. Get answers with full reasoning traces showing exactly how and where the information was found.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) { .md\\:!block { display: block !important; } }
      `}</style>
    </div>
  );
}
