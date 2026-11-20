import React, { useState, useEffect } from 'react';
import { Trophy, Flag, Building2, Star, Award, Crown, Check, Lock, Calendar } from 'lucide-react';
import { api } from '../services/api';

const BADGE_ICONS = {
  flag: Flag,
  building: Building2,
  star: Star,
  award: Award,
  crown: Crown,
  trophy: Trophy
};

export default function Achievements({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAchievements = async () => {
    try {
      const res = await api.getAchievements();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAchievements();
  }, [user]);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            Hall of Achievements 🏆
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Earn prestigious badges and verify key operational milestones.
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, rgba(217, 70, 239, 0.2) 0%, rgba(139, 92, 246, 0.3) 100%)',
          border: '1px solid rgba(217, 70, 239, 0.4)',
          padding: '8px 16px',
          borderRadius: '12px',
          color: '#e879f9',
          fontWeight: 800,
          fontSize: '0.95rem'
        }}>
          Unlocked: {data?.earned_count || 0} / {data?.total_count || 5} Badges
        </div>
      </div>

      {/* Achievements Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {data?.achievements?.map((ach) => {
          const isEarned = ach.is_earned;
          const IconComp = BADGE_ICONS[ach.icon] || Trophy;

          return (
            <div
              key={ach.id}
              className="vy-card"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                border: isEarned ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)',
                boxShadow: isEarned ? '0 0 20px rgba(56, 189, 248, 0.15)' : 'none',
                opacity: isEarned ? 1 : 0.65
              }}
            >
              {/* Badge Emblem */}
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '16px',
                background: isEarned
                  ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)'
                  : 'rgba(255, 255, 255, 0.04)',
                border: isEarned ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: isEarned ? '0 0 15px rgba(56, 189, 248, 0.4)' : 'none'
              }}>
                <IconComp size={28} color={isEarned ? '#fff' : '#64748b'} />
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>
                    {ach.name}
                  </h4>
                  {isEarned ? (
                    <span style={{
                      background: 'rgba(16, 185, 129, 0.2)',
                      color: '#34d399',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Check size={12} />
                      <span>Claimed</span>
                    </span>
                  ) : (
                    <span style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#94a3b8',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '0.72rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Lock size={12} />
                      <span>Locked</span>
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '10px', lineHeight: 1.35 }}>
                  {ach.description}
                </p>

                {isEarned && ach.earned_at && (
                  <div style={{ fontSize: '0.72rem', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} />
                    <span>Unlocked on {new Date(ach.earned_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
