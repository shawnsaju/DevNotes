const API_BASE = '/api';

export async function apiLogin(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error || 'Login failed');
    err.status = res.status;
    throw err;
  }
  return data; // { token, user }
}

export async function apiRegister(username, email, password) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error || 'Registration failed');
    err.status = res.status;
    throw err;
  }
  return data; // { token, user }
}

export async function apiGetMe(token) {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Session invalid');
  return res.json(); // { id, username, email, notesCount, pinnedCount }
}
