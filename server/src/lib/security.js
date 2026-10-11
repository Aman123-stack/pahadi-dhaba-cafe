import crypto from 'node:crypto';

// In-memory fixed-window limiter, keyed by client IP. Good enough for a single server.
export function rateLimit({ windowMs, max }) {
  const hits = new Map();
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits) if (entry.reset < now) hits.delete(key);
  }, windowMs).unref();

  return (req, res, next) => {
    const now = Date.now();
    let entry = hits.get(req.ip);
    if (!entry || entry.reset < now) {
      entry = { count: 0, reset: now + windowMs };
      hits.set(req.ip, entry);
    }
    if (++entry.count > max) {
      res.set('Retry-After', String(Math.ceil((entry.reset - now) / 1000)));
      return res.status(429).json({ ok: false, error: 'Too many requests. Please try again in a few minutes.' });
    }
    next();
  };
}

// Staff-only endpoints. Disabled unless ADMIN_TOKEN is set — and, on a live server, at least 12 characters.
export const MIN_ADMIN_TOKEN = 12;
export function adminToken() {
  const token = process.env.ADMIN_TOKEN ?? '';
  if (!token) return '';
  if (process.env.NODE_ENV === 'production' && token.length < MIN_ADMIN_TOKEN) return '';
  return token;
}

// Wrong passwords per IP: after 20 in 15 minutes, that IP is locked out of admin until the window ends.
const FAIL_WINDOW = 15 * 60 * 1000;
const MAX_FAILS = 20;
const failures = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of failures) if (entry.reset < now) failures.delete(ip);
}, FAIL_WINDOW).unref();

export function requireAdmin(req, res, next) {
  const expected = adminToken();
  if (!expected) return res.status(404).json({ ok: false, error: 'Not found.' });

  const now = Date.now();
  const entry = failures.get(req.ip);
  if (entry && entry.reset > now && entry.count >= MAX_FAILS) {
    return res.status(429).json({ ok: false, error: 'Too many wrong passwords. Try again in 15 minutes.' });
  }

  const given = req.get('x-admin-token') ?? req.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  const a = crypto.createHash('sha256').update(given).digest();
  const b = crypto.createHash('sha256').update(expected).digest();
  if (!crypto.timingSafeEqual(a, b)) {
    if (!entry || entry.reset < now) failures.set(req.ip, { count: 1, reset: now + FAIL_WINDOW });
    else entry.count += 1;
    return res.status(401).json({ ok: false, error: 'Unauthorized.' });
  }
  next();
}

// Hidden "website" field: real people leave it empty, bots tend to fill it in.
export const isBot = (body) => typeof body?.website === 'string' && body.website.trim() !== '';

export const clean = (value) => (typeof value === 'string' ? value.trim() : '');
