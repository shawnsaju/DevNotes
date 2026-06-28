const API_BASE = '/api';

export function getAuthHeaders() {
  const token = localStorage.getItem('devnotes_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── Notes ────────────────────────────────────────────────────────────────────

export async function fetchNotes({ search = '', tag = '' } = {}) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (tag) params.set('tag', tag);
  const res = await fetch(`${API_BASE}/notes?${params}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch notes');
  return res.json();
}

export async function fetchNote(id) {
  const res = await fetch(`${API_BASE}/notes/${id}`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch note');
  return res.json();
}

export async function createNote(data) {
  const res = await fetch(`${API_BASE}/notes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create note');
  return res.json();
}

export async function updateNote(id, data) {
  const res = await fetch(`${API_BASE}/notes/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update note');
  return res.json();
}

export async function deleteNote(id) {
  const res = await fetch(`${API_BASE}/notes/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete note');
  return res.json();
}

// ─── Tags ─────────────────────────────────────────────────────────────────────

export async function fetchTags() {
  const res = await fetch(`${API_BASE}/notes/tags`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Failed to fetch tags');
  return res.json();
}
