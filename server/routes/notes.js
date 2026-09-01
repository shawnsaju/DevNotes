import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Apply auth middleware to all note routes
router.use(authenticateToken);

// ─── GET /api/notes ─────────────────────────────────────────────────────────
// Query params: ?search=keyword  &tag=React
router.get('/', async (req, res) => {
  try {
    const { search, tag, trash } = req.query;
    const userId = req.user.id;
    const isDeleted = trash === 'true';

    let notes = await prisma.note.findMany({
      where: { userId, isDeleted },
      orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
    });

    // Backend search: filter by title OR content
    if (search) {
      const q = search.toLowerCase();
      notes = notes.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q)
      );
    }

    // Filter by tag
    if (tag) {
      notes = notes.filter((n) =>
        n.tags
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .includes(tag.toLowerCase())
      );
    }

    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/notes/tags ─────────────────────────────────────────────────────
router.get('/tags', async (req, res) => {
  try {
    const userId = req.user.id;
    const notes = await prisma.note.findMany({
      where: { userId, isDeleted: false },
      select: { tags: true },
    });
    const tagSet = new Set();
    notes.forEach((n) => {
      n.tags.split(',').forEach((t) => {
        const trimmed = t.trim();
        if (trimmed) tagSet.add(trimmed);
      });
    });
    res.json([...tagSet].sort());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/notes/:id ──────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const note = await prisma.note.findFirst({
      where: { id: parseInt(req.params.id), userId },
    });
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/notes ─────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { title, content, tags, isPinned } = req.body;
    const userId = req.user.id;

    if (!title) return res.status(400).json({ error: 'Title is required' });

    const note = await prisma.note.create({
      data: {
        title,
        content: content || '',
        tags: tags || '',
        isPinned: isPinned || false,
        userId,
      },
    });
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /api/notes/:id ──────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { title, content, tags, isPinned, isDeleted } = req.body;
    const userId = req.user.id;

    // Ensure note belongs to user
    const existing = await prisma.note.findFirst({
      where: { id: parseInt(req.params.id), userId },
    });
    if (!existing) return res.status(404).json({ error: 'Note not found' });

    const note = await prisma.note.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(tags !== undefined && { tags }),
        ...(isPinned !== undefined && { isPinned }),
        ...(isDeleted !== undefined && { isDeleted }),
      },
    });
    res.json(note);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Note not found' });
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/notes/trash/empty ──────────────────────────────────────────
router.delete('/trash/empty', async (req, res) => {
  try {
    const userId = req.user.id;
    await prisma.note.deleteMany({
      where: { userId, isDeleted: true },
    });
    res.json({ message: 'Trash emptied successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /api/notes/:id ───────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;

    // Ensure note belongs to user
    const existing = await prisma.note.findFirst({
      where: { id: parseInt(req.params.id), userId },
    });
    if (!existing) return res.status(404).json({ error: 'Note not found' });

    if (!existing.isDeleted) {
      // Soft delete
      await prisma.note.update({
        where: { id: parseInt(req.params.id) },
        data: { isDeleted: true, isPinned: false },
      });
      res.json({ message: 'Note moved to trash' });
    } else {
      // Hard delete
      await prisma.note.delete({ where: { id: parseInt(req.params.id) } });
      res.json({ message: 'Note deleted permanently' });
    }
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Note not found' });
    res.status(500).json({ error: err.message });
  }
});

export default router;
