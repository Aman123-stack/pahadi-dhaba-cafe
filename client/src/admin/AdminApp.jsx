import { useEffect, useState } from 'react';
import { CalendarCheck, ExternalLink, Flame, LogOut, MessageSquare, Save, Store, UtensilsCrossed } from 'lucide-react';
import { api } from '../lib/api.js';
import SiteEditor from './SiteEditor.jsx';
import MenuEditor from './MenuEditor.jsx';
import { Reservations, ReviewInbox } from './Inbox.jsx';
import { inputClass } from './fields.jsx';

const TOKEN_KEY = 'pahadi-admin';
const storage = {
  get: () => { try { return sessionStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; } },
  set: (v) => { try { sessionStorage.setItem(TOKEN_KEY, v); } catch { /* private mode: stay logged in for this tab only */ } },
  clear: () => { try { sessionStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ } },
};

const TABS = [
  { id: 'site', label: 'Website details', icon: Store },
  { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
  { id: 'bookings', label: 'Bookings', icon: CalendarCheck },
  { id: 'reviews', label: 'Reviews', icon: MessageSquare },
];

function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/api/admin/login', { method: 'POST', token: password });
      onLogin(password);
    } catch (err) {
      setError(
        err.status === 404
          ? 'Admin is switched off. Set ADMIN_TOKEN in server/.env and restart the server.'
          : err.status === 401
            ? 'That password is not correct.'
            : err.message,
      );
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark p-4">
      <form onSubmit={submit} className="w-full max-w-sm bg-brand-cream rounded-3xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <Flame className="w-12 h-12 text-brand-orange mx-auto fire-logo" />
          <h1 className="font-serif text-2xl font-bold text-brand-dark mt-3">Website Admin</h1>
          <p className="text-sm text-brand-brown/70">Edit your website, menu and bookings</p>
        </div>
        <label htmlFor="admin-password" className="block text-sm font-semibold text-brand-dark mb-1">Password</label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
        {error && <p className="text-sm font-semibold text-red-700 mt-3" role="alert">{error}</p>}
        <button
          type="submit"
          disabled={busy || !password}
          className="w-full mt-5 bg-brand-orange text-white py-3 rounded-xl font-bold hover:bg-brand-dark transition-colors disabled:opacity-60"
        >
          {busy ? 'Checking…' : 'Log in'}
        </button>
        <a href="/" className="block text-center text-sm text-brand-brown/70 mt-4 hover:text-brand-orange">← Back to website</a>
      </form>
    </div>
  );
}

// Loads one editable document, keeps a draft, and saves it back.
function useDraft(path, pick, token, onUnauthorized) {
  const [saved, setSaved] = useState(null);
  const [draft, setDraft] = useState(null);
  const [status, setStatus] = useState({ text: '', ok: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api(path, { token })
      .then((data) => {
        setSaved(pick(data));
        setDraft(pick(data));
      })
      .catch((err) => setStatus({ text: err.message, ok: false }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, token]);

  const dirty = draft != null && JSON.stringify(draft) !== JSON.stringify(saved);

  async function save() {
    setSaving(true);
    setStatus({ text: '', ok: true });
    try {
      const data = await api(path, { method: 'PUT', body: draft, token });
      setSaved(pick(data));
      setDraft(pick(data));
      setStatus({ text: 'Saved — the website now shows your changes.', ok: true });
    } catch (err) {
      if (err.status === 401) onUnauthorized();
      setStatus({ text: err.message, ok: false });
    } finally {
      setSaving(false);
    }
  }

  const edit = (next) => {
    setDraft(next);
    setStatus({ text: '', ok: true });
  };

  return { draft, setDraft: edit, dirty, save, saving, status, discard: () => edit(saved) };
}

function SaveBar({ dirty, saving, status, onSave, onDiscard }) {
  return (
    <div className="sticky bottom-0 z-20 -mx-4 sm:mx-0 mt-6">
      <div className="bg-white/95 backdrop-blur border-t sm:border sm:rounded-2xl border-brand-brown/15 shadow-lg px-4 py-3 flex flex-wrap items-center gap-3">
        <p className={`flex-1 min-w-[12rem] text-sm font-semibold ${status.text ? (status.ok ? 'text-green-700' : 'text-red-700') : 'text-brand-brown/70'}`} role="status">
          {status.text || (dirty ? 'You have unsaved changes.' : 'All changes saved.')}
        </p>
        {dirty && (
          <button type="button" onClick={onDiscard} className="px-4 py-2 rounded-lg text-sm font-semibold text-brand-brown/70 hover:bg-brand-cream">
            Discard
          </button>
        )}
        <button
          type="button"
          onClick={onSave}
          disabled={!dirty || saving}
          className="inline-flex items-center gap-2 bg-brand-orange text-white px-5 py-2.5 rounded-lg font-bold hover:bg-brand-dark transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  );
}

function Dashboard({ token, onLogout }) {
  const [tab, setTab] = useState('site');
  const site = useDraft('/api/site', (d) => d.site, token, onLogout);
  const menu = useDraft('/api/menu', (d) => ({ categories: d.categories, items: d.items }), token, onLogout);
  const anyDirty = site.dirty || menu.dirty;

  useEffect(() => {
    document.title = 'Website Admin';
    if (!anyDirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [anyDirty]);

  const active = tab === 'site' ? site : tab === 'menu' ? menu : null;

  return (
    <div className="min-h-screen bg-brand-cream">
      <header className="bg-brand-dark text-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-wrap items-center gap-3">
          <Flame className="w-8 h-8 text-brand-orange" />
          <div className="flex-1 min-w-0">
            <p className="font-serif text-xl font-bold truncate">{site.draft?.name ?? 'Website'} — Admin</p>
          </div>
          <a href="/" target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-gold hover:underline">
            View website <ExternalLink className="w-4 h-4" />
          </a>
          <button
            type="button"
            onClick={() => (!anyDirty || window.confirm('You have unsaved changes. Log out anyway?')) && onLogout()}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white"
          >
            <LogOut className="w-4 h-4" /> Log out
          </button>
        </div>
        <nav className="max-w-5xl mx-auto px-4 flex gap-1 overflow-x-auto" aria-label="Admin sections">
          {TABS.map(({ id, label, icon: Icon }) => {
            const dirty = (id === 'site' && site.dirty) || (id === 'menu' && menu.dirty);
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                aria-current={tab === id ? 'page' : undefined}
                className={`inline-flex items-center gap-2 px-4 py-3 rounded-t-xl text-sm font-semibold whitespace-nowrap transition-colors ${
                  tab === id ? 'bg-brand-cream text-brand-dark' : 'text-white/75 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
                {dirty && <span className="w-2 h-2 rounded-full bg-brand-gold" aria-label="unsaved" />}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {tab === 'site' && (site.draft ? <SiteEditor site={site.draft} onChange={site.setDraft} token={token} /> : <Loading status={site.status} />)}
        {tab === 'menu' && (menu.draft ? <MenuEditor menu={menu.draft} onChange={menu.setDraft} token={token} /> : <Loading status={menu.status} />)}
        {tab === 'bookings' && <Reservations token={token} />}
        {tab === 'reviews' && <ReviewInbox token={token} />}

        {active?.draft && (
          <SaveBar dirty={active.dirty} saving={active.saving} status={active.status} onSave={active.save} onDiscard={active.discard} />
        )}
      </main>
    </div>
  );
}

function Loading({ status }) {
  return <p className={`text-center py-16 ${status.ok ? 'text-brand-brown/60' : 'text-red-700 font-semibold'}`}>{status.text || 'Loading…'}</p>;
}

export default function AdminApp() {
  const [token, setToken] = useState(storage.get);

  if (!token) {
    return (
      <Login
        onLogin={(t) => {
          storage.set(t);
          setToken(t);
        }}
      />
    );
  }
  return (
    <Dashboard
      token={token}
      onLogout={() => {
        storage.clear();
        setToken('');
      }}
    />
  );
}
