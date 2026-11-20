import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, Flame, Calendar, Coins, Star, PieChart } from 'lucide-react';
import { api } from '../services/api';

export default function Analytics({ user }) {
  const [range, setRange] = useState('week');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.getAnalytics(range);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [range, user]);

  const productivity = data?.productivity_percentage || 0;
  const planned = data?.planned_count || 0;
  const completed = data?.completed_count || 0;
  const focusHours = data?.focus_hours || 0;
  const streak = data?.current_streak || user?.streak || 0;
  const weeklyGain = data?.weekly_xp_gain || 0;

  // Chart calculation
  const dailyXP = data?.daily_xp || [];
  const maxXP = Math.max(...dailyXP.map(d => d.xp), 50);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            Productivity Telemetry 📊
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Server-verified progress metrics, focus intervals, and reward history.
          </p>
        </div>

        {/* Range Selector */}
        <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px' }}>
          <button
            onClick={() => setRange('week')}
            style={{
              background: range === 'week' ? 'var(--grad-purple-action)' : 'transparent',
              border: 'none',
              color: range === 'week' ? '#fff' : '#94a3b8',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
          >
            This Week
          </button>
          <button
            onClick={() => setRange('month')}
            style={{
              background: range === 'month' ? 'var(--grad-purple-action)' : 'transparent',
              border: 'none',
              color: range === 'month' ? '#fff' : '#94a3b8',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
          >
            This Month
          </button>
        </div>
      </div>

      {/* 4 Top Metric Cards */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="vy-card">
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Productivity Rating</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#06b6d4' }}>{productivity}%</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>{completed} of {planned} planned tasks</div>
        </div>

        <div className="vy-card">
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Focus Time Invested</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#38bdf8' }}>{focusHours} hrs</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Deep work sessions</div>
        </div>

        <div className="vy-card">
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Active Daily Streak</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f59e0b' }}>{streak} Days</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>Bonus multiplier active</div>
        </div>

        <div className="vy-card">
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>XP Generated</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#c084fc' }}>+{weeklyGain} XP</div>
          <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '4px' }}>Earned in selected period</div>
        </div>
      </div>

      {/* Middle: Trend Chart + Category Distribution */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Daily XP Trend Bar/Line Visualization */}
        <div className="vy-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} color="#38bdf8" />
            <span>Daily XP Velocity</span>
          </h3>

          <div style={{ height: '220px', display: 'flex', alignItems: 'flex-end', gap: '16px', paddingBottom: '24px', position: 'relative' }}>
            {dailyXP.map((d, i) => {
              const heightPct = Math.max(8, (d.xp / maxXP) * 100);
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: 600 }}>
                    {d.xp > 0 ? `+${d.xp}` : '0'}
                  </span>
                  <div style={{
                    width: '100%',
                    maxWidth: '42px',
                    height: `${heightPct}%`,
                    background: 'linear-gradient(180deg, #38bdf8 0%, #6366f1 100%)',
                    borderRadius: '8px 8px 2px 2px',
                    boxShadow: '0 0 15px rgba(56, 189, 248, 0.3)',
                    transition: 'all 0.3s ease'
                  }} />
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px' }}>
                    {d.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="vy-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PieChart size={18} color="#c084fc" />
            <span>Mission Disciplines</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {data?.category_split && Object.keys(data.category_split).length > 0 ? (
              Object.entries(data.category_split).map(([cat, count]) => (
                <div key={cat}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{cat}</span>
                    <span style={{ color: '#38bdf8', fontWeight: 700 }}>{count} completed</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.min(100, count * 20)}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #c084fc 0%, #38bdf8 100%)'
                    }} />
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', textAlign: 'center', padding: '30px 0' }}>
                Complete missions to record discipline breakdown.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reward History Log Table (SRS FR-GAM-05) */}
      <div className="vy-card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
          XP History & Audit Log
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: '#94a3b8' }}>
                <th style={{ padding: '10px 12px' }}>Timestamp</th>
                <th style={{ padding: '10px 12px' }}>Event / Mission</th>
                <th style={{ padding: '10px 12px' }}>XP Earned</th>
                <th style={{ padding: '10px 12px' }}>Coins Granted</th>
              </tr>
            </thead>
            <tbody>
              {data?.recent_logs?.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <td style={{ padding: '12px', color: '#94a3b8' }}>
                    {new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '12px', color: '#fff', fontWeight: 600 }}>
                    {log.reason}
                  </td>
                  <td style={{ padding: '12px', color: '#c084fc', fontWeight: 700 }}>
                    +{log.xp} XP
                  </td>
                  <td style={{ padding: '12px', color: '#fbbf24', fontWeight: 700 }}>
                    +{log.coins} Coins
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
