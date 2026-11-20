import React from 'react';
import {
  LayoutDashboard,
  Target,
  Building2,
  BarChart3,
  Trophy,
  Crown,
  Settings,
  Sparkles
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'missions', label: 'Missions', icon: Target },
  { id: 'city', label: 'My City', icon: Building2 },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'achievements', label: 'Achievements', icon: Trophy },
  { id: 'leaderboard', label: 'Leaderboard', icon: Crown },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <aside style={{
      width: '260px',
      minWidth: '260px',
      backgroundColor: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      overflowY: 'auto'
    }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 8px', marginBottom: '32px' }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #06b6d4 0%, #6366f1 50%, #d946ef 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)'
        }}>
          {/* Custom Stylized V Logo */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4 4L12 20L20 4" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 4L12 13L16 4" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h1 style={{
            fontSize: '1.4rem',
            fontWeight: 800,
            letterSpacing: '2px',
            color: '#fff',
            lineHeight: 1
          }}>
            VYRON
          </h1>
          <span style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            color: '#818cf8',
            letterSpacing: '1.5px',
            textTransform: 'uppercase'
          }}>
            LEVEL UP YOUR LIFE.
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 16px',
                borderRadius: '14px',
                border: 'none',
                background: isActive
                  ? 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)'
                  : 'transparent',
                color: isActive ? '#ffffff' : '#94a3b8',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.95rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 4px 18px rgba(59, 130, 246, 0.45)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = '#fff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#94a3b8';
                }
              }}
            >
              <Icon size={20} color={isActive ? '#ffffff' : '#818cf8'} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Visual / Sci-Fi Graphic Card */}
      <div style={{
        marginTop: 'auto',
        background: 'linear-gradient(180deg, rgba(20, 24, 46, 0.6) 0%, rgba(13, 15, 29, 0.9) 100%)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        borderRadius: '16px',
        padding: '16px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow circle */}
        <div style={{
          position: 'absolute',
          top: '-20px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '90px',
          height: '90px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, transparent 70%)',
          borderRadius: '50%'
        }} />

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
          <img
            src="/assets/sidebar_globe.jpg"
            alt="Dream · Plan · Build"
            style={{
              width: '100%',
              maxHeight: '75px',
              objectFit: 'cover',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        <div style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          color: '#38bdf8',
          letterSpacing: '1px',
          marginBottom: '6px'
        }}>
          Dream • Plan • Build
        </div>

        <p style={{
          fontSize: '0.75rem',
          fontStyle: 'italic',
          color: '#cbd5e1',
          lineHeight: 1.4
        }}>
          "Small steps build great cities."
        </p>
      </div>
    </aside>
  );
}
