import React, { useState } from 'react';
import { Bell, Volume2, VolumeX, Sparkles, ChevronDown, LogOut, User as UserIcon } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function Navbar({ user, onOpenAI, onOpenAuth, onLogout, setActiveTab }) {
  const [soundActive, setSoundActive] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleSound = () => {
    const newState = sounds.toggle();
    setSoundActive(newState);
  };

  const displayName = user?.display_name || user?.username || 'Fahima F';
  const level = user?.level || 5;

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '24px',
      position: 'relative'
    }}>
      {/* Left: Greeting matching design */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            Hello, {user?.full_name?.split(' ')[0] || displayName}!
          </h2>
          <span style={{ fontSize: '1.6rem' }}>👋</span>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          Keep going! Your next level awaits...
        </p>
      </div>

      {/* Right: Actions, Sound FX, AI Coach, Bell, User Profile Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* AI Mission Assistant Button */}
        <button
          onClick={onOpenAI}
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.3) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.5)',
            color: '#c084fc',
            padding: '8px 16px',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 0 15px rgba(139, 92, 246, 0.25)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.15)'}
          onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
        >
          <Sparkles size={16} />
          <span>AI Coach</span>
        </button>

        {/* Audio Toggle */}
        <button
          onClick={toggleSound}
          title={soundActive ? 'Sound Effects Enabled' : 'Sound Effects Muted'}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            color: soundActive ? '#38bdf8' : '#64748b',
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          {soundActive ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        {/* Notification Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: '#f8fafc',
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <Bell size={18} />
            <span style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '8px',
              height: '8px',
              backgroundColor: '#ef4444',
              borderRadius: '50%',
              boxShadow: '0 0 8px #ef4444'
            }} />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '50px',
              width: '300px',
              backgroundColor: '#16192e',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '16px',
              padding: '16px',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.6)',
              zIndex: 50
            }}>
              <h4 style={{ fontSize: '0.9rem', color: '#fff', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Notifications</span>
                <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>Mark all read</span>
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', fontSize: '0.8rem' }}>
                  <div style={{ fontWeight: 600, color: '#38bdf8' }}>🌟 Streak Preserved!</div>
                  <div style={{ color: '#94a3b8' }}>You have maintained a 5-day productive streak.</div>
                </div>
                <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', fontSize: '0.8rem' }}>
                  <div style={{ fontWeight: 600, color: '#fbbf24' }}>🏙️ New Unlock Available</div>
                  <div style={{ color: '#94a3b8' }}>Reach Level 5 to build the Quantum Research Center!</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill matching screenshot */}
        {user ? (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              style={{
                background: 'rgba(20, 24, 46, 0.85)',
                border: '1px solid rgba(139, 92, 246, 0.35)',
                borderRadius: '9999px',
                padding: '4px 14px 4px 6px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
              }}
            >
              <img
                src={user.avatar || '/assets/avatar_fahima.jpg'}
                alt={displayName}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid #8b5cf6'
                }}
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
                }}
              />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                  {displayName}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>Level {level}</span>
                  <ChevronDown size={12} />
                </div>
              </div>
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div style={{
                position: 'absolute',
                right: 0,
                top: '50px',
                width: '180px',
                backgroundColor: '#16192e',
                border: '1px solid rgba(139, 92, 246, 0.3)',
                borderRadius: '14px',
                padding: '8px',
                boxShadow: '0 15px 35px rgba(0, 0, 0, 0.6)',
                zIndex: 50
              }}>
                <button
                  onClick={() => { setActiveTab('settings'); setShowProfileMenu(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '8px 12px',
                    background: 'transparent',
                    border: 'none',
                    color: '#f8fafc',
                    fontSize: '0.85rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <UserIcon size={16} />
                  <span>Edit Profile</span>
                </button>
                <div style={{ height: '1px', backgroundColor: 'var(--border-subtle)', margin: '4px 0' }} />
                <button
                  onClick={() => { onLogout(); setShowProfileMenu(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '8px 12px',
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '0.85rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="btn-primary"
            style={{ padding: '8px 20px', fontSize: '0.88rem' }}
          >
            Sign In / Register
          </button>
        )}
      </div>
    </header>
  );
}
