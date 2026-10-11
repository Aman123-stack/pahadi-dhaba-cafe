import { useState } from 'react';
import { Check, MessageSquareHeart } from 'lucide-react';
import Modal from './Modal.jsx';
import { api } from '../lib/api.js';

const inputClass =
  'w-full px-4 py-3 rounded-xl border-2 border-brand-brown/20 focus:border-brand-orange outline-none transition-all duration-300 bg-white';

const RATING_WORDS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

export default function ReviewModal({ onClose }) {
  const [form, setForm] = useState({ name: '', rating: 0, text: '', website: '' });
  const [hover, setHover] = useState(0);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.rating) return setError('Please choose a star rating.');
    if (form.text.trim().length < 10) return setError('Please write at least a sentence about your visit.');
    setSending(true);
    try {
      await api('/api/reviews', { body: form });
      setDone(true);
    } catch (err) {
      setError(err.message);
      setSending(false);
    }
  }

  if (done) {
    return (
      <Modal onClose={onClose} label="Thank you" maxWidth="max-w-lg">
        <div className="text-center">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-10 h-10 text-white" strokeWidth={3} />
          </div>
          <h3 className="text-3xl font-serif font-bold text-brand-dark mb-3">Thank You!</h3>
          <p className="text-brand-brown/70 mb-6 leading-relaxed">
            We've received your feedback. Our team reads every review, and selected ones are featured on this page.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-brand-orange text-white px-6 py-4 rounded-xl font-bold hover:bg-brand-dark transition-all"
          >
            Close
          </button>
        </div>
      </Modal>
    );
  }

  const shown = hover || form.rating;

  return (
    <Modal onClose={onClose} label="Share your experience" maxWidth="max-w-xl">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquareHeart className="w-8 h-8 text-brand-orange" />
        </div>
        <h3 className="text-3xl font-serif font-bold text-brand-dark mb-2">Share Your Experience</h3>
        <p className="text-brand-brown/70">No sign-up needed</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <fieldset>
          <legend className="block text-sm font-bold mb-2 text-brand-dark">Your Rating *</legend>
          <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`${n} star${n > 1 ? 's' : ''}`}
                aria-pressed={form.rating === n}
                onMouseEnter={() => setHover(n)}
                onClick={() => setForm((f) => ({ ...f, rating: n }))}
                className={`text-4xl leading-none p-1 transition-transform hover:scale-125 ${n <= shown ? 'text-brand-gold' : 'text-brand-brown/20'}`}
              >
                ★
              </button>
            ))}
            <span className="ml-3 text-sm font-semibold text-brand-brown/70">{RATING_WORDS[shown]}</span>
          </div>
        </fieldset>

        <div>
          <label htmlFor="rev-name" className="block text-sm font-bold mb-2 text-brand-dark">Your Name *</label>
          <input id="rev-name" type="text" required minLength={2} maxLength={60} autoComplete="name"
            value={form.name} onChange={set('name')} className={inputClass} placeholder="Enter your name" />
        </div>

        <div>
          <label htmlFor="rev-text" className="block text-sm font-bold mb-2 text-brand-dark">Your Review *</label>
          <textarea id="rev-text" rows={4} required maxLength={600} value={form.text} onChange={set('text')}
            className={`${inputClass} resize-none`} placeholder="What did you order? How was the ambience and service?" />
          <p className="text-xs text-brand-brown/50 text-right mt-1">{form.text.length}/600</p>
        </div>

        <div style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }} aria-hidden="true">
          <label>
            Leave this field empty
            <input type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
          </label>
        </div>

        {error && (
          <p role="alert" className="text-sm font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            type="submit"
            disabled={sending}
            className="flex-1 bg-brand-orange text-white px-8 py-4 rounded-xl font-bold hover:bg-brand-dark transition-all duration-300 disabled:opacity-70 disabled:pointer-events-none"
          >
            {sending ? 'Sending…' : 'Submit Review'}
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
    </Modal>
  );
}
