// fetch wrapper: returns the JSON body, or throws an Error with a message safe to show visitors.
export async function api(path, { body, method = body ? 'POST' : 'GET', token, raw } = {}) {
  const headers = {};
  if (token) headers['x-admin-token'] = token;
  if (body && !raw) headers['Content-Type'] = 'application/json';
  if (raw) headers['Content-Type'] = raw.type || 'application/octet-stream';

  let res;
  try {
    res = await fetch(path, {
      method,
      headers,
      body: raw ?? (body ? JSON.stringify(body) : undefined),
    });
  } catch {
    throw new Error('We could not reach the server.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) {
    const err = new Error(data.error || 'Something went wrong. Please try again.');
    err.status = res.status;
    throw err;
  }
  return data;
}
