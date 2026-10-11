import { Router } from 'express';
import crypto from 'node:crypto';
import { append, readAll, updateWhere } from '../lib/store.js';
import { rateLimit, requireAdmin, isBot, clean } from '../lib/security.js';

export const TYPES = ['Outdoor Hill Cabana', 'Royal AC Dining Hall', 'Table'];
export const TIMES = ['12:00 PM', '01:00 PM', '02:00 PM', '07:00 PM', '07:30 PM', '08:00 PM', '09:00 PM'];
export const GUESTS = ['2 People', '3-4 People', '5-6 People', '7-10 People', '10+ People'];
const MAX_DAYS_AHEAD = 120;

const router = Router();
const limiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 5 });

const makeReference = () => `PDC-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

// The restaurant is in Bhubaneswar, so "today" means today in India.
const todayInIndia = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());

function addDays(isoDate, days) {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function validate(r) {
  if (!TYPES.includes(r.type)) return 'Please choose a valid seating option.';
  if (r.name.length < 2 || r.name.length > 80) return 'Please enter your name.';
  const digits = r.phone.replace(/\D/g, '');
  if (!/^[+\d\s()-]+$/.test(r.phone) || digits.length < 10 || digits.length > 15) {
    return 'Please enter a valid phone number.';
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(r.date) || Number.isNaN(Date.parse(`${r.date}T00:00:00Z`))) {
    return 'Please choose a valid date.';
  }
  const today = todayInIndia();
  if (r.date < today) return 'Please choose today or a future date.';
  if (r.date > addDays(today, MAX_DAYS_AHEAD)) return `We take reservations up to ${MAX_DAYS_AHEAD} days ahead.`;
  if (!TIMES.includes(r.time)) return 'Please choose a time.';
  if (!GUESTS.includes(r.guests)) return 'Please choose the number of guests.';
  if (r.notes.length > 500) return 'Special requests must be 500 characters or fewer.';
  return null;
}

router.post('/', limiter, async (req, res) => {
  // Pretend success so bots don't learn to adapt; nothing is saved.
  if (isBot(req.body)) return res.status(201).json({ ok: true, reference: makeReference() });

  const b = req.body ?? {};
  const r = {
    type: clean(b.type),
    name: clean(b.name),
    phone: clean(b.phone),
    date: clean(b.date),
    time: clean(b.time),
    guests: clean(b.guests),
    notes: clean(b.notes),
  };

  const error = validate(r);
  if (error) return res.status(400).json({ ok: false, error });

  const reservation = {
    reference: makeReference(),
    ...r,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  await append('reservations', reservation);
  console.log(`[reservation] ${reservation.reference} ${r.type} | ${r.date} ${r.time} | ${r.guests} | ${r.name} ${r.phone}`);

  res.status(201).json({ ok: true, reference: reservation.reference });
});

// Staff view of all requests:  curl -H "x-admin-token: $ADMIN_TOKEN" http://localhost:5050/api/reservations
router.get('/', requireAdmin, async (req, res) => {
  const reservations = await readAll('reservations');
  res.json({ ok: true, count: reservations.length, reservations: reservations.reverse() });
});

// Staff mark a request confirmed / cancelled after calling the guest.
const STATUSES = ['pending', 'confirmed', 'cancelled'];
router.patch('/:reference', requireAdmin, async (req, res) => {
  const status = clean(req.body?.status);
  if (!STATUSES.includes(status)) return res.status(400).json({ ok: false, error: 'Unknown status.' });
  const updated = await updateWhere('reservations', (r) => r.reference === req.params.reference, {
    status,
    updatedAt: new Date().toISOString(),
  });
  if (!updated) return res.status(404).json({ ok: false, error: 'Reservation not found.' });
  res.json({ ok: true, reservation: updated });
});

export default router;
