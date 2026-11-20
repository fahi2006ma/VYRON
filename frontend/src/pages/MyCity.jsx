import React, { useState, useEffect } from 'react';
import { Building2, Coins, Lock, Check, Sparkles, AlertCircle, ArrowUpRight } from 'lucide-react';
import { api } from '../services/api';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';

export default function MyCity({ user, onRefreshUser }) {
  const [cityData, setCityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [constructingId, setConstructingId] = useState(null);
  const [message, setMessage] = useState(null);

  const loadCity = async () => {
    try {
      const data = await api.getCity();
      setCityData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCity();
  }, [user]);

  const handleConstruct = async (building) => {
    if (!building.is_unlocked || building.missing_coins > 0) return;
    setConstructingId(building.id);
    sounds.playClick();

    try {
      const res = await api.constructBuilding(building.id);
      sounds.playLevelUp();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.5 }
      });
      setMessage({ type: 'success', text: `Constructed ${building.name}! Metropolis vitality enhanced.` });
      if (onRefreshUser) onRefreshUser();
      loadCity();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setConstructingId(null);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            My Metropolis 🏙️
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Transform real-world productivity into high-tech architectural wonders.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.3) 100%)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            padding: '8px 16px',
            borderRadius: '12px',
            color: '#fbbf24',
            fontWeight: 800,
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Coins size={18} />
            <span>{(user?.coins || 0).toLocaleString()} Coins Available</span>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(59, 130, 246, 0.3) 100%)',
            border: '1px solid rgba(6, 182, 212, 0.4)',
            padding: '8px 16px',
            borderRadius: '12px',
            color: '#38bdf8',
            fontWeight: 800,
            fontSize: '1rem'
          }}>
            👑 City Level {cityData?.city_level || 2}
          </div>
        </div>
      </div>

      {message && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '12px',
          marginBottom: '20px',
          background: message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
          border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`,
          color: message.type === 'success' ? '#34d399' : '#fca5a5',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {message.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Interactive City Visualization Canvas */}
      <div className="vy-card vy-card-glow" style={{
        position: 'relative',
        minHeight: '360px',
        marginBottom: '32px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px',
        backgroundImage: 'url(/assets/hero_city.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        {/* Dark overlay with grid pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(10, 11, 20, 0.6) 0%, rgba(10, 11, 20, 0.85) 100%)',
          zIndex: 1
        }} />

        {/* Content on top of City Canvas */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span className="badge-purple" style={{ marginBottom: '6px' }}>NEON SKYLINE SECTOR 7</span>
              <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>
                Metropolitan Core
              </h3>
            </div>
            <div style={{ textAlign: 'right', color: '#cbd5e1', fontSize: '0.85rem' }}>
              <div>Constructed Structures: <strong style={{ color: '#38bdf8' }}>{cityData?.constructed_count || 4}</strong></div>
              <div>Citizens Vitality: <strong style={{ color: '#10b981' }}>98.4% Optimal</strong></div>
            </div>
          </div>
        </div>

        {/* Constructed District Grid */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '16px',
          marginTop: '30px'
        }}>
          {cityData?.constructed_buildings?.map((ub) => (
            <div
              key={ub.id}
              style={{
                background: 'rgba(20, 25, 48, 0.85)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                borderRadius: '16px',
                padding: '14px',
                textAlign: 'center',
                boxShadow: '0 8px 25px rgba(0,0,0,0.4)',
                animation: 'modalPop 0.3s ease-out'
              }}
            >
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.3) 0%, rgba(59, 130, 246, 0.3) 100%)',
                margin: '0 auto 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #38bdf8'
              }}>
                <Building2 size={24} color="#38bdf8" />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>{ub.building.name}</div>
              <div style={{ fontSize: '0.7rem', color: '#34d399', marginTop: '2px' }}>Operational</div>
            </div>
          ))}
        </div>
      </div>

      {/* Building Catalogue */}
      <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>
        Architectural Catalogue & Blueprints
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {cityData?.catalogue?.map((b) => {
          const isUnlocked = b.is_unlocked;
          const canAfford = b.missing_coins === 0;

          return (
            <div
              key={b.id}
              className="vy-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: isUnlocked ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
                opacity: isUnlocked ? 1 : 0.65
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: isUnlocked
                      ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                      : 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {isUnlocked ? <Building2 size={22} color="#fff" /> : <Lock size={20} color="#94a3b8" />}
                  </div>

                  <span className={isUnlocked ? 'badge-purple' : 'badge-gold'}>
                    Req. Level {b.required_level}
                  </span>
                </div>

                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                  {b.name}
                </h4>
                <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '16px', lineHeight: 1.4 }}>
                  {b.description}
                </p>
              </div>

              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-subtle)',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24', fontWeight: 700 }}>
                    <Coins size={16} />
                    <span>{b.cost.toLocaleString()} Coins</span>
                  </div>
                  {b.times_constructed > 0 && (
                    <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>Built: {b.times_constructed}x</span>
                  )}
                </div>

                {!isUnlocked ? (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#fca5a5',
                    padding: '8px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '0.78rem',
                    fontWeight: 600
                  }}>
                    Locked • Reach Level {b.required_level} to unlock blueprint
                  </div>
                ) : !canAfford ? (
                  <div style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    color: '#fbbf24',
                    padding: '8px',
                    borderRadius: '8px',
                    textAlign: 'center',
                    fontSize: '0.78rem',
                    fontWeight: 600
                  }}>
                    Need {b.missing_coins.toLocaleString()} more coins
                  </div>
                ) : (
                  <button
                    onClick={() => handleConstruct(b)}
                    disabled={constructingId === b.id}
                    className="btn-cyan"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <Sparkles size={16} />
                    <span>{constructingId === b.id ? 'Constructing...' : 'Construct Structure'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
