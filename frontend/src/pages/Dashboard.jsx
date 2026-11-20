import React, { useState, useEffect } from 'react';
import {
  Zap, Star, Coins, Trophy, ArrowRight, Check,
  Crown, Flame, Clock, CheckCircle2, FlaskConical, ChevronDown,
  Building, Flag, Award, Sparkles
} from 'lucide-react';
import StatCards from '../components/StatCard';
import { api } from '../services/api';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';

export default function Dashboard({ user, onExploreCity, onExploreMissions, onExploreAchievements, onExploreLeaderboard, onLevelUp }) {
  const [currentMission, setCurrentMission] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [cityData, setCityData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [completing, setCompleting] = useState(false);
  const [completedSuccess, setCompletedSuccess] = useState(false);

  // Fetch initial dashboard state
  const loadDashboardData = async () => {
    try {
      const [missionsRes, analyticsRes, cityRes, ldrRes] = await Promise.all([
        api.getMissions({ status: 'Pending' }),
        api.getAnalytics('week'),
        api.getCity(),
        api.getLeaderboard()
      ]);

      // Set current mission
      if (missionsRes && missionsRes.length > 0) {
        setCurrentMission(missionsRes[0]);
      } else {
        // Fallback default from screenshot if none pending
        setCurrentMission({
          id: 1,
          title: 'Complete Python Assignment',
          description: 'Finish your Python assignment and submit it.',
          coin_reward: 100,
          xp_reward: 200,
          category: 'Coding',
          difficulty: 'Hard'
        });
      }

      setAnalytics(analyticsRes);
      setCityData(cityRes);
      setLeaderboard(ldrRes.leaderboard || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  // Handle Mark as Complete
  const handleMarkComplete = async () => {
    if (!currentMission || completing || completedSuccess) return;
    setCompleting(true);
    sounds.playClick();

    try {
      const result = await api.completeMission(currentMission.id);
      sounds.playComplete();
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.6 }
      });

      setCompletedSuccess(true);

      // Check level up
      if (result.level_up && onLevelUp) {
        setTimeout(() => {
          sounds.playLevelUp();
          onLevelUp(result);
        }, 600);
      }

      // Reload dashboard state
      setTimeout(() => {
        loadDashboardData();
        setCompletedSuccess(false);
        setCompleting(false);
      }, 1200);

    } catch (err) {
      console.error(err);
      // If already completed or demo fallback, still show rewarding visual
      sounds.playComplete();
      confetti({ particleCount: 70, spread: 50 });
      setCompletedSuccess(true);
      setTimeout(() => {
        setCompletedSuccess(false);
        setCompleting(false);
      }, 1200);
    }
  };

  // SVG Line Chart coordinates for Weekly XP
  const xpDataPoints = analytics?.daily_xp || [
    { day: 'Mon', xp: 20 },
    { day: 'Tue', xp: 45 },
    { day: 'Wed', xp: 40 },
    { day: 'Thu', xp: 60 },
    { day: 'Fri', xp: 55 },
    { day: 'Sat', xp: 75 },
    { day: 'Sun', xp: 90 }
  ];

  const maxXP = Math.max(...xpDataPoints.map(p => p.xp), 100);
  const chartWidth = 240;
  const chartHeight = 85;
  const pointsString = xpDataPoints.map((p, i) => {
    const x = (i / (xpDataPoints.length - 1)) * chartWidth;
    const y = chartHeight - (p.xp / maxXP) * (chartHeight - 15) - 10;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div>
      {/* 4 Top Stat Cards */}
      <StatCards user={user} />

      {/* ROW 1: Hero City Banner + Current Mission Card */}
      <div className="hero-row">
        {/* Left: Build Your Dream City Banner */}
        <div className="vy-card vy-card-glow" style={{
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '36px 32px',
          minHeight: '260px',
          background: 'linear-gradient(90deg, rgba(14, 16, 32, 0.95) 0%, rgba(20, 24, 48, 0.85) 50%, rgba(20, 24, 48, 0.4) 100%)'
        }}>
          {/* Futuristic City Artwork Background */}
          <div style={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '60%',
            backgroundImage: 'url(/assets/hero_city.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.9,
            maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)',
            zIndex: 1
          }} />

          {/* Banner Text Overlay */}
          <div style={{ position: 'relative', zIndex: 2, maxWidth: '420px' }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: '#ffffff',
              lineHeight: 1.15,
              marginBottom: '4px'
            }}>
              Build Your
            </h2>
            <h2 style={{
              fontSize: '2.3rem',
              fontWeight: 900,
              background: 'linear-gradient(135deg, #c084fc 0%, #a855f7 50%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.15,
              marginBottom: '12px',
              textShadow: '0 0 30px rgba(168, 85, 247, 0.4)'
            }}>
              Dream City
            </h2>

            <p style={{
              color: '#cbd5e1',
              fontSize: '0.95rem',
              lineHeight: 1.4,
              marginBottom: '20px'
            }}>
              Complete missions, earn rewards and watch your city grow!
            </p>

            <button
              onClick={onExploreCity}
              className="btn-cyan"
            >
              <span>Explore Your City</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Right: Current Mission Card */}
        <div className="vy-card" style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '24px',
          background: 'linear-gradient(145deg, #15182e 0%, #101222 100%)',
          border: '1px solid rgba(139, 92, 246, 0.3)'
        }}>
          <div>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Star size={18} color="#fbbf24" fill="#fbbf24" />
                <span style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>Current Mission</span>
              </div>
              <button
                onClick={onExploreMissions}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#c084fc',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>View All</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Mission Details with Python Logo */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '18px' }}>
              {/* Python Logo Graphic */}
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '14px',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg width="36" height="36" viewBox="0 0 128 128">
                  <path fill="#387EB8" d="M63.7 3.2c-15.6 0-29.4 1.3-29.4 9.1v9.6h29.8v3.2H20.7c-9.1 0-17 5.4-17 15.6 0 11.8 7.3 16 16.5 16h8.7v-12c0-8.9 7.7-16.3 16.6-16.3h28.6c7.3 0 13.2-6 13.2-13.4V16.3c0-8.8-11.8-13.1-23.6-13.1zM47.8 11.2a4.4 4.4 0 1 1 0 8.8 4.4 4.4 0 0 1 0-8.8z"/>
                  <path fill="#FFE052" d="M64.3 124.8c15.6 0 29.4-1.3 29.4-9.1v-9.6H63.9v-3.2h43.4c9.1 0 17-5.4 17-15.6 0-11.8-7.3-16-16.5-16h-8.7v12c0 8.9-7.7 16.3-16.6 16.3H44c-7.3 0-13.2 6-13.2 13.4v19.1c0 8.8 11.8 13.1 23.6 13.1zM80.2 116.8a4.4 4.4 0 1 1 0-8.8 4.4 4.4 0 0 1 0 8.8z"/>
                </svg>
              </div>

              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                  {currentMission?.title || 'Complete Python Assignment'}
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.35 }}>
                  {currentMission?.description || 'Finish your Python assignment and submit it.'}
                </p>
              </div>
            </div>

            {/* Reward Badges */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <span className="badge-gold">
                <span>🪙</span>
                <span>+{currentMission?.coin_reward || 100} Coins</span>
              </span>
              <span className="badge-purple">
                <span>⭐</span>
                <span>+{currentMission?.xp_reward || 200} XP</span>
              </span>
            </div>
          </div>

          {/* Mark as Complete Button */}
          <button
            onClick={handleMarkComplete}
            disabled={completing}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '1rem',
              background: completedSuccess
                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #7928ca 0%, #4f46e5 100%)'
            }}
          >
            {completedSuccess ? (
              <>
                <CheckCircle2 size={18} />
                <span>Mission Completed! (+XP)</span>
              </>
            ) : (
              <>
                <Check size={18} />
                <span>Mark as Complete</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ROW 2: Your City Preview + Your Progress Panel */}
      <div className="mid-row">
        {/* Left: Your City Preview Card */}
        <div className="vy-card" style={{
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '260px',
          background: 'linear-gradient(180deg, #121528 0%, #0c0e1a 100%)'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 2, marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building size={18} color="#38bdf8" />
              <span style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>Your City</span>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.3) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              color: '#fbbf24',
              padding: '4px 10px',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>👑 Level {cityData?.city_level || 2}</span>
            </div>
          </div>

          {/* City Isometric Visual Image */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url(/assets/city_card.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.65,
            zIndex: 1
          }} />

          {/* Subcard inside bottom: Next Unlock */}
          <div style={{
            position: 'relative',
            zIndex: 2,
            marginTop: 'auto',
            background: 'rgba(15, 18, 36, 0.88)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '14px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 20px rgba(0,0,0,0.4)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <FlaskConical size={18} color="#38bdf8" />
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Next Unlock:</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>
                  {cityData?.next_unlock?.name || 'Research Center'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24' }}>
                <Coins size={14} />
                <span>{cityData?.next_unlock?.cost?.toLocaleString() || '2,500'}</span>
              </div>
              <button
                onClick={onExploreCity}
                className="btn-cyan"
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              >
                <span>Upgrade City</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Your Progress Card */}
        <div className="vy-card" style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '24px',
          background: 'linear-gradient(145deg, #15182e 0%, #101222 100%)',
          minHeight: '260px'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3Icon size={18} color="#38bdf8" />
              <span style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>Your Progress</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '4px 10px',
                fontSize: '0.78rem',
                color: '#cbd5e1',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <span>This Week</span>
                <ChevronDown size={12} />
              </div>

              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 700
              }}>
                +280 XP
              </div>
            </div>
          </div>

          {/* Grid Layout inside Progress Card */}
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1.3fr', gap: '20px', alignItems: 'center' }}>
            {/* 1. Circular Progress Gauge (78% Productivity) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '84px', height: '84px' }}>
                <svg width="84" height="84" viewBox="0 0 100 100">
                  <circle
                    cx="50" cy="50" r="40"
                    fill="transparent"
                    stroke="rgba(255, 255, 255, 0.08)"
                    strokeWidth="9"
                  />
                  <circle
                    cx="50" cy="50" r="40"
                    fill="transparent"
                    stroke="#06b6d4"
                    strokeWidth="9"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 * (1 - 0.78)}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                    style={{ filter: 'drop-shadow(0 0 6px rgba(6, 182, 212, 0.6))' }}
                  />
                </svg>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1.1
                }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                    {analytics?.productivity_percentage || 78}%
                  </span>
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '6px', fontWeight: 600 }}>
                Productivity
              </span>
            </div>

            {/* 2. Middle Stats (Missions, Focus, Streak) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Check size={14} color="#34d399" />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                    {analytics?.completed_count ?? 7} / {analytics?.planned_count ?? 9}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Missions Completed</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: 'rgba(59, 130, 246, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Clock size={14} color="#38bdf8" />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                    {analytics?.focus_hours ?? 12.5} hrs
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Focus Time</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: 'rgba(245, 158, 11, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Flame size={14} color="#f59e0b" fill="#f59e0b" />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>
                    {analytics?.current_streak ?? user?.streak ?? 5} Day
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>Streak</div>
                </div>
              </div>
            </div>

            {/* 3. Smooth Weekly XP Line Chart */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <svg width="100%" height="85" viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ overflow: 'visible' }}>
                {/* Horizontal reference lines */}
                <line x1="0" y1={chartHeight - 10} x2={chartWidth} y2={chartHeight - 10} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <line x1="0" y1="20" x2={chartWidth} y2="20" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />

                {/* Smooth Glowing Path */}
                <polyline
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={pointsString}
                  style={{ filter: 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.8))' }}
                />

                {/* Individual Nodes */}
                {xpDataPoints.map((p, i) => {
                  const x = (i / (xpDataPoints.length - 1)) * chartWidth;
                  const y = chartHeight - (p.xp / maxXP) * (chartHeight - 15) - 10;
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="3.5"
                      fill="#38bdf8"
                      stroke="#0f172a"
                      strokeWidth="2"
                    />
                  );
                })}
              </svg>

              {/* Day Labels below chart */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                marginTop: '8px',
                fontSize: '0.68rem',
                color: '#64748b'
              }}>
                {xpDataPoints.map((p, i) => (
                  <span key={i}>{p.day}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3: Achievements + Leaderboard */}
      <div className="bottom-row">
        {/* Left: Achievements Hex Badges */}
        <div className="vy-card" style={{
          padding: '24px',
          background: 'linear-gradient(145deg, #15182e 0%, #101222 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={18} color="#fbbf24" />
              <span style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>Achievements</span>
            </div>
            <button
              onClick={onExploreAchievements}
              style={{
                background: 'none',
                border: 'none',
                color: '#c084fc',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* 5 Badges matching screenshot */}
          <div className="hex-badge-container">
            {/* 1. First Mission Unlocked */}
            <div className="hex-badge-item" onClick={onExploreAchievements}>
              <div className="hex-icon-box active">
                <Flag size={26} color="#ffffff" />
              </div>
              <span style={{ fontSize: '0.72rem', color: '#e2e8f0', fontWeight: 600, lineHeight: 1.2 }}>
                First Mission<br />Unlocked
              </span>
            </div>

            {/* 2. City Builder */}
            <div className="hex-badge-item" onClick={onExploreAchievements}>
              <div className="hex-icon-box active" style={{ borderColor: '#38bdf8', boxShadow: '0 0 20px rgba(56, 189, 248, 0.45)' }}>
                <Building size={26} color="#38bdf8" />
              </div>
              <span style={{ fontSize: '0.72rem', color: '#e2e8f0', fontWeight: 600, lineHeight: 1.2 }}>
                City Builder
              </span>
            </div>

            {/* 3. Productivity Pro */}
            <div className="hex-badge-item" onClick={onExploreAchievements}>
              <div className="hex-icon-box gold">
                <Star size={26} color="#fbbf24" fill="#fbbf24" />
              </div>
              <span style={{ fontSize: '0.72rem', color: '#e2e8f0', fontWeight: 600, lineHeight: 1.2 }}>
                Productivity<br />Pro
              </span>
            </div>

            {/* 4. XP Collector */}
            <div className="hex-badge-item" onClick={onExploreAchievements}>
              <div className="hex-icon-box" style={{ background: '#131b38', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#60a5fa' }}>XP</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#e2e8f0', fontWeight: 600, lineHeight: 1.2 }}>
                XP Collector
              </span>
            </div>

            {/* 5. Dream Achiever */}
            <div className="hex-badge-item" onClick={onExploreAchievements}>
              <div className="hex-icon-box gold">
                <Crown size={26} color="#fbbf24" />
              </div>
              <span style={{ fontSize: '0.72rem', color: '#e2e8f0', fontWeight: 600, lineHeight: 1.2 }}>
                Dream Achiever
              </span>
            </div>
          </div>
        </div>

        {/* Right: Leaderboard Preview */}
        <div className="vy-card" style={{
          padding: '24px',
          background: 'linear-gradient(145deg, #15182e 0%, #101222 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Crown size={18} color="#fbbf24" />
              <span style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>Leaderboard</span>
            </div>
            <button
              onClick={onExploreLeaderboard}
              style={{
                background: 'none',
                border: 'none',
                color: '#c084fc',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Ranks list matching screenshot */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* 1. NovaDreamer */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontWeight: 800, color: '#fbbf24', fontSize: '0.9rem', width: '14px' }}>1</span>
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  alt="NovaDreamer"
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>NovaDreamer</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Lv.12</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24' }}>
                  <Coins size={14} />
                  <span>8,500</span>
                </div>
              </div>
            </div>

            {/* 2. CodeQueen */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.02)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontWeight: 800, color: '#94a3b8', fontSize: '0.9rem', width: '14px' }}>2</span>
                <img
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80"
                  alt="CodeQueen"
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>CodeQueen</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Lv. 11</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24' }}>
                  <Coins size={14} />
                  <span>7,200</span>
                </div>
              </div>
            </div>

            {/* 3. You (Fahima) - Highlighted capsule */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 12px',
              borderRadius: '12px',
              background: 'linear-gradient(90deg, rgba(124, 58, 237, 0.25) 0%, rgba(59, 130, 246, 0.15) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.45)',
              boxShadow: '0 0 15px rgba(124, 58, 237, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ fontWeight: 800, color: '#f97316', fontSize: '0.9rem' }}>3</span>
                  <Crown size={14} color="#fbbf24" />
                </div>
                <img
                  src={user?.avatar || '/assets/avatar_fahima.jpg'}
                  alt="You (Fahima)"
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #c084fc' }}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>You ({user?.display_name || 'Fahima'})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: 600 }}>Lv. {user?.level || 5}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24' }}>
                  <Coins size={14} />
                  <span>{(user?.coins || 3250).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BarChart3Icon({ size = 18, color = "#38bdf8" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  );
}
