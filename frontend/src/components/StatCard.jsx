import React from 'react';
import { Zap, Star, Coins, Trophy } from 'lucide-react';

export default function StatCards({ user }) {
  const level = user?.level || 1;
  const xpWithinLevel = user?.xp_within_level ?? (user?.total_xp ? user.total_xp % 1000 : 720);
  const totalXP = user?.total_xp ?? 780;
  const coins = user?.coins ?? 3250;
  const achievementsCount = 12; // matching UI reference design

  const xpProgressPercent = Math.min(100, Math.round((xpWithinLevel / 1000) * 100));

  return (
    <div className="stats-grid">
      {/* 1. Level Card with XP bar */}
      <div className="vy-card" style={{
        background: 'linear-gradient(135deg, rgba(20, 25, 52, 0.95) 0%, rgba(14, 16, 32, 0.95) 100%)',
        border: '1px solid rgba(59, 130, 246, 0.35)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '100px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(59, 130, 246, 0.5)'
            }}>
              <Zap size={22} color="#ffffff" fill="#ffffff" />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>
                Level {level}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                {xpWithinLevel} / 1000 XP
              </div>
            </div>
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div style={{ marginTop: '12px' }}>
          <div style={{
            width: '100%',
            height: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '9999px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${xpProgressPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #38bdf8 0%, #818cf8 100%)',
              borderRadius: '9999px',
              boxShadow: '0 0 10px #38bdf8'
            }} />
          </div>
        </div>
      </div>

      {/* 2. Total XP Card */}
      <div className="vy-card" style={{
        background: 'linear-gradient(135deg, rgba(20, 25, 52, 0.95) 0%, rgba(14, 16, 32, 0.95) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        minHeight: '100px'
      }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)'
        }}>
          <Star size={22} color="#ffffff" fill="#ffffff" />
        </div>
        <div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>
            {totalXP.toLocaleString()} XP
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: '#34d399',
            fontWeight: 600,
            marginTop: '3px',
            display: 'flex',
            alignItems: 'center',
            gap: '2px'
          }}>
            +100 from last mission ↑
          </div>
        </div>
      </div>

      {/* 3. Coins Card */}
      <div className="vy-card" style={{
        background: 'linear-gradient(135deg, rgba(20, 25, 52, 0.95) 0%, rgba(14, 16, 32, 0.95) 100%)',
        border: '1px solid rgba(234, 179, 8, 0.25)',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        minHeight: '100px'
      }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(234, 179, 8, 0.4)'
        }}>
          <Coins size={22} color="#ffffff" />
        </div>
        <div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>
            {coins.toLocaleString()}
          </div>
          <div style={{
            fontSize: '0.75rem',
            color: '#34d399',
            fontWeight: 600,
            marginTop: '3px',
            display: 'flex',
            alignItems: 'center',
            gap: '2px'
          }}>
            +50 today ↑
          </div>
        </div>
      </div>

      {/* 4. Achievements Card */}
      <div className="vy-card" style={{
        background: 'linear-gradient(135deg, rgba(20, 25, 52, 0.95) 0%, rgba(14, 16, 32, 0.95) 100%)',
        border: '1px solid rgba(217, 70, 239, 0.25)',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        minHeight: '100px'
      }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #d946ef 0%, #8b5cf6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(217, 70, 239, 0.4)'
        }}>
          <Trophy size={22} color="#ffffff" />
        </div>
        <div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', lineHeight: 1.1 }}>
            {achievementsCount}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#cbd5e1', marginTop: '3px' }}>
            Achievements
          </div>
        </div>
      </div>
    </div>
  );
}
