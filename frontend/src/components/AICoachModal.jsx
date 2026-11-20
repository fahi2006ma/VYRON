import React, { useState } from 'react';
import { Sparkles, X, Plus, Brain, Target, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function AICoachModal({ isOpen, onClose, onMissionAdded }) {
  const [goal, setGoal] = useState('');
  const [category, setCategory] = useState('Coding');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [addedIds, setAddedIds] = useState([]);
  const [advice, setAdvice] = useState(null);

  if (!isOpen) return null;

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!goal.trim()) return;
    setLoading(true);
    setSuggestions([]);
    try {
      const res = await api.getAISuggestions(goal, category);
      setSuggestions(res.suggestions || []);
    } catch (err) {
      console.error('AI Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMission = async (mission, idx) => {
    try {
      const today = new Date();
      const dueDate = new Date(today);
      dueDate.setDate(today.getDate() + 2);

      await api.createMission({
        title: mission.title,
        description: mission.description,
        category: mission.category || category,
        difficulty: mission.difficulty || 'Medium',
        due_date: dueDate.toISOString().split('T')[0],
        focus_minutes: mission.focus_minutes || 25
      });
      setAddedIds(prev => [...prev, idx]);
      if (onMissionAdded) onMissionAdded();
    } catch (e) {
      alert(e.message);
    }
  };

  const fetchAdvice = async () => {
    setLoading(true);
    try {
      const adv = await api.getAICoaching();
      setAdvice(adv);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ maxWidth: '600px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #d946ef 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Brain size={20} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>VYRON AI Copilot</h3>
              <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>Secured by API Key in .env</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Goal Input Form */}
        <form onSubmit={handleGenerate} style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px', fontWeight: 600 }}>
            What is your current ambition or goal?
          </label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Master React and build full-stack project..."
              style={{
                flex: 1,
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '0.9rem'
              }}
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                padding: '0 12px',
                background: '#16192e',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                color: '#fff',
                fontSize: '0.85rem'
              }}
            >
              <option value="Coding">Coding</option>
              <option value="Study">Study</option>
              <option value="Work">Work</option>
              <option value="Health">Health</option>
              <option value="Personal">Personal</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              disabled={loading || !goal.trim()}
              className="btn-primary"
              style={{ flex: 1 }}
            >
              <Sparkles size={16} />
              <span>{loading ? 'Synthesizing Missions...' : 'Break Down into Gamified Missions'}</span>
            </button>
            <button
              type="button"
              onClick={fetchAdvice}
              className="btn-ghost"
              style={{ fontSize: '0.85rem' }}
            >
              Get Coaching Tip
            </button>
          </div>
        </form>

        {/* Dynamic Advice Card */}
        {advice && (
          <div style={{
            padding: '14px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(59, 130, 246, 0.15) 100%)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            marginBottom: '16px'
          }}>
            <div style={{ fontWeight: 700, color: '#38bdf8', fontSize: '0.9rem', marginBottom: '4px' }}>
              {advice.headline}
            </div>
            <div style={{ color: '#e2e8f0', fontSize: '0.85rem', marginBottom: '8px' }}>
              {advice.message}
            </div>
            <div style={{ color: '#fbbf24', fontSize: '0.78rem', fontStyle: 'italic' }}>
              {advice.tip}
            </div>
          </div>
        )}

        {/* Suggestions List */}
        {suggestions.length > 0 && (
          <div>
            <h4 style={{ fontSize: '0.85rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
              Suggested Missions:
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '250px', overflowY: 'auto' }}>
              {suggestions.map((m, idx) => {
                const isAdded = addedIds.includes(idx);
                return (
                  <div key={idx} style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{m.title}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '2px' }}>{m.description}</div>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                        <span className="badge-purple">{m.difficulty}</span>
                        <span className="badge-gold">⏱ {m.focus_minutes}m</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddMission(m, idx)}
                      disabled={isAdded}
                      style={{
                        background: isAdded ? 'rgba(16, 185, 129, 0.2)' : 'var(--grad-purple-action)',
                        border: isAdded ? '1px solid #10b981' : 'none',
                        color: isAdded ? '#34d399' : '#fff',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        cursor: isAdded ? 'default' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}
                    >
                      {isAdded ? (
                        <>
                          <CheckCircle2 size={14} />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus size={14} />
                          <span>Accept</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
