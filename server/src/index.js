import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import siteRouter from './routes/site.js';
import menuRouter from './routes/menu.js';
import reviewsRouter from './routes/reviews.js';
import reservationsRouter from './routes/reservations.js';
import adminRouter, { UPLOAD_DIR } from './routes/admin.js';
import { DATA_DIR } from './lib/store.js';
import { adminToken, MIN_ADMIN_TOKEN } from './lib/security.js';

const PORT = Number(process.env.PORT) || 5050;
const CLIENT_DIST = fileURLToPath(new URL('../../client/dist', import.meta.url));

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', process.env.TRUST_PROXY === '1' ? 1 : false);

app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'SAMEORIGIN',
  });
  if (req.secure) res.set('Strict-Transport-Security', 'max-age=31536000');
  next();
});
app.use(express.json({ limit: '200kb' }));

// ---- API ----
app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));
app.use('/api/site', siteRouter);
app.use('/api/admin', adminRouter);
app.use('/api/menu', menuRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api', (req, res) => res.status(404).json({ ok: false, error: 'Not found.' }));

// Photos uploaded from the admin page (file names are random and never reused).
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '365d', immutable: true, fallthrough: false }));

// ---- Built React site (production) ----
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST, { maxAge: '7d', index: false }));
  // index.html is never cached, so visitors always get the latest build.
  app.use((req, res, next) => {
    if (req.method !== 'GET') return next();
    res.set('Cache-Control', 'no-cache');
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
}

// ---- Errors ----
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ ok: false, error: 'Invalid request body.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ ok: false, error: 'Request is too large.' });
  }
  const status = err.status ?? err.statusCode;
  if (status >= 400 && status < 500) {
    return res.status(status).json({ ok: false, error: status === 404 ? 'Not found.' : 'Bad request.' });
  }
  console.error(err);
  res.status(500).json({ ok: false, error: 'Something went wrong on our side.' });
});

app.listen(PORT, () => {
  console.log(`Pahadi API listening on http://localhost:${PORT}`);
  if (fs.existsSync(CLIENT_DIST)) console.log('Serving built React site from client/dist');
  console.log(`Saving content, bookings and uploads in ${DATA_DIR}`);
  const raw = process.env.ADMIN_TOKEN ?? '';
  if (!raw) console.warn('Admin page is OFF: set ADMIN_TOKEN to turn it on.');
  else if (!adminToken()) console.warn(`Admin page is OFF: ADMIN_TOKEN must be at least ${MIN_ADMIN_TOKEN} characters on a live server.`);
});
