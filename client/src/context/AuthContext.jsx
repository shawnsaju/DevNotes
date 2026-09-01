import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiLogin, apiRegister, apiGetMe } from '../api/auth';

const AuthContext = createContext(null);

const TOKEN_KEY = 'devnotes_token';

export function AuthProvider({ children }) {
  const storedToken = localStorage.getItem(TOKEN_KEY);
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(storedToken);
  // Start loading only if we have a token to validate
  const [loading, setLoading] = useState(Boolean(storedToken));

  // On mount: validate stored token
  useEffect(() => {
    if (!token) return; // loading already false (initialized to false when no token)
    apiGetMe(token)
      .then(userData => setUser(userData))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await apiLogin(email, password);
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (username, email, password) => {
    const data = await apiRegister(username, email, password);
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  // Refresh user stats (call after note operations)
  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const userData = await apiGetMe(token);
      setUser(userData);
    } catch {
      // ignore
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
