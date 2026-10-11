import express, { Router } from 'express';
import crypto from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { DATA_DIR } from '../lib/store.js';
import { rateLimit, requireAdmin } from '../lib/security.js';

export const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');

const router = Router();

// The password check itself is requireAdmin; this just gives the login form a clear answer
// and slows down guessing.
router.post('/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }), requireAdmin, (req, res) => {
  res.json({ ok: true });
});

// Identify images by their first bytes rather than trusting the browser's content type.
function detectImage(buf) {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpg';
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (buf.length > 12 && buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  return null;
}

router.post(
  '/uploads',
  requireAdmin,
  express.raw({ type: () => true, limit: '8mb' }),
  async (req, res) => {
    const body = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
    const ext = detectImage(body);
    if (!ext) return res.status(400).json({ ok: false, error: 'Please upload a JPG, PNG or WebP image.' });

    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const name = `${Date.now().toString(36)}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
    await fs.writeFile(path.join(UPLOAD_DIR, name), body);
    res.status(201).json({ ok: true, url: `/uploads/${name}` });
  },
);

export default router;
