import { useId, useRef, useState } from 'react';
import { ImageUp, Loader2 } from 'lucide-react';
import { api } from '../lib/api.js';

export const inputClass =
  'w-full px-3 py-2.5 rounded-lg border-2 border-brand-brown/15 focus:border-brand-orange outline-none transition-colors bg-white text-brand-dark';

export function Field({ label, hint, children, id }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-brand-dark mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-brand-brown/60 mt-1">{hint}</p>}
    </div>
  );
}

export function TextField({ label, hint, value, onChange, multiline, rows = 3, maxLength, type = 'text', placeholder }) {
  const id = useId();
  const props = {
    id,
    value: value ?? '',
    maxLength,
    placeholder,
    onChange: (e) => onChange(e.target.value),
    className: `${inputClass} ${multiline ? 'resize-y' : ''}`,
  };
  return (
    <Field label={label} hint={hint} id={id}>
      {multiline ? <textarea rows={rows} {...props} /> : <input type={type} step={type === 'number' ? 'any' : undefined} {...props} />}
    </Field>
  );
}

export function Section({ title, description, children }) {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-brand-brown/10 p-5 sm:p-6">
      <h2 className="font-serif text-xl font-bold text-brand-dark">{title}</h2>
      {description && <p className="text-sm text-brand-brown/70 mt-1">{description}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

const MAX_UPLOAD = 8 * 1024 * 1024;

// Photo picker: preview + upload from computer + (optional) paste a link.
export function ImageField({ label, hint, value, onChange, token, compact = false }) {
  const id = useId();
  const fileInput = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function upload(file) {
    setError('');
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return setError('Choose a JPG, PNG or WebP image.');
    if (file.size > MAX_UPLOAD) return setError('That image is over 8 MB. Please choose a smaller one.');
    setBusy(true);
    try {
      const { url } = await api('/api/admin/uploads', { method: 'POST', raw: file, token });
      onChange(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  }

  return (
    <Field label={label} hint={hint} id={id}>
      <div className={`flex gap-3 ${compact ? 'flex-col' : 'flex-col sm:flex-row'}`}>
        <div className={`${compact ? 'w-full h-32' : 'sm:w-48 h-32'} shrink-0 rounded-lg overflow-hidden bg-brand-cream border border-brand-brown/10`}>
          {value ? (
            <img src={value} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-brand-brown/50">No photo</div>
          )}
        </div>
        <div className="flex-1 space-y-2 min-w-0">
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-2 bg-brand-orange text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-brand-dark transition-colors disabled:opacity-60"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageUp className="w-4 h-4" />}
            {busy ? 'Uploading…' : 'Upload photo'}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => upload(e.target.files?.[0])}
          />
          <input
            id={id}
            type="text"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="…or paste an image link (https://…)"
            className={`${inputClass} text-sm`}
          />
          {error && <p className="text-xs font-semibold text-red-700">{error}</p>}
        </div>
      </div>
    </Field>
  );
}
