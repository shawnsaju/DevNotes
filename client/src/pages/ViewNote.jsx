import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { fetchNote, deleteNote } from '../api/notes';
import ConfirmDialog from '../components/ConfirmDialog';
import { exportAsJSON, exportAsMarkdown, exportAsPDF } from '../utils/exportNote';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function ViewNote({ refresh, addToast }) {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [note,        setNote]        = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [exportOpen,  setExportOpen]  = useState(false);
  const exportRef = useRef(null);

  useEffect(() => {
    fetchNote(id)
      .then(setNote)
      .catch(() => { addToast('Note not found', 'error'); navigate('/'); })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Close export dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleDelete = async () => {
    try {
      await deleteNote(id);
      addToast('Note deleted', 'success');
      refresh();
      navigate('/');
    } catch {
      addToast('Failed to delete note', 'error');
    }
  };

  const handleExport = (type) => {
    setExportOpen(false);
    try {
      if (type === 'json')     exportAsJSON(note);
      if (type === 'markdown') exportAsMarkdown(note);
      if (type === 'pdf')      exportAsPDF(note);
      addToast(`Exported as ${type.toUpperCase()} ✅`, 'success');
    } catch {
      addToast('Export failed', 'error');
    }
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;
  if (!note)   return null;

  const tags = note.tags ? note.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  return (
    <>
      <header className="topbar">
        <button className="btn btn-ghost" onClick={() => navigate('/')} id="view-back-btn">
          ← Back
        </button>
        <span className="topbar-title" style={{ flex: 1, textAlign: 'center' }}>
          {note.isPinned && '📌 '}{note.title}
        </span>
        <div className="topbar-right">
          {/* Export dropdown */}
          <div className="export-dropdown" ref={exportRef}>
            <button
              id="export-btn"
              className="btn btn-ghost"
              onClick={() => setExportOpen(o => !o)}
              aria-haspopup="true"
              aria-expanded={exportOpen}
            >
              ⬇️ Export
            </button>
            {exportOpen && (
              <div className="export-menu" role="menu">
                <button
                  className="export-menu-item"
                  onClick={() => handleExport('json')}
                  id="export-json-btn"
                  role="menuitem"
                >
                  <span>{ }</span>
                  <div>
                    <div className="export-menu-title">JSON</div>
                    <div className="export-menu-desc">Raw note data</div>
                  </div>
                </button>
                <button
                  className="export-menu-item"
                  onClick={() => handleExport('markdown')}
                  id="export-md-btn"
                  role="menuitem"
                >
                  <span>#</span>
                  <div>
                    <div className="export-menu-title">Markdown</div>
                    <div className="export-menu-desc">With YAML frontmatter</div>
                  </div>
                </button>
                <button
                  className="export-menu-item"
                  onClick={() => handleExport('pdf')}
                  id="export-pdf-btn"
                  role="menuitem"
                >
                  <span>🖨️</span>
                  <div>
                    <div className="export-menu-title">PDF</div>
                    <div className="export-menu-desc">Via print dialog</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button className="btn btn-ghost" onClick={() => navigate(`/edit/${id}`)} id="view-edit-btn">
            ✏️ Edit
          </button>
          <button className="btn btn-danger" onClick={() => setShowConfirm(true)} id="view-delete-btn">
            🗑️ Delete
          </button>
        </div>
      </header>

      <div className="page-content">
        <div className="view-note-page">
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 16 }}>{note.title}</h1>

          <div className="view-note-meta">
            <span className="view-note-date">Updated {formatDate(note.updatedAt)}</span>
            {tags.length > 0 && (
              <div className="tag-list">
                {tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
              </div>
            )}
          </div>

          <div className="markdown-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {note.content || '*No content*'}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmDialog
          title="Delete Note"
          message={`"${note.title}" will be permanently deleted.`}
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}
