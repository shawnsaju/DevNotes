import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchTags, fetchNotes } from '../api/notes';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import logo from '../assets/logo.png';
import SettingsModal from './SettingsModal';

export default function Sidebar({ activeTag, onTagSelect, refreshKey }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isTrash = location.pathname === '/trash';

  const [tags,           setTags]           = useState([]);
  const [totalNotes,     setTotalNotes]     = useState(0);
  const [pinnedNotes,    setPinnedNotes]    = useState(0);
  const [settingsOpen,   setSettingsOpen]   = useState(false);

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

  return (
    <aside className="sidebar">
      {/* ── Header ── */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img className="sidebar-logo-img" src={logo} alt="DevNotes Logo" />
          <span className="sidebar-logo-text">DevNotes</span>
          {/* Theme toggle */}
          <button
            id="theme-toggle-btn"
            className="btn-icon theme-toggle"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            )}
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
          className={`nav-item ${location.pathname === '/' && activeTag === '' ? 'active' : ''}`}
          onClick={() => handleSelect('')}
        >
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>
          </span>
          All Notes
        </button>

        <button
          className={`nav-item ${isTrash ? 'active' : ''}`}
          onClick={() => {
            onTagSelect('');
            navigate('/trash');
          }}
        >
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </span>
          Trash
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

        {/* ── Footer: User info + Settings ── */}
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
          id="settings-open-btn"
          className="btn-icon"
          onClick={() => setSettingsOpen(true)}
          title="Settings"
          aria-label="Open settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            width="16" height="16">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
        </button>
      </div>

      {/* Settings Modal — always mounted, toggled via CSS */}
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </aside>
  );
}
