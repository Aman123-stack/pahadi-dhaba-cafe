// Small schema helpers for content edited in the admin page.
// Each field validator gets (value, label) and returns the cleaned value or throws a ValidationError.

export class ValidationError extends Error {}

const fail = (label, message) => {
  throw new ValidationError(`${label}: ${message}`);
};

export const text = (max, { required = false } = {}) => (value, label) => {
  if (value == null) value = '';
  if (typeof value !== 'string') fail(label, 'must be text.');
  const v = value.trim();
  if (required && !v) fail(label, 'is required.');
  if (v.length > max) fail(label, `must be ${max} characters or fewer.`);
  return v;
};

// Links and image addresses: empty, a site path (/images/x.jpg), or http(s)://
export const url = ({ required = false } = {}) => (value, label) => {
  const v = text(1000, { required })(value, label);
  if (v && !/^(\/(?!\/)|https?:\/\/)/i.test(v)) fail(label, 'must start with https:// or /');
  return v;
};

export const number = (min, max, { integer = false } = {}) => (value, label) => {
  const n = typeof value === 'string' && value.trim() !== '' ? Number(value) : value;
  if (typeof n !== 'number' || !Number.isFinite(n)) fail(label, 'must be a number.');
  if (integer && !Number.isInteger(n)) fail(label, 'must be a whole number.');
  if (n < min || n > max) fail(label, `must be between ${min} and ${max}.`);
  return n;
};

export const bool = () => (value) => value === true;

export const oneOf = (options) => (value, label) => {
  if (!options.includes(value)) fail(label, `must be one of ${options.join(', ')}.`);
  return value;
};

// Fixed-shape object: unknown keys are dropped.
export const shape = (fields) => (value, label) => {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) fail(label, 'is missing.');
  const out = {};
  for (const [key, check] of Object.entries(fields)) out[key] = check(value[key], label ? `${label} › ${key}` : key);
  return out;
};

export const list = (item, { max, min = 0 }) => (value, label) => {
  if (!Array.isArray(value)) fail(label, 'must be a list.');
  if (value.length < min) fail(label, `needs at least ${min}.`);
  if (value.length > max) fail(label, `can have at most ${max}.`);
  return value.map((entry, i) => item(entry, `${label} #${i + 1}`));
};

export const optional = (check) => (value, label) => (value == null ? null : check(value, label));

export const slugify = (s) =>
  String(s)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .slice(0, 60) || 'item';
