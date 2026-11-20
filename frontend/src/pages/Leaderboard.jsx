import React, { useState, useEffect } from 'react';
import { Crown, Coins, Zap, Trophy, Shield, Medal } from 'lucide-react';
import { api } from '../services/api';

export default function Leaderboard({ user }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadLeaderboard = async () => {
    try {
      const res = await api.getLeaderboard();
      setLeaderboard(res.leaderboard || []);
      setCurrentUserRank(res.current_user_rank || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard();
  }, [user]);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            Global Leaderboard 👑
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Compete with productive architects across the network.
          </p>
        </div>

        <div style={{
          background: 'linear-gradient(90deg, rgba(124, 58, 237, 0.25) 0%, rgba(59, 130, 246, 0.25) 100%)',
          border: '1px solid rgba(139, 92, 246, 0.4)',
          padding: '8px 16px',
          borderRadius: '12px',
          color: '#fff',
          fontWeight: 700,
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Crown size={18} color="#fbbf24" />
          <span>Your Standing: Rank #{currentUserRank}</span>
        </div>
      </div>

      {/* Leaderboard Table Card */}
      <div className="vy-card" style={{ padding: '16px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                <th style={{ padding: '14px 16px', width: '80px' }}>Rank</th>
                <th style={{ padding: '14px 16px' }}>Architect</th>
                <th style={{ padding: '14px 16px' }}>Level</th>
                <th style={{ padding: '14px 16px' }}>Total XP</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Treasury Coins</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((item, idx) => {
                const rank = idx + 1;
                const isUser = item.is_current_user || (user && item.id === user.id);
                const rankColor = rank === 1 ? '#fbbf24' : rank === 2 ? '#94a3b8' : rank === 3 ? '#f97316' : '#64748b';

                return (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                      background: isUser
                        ? 'linear-gradient(90deg, rgba(124, 58, 237, 0.25) 0%, rgba(59, 130, 246, 0.15) 100%)'
                        : 'transparent',
                      boxShadow: isUser ? '0 0 15px rgba(124, 58, 237, 0.2)' : 'none',
                      transition: 'background 0.2s'
                    }}
                  >
                    {/* Rank */}
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 800, color: rankColor, fontSize: '1.05rem', minWidth: '18px' }}>
                          {rank}
                        </span>
                        {rank <= 3 && <Medal size={16} color={rankColor} />}
                      </div>
                    </td>

                    {/* Architect User */}
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={item.avatar || '/assets/avatar_fahima.jpg'}
                          alt={item.display_name}
                          style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: isUser ? '2px solid #8b5cf6' : '1px solid rgba(255,255,255,0.1)'
                          }}
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: '#fff' }}>
                            {item.display_name || item.username} {isUser && <span style={{ color: '#c084fc', fontSize: '0.8rem' }}>(You)</span>}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>@{item.username}</div>
                        </div>
                      </div>
                    </td>

                    {/* Level */}
                    <td style={{ padding: '16px' }}>
                      <span className="badge-purple" style={{ fontSize: '0.8rem' }}>
                        Lv. {item.level}
                      </span>
                    </td>

                    {/* Total XP */}
                    <td style={{ padding: '16px', color: '#38bdf8', fontWeight: 700 }}>
                      {item.total_xp.toLocaleString()} XP
                    </td>

                    {/* Treasury Coins */}
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#fbbf24', fontWeight: 800 }}>
                        <Coins size={16} />
                        <span>{item.coins.toLocaleString()}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
