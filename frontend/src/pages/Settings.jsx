import React, { useState } from 'react';
import { User, Lock, Bell, Sparkles, RefreshCw, LogOut, Check, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { sounds } from '../utils/audio';

export default function Settings({ user, onRefreshUser, onLogout }) {
  // Profile Form
  const [displayName, setDisplayName] = useState(user?.display_name || 'Fahima F');
  const [avatar, setAvatar] = useState(user?.avatar || '/assets/avatar_fahima.jpg');
  const [bio, setBio] = useState(user?.bio || 'Mastering productivity one mission at a time.');
  const [profileMsg, setProfileMsg] = useState(null);

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwMsg, setPwMsg] = useState(null);

  // Preferences
  const [notifications, setNotifications] = useState(user?.notifications_enabled ?? true);
  const [reSeeding, setReSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState(null);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.updateProfile({ display_name: displayName, avatar, bio });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
      if (onRefreshUser) onRefreshUser();
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message });
    }
    setTimeout(() => setProfileMsg(null), 3500);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    try {
      await api.changePassword(currentPassword, newPassword);
      setPwMsg({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwMsg({ type: 'error', text: err.message });
    }
    setTimeout(() => setPwMsg(null), 3500);
  };

  const handleReseed = async () => {
    setReSeeding(true);
    sounds.playClick();
    try {
      await api.seedData();
      sounds.playComplete();
      setSeedMsg('Sample data re-seeded successfully! Level, missions, city, and rivals synchronized.');
      if (onRefreshUser) onRefreshUser();
    } catch (err) {
      setSeedMsg('Failed to seed: ' + err.message);
    } finally {
      setReSeeding(false);
      setTimeout(() => setSeedMsg(null), 4000);
    }
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
          System & Profile Settings ⚙️
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Manage your architect identity, security credentials, and system options.
        </p>
      </div>

      {/* Profile Form */}
      <div className="vy-card" style={{ marginBottom: '24px', padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={18} color="#38bdf8" />
          <span>Architect Profile</span>
        </h3>

        {profileMsg && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            marginBottom: '16px',
            background: profileMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: profileMsg.type === 'success' ? '#34d399' : '#fca5a5',
            fontSize: '0.85rem'
          }}>
            {profileMsg.text}
          </div>
        )}

        <form onSubmit={handleUpdateProfile}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                Avatar URL / Asset
              </label>
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
              Bio / Motto
            </label>
            <input
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <button type="submit" className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.88rem' }}>
            Save Profile
          </button>
        </form>
      </div>

      {/* Password Change Form */}
      <div className="vy-card" style={{ marginBottom: '24px', padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Lock size={18} color="#fbbf24" />
          <span>Security & Password</span>
        </h3>

        {pwMsg && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            marginBottom: '16px',
            background: pwMsg.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            color: pwMsg.type === 'success' ? '#34d399' : '#fca5a5',
            fontSize: '0.85rem'
          }}>
            {pwMsg.text}
          </div>
        )}

        <form onSubmit={handleChangePassword}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '0.9rem'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                New Password (min 8 chars)
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          <button type="submit" className="btn-cyan" style={{ padding: '8px 20px', fontSize: '0.88rem' }}>
            Update Password
          </button>
        </form>
      </div>

      {/* System Administration & Synchronization */}
      <div className="vy-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} color="#c084fc" />
          <span>System Synchronization & Utilities</span>
        </h3>

        {seedMsg && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '8px',
            marginBottom: '16px',
            background: 'rgba(56, 189, 248, 0.15)',
            color: '#38bdf8',
            fontSize: '0.85rem'
          }}>
            {seedMsg}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>Restore Standard Demo Blueprint</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Reset default achievements, buildings catalogue, and leaderboard rivals.
            </div>
          </div>
          <button
            onClick={handleReseed}
            disabled={reSeeding}
            className="btn-ghost"
            style={{ fontSize: '0.85rem' }}
          >
            <RefreshCw size={14} className={reSeeding ? 'pulse-glow' : ''} />
            <span>{reSeeding ? 'Syncing...' : 'Sync Demo Data'}</span>
          </button>
        </div>

        <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '16px 0' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 600, color: '#ef4444', fontSize: '0.9rem' }}>Terminate Current Session</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              Sign out and clear local session authentication tokens.
            </div>
          </div>
          <button
            onClick={onLogout}
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
