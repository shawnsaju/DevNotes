import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchTags, fetchNotes } from '../api/notes';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Sidebar({ activeTag, onTagSelect, refreshKey }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [tags,        setTags]        = useState([]);
  const [totalNotes,  setTotalNotes]  = useState(0);
  const [pinnedNotes, setPinnedNotes] = useState(0);

  useEffect(() => {
    fetchTags().then(setTags).catch(() => {});
    fetchNotes().then(notes => {
      setTotalNotes(notes.length);
      setPinnedNotes(notes.filter(n => n.isPinned).length);
    }).catch(() => {});
  }, [refreshKey]);

  const handleSelect = (tag) => {
    onTagSelect(tag);
    navigate('/');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      {/* ── Header ── */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">📝</div>
          <span className="sidebar-logo-text">DevNotes</span>
          {/* Theme toggle */}
          <button
            id="theme-toggle-btn"
            className="btn-icon theme-toggle"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
        <button
          id="sidebar-new-note-btn"
          className="sidebar-new-btn"
          onClick={() => navigate('/new')}
        >
          <span>＋</span> New Note
        </button>
      </div>

      {/* ── Body ── */}
      <div className="sidebar-body">
        {/* Dashboard stats */}
        <div className="sidebar-stats">
          <div className="stat-item">
            <span className="stat-value">{totalNotes}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">{pinnedNotes}</span>
            <span className="stat-label">Pinned</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value">{tags.length}</span>
            <span className="stat-label">Tags</span>
          </div>
        </div>

        <p className="sidebar-section-title" style={{ marginTop: 20 }}>Navigation</p>
        <button
          className={`nav-item ${activeTag === '' ? 'active' : ''}`}
          onClick={() => handleSelect('')}
        >
          <span>📋</span>
          All Notes
          <span className="tag-count">{totalNotes}</span>
        </button>

        {tags.length > 0 && (
          <>
            <p className="sidebar-section-title">Tags</p>
            {tags.map((tag) => (
              <button
                key={tag}
                className={`nav-item ${activeTag === tag ? 'active' : ''}`}
                onClick={() => handleSelect(tag)}
              >
                <span style={{ fontSize: '10px', opacity: 0.5 }}>●</span>
                {tag}
              </button>
            ))}
          </>
        )}
      </div>

      {/* ── Footer: User info + Logout ── */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {user?.username?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user?.username}</span>
            <span className="sidebar-user-email">{user?.email}</span>
          </div>
        </div>
        <button
          id="logout-btn"
          className="btn-icon danger"
          onClick={handleLogout}
          title="Sign out"
          aria-label="Sign out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            width="16" height="16">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </button>
      </div>
    </aside>
  );
}
