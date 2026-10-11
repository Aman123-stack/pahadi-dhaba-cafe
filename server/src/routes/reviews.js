import { Router } from 'express';
import crypto from 'node:crypto';
import { append, readAll } from '../lib/store.js';
import { rateLimit, requireAdmin, isBot, clean } from '../lib/security.js';
import { summary, reviews } from '../data/reviews.js';
import { getSite } from './site.js';

const router = Router();
const limiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 3 });

router.get('/', async (req, res) => {
  // Headline rating and count are edited with the rest of the site details.
  const { rating, reviewCount } = await getSite();
  res.set('Cache-Control', 'no-cache');
  res.json({ ok: true, summary: { ...summary, rating, count: reviewCount }, reviews });
});

// New reviews are stored for staff to read; they are not published automatically.
router.post('/', limiter, async (req, res) => {
  if (isBot(req.body)) return res.status(201).json({ ok: true });

  const b = req.body ?? {};
  const review = {
    id: crypto.randomUUID(),
    name: clean(b.name),
    rating: Number(b.rating),
    text: clean(b.text),
    createdAt: new Date().toISOString(),
  };

  if (review.name.length < 2 || review.name.length > 60) {
    return res.status(400).json({ ok: false, error: 'Please enter your name.' });
  }
  if (!Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5) {
    return res.status(400).json({ ok: false, error: 'Please choose a rating from 1 to 5 stars.' });
  }
  if (review.text.length < 10 || review.text.length > 600) {
    return res.status(400).json({ ok: false, error: 'Please write between 10 and 600 characters.' });
  }

  await append('review-submissions', review);
  console.log(`[review] ${review.rating}★ from ${review.name}`);
  res.status(201).json({ ok: true });
});

router.get('/submissions', requireAdmin, async (req, res) => {
  const submissions = await readAll('review-submissions');
  res.json({ ok: true, count: submissions.length, submissions: submissions.reverse() });
});

export default router;
