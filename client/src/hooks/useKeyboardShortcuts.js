import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Global keyboard shortcuts:
 *  Ctrl+K  → focus search bar (#search-input)
 *  Ctrl+N  → navigate to /new
 *  Ctrl+S  → click #editor-save-btn (if on editor page)
 *  Escape  → navigate back / close dialogs
 */
export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handler = (e) => {

      // Ctrl+K → focus search
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        if (searchInput) { searchInput.focus(); searchInput.select(); }
        return;
      }

      // Ctrl+N → new note
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        navigate('/new');
        return;
      }

      // Ctrl+S → save (editor page only)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        const saveBtn = document.getElementById('editor-save-btn');
        if (saveBtn) saveBtn.click();
        return;
      }

      // Escape → go back / close dialogs
      if (e.key === 'Escape') {
        // If a dialog overlay is open, close via its cancel button
        const cancelBtn = document.getElementById('dialog-cancel-btn');
        if (cancelBtn) { cancelBtn.click(); return; }
        // If on any page other than home, go back
        if (location.pathname !== '/') { navigate(-1); return; }
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate, location]);
}
