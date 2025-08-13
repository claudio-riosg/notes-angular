import http from 'node:http';
import { randomUUID } from 'node:crypto';
import { URL } from 'node:url';

const PORT = process.env.MOCK_PORT ? Number(process.env.MOCK_PORT) : 4300;
const API_PREFIX = '/api/notes';

/** In-memory dataset (seed) */
/** @type {Array<any>} */
let notes = [
  {
    id: '1',
    title: 'Welcome to Notes App',
    content:
      'This is your first note! You can create, edit, and organize your notes using this application. Try adding some tags and changing colors.',
    createdAt: new Date('2025-01-01T10:00:00Z').toISOString(),
    updatedAt: new Date('2025-01-01T10:00:00Z').toISOString(),
    tags: ['welcome', 'tutorial'],
    color: 'yellow',
    isPinned: true,
  },
  {
    id: '2',
    title: 'Angular 20 Signals',
    content:
      'Angular 20 introduces signal-based reactivity as a stable feature. Signals provide fine-grained reactivity and better performance.',
    createdAt: new Date('2025-01-02T09:30:00Z').toISOString(),
    updatedAt: new Date('2025-01-02T09:30:00Z').toISOString(),
    tags: ['angular', 'signals', 'development'],
    color: 'blue',
    isPinned: false,
  },
  {
    id: '3',
    title: 'Shopping List',
    content: 'Milk\nBread\nEggs\nApples\nOrange juice\nPasta',
    createdAt: new Date('2025-01-03T15:20:00Z').toISOString(),
    updatedAt: new Date('2025-01-03T15:20:00Z').toISOString(),
    tags: ['shopping', 'groceries'],
    color: 'green',
    isPinned: false,
  },
];

/** Helpers */
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * @param {http.ServerResponse} res
 * @param {number} status
 * @param {any} data
 */
function sendJson(res, status, data) {
  const payload = data === undefined ? '' : JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
  });
  res.end(payload);
}

/** @param {http.IncomingMessage} req */
async function readBody(req) {
  return await new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      if (!data) return resolve(undefined);
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    if (!url.pathname.startsWith(API_PREFIX)) {
      return sendJson(res, 404, { message: 'Not Found' });
    }

    // Basic latency simulation
    await delay(300);

    const idMatch = url.pathname.match(/^\/api\/notes\/(.+)$/);

    if (req.method === 'GET' && url.pathname === API_PREFIX) {
      // Basic query filters: search, tags (csv), color, pinned
      const search = (url.searchParams.get('search') || '').toLowerCase().trim();
      const tagsCsv = url.searchParams.get('tags');
      const color = url.searchParams.get('color');
      const pinned = url.searchParams.get('pinned') === 'true';

      let result = notes.slice();
      if (search) {
        result = result.filter((n) =>
          n.title.toLowerCase().includes(search) ||
          n.content.toLowerCase().includes(search) ||
          (Array.isArray(n.tags) && n.tags.some((t) => t.toLowerCase().includes(search)))
        );
      }
      if (tagsCsv) {
        const tags = new Set(tagsCsv.split(',').map((t) => t.trim()).filter(Boolean));
        result = result.filter((n) => Array.isArray(n.tags) && n.tags.some((t) => tags.has(t)));
      }
      if (color) {
        result = result.filter((n) => n.color === color);
      }
      if (pinned) {
        result = result.filter((n) => n.isPinned === true);
      }

      // Sort: pinned first, then updatedAt desc
      result.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });

      return sendJson(res, 200, result);
    }

    if (req.method === 'POST' && url.pathname === API_PREFIX) {
      const body = (await readBody(req)) || {};
      const now = new Date().toISOString();
      const newNote = {
        id: randomUUID(),
        title: body.title ?? '',
        content: body.content ?? '',
        tags: Array.isArray(body.tags) ? body.tags : [],
        color: body.color ?? 'yellow',
        isPinned: Boolean(body.isPinned),
        createdAt: now,
        updatedAt: now,
      };
      notes = [newNote, ...notes];
      return sendJson(res, 201, newNote);
    }

    if (idMatch) {
      const id = idMatch[1];
      const idx = notes.findIndex((n) => n.id === id);
      if (idx === -1) return sendJson(res, 404, { message: 'Note not found' });

      if (req.method === 'PATCH') {
        const body = (await readBody(req)) || {};
        const updated = {
          ...notes[idx],
          ...(['title', 'content', 'tags', 'color', 'isPinned'].reduce((acc, k) => {
            if (body[k] !== undefined) acc[k] = body[k];
            return acc;
          }, {})),
          updatedAt: new Date().toISOString(),
        };
        notes[idx] = updated;
        return sendJson(res, 200, updated);
      }

      if (req.method === 'DELETE') {
        notes.splice(idx, 1);
        res.statusCode = 204;
        return res.end();
      }
    }

    return sendJson(res, 405, { message: 'Method Not Allowed' });
  } catch (error) {
    return sendJson(res, 500, { message: 'Internal Server Error' });
  }
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Mock Notes API running on http://localhost:${PORT}`);
});


