import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function SettingsModal({ open, onClose }) {
  const navigate = useNavigate();
  const { user, logout, deleteAccount } = useAuth();

  const [visible, setVisible]       = useState(false); // controls CSS open class
  const [logoutStep, setLogoutStep]  = useState(0); // 0 = idle, 1 = confirm
  const [deleteStep, setDeleteStep]  = useState(0); // 0 = idle, 1 = confirm
  const [deleting, setDeleting]      = useState(false);
  const [error, setError]            = useState('');

  // Sync open → visible with a tiny rAF so the browser paints the
  // hidden state first, letting the CSS transition run from the start.
  useEffect(() => {
    if (open) {
      // Mount first (opacity 0), then flip to visible on next frame
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    } else {
      setVisible(false);
      // Reset both confirm steps after modal fades out
      const t = setTimeout(() => { setDeleteStep(0); setLogoutStep(0); }, 250);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/login');
  };

  const handleLogoutClick = () => { setLogoutStep(1); setDeleteStep(0); setError(''); };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    setError('');
    try {
      await deleteAccount();
      onClose();
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Failed to delete account.');
      setDeleting(false);
    }
  };

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '—';

  return (
    <>
      {/* Backdrop — always in DOM, fades via CSS */}
      <div
        className={`settings-backdrop${visible ? ' settings-backdrop--open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal — always in DOM, slides + fades via CSS */}
      <div
        className={`settings-modal${visible ? ' settings-modal--open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="settings-modal-header">
          <div className="settings-modal-title-row">
            <span className="settings-modal-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </span>
            <h2 className="settings-modal-title">Settings</h2>
          </div>
          <button
            id="settings-close-btn"
            className="btn-icon settings-close-btn"
            onClick={onClose}
            aria-label="Close settings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="settings-modal-body">

          {/* Account Details */}
          <section className="settings-section">
            <p className="settings-section-label">Account Details</p>
            <div className="settings-account-card">
              <div className="settings-avatar">
                {user?.username?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="settings-account-info">
                <span className="settings-account-name">{user?.username}</span>
                <span className="settings-account-email">{user?.email}</span>
                <span className="settings-account-joined">Joined {joinDate}</span>
              </div>
            </div>
            <div className="settings-stats-row">
              <div className="settings-stat">
                <span className="settings-stat-value">{user?.notesCount ?? '—'}</span>
                <span className="settings-stat-label">Notes</span>
              </div>
              <div className="settings-stat-divider" />
              <div className="settings-stat">
                <span className="settings-stat-value">{user?.pinnedCount ?? '—'}</span>
                <span className="settings-stat-label">Pinned</span>
              </div>
            </div>
          </section>

          {/* Sign Out */}
          <section className="settings-section">
            {logoutStep === 0 && (
              <button id="settings-logout-btn" className="settings-action-btn" onClick={handleLogoutClick}>
                <span className="settings-action-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </span>
                <div className="settings-action-text">
                  <span className="settings-action-title">Sign Out</span>
                  <span className="settings-action-desc">You can sign back in anytime</span>
                </div>
                <svg className="settings-action-arrow" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            )}

            {logoutStep === 1 && (
              <div className="settings-confirm-box">
                <p className="settings-confirm-title settings-confirm-title--neutral">Sign out of DevNotes?</p>
                <p className="settings-confirm-desc">You can always sign back in with your email and password.</p>
                <div className="settings-confirm-actions">
                  <button
                    className="btn btn-ghost"
                    onClick={() => setLogoutStep(0)}
                  >
                    Cancel
                  </button>
                  <button
                    id="settings-confirm-logout-btn"
                    className="btn btn-primary"
                    onClick={handleLogout}
                  >
                    Yes, Sign Out
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Delete Account */}
          <section className="settings-section settings-danger-section">
            {deleteStep === 0 && (
              <button
                id="settings-delete-account-btn"
                className="settings-action-btn settings-action-btn--danger"
                onClick={() => { setDeleteStep(1); setLogoutStep(0); }}
              >
                <span className="settings-action-icon settings-action-icon--danger">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    <line x1="10" y1="11" x2="10" y2="17"/>
                    <line x1="14" y1="11" x2="14" y2="17"/>
                  </svg>
                </span>
                <div className="settings-action-text">
                  <span className="settings-action-title">Delete Account</span>
                  <span className="settings-action-desc">Permanently delete your account and all notes</span>
                </div>
                <svg className="settings-action-arrow" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            )}

            {deleteStep === 1 && (
              <div className="settings-confirm-box">
                <p className="settings-confirm-title">Are you absolutely sure?</p>
                <p className="settings-confirm-desc">
                  This will permanently delete your account and <strong>all your notes</strong>. This action cannot be undone.
                </p>
                {error && <p className="settings-error">{error}</p>}
                <div className="settings-confirm-actions">
                  <button
                    className="btn btn-ghost"
                    onClick={() => { setDeleteStep(0); setError(''); }}
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    id="settings-confirm-delete-btn"
                    className="btn btn-danger"
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                  >
                    {deleting ? 'Deleting…' : 'Yes, Delete My Account'}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
