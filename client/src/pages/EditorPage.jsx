import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import { fetchNote, createNote, updateNote } from '../api/notes';
import { useTheme } from '../context/ThemeContext';

export default function EditorPage({ refresh, addToast }) {
  const { id }  = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isEdit  = Boolean(id);

  const [title,     setTitle]     = useState('');
  const [content,   setContent]   = useState('');
  const [tagInput,  setTagInput]  = useState('');
  const [tags,      setTags]      = useState([]);
  const [isPinned,  setIsPinned]  = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [loading,   setLoading]   = useState(isEdit);
  const [autoSaved, setAutoSaved] = useState(false); // "Auto-saved" badge visibility
  const tagRef    = useRef();
  const autoSaveTimer = useRef(null);
  const isFirstLoad   = useRef(true);

  useEffect(() => {
    if (!isEdit) return;
    fetchNote(id)
      .then(note => {
        setTitle(note.title);
        setContent(note.content);
        setTags(note.tags ? note.tags.split(',').map(t => t.trim()).filter(Boolean) : []);
        setIsPinned(note.isPinned);
      })
      .catch(() => { addToast('Failed to load note', 'error'); navigate('/'); })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ─── Auto-save (only for existing notes, debounced 1.5s) ────────────────────
  useEffect(() => {
    if (!isEdit) return;
    if (loading)  return;
    if (isFirstLoad.current) { isFirstLoad.current = false; return; }
    if (!title.trim()) return;

    clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      try {
        await updateNote(id, { title: title.trim(), content, tags: tags.join(', '), isPinned });
        setAutoSaved(true);
        refresh();
        setTimeout(() => setAutoSaved(false), 2500);
      } catch {
        // silently fail — user can still manually save
      }
    }, 1500);

    return () => clearTimeout(autoSaveTimer.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, tags, isPinned]);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput('');
    tagRef.current?.focus();
  };

  const removeTag = (tag) => setTags(prev => prev.filter(t => t !== tag));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
    if (e.key === 'Backspace' && !tagInput && tags.length) {
      setTags(prev => prev.slice(0, -1));
    }
  };

  const handleSave = useCallback(async () => {
    if (!title.trim()) { addToast('Please enter a title', 'error'); return; }
    setSaving(true);
    const payload = { title: title.trim(), content, tags: tags.join(', '), isPinned };
    try {
      if (isEdit) {
        await updateNote(id, payload);
        addToast('Note updated ✅', 'success');
      } else {
        await createNote(payload);
        addToast('Note created ✅', 'success');
      }
      refresh();
      navigate('/');
    } catch {
      addToast('Failed to save note', 'error');
    } finally {
      setSaving(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content, tags, isPinned, isEdit, id]);

  // Expose save handler to Ctrl+S shortcut via the button click
  if (loading) return <div className="spinner-wrap"><div className="spinner" /></div>;

  return (
    <>
      <header className="topbar">
        <button className="btn btn-ghost" onClick={() => navigate(-1)} id="editor-back-btn">
          ← Back
        </button>
        <span className="topbar-title">{isEdit ? 'Edit Note' : 'New Note'}</span>
        <div className="topbar-right">
          {/* Auto-saved indicator */}
          {isEdit && (
            <span className={`autosave-badge ${autoSaved ? 'visible' : ''}`}>
              ✓ Auto-saved
            </span>
          )}

          <button
            className={`btn-icon ${isPinned ? 'active' : ''}`}
            onClick={() => setIsPinned(p => !p)}
            title={isPinned ? 'Unpin' : 'Pin note'}
            id="editor-pin-btn"
          >
            📌
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving}
            id="editor-save-btn"
          >
            {saving ? 'Saving…' : isEdit ? '💾 Update' : '✅ Save'}
          </button>
        </div>
      </header>

      <div className="page-content">
        <div className="editor-page">
          {/* Title */}
          <div className="editor-field">
            <label className="editor-label" htmlFor="note-title">Title</label>
            <input
              id="note-title"
              className="editor-input"
              placeholder="Note title…"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          {/* Tags */}
          <div className="editor-field">
            <label className="editor-label">Tags</label>
            <div className="tag-input-wrap">
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', flex: 1,
                background: 'var(--bg-input)', border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)', padding: '6px 12px', minHeight: 42,
              }}>
                {tags.map(tag => (
                  <span key={tag} className="tag removable" onClick={() => removeTag(tag)}>
                    {tag} ✕
                  </span>
                ))}
                <input
                  ref={tagRef}
                  className="tag-input"
                  style={{ border: 'none', background: 'transparent', outline: 'none', minWidth: 100, padding: '4px 0', flex: 1 }}
                  placeholder={tags.length ? '' : 'Add tags… (Enter to add)'}
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  id="tag-input"
                />
              </div>
              <button className="btn btn-ghost" onClick={addTag} id="add-tag-btn">Add</button>
            </div>
          </div>

          {/* Markdown Editor */}
          <div className="editor-field">
            <label className="editor-label">
              Content (Markdown)
              <span className="editor-label-hint">Ctrl+S to save</span>
            </label>
            <div data-color-mode={theme === 'light' ? 'light' : 'dark'}>
              <MDEditor
                id="md-editor"
                value={content}
                onChange={v => setContent(v || '')}
                height={500}
                preview="live"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
