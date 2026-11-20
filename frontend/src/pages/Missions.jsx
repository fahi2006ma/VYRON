import React, { useState, useEffect } from 'react';
import {
  Target, Plus, Search, Filter, Calendar, Clock,
  Edit2, Trash2, CheckCircle2, AlertCircle, Coins, Star, Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';

const CATEGORIES = ['All', 'Coding', 'Study', 'Work', 'Health', 'Personal'];
const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];

export default function Missions({ user, onRefreshUser, onLevelUp }) {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [search, setSearch] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingMission, setEditingMission] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  
  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Coding');
  const [difficulty, setDifficulty] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [focusMinutes, setFocusMinutes] = useState(25);
  const [formError, setFormError] = useState('');

  const loadMissions = async () => {
    setLoading(true);
    try {
      const data = await api.getMissions({
        status: statusFilter,
        category: categoryFilter,
        difficulty: difficultyFilter,
        search: search
      });
      setMissions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMissions();
  }, [statusFilter, categoryFilter, difficultyFilter, search]);

  const openAddModal = () => {
    setEditingMission(null);
    setTitle('');
    setDescription('');
    setCategory('Coding');
    setDifficulty('Medium');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDueDate(tomorrow.toISOString().split('T')[0]);
    setFocusMinutes(25);
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (m) => {
    if (m.status === 'Completed') return;
    setEditingMission(m);
    setTitle(m.title);
    setDescription(m.description || '');
    setCategory(m.category);
    setDifficulty(m.difficulty);
    setDueDate(m.due_date);
    setFocusMinutes(m.focus_minutes || 25);
    setFormError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (title.trim().length < 3) {
      setFormError('Title must be at least 3 characters.');
      return;
    }

    try {
      if (editingMission) {
        await api.updateMission(editingMission.id, {
          title, description, category, difficulty, due_date: dueDate, focus_minutes: focusMinutes
        });
      } else {
        await api.createMission({
          title, description, category, difficulty, due_date: dueDate, focus_minutes: focusMinutes
        });
      }
      setShowModal(false);
      loadMissions();
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteMission(id);
      setDeleteConfirmId(null);
      loadMissions();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleComplete = async (m) => {
    sounds.playClick();
    try {
      const res = await api.completeMission(m.id);
      sounds.playComplete();
      confetti({ particleCount: 90, spread: 60 });
      if (res.level_up && onLevelUp) {
        sounds.playLevelUp();
        onLevelUp(res);
      }
      if (onRefreshUser) onRefreshUser();
      loadMissions();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
            Mission Operations 🎯
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Transform daily objectives into XP and expand your digital metropolis.
          </p>
        </div>

        <button onClick={openAddModal} className="btn-primary">
          <Plus size={18} />
          <span>New Mission</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="vy-card" style={{ marginBottom: '24px', padding: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {['All', 'Pending', 'Completed'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                style={{
                  background: statusFilter === st ? 'var(--grad-purple-action)' : 'rgba(255, 255, 255, 0.05)',
                  border: 'none',
                  color: statusFilter === st ? '#fff' : '#94a3b8',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.85rem'
                }}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px', maxWidth: '350px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              padding: '6px 12px',
              width: '100%'
            }}>
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="Search missions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '0.85rem',
                  width: '100%'
                }}
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{
              background: '#16192e',
              border: '1px solid var(--border-subtle)',
              color: '#cbd5e1',
              padding: '8px 12px',
              borderRadius: '10px',
              fontSize: '0.85rem'
            }}
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c} Category</option>)}
          </select>

          {/* Difficulty Dropdown */}
          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            style={{
              background: '#16192e',
              border: '1px solid var(--border-subtle)',
              color: '#cbd5e1',
              padding: '8px 12px',
              borderRadius: '10px',
              fontSize: '0.85rem'
            }}
          >
            {DIFFICULTIES.map(d => <option key={d} value={d}>{d} Difficulty</option>)}
          </select>
        </div>
      </div>

      {/* Missions Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
          Loading mission telemetry...
        </div>
      ) : missions.length === 0 ? (
        <div className="vy-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Target size={48} color="#6366f1" style={{ margin: '0 auto 16px', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '8px' }}>No Missions Found</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px' }}>
            No missions matched your filter criteria. Ready to forge a new challenge?
          </p>
          <button onClick={openAddModal} className="btn-primary">
            <Plus size={16} />
            <span>Create Mission</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {missions.map((m) => {
            const isCompleted = m.status === 'Completed';
            const diffColor = m.difficulty === 'Hard' ? '#ef4444' : m.difficulty === 'Medium' ? '#f59e0b' : '#10b981';

            return (
              <div
                key={m.id}
                className="vy-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  opacity: isCompleted ? 0.75 : 1,
                  border: isCompleted ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)'
                }}
              >
                <div>
                  {/* Card Header badges */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        color: diffColor,
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: `1px solid ${diffColor}`,
                        padding: '2px 8px',
                        borderRadius: '6px'
                      }}>
                        {m.difficulty}
                      </span>
                      <span className="badge-purple" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                        {m.category}
                      </span>
                    </div>

                    {/* Actions: Edit / Delete */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {!isCompleted && (
                        <button
                          onClick={() => openEditModal(m)}
                          title="Edit mission"
                          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                        >
                          <Edit2 size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteConfirmId(m.id)}
                        title="Delete mission"
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    color: '#fff',
                    marginBottom: '8px',
                    textDecoration: isCompleted ? 'line-through' : 'none'
                  }}>
                    {m.title}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '16px', lineHeight: 1.4 }}>
                    {m.description || 'No additional mission logs provided.'}
                  </p>

                  {/* Meta: Due Date & Focus Time */}
                  <div style={{ display: 'flex', gap: '16px', fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Calendar size={14} color="#38bdf8" />
                      <span>Due: {m.due_date}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Clock size={14} color="#fbbf24" />
                      <span>{m.focus_minutes}m focus</span>
                    </div>
                  </div>
                </div>

                {/* Footer: Rewards & Complete button */}
                <div style={{
                  paddingTop: '14px',
                  borderTop: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <span className="badge-gold">
                      <Coins size={12} />
                      <span>+{m.coin_reward}</span>
                    </span>
                    <span className="badge-purple">
                      <Star size={12} />
                      <span>+{m.xp_reward} XP</span>
                    </span>
                  </div>

                  {isCompleted ? (
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={16} />
                      <span>Claimed</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleComplete(m)}
                      className="btn-cyan"
                      style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Mission Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>
              {editingMission ? 'Edit Mission Parameters' : 'Forge New Mission'}
            </h3>

            {formError && (
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #ef4444',
                color: '#fca5a5',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '14px'
              }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Mission Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Neural Networks Chapter 4"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.9rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                  Description (Optional)
                </label>
                <textarea
                  rows="3"
                  placeholder="Specify key objectives and deliverables..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '0.85rem',
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: '#16192e',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.85rem'
                    }}
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: '#16192e',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.85rem'
                    }}
                  >
                    <option value="Easy">Easy (50 XP / 25 Coins)</option>
                    <option value="Medium">Medium (100 XP / 50 Coins)</option>
                    <option value="Hard">Hard (200 XP / 100 Coins)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: '#16192e',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '6px' }}>
                    Focus Time (Minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="360"
                    value={focusMinutes}
                    onChange={(e) => setFocusMinutes(parseInt(e.target.value) || 25)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn-ghost"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  {editingMission ? 'Save Changes' : 'Initialize Mission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '400px', textAlign: 'center' }}>
            <AlertCircle size={42} color="#ef4444" style={{ margin: '0 auto 12px' }} />
            <h4 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '8px' }}>Confirm Deletion</h4>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '20px' }}>
              Are you sure you want to delete this mission? Any XP already earned will remain preserved.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setDeleteConfirmId(null)} className="btn-ghost" style={{ flex: 1 }}>
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirmId)} className="btn-primary" style={{ flex: 1, background: '#ef4444' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
