import React from 'react';
import { Award, Zap, Building2, Check, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function LevelUpModal({ levelUpData, onClose, onExploreCity }) {
  if (!levelUpData) return null;

  React.useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ textAlign: 'center', maxWidth: '480px' }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #f59e0b 0%, #ec4899 50%, #8b5cf6 100%)',
          margin: '0 auto 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 30px rgba(236, 72, 153, 0.6)'
        }}>
          <Zap size={36} color="#fff" />
        </div>

        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
          LEVEL UP!
        </h2>
        <p style={{ color: '#38bdf8', fontSize: '1.1rem', fontWeight: 700, marginBottom: '16px' }}>
          You reached Level {levelUpData.new_level}!
        </p>

        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px' }}>
          Your consistent productivity has expanded the horizons of your metropolis. New building blueprints and architectural milestones unlocked!
        </p>

        {levelUpData.unlocked_buildings && levelUpData.unlocked_buildings.length > 0 && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '24px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 700, marginBottom: '6px' }}>
              NEW PERK AVAILABLE IN CITY CATALOGUE:
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#fff', fontWeight: 600 }}>
              <Building2 size={18} color="#38bdf8" />
              <span>{levelUpData.unlocked_buildings[levelUpData.unlocked_buildings.length - 1].name}</span>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={onClose}
            className="btn-ghost"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            Keep Working
          </button>
          <button
            onClick={() => { onClose(); onExploreCity(); }}
            className="btn-primary"
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <span>Upgrade City</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
