import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Layers, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

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

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const resetForm = () => {
    setUsername(''); setEmail(''); setPassword(''); setConfirmPassword('');
    setError(''); setSuccess('');
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(''); setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('arcaive_auth', 'true');
        localStorage.setItem('arcaive_token', data.access_token);
        localStorage.setItem('arcaive_username', data.username);
        navigate('/dashboard');
      } else {
        setError(data.detail || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection failed. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match'); return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters'); return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Account created! Signing you in...');
        setTimeout(async () => {
          const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          });
          const loginData = await loginRes.json();
          if (loginRes.ok) {
            localStorage.setItem('arcaive_auth', 'true');
            localStorage.setItem('arcaive_token', loginData.access_token);
            localStorage.setItem('arcaive_username', loginData.username);
            navigate('/dashboard');
          }
        }, 800);
      } else {
        setError(data.detail || 'Registration failed');
      }
    } catch (err) {
      setError('Connection failed. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => { setIsSignUp(!isSignUp); resetForm(); };

  // Input component with proper spacing
  const FormInput = ({ label, type = 'text', placeholder, value, onChange, required = true, hasToggle = false }) => (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          type={hasToggle ? (showPassword ? 'text' : 'password') : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          style={{
            width: '100%', padding: '11px 14px',
            paddingRight: hasToggle ? 44 : 14,
            border: '1.5px solid #E5E7EB', borderRadius: 10,
            fontSize: 14, color: '#111827', background: '#FAFAFA',
            fontFamily: "'DM Sans', sans-serif",
            outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
            boxSizing: 'border-box',
          }}
          onFocus={(e) => { e.target.style.borderColor = '#4A6FA5'; e.target.style.boxShadow = '0 0 0 3px rgba(74,111,165,0.1)'; e.target.style.background = '#fff'; }}
          onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; e.target.style.background = '#FAFAFA'; }}
        />
        {hasToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#9CA3AF' }}
          >
            {showPassword ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(160deg, #0E121A 0%, #1A2332 40%, #0E121A 100%)',
      padding: '24px 16px',
      fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    }}>
      {/* Brand Header */}
      <Link to="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', marginBottom: 28 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 16, background: '#4A6FA5',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 24px rgba(74,111,165,0.35)', marginBottom: 12,
        }}>
          <Layers style={{ width: 24, height: 24, color: '#fff' }} />
        </div>
        <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 24, color: '#fff', fontWeight: 500 }}>Arcaive</span>
        <span style={{ fontSize: 12, color: '#8B95A8', marginTop: 4, letterSpacing: 0.5 }}>Reasoning-Based Document Intelligence</span>
      </Link>

      {/* Auth Card */}
      <div style={{
        width: '100%', maxWidth: 400,
        background: '#fff', borderRadius: 20,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.1)',
        overflow: 'hidden',
      }}>
        {/* Card Header */}
        <div style={{ padding: '28px 32px 0', textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 600, color: '#111827', margin: 0 }}>
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 6 }}>
            {isSignUp ? 'Start querying documents with reasoning-based intelligence' : 'Sign in to continue to Arcaive'}
          </p>
        </div>

        {/* Form */}
        <div style={{ padding: '24px 32px 28px' }}>
          <form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
            {/* Error */}
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10 }}>
                <AlertCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* Success */}
            {success && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#059669', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 10 }}>
                <CheckCircle style={{ width: 16, height: 16, flexShrink: 0 }} />
                <span>{success}</span>
              </div>
            )}

            {/* Username */}
            <FormInput label="Username" placeholder="Enter your username" value={username} onChange={(e) => setUsername(e.target.value)} />

            {/* Email — signup only */}
            {isSignUp && (
              <FormInput label="Email Address" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
            )}

            {/* Password */}
            <FormInput label="Password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} hasToggle />

            {/* Confirm Password — signup only */}
            {isSignUp && (
              <FormInput label="Confirm Password" placeholder="Confirm your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} hasToggle />
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%', padding: '12px 0', marginTop: 4,
                background: isLoading ? '#7B9BC5' : '#4A6FA5',
                color: '#fff', border: 'none', borderRadius: 12,
                fontSize: 15, fontWeight: 600, cursor: isLoading ? 'default' : 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'background 0.2s, transform 0.1s',
                boxShadow: '0 2px 12px rgba(74,111,165,0.3)',
              }}
              onMouseEnter={(e) => { if (!isLoading) e.target.style.background = '#3E5F8F'; }}
              onMouseLeave={(e) => { if (!isLoading) e.target.style.background = '#4A6FA5'; }}
              onMouseDown={(e) => { e.target.style.transform = 'scale(0.98)'; }}
              onMouseUp={(e) => { e.target.style.transform = 'scale(1)'; }}
            >
              {isLoading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </span>
              ) : (
                isSignUp ? 'Create Account' : 'Sign In'
              )}
            </button>

            {/* Toggle */}
            <div style={{ textAlign: 'center', marginTop: 18 }}>
              <span style={{ fontSize: 13, color: '#6B7280' }}>
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              </span>
              <button
                type="button"
                onClick={toggleMode}
                style={{ marginLeft: 4, fontSize: 13, fontWeight: 600, color: '#4A6FA5', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'none' }}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <p style={{ fontSize: 11, color: '#525D72', marginTop: 24 }}>
        © 2026 Arcaive. Powered by PageIndex.
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
