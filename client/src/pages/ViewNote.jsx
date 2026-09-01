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
      addToast(`Exported as ${type.toUpperCase()}`, 'success');
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
          Back
        </button>
        <span className="topbar-title" style={{ flex: 1, textAlign: 'center' }}>
          {note.isPinned && (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: 6, display: 'inline-block', verticalAlign: 'middle', color: 'var(--warn)' }}><path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2z"/></svg>
          )}{note.title}
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
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: 'middle' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export
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
                  <span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/><polyline points="6 9 6 2 18 2 18 9"/></svg>
                  </span>
                  <div>
                    <div className="export-menu-title">PDF</div>
                    <div className="export-menu-desc">Via print dialog</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          <button className="btn btn-ghost" onClick={() => navigate(`/edit/${id}`)} id="view-edit-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: 'middle' }}><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            Edit
          </button>
          <button className="btn btn-danger" onClick={() => setShowConfirm(true)} id="view-delete-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: 'middle' }}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            Delete
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
              {note.content || ''}
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
