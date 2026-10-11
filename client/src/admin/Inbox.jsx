import { useCallback, useEffect, useState } from 'react';
import { Phone, RefreshCw } from 'lucide-react';
import { api } from '../lib/api.js';
import { telHref } from '../lib/site.js';
import { Section } from './fields.jsx';

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-200 text-gray-600',
};

const when = (iso) =>
  new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

const niceDate = (d) =>
  new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

function useList(path, key, token) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const load = useCallback(() => {
    setError('');
    api(path, { token })
      .then((data) => setItems(data[key]))
      .catch((err) => setError(err.message));
  }, [path, key, token]);
  useEffect(load, [load]);
  return { items, setItems, error, load };
}

function RefreshButton({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-2 text-sm font-semibold text-brand-orange hover:underline">
      <RefreshCw className="w-4 h-4" /> Refresh
    </button>
  );
}

export function Reservations({ token }) {
  const { items, setItems, error, load } = useList('/api/reservations', 'reservations', token);
  const [filter, setFilter] = useState('pending');

  async function setStatus(reference, status) {
    try {
      const { reservation } = await api(`/api/reservations/${encodeURIComponent(reference)}`, { method: 'PATCH', body: { status }, token });
      setItems((list) => list.map((r) => (r.reference === reference ? reservation : r)));
    } catch (err) {
      window.alert(err.message);
    }
  }

  const shown = items?.filter((r) => filter === 'all' || r.status === filter) ?? [];

  return (
    <Section title="Table & cabana requests" description="Call the guest, then mark the request confirmed or cancelled.">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {['pending', 'confirmed', 'cancelled', 'all'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold capitalize ${filter === f ? 'bg-brand-orange text-white' : 'bg-brand-brown/10 text-brand-dark'}`}
            >
              {f}
              {items && f !== 'all' && ` (${items.filter((r) => r.status === f).length})`}
            </button>
          ))}
        </div>
        <RefreshButton onClick={load} />
      </div>

      {error && <p className="text-sm font-semibold text-red-700">{error}</p>}
      {items && !shown.length && <p className="text-brand-brown/60">Nothing here yet.</p>}

      <div className="space-y-3">
        {shown.map((r) => (
          <div key={r.reference} className="rounded-xl border border-brand-brown/15 p-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-brand-dark">{r.name}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[r.status] ?? ''}`}>{r.status}</span>
                <span className="text-xs text-brand-brown/50">{r.reference} · received {when(r.createdAt)}</span>
              </div>
              <p className="text-sm text-brand-dark mt-1">
                <strong>{niceDate(r.date)}</strong> at <strong>{r.time}</strong> · {r.guests} · {r.type}
              </p>
              {r.notes && <p className="text-sm text-brand-brown/70 mt-1">“{r.notes}”</p>}
            </div>
            <div className="flex flex-wrap gap-2 shrink-0">
              <a href={telHref(r.phone)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-brand-brown/20 text-sm font-semibold hover:bg-brand-cream">
                <Phone className="w-4 h-4" /> {r.phone}
              </a>
              {r.status !== 'confirmed' && (
                <button type="button" onClick={() => setStatus(r.reference, 'confirmed')} className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700">
                  Confirm
                </button>
              )}
              {r.status !== 'cancelled' && (
                <button type="button" onClick={() => setStatus(r.reference, 'cancelled')} className="px-3 py-2 rounded-lg border border-brand-brown/20 text-sm font-semibold hover:bg-brand-cream">
                  Cancel
                </button>
              )}
              {r.status !== 'pending' && (
                <button type="button" onClick={() => setStatus(r.reference, 'pending')} className="px-3 py-2 rounded-lg text-sm font-semibold text-brand-brown/70 hover:underline">
                  Back to pending
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

export function ReviewInbox({ token }) {
  const { items, error, load } = useList('/api/reviews/submissions', 'submissions', token);
  return (
    <Section title="Reviews sent from the website" description="These are not published automatically.">
      <div className="flex justify-end">
        <RefreshButton onClick={load} />
      </div>
      {error && <p className="text-sm font-semibold text-red-700">{error}</p>}
      {items && !items.length && <p className="text-brand-brown/60">No reviews yet.</p>}
      <div className="space-y-3">
        {items?.map((r) => (
          <div key={r.id} className="rounded-xl border border-brand-brown/15 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-brand-gold" aria-label={`${r.rating} stars`}>{'★'.repeat(r.rating)}<span className="text-brand-brown/20">{'★'.repeat(5 - r.rating)}</span></span>
              <span className="font-bold">{r.name}</span>
              <span className="text-xs text-brand-brown/50">{when(r.createdAt)}</span>
            </div>
            <p className="text-brand-dark mt-2 whitespace-pre-line">{r.text}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
