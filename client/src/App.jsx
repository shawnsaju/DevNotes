import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import EditorPage from './pages/EditorPage';
import ViewNote from './pages/ViewNote';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ToastContainer from './components/ToastContainer';

// ─── Protected Route wrapper ──────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="spinner-wrap" style={{ height: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }
  return user ? children : <Navigate to="/login" replace />;
}

// ─── Inner app (needs to be inside BrowserRouter for hooks) ───────────────────
function AppShell() {
  const { user } = useAuth();
  const [activeTag,   setActiveTag]   = useState('');
  const [search,      setSearch]      = useState('');
  const [refreshKey,  setRefreshKey]  = useState(0);
  const [toasts,      setToasts]      = useState([]);

  const refresh = useCallback(() => setRefreshKey(k => k + 1), []);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  // Register global keyboard shortcuts (only when authenticated)
  useKeyboardShortcuts();

  if (!user) {
    return (
      <>
        <Routes>
          <Route path="/login"    element={<LoginPage addToast={addToast} />} />
          <Route path="/register" element={<RegisterPage addToast={addToast} />} />
          <Route path="*"         element={<Navigate to="/login" replace />} />
        </Routes>
        <ToastContainer toasts={toasts} />
      </>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar
        activeTag={activeTag}
        onTagSelect={setActiveTag}
        refreshKey={refreshKey}
      />
      <div className="main-area">
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard
                  activeTag={activeTag}
                  setActiveTag={setActiveTag}
                  search={search}
                  setSearch={setSearch}
                  refreshKey={refreshKey}
                  refresh={refresh}
                  addToast={addToast}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/new"
            element={
              <ProtectedRoute>
                <EditorPage refresh={refresh} addToast={addToast} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit/:id"
            element={
              <ProtectedRoute>
                <EditorPage refresh={refresh} addToast={addToast} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/note/:id"
            element={
              <ProtectedRoute>
                <ViewNote refresh={refresh} addToast={addToast} />
              </ProtectedRoute>
            }
          />
          <Route path="/login"    element={<Navigate to="/" replace />} />
          <Route path="/register" element={<Navigate to="/" replace />} />
          <Route path="*"         element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <ToastContainer toasts={toasts} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <AppShell />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
