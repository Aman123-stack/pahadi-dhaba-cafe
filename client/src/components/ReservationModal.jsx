import { useState } from 'react';
import { CalendarDays, Check } from 'lucide-react';
import Modal from './Modal.jsx';
import { api } from '../lib/api.js';
import { GUEST_OPTIONS, TIME_OPTIONS, telHref, todayISO, useSite } from '../lib/site.js';

const inputClass =
  'w-full px-4 py-3 rounded-xl border-2 border-brand-brown/20 focus:border-brand-orange outline-none transition-all duration-300 bg-white';

function Field({ label, htmlFor, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-bold mb-2 text-brand-dark">{label}</label>
      {children}
    </div>
  );
}

function Success({ booking, onClose }) {
  const site = useSite();
  const niceDate = new Date(`${booking.date}T00:00:00`).toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  return (
    <div className="text-center">
      <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check className="w-10 h-10 text-white" strokeWidth={3} />
      </div>
      <h3 className="text-3xl font-serif font-bold text-brand-dark mb-3">Request Received!</h3>
      <p className="text-brand-brown/70 mb-5 leading-relaxed">
        Thank you, <strong>{booking.name}</strong>. We have received your {booking.type.toLowerCase()} request at {site.name}.
      </p>
      <div className="bg-brand-cream rounded-2xl p-5 mb-5 text-left space-y-2">
        <div>
          <span className="text-sm text-brand-brown/60">Reference</span>
          <div className="font-bold text-xl tracking-wider text-brand-orange">{booking.reference}</div>
        </div>
        <div className="font-semibold">📅 {niceDate}</div>
        <div className="font-semibold">🕒 {booking.time}</div>
        <div className="font-semibold">👥 {booking.guests}</div>
      </div>
      <div className="bg-brand-orange/10 rounded-2xl p-4 mb-6">
        <p className="text-sm text-brand-dark">
          <strong>Your table is not confirmed yet.</strong>
          <br />
          Our team will call or WhatsApp you on {booking.phone} to confirm. Please keep your reference handy.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <a href={telHref(site.phone)} className="flex-1 bg-brand-orange text-white px-6 py-4 rounded-xl font-bold hover:bg-brand-dark transition-all">
          Call Now
        </a>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 border-2 border-brand-orange text-brand-orange px-6 py-4 rounded-xl font-bold hover:bg-brand-orange hover:text-white transition-all"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default function ReservationModal({ type, prefill = {}, onClose }) {
  const site = useSite();
  const today = todayISO();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    date: prefill.date ?? '',
    time: prefill.time ?? '',
    guests: prefill.guests ?? '',
    notes: '',
    website: '', // honeypot
  });
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [booking, setBooking] = useState(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const payload = { ...form, type, name: form.name.trim(), phone: form.phone.trim(), notes: form.notes.trim() };

    if (payload.phone.replace(/\D/g, '').length < 10) return setError('Please enter a valid phone number.');
    if (!payload.date || payload.date < today) return setError('Please choose today or a future date.');

    setSending(true);
    try {
      const { reference } = await api('/api/reservations', { body: payload });
      setBooking({ ...payload, reference });
    } catch (err) {
      setError(err.message);
      setSending(false);
    }
  }

  return (
    <Modal onClose={onClose} label={`Reserve your ${type}`} maxWidth={booking ? 'max-w-lg' : 'max-w-2xl'}>
      {booking ? (
        <Success booking={booking} onClose={onClose} />
      ) : (
        <>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CalendarDays className="w-8 h-8 text-brand-orange" />
            </div>
            <h3 className="text-3xl font-serif font-bold text-brand-dark mb-2">Reserve Your {type}</h3>
            <p className="text-brand-brown/70">Send your request and our team will confirm it with you</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Field label="Full Name *" htmlFor="res-name">
                <input id="res-name" type="text" required maxLength={80} autoComplete="name" value={form.name}
                  onChange={set('name')} className={inputClass} placeholder="Enter your name" />
              </Field>
              <Field label="Phone Number *" htmlFor="res-phone">
                <input id="res-phone" type="tel" required maxLength={20} autoComplete="tel" inputMode="tel" value={form.phone}
                  onChange={set('phone')} className={inputClass} placeholder="+91 XXXXX XXXXX" />
              </Field>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Field label="Date *" htmlFor="res-date">
                <input id="res-date" type="date" required min={today} value={form.date} onChange={set('date')} className={inputClass} />
              </Field>
              <Field label="Time *" htmlFor="res-time">
                <select id="res-time" required value={form.time} onChange={set('time')} className={inputClass}>
                  <option value="">Select time</option>
                  {TIME_OPTIONS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Guests *" htmlFor="res-guests">
                <select id="res-guests" required value={form.guests} onChange={set('guests')} className={inputClass}>
                  <option value="">Select guests</option>
                  {GUEST_OPTIONS.map((g) => <option key={g}>{g}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Special Requests (Optional)" htmlFor="res-notes">
              <textarea id="res-notes" rows={3} maxLength={500} value={form.notes} onChange={set('notes')}
                className={`${inputClass} resize-none`}
                placeholder="Any dietary restrictions, occasion, or special requirements..." />
            </Field>

            <div style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }} aria-hidden="true">
              <label>
                Leave this field empty
                <input type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
              </label>
            </div>

            {error && (
              <p role="alert" className="text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {error} You can also call us on{' '}
                <a className="underline" href={telHref(site.phone)}>{site.phone}</a>.
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                type="submit"
                disabled={sending}
                className="flex-1 bg-brand-orange text-white px-8 py-4 rounded-xl font-bold hover:bg-brand-dark transition-all duration-300 hover:shadow-xl hover:-translate-y-1 disabled:opacity-70 disabled:pointer-events-none"
              >
                {sending ? 'Sending…' : 'Send Reservation Request'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border-2 border-brand-orange text-brand-orange px-8 py-4 rounded-xl font-bold hover:bg-brand-orange hover:text-white transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </>
      )}
    </Modal>
  );
}
