/**
 * Export utilities for notes
 */

function sanitizeFilename(title) {
  return title.replace(/[^a-z0-9_-]/gi, '_').toLowerCase().slice(0, 60);
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Export as JSON ────────────────────────────────────────────────────────────
export function exportAsJSON(note) {
  const data = JSON.stringify({
    id:        note.id,
    title:     note.title,
    content:   note.content,
    tags:      note.tags,
    isPinned:  note.isPinned,
    createdAt: note.createdAt,
    updatedAt: note.updatedAt,
  }, null, 2);
  downloadBlob(data, `${sanitizeFilename(note.title)}.json`, 'application/json');
}

// ─── Export as Markdown ────────────────────────────────────────────────────────
export function exportAsMarkdown(note) {
  const tags = note.tags
    ? note.tags.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  const frontmatter = [
    '---',
    `title: "${note.title}"`,
    `tags: [${tags.map(t => `"${t}"`).join(', ')}]`,
    `pinned: ${note.isPinned}`,
    `created: ${note.createdAt}`,
    `updated: ${note.updatedAt}`,
    '---',
    '',
  ].join('\n');

  downloadBlob(
    frontmatter + (note.content || ''),
    `${sanitizeFilename(note.title)}.md`,
    'text/markdown'
  );
}

// ─── Export as PDF (via print dialog) ─────────────────────────────────────────
export function exportAsPDF(note) {
  const tags = note.tags
    ? note.tags.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>${note.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; color: #1e293b; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.7; }
    h1 { font-size: 2rem; font-weight: 700; margin-bottom: 8px; color: #0f172a; }
    .meta { font-size: 0.8rem; color: #64748b; margin-bottom: 16px; }
    .tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 24px; }
    .tag { background: #ede9fe; color: #6d28d9; padding: 3px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; }
    hr { border: none; border-top: 1px solid #e2e8f0; margin: 24px 0; }
    pre { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; overflow-x: auto; font-family: 'JetBrains Mono', monospace; font-size: 0.85rem; margin: 1em 0; }
    code { font-family: 'JetBrains Mono', monospace; background: #f1f5f9; padding: 2px 5px; border-radius: 3px; font-size: 0.85em; }
    h2, h3 { margin: 1.4em 0 0.6em; color: #1e293b; }
    p { margin-bottom: 1em; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>${note.title}</h1>
  <div class="meta">Updated: ${new Date(note.updatedAt).toLocaleString()}</div>
  ${tags.length ? `<div class="tags">${tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>` : ''}
  <hr/>
  <div id="content"></div>
  <script>
    // Render markdown as plain formatted text for print
    const raw = ${JSON.stringify(note.content || '')};
    document.getElementById('content').innerText = raw;
    window.onload = () => window.print();
  </script>
</body>
</html>`;

  const printWin = window.open('', '_blank', 'width=900,height=700');
  if (printWin) {
    printWin.document.write(html);
    printWin.document.close();
  }
}
