import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Missions from './pages/Missions';
import MyCity from './pages/MyCity';
import Analytics from './pages/Analytics';
import Achievements from './pages/Achievements';
import Leaderboard from './pages/Leaderboard';
import Settings from './pages/Settings';
import LoginPage from './pages/LoginPage';
import LevelUpModal from './components/LevelUpModal';
import AICoachModal from './components/AICoachModal';

export default function App() {
  const { user, isAuthenticated, loading, refreshUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAIModal, setShowAIModal] = useState(false);
  const [levelUpData, setLevelUpData] = useState(null);

  // Loading state while checking authentication
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#07080f',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #06b6d4 0%, #6366f1 50%, #d946ef 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 30px rgba(99, 102, 241, 0.6)',
          animation: 'pulseGlow 2s infinite'
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M4 4L12 20L20 4" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 4L12 13L16 4" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div style={{ color: '#818cf8', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '1.5px' }}>
          INITIALIZING VYRON TELEMETRY...
        </div>
      </div>
    );
  }

  // If user is not authenticated, show separate dedicated Login Page!
  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  const handleLevelUp = (data) => {
    setLevelUpData(data);
    refreshUser();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            user={user}
            onExploreCity={() => setActiveTab('city')}
            onExploreMissions={() => setActiveTab('missions')}
            onExploreAchievements={() => setActiveTab('achievements')}
            onExploreLeaderboard={() => setActiveTab('leaderboard')}
            onLevelUp={handleLevelUp}
          />
        );
      case 'missions':
        return (
          <Missions
            user={user}
            onRefreshUser={refreshUser}
            onLevelUp={handleLevelUp}
          />
        );
      case 'city':
        return (
          <MyCity
            user={user}
            onRefreshUser={refreshUser}
          />
        );
      case 'analytics':
        return <Analytics user={user} />;
      case 'achievements':
        return <Achievements user={user} />;
      case 'leaderboard':
        return <Leaderboard user={user} />;
      case 'settings':
        return (
          <Settings
            user={user}
            onRefreshUser={refreshUser}
            onLogout={logout}
          />
        );
      default:
        return <Dashboard user={user} onExploreCity={() => setActiveTab('city')} />;
    }
  };

  // Main Authenticated Web Application
  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="main-content">
        <Navbar
          user={user}
          onOpenAI={() => setShowAIModal(true)}
          onLogout={logout}
          setActiveTab={setActiveTab}
        />

        {/* Dynamic Page View */}
        {renderContent()}
      </main>

      {/* Modals */}
      <LevelUpModal
        levelUpData={levelUpData}
        onClose={() => setLevelUpData(null)}
        onExploreCity={() => setActiveTab('city')}
      />

      <AICoachModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onMissionAdded={() => {
          refreshUser();
        }}
      />
    </div>
  );
}
