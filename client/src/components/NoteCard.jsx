import { useNavigate } from 'react-router-dom';
import { updateNote } from '../api/notes';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function NoteCard({ note, onRefresh, addToast, onDelete }) {
  const navigate = useNavigate();

  const handlePin = async (e) => {
    e.stopPropagation();
    try {
      await updateNote(note.id, { isPinned: !note.isPinned });
      addToast(note.isPinned ? 'Note unpinned' : 'Note pinned', 'info');
      onRefresh();
    } catch {
      addToast('Failed to update note', 'error');
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    navigate(`/edit/${note.id}`);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(note);
  };

  const tags = note.tags ? note.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  return (
    <div
      className={`note-card ${note.isPinned ? 'pinned' : ''}`}
      onClick={() => navigate(`/note/${note.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/note/${note.id}`)}
      id={`note-card-${note.id}`}
    >
      <div className="note-card-header">
        <h3 className="note-card-title">{note.title}</h3>
        <div className="note-card-actions">
          {/* Pin button */}
          <button
            type="button"
            className={`btn-icon ${note.isPinned ? 'active' : ''}`}
            onClick={handlePin}
            title={note.isPinned ? 'Unpin' : 'Pin'}
            id={`pin-note-${note.id}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
              fill={note.isPinned ? 'currentColor' : 'none'}
              stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
              width="15" height="15">
              <line x1="12" y1="17" x2="12" y2="22"/>
              <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
            </svg>
          </button>

          {/* Edit button */}
          <button
            type="button"
            className="btn-icon"
            onClick={handleEdit}
            title="Edit"
            id={`edit-note-${note.id}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
              width="15" height="15">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>

          {/* Delete button */}
          <button
            type="button"
            className="btn-icon danger"
            onClick={handleDelete}
            title="Delete"
            id={`delete-note-${note.id}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"
              width="15" height="15">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/>
              <path d="M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
          </button>
        </div>
      </div>


      <div className="note-card-footer">
        <span className="note-card-date">{formatDate(note.updatedAt)}</span>
        {tags.length > 0 && (
          <div className="tag-list">
            {tags.slice(0, 3).map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
            {tags.length > 3 && <span className="tag">+{tags.length - 3}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
