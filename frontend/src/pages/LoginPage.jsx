import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Sparkles, Building2, Target, Trophy, ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { sounds } from '../utils/audio';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  
  // Registration fields
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const { login, register } = useAuth();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setFieldErrors({});

    if (!credential.trim()) {
      setFieldErrors({ credential: 'Email or username is required.' });
      return;
    }
    if (!password) {
      setFieldErrors({ password: 'Password is required.' });
      return;
    }

    setLoading(true);
    sounds.playClick();
    try {
      await login(credential.trim(), password);
      sounds.playComplete();
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const errors = {};

    if (fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters.';
    }
    if (username.trim().length < 3) {
      errors.username = 'Username must be at least 3 characters.';
    }
    if (!email.includes('@') || !email.includes('.')) {
      errors.email = 'Please provide a valid email address.';
    }
    if (regPassword.length < 8) {
      errors.regPassword = 'Password must be at least 8 characters long.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    sounds.playClick();
    try {
      await register(username.trim(), email.trim(), regPassword, fullName.trim());
      sounds.playLevelUp();
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Email or username may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setErrorMsg('');
    sounds.playClick();
    try {
      await login('fahima@vyron.app', 'password123!');
      sounds.playComplete();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#07080f',
      backgroundImage: `
        radial-gradient(circle at 15% 20%, rgba(99, 102, 241, 0.18) 0%, transparent 40%),
        radial-gradient(circle at 85% 80%, rgba(217, 70, 239, 0.15) 0%, transparent 40%),
        radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.08) 0%, transparent 50%),
        url(/assets/hero_city.jpg)
      `,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      {/* Dark tint backdrop overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(7, 8, 15, 0.88)',
        backdropFilter: 'blur(10px)',
        zIndex: 1
      }} />

      {/* Main Container */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        maxWidth: '1080px',
        width: '100%',
        display: 'grid',
        gridTemplateColumns: '1.1fr 0.9fr',
        gap: '40px',
        alignItems: 'center'
      }}>
        {/* Left Column: Branding, Value Pillars & Features */}
        <div>
          {/* Logo Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #6366f1 50%, #d946ef 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 25px rgba(99, 102, 241, 0.6)'
            }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                <path d="M4 4L12 20L20 4" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 4L12 13L16 4" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h1 style={{
                fontSize: '2.2rem',
                fontWeight: 900,
                letterSpacing: '2.5px',
                color: '#fff',
                lineHeight: 1
              }}>
                VYRON
              </h1>
              <span style={{
                fontSize: '0.8rem',
                fontWeight: 800,
                color: '#38bdf8',
                letterSpacing: '2px',
                textTransform: 'uppercase'
              }}>
                LEVEL UP YOUR LIFE.
              </span>
            </div>
          </div>

          <h2 style={{
            fontSize: '2.4rem',
            fontWeight: 800,
            color: '#fff',
            lineHeight: 1.2,
            marginBottom: '16px'
          }}>
            Gamify Your Focus.<br />
            <span style={{
              background: 'linear-gradient(135deg, #38bdf8 0%, #c084fc 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Build Your Metropolis.
            </span>
          </h2>

          <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: 1.6, marginBottom: '32px', maxWidth: '480px' }}>
            Transform daily work into rewarding missions. Gain XP, earn treasury coins, and construct an architecturally stunning cybernetic city with every completed objective.
          </p>

          {/* 3 Pillars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '440px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '12px 16px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Target size={20} color="#818cf8" />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>Mission Operations</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Dynamic XP, On-Time Bonuses & Streak Multipliers</div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '12px 16px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(6, 182, 212, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Building2 size={20} color="#38bdf8" />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>Virtual City Growth</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Unlock research centers, skyscrapers & landmarks</div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '12px 16px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)'
            }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'rgba(245, 158, 11, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Trophy size={20} color="#fbbf24" />
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>Telemetry & Leaderboard</div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Track productivity rate, focus hours, and achievements</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Card */}
        <div>
          <div style={{
            background: 'rgba(18, 21, 38, 0.85)',
            border: '1px solid rgba(139, 92, 246, 0.35)',
            borderRadius: '24px',
            padding: '36px 32px',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.65), 0 0 30px rgba(139, 92, 246, 0.15)'
          }}>
            {/* Tab Switcher */}
            <div style={{
              display: 'flex',
              background: 'rgba(0, 0, 0, 0.35)',
              borderRadius: '12px',
              padding: '4px',
              marginBottom: '24px'
            }}>
              <button
                type="button"
                onClick={() => { setIsLogin(true); setErrorMsg(''); setFieldErrors({}); }}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: 'none',
                  borderRadius: '10px',
                  background: isLogin ? 'var(--grad-purple-action)' : 'transparent',
                  color: isLogin ? '#fff' : '#94a3b8',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: isLogin ? '0 4px 15px rgba(99, 102, 241, 0.4)' : 'none'
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(false); setErrorMsg(''); setFieldErrors({}); }}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: 'none',
                  borderRadius: '10px',
                  background: !isLogin ? 'var(--grad-purple-action)' : 'transparent',
                  color: !isLogin ? '#fff' : '#94a3b8',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: !isLogin ? '0 4px 15px rgba(99, 102, 241, 0.4)' : 'none'
                }}
              >
                Create Account
              </button>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #ef4444',
                color: '#fca5a5',
                padding: '10px 14px',
                borderRadius: '10px',
                fontSize: '0.85rem',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={16} flexShrink={0} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* SIGN IN FORM */}
            {isLogin ? (
              <form onSubmit={handleLoginSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                    Email or Username
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="e.g. fahima@vyron.app"
                      value={credential}
                      onChange={(e) => setCredential(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 42px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: fieldErrors.credential ? '1px solid #ef4444' : '1px solid var(--border-subtle)',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '0.92rem',
                        outline: 'none'
                      }}
                    />
                    <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '13px' }} />
                  </div>
                  {fieldErrors.credential && (
                    <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                      {fieldErrors.credential}
                    </span>
                  )}
                </div>

                <div style={{ marginBottom: '22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1' }}>
                      Password
                    </label>
                    <span style={{ fontSize: '0.75rem', color: '#818cf8', cursor: 'pointer' }} onClick={() => alert('Demo password is password123!')}>
                      Forgot?
                    </span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px 12px 42px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: fieldErrors.password ? '1px solid #ef4444' : '1px solid var(--border-subtle)',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '0.92rem',
                        outline: 'none'
                      }}
                    />
                    <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '14px', top: '13px' }} />
                  </div>
                  {fieldErrors.password && (
                    <span style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '4px', display: 'block' }}>
                      {fieldErrors.password}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{ width: '100%', padding: '13px', fontSize: '1rem', marginBottom: '14px' }}
                >
                  <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
                  <ArrowRight size={18} />
                </button>

                {/* Quick 1-Click Demo Sign In */}
                <div style={{ textAlign: 'center', margin: '14px 0 10px', position: 'relative' }}>
                  <div style={{ height: '1px', background: 'var(--border-subtle)', width: '100%' }} />
                  <span style={{
                    position: 'absolute',
                    top: '-10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#15182e',
                    padding: '0 10px',
                    fontSize: '0.72rem',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Instant Evaluation
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleDemoLogin}
                  disabled={loading}
                  className="btn-cyan"
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '0.88rem',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(59, 130, 246, 0.3) 100%)',
                    border: '1px solid rgba(6, 182, 212, 0.4)'
                  }}
                >
                  <img
                    src="/assets/avatar_fahima.jpg"
                    alt="Fahima"
                    style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <span>1-Click Sign In as Fahima (Level 5)</span>
                </button>
              </form>
            ) : (
              /* CREATE ACCOUNT FORM */
              <form onSubmit={handleRegisterSubmit}>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
                    Full Name *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="e.g. Fahima F"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px 10px 38px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: fieldErrors.fullName ? '1px solid #ef4444' : '1px solid var(--border-subtle)',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                    <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                  </div>
                  {fieldErrors.fullName && (
                    <span style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '2px', display: 'block' }}>
                      {fieldErrors.fullName}
                    </span>
                  )}
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
                    Username *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. fahima_bca"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: fieldErrors.username ? '1px solid #ef4444' : '1px solid var(--border-subtle)',
                      borderRadius: '10px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  />
                  {fieldErrors.username && (
                    <span style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '2px', display: 'block' }}>
                      {fieldErrors.username}
                    </span>
                  )}
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
                    Email Address *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      placeholder="e.g. fahima@skasc.ac.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px 10px 38px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: fieldErrors.email ? '1px solid #ef4444' : '1px solid var(--border-subtle)',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                    <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                  </div>
                  {fieldErrors.email && (
                    <span style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '2px', display: 'block' }}>
                      {fieldErrors.email}
                    </span>
                  )}
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
                    Password (min 8 chars) *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px 10px 38px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: fieldErrors.regPassword ? '1px solid #ef4444' : '1px solid var(--border-subtle)',
                        borderRadius: '10px',
                        color: '#fff',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                    <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                  </div>
                  {fieldErrors.regPassword && (
                    <span style={{ fontSize: '0.72rem', color: '#ef4444', marginTop: '2px', display: 'block' }}>
                      {fieldErrors.regPassword}
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
                >
                  <Sparkles size={16} />
                  <span>{loading ? 'Creating Citizen Profile...' : 'Initialize Citizen Profile'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
