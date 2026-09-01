import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import NoteCard from '../components/NoteCard';
import ConfirmDialog from '../components/ConfirmDialog';
import { fetchNotes, deleteNote, emptyTrash } from '../api/notes';
import logo from '../assets/logo.png';

// Debounce hook
function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function Dashboard({ isTrashView = false, activeTag, setActiveTag, search, setSearch, refreshKey, refresh, addToast }) {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [showConfirmEmpty, setShowConfirmEmpty] = useState(false);

  const debouncedSearch = useDebounce(search);

  const loadNotes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchNotes({ search: debouncedSearch, tag: activeTag, trash: isTrashView });
      setNotes(data);
    } catch {
      addToast('Failed to load notes', 'error');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, activeTag, refreshKey, isTrashView]);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { loadNotes(); }, [loadNotes]);

  const handleDelete = async () => {
    if (!noteToDelete) return;
    try {
      await deleteNote(noteToDelete.id);
      addToast(isTrashView ? 'Note permanently deleted' : 'Note moved to trash', 'success');
      refresh();
      setNoteToDelete(null);
    } catch {
      addToast('Failed to delete note', 'error');
    }
  };

  const handleEmptyTrash = async () => {
    try {
      await emptyTrash();
      addToast('Trash emptied', 'success');
      refresh();
      setShowConfirmEmpty(false);
    } catch {
      addToast('Failed to empty trash', 'error');
    }
  };

  const pinnedNotes  = notes.filter(n => n.isPinned);
  const regularNotes = notes.filter(n => !n.isPinned);

  return (
    <>
      {/* Top bar */}
      <header className="topbar">
        <span className="topbar-title">
          {isTrashView ? 'Trash' : activeTag ? `# ${activeTag}` : 'All Notes'}
        </span>
        <div className="topbar-right" style={{ flex: 1, justifyContent: 'flex-end' }}>
          <div className="search-wrap">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              id="search-input"
              className="search-input"
              placeholder="Search notes…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {isTrashView ? (
            notes.length > 0 && (
              <button className="btn btn-danger" onClick={() => setShowConfirmEmpty(true)} id="topbar-empty-btn">
                Delete All
              </button>
            )
          ) : (
            <button className="btn btn-primary" onClick={() => navigate('/new')} id="topbar-new-btn">
              ＋ New Note
            </button>
          )}
        </div>
      </header>

      <div className="page-content">
        {/* Active tag filter badge */}
        {(activeTag || search) && (
          <div className="filter-bar">
            {activeTag && (
              <>
                <span className="filter-bar-label">Filtered by:</span>
                <span className="tag removable" onClick={() => setActiveTag('')} title="Clear filter">
                  {activeTag} ✕
                </span>
              </>
            )}
            <span className="notes-count">{notes.length} note{notes.length !== 1 ? 's' : ''}</span>
          </div>
        )}

        {loading ? (
          <div className="spinner-wrap"><div className="spinner" /></div>
        ) : notes.length === 0 ? (
          <div className="empty-state">
            <img className="empty-state-logo" src={logo} alt="DevNotes Logo" />
            <h3>
              {isTrashView
                ? search
                  ? 'No matching notes in trash'
                  : 'Trash is empty'
                : search || activeTag
                ? 'No notes found'
                : 'No notes yet'}
            </h3>
            <p>
              {isTrashView
                ? search
                  ? 'Try a different search term'
                  : 'Deleted notes will appear here'
                : search || activeTag
                ? 'Try a different search or tag'
                : 'Create your first note to get started'}
            </p>
            {!isTrashView && !search && !activeTag && (
              <button className="btn btn-primary" onClick={() => navigate('/new')} style={{ marginTop: 8 }}>
                ＋ Create Note
              </button>
            )}
          </div>
        ) : (
          <>
            {isTrashView ? (
              <div className="notes-grid">
                {notes.map(note => (
                  <NoteCard key={note.id} note={note} isTrashView={true} onRefresh={refresh} addToast={addToast} onDelete={setNoteToDelete} />
                ))}
              </div>
            ) : (
              <>
                {pinnedNotes.length > 0 && (
                  <>
                    <div className="page-header" style={{ marginBottom: 16 }}>
                      <h2 style={{ fontSize: '0.85rem', color: 'var(--warn)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2z"/></svg>
                        Pinned
                      </h2>
                    </div>
                    <div className="notes-grid" style={{ marginBottom: 32 }}>
                      {pinnedNotes.map(note => (
                        <NoteCard key={note.id} note={note} onRefresh={refresh} addToast={addToast} onDelete={setNoteToDelete} />
                      ))}
                    </div>
                  </>
                )}

                {regularNotes.length > 0 && (
                  <>
                    {pinnedNotes.length > 0 && (
                      <div style={{ marginBottom: 16 }}>
                        <h2 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                          All Notes
                        </h2>
                      </div>
                    )}
                    <div className="notes-grid">
                      {regularNotes.map(note => (
                        <NoteCard key={note.id} note={note} onRefresh={refresh} addToast={addToast} onDelete={setNoteToDelete} />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>

      {noteToDelete && (
        <ConfirmDialog
          title="Delete Note"
          message={`"${noteToDelete.title}" will be permanently deleted. This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setNoteToDelete(null)}
        />
      )}

      {showConfirmEmpty && (
        <ConfirmDialog
          title="Empty Trash"
          message="All notes in the trash will be permanently deleted. This cannot be undone."
          onConfirm={handleEmptyTrash}
          onCancel={() => setShowConfirmEmpty(false)}
          confirmLabel="Empty Trash"
        />
      )}
    </>
  );
}
