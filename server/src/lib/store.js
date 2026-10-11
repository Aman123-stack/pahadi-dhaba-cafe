import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Tiny JSON-file store. Each file is written atomically (write .tmp, then rename) and
// writes to the same file are serialised, so a crash can't leave half a file.
export const DATA_DIR = path.resolve(process.env.DATA_DIR || fileURLToPath(new URL('../../storage', import.meta.url)));
const queues = new Map();

const fileFor = (name) => path.join(DATA_DIR, `${name}.json`);

async function readJson(name, fallback) {
  try {
    return JSON.parse(await fs.readFile(fileFor(name), 'utf8'));
  } catch (err) {
    if (err.code === 'ENOENT') return fallback;
    throw err;
  }
}

async function writeJson(name, data) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const tmp = `${fileFor(name)}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2));
  await fs.rename(tmp, fileFor(name));
}

function serialise(name, task) {
  const next = (queues.get(name) ?? Promise.resolve()).catch(() => {}).then(task);
  queues.set(name, next);
  return next;
}

// ---- Collections (arrays of records) ----

export const readAll = (name) => readJson(name, []);

export function append(name, record) {
  return serialise(name, async () => {
    const list = await readAll(name);
    list.push(record);
    await writeJson(name, list);
  });
}

// Applies `change` to the first record matching `match`; resolves to the updated record or null.
export function updateWhere(name, match, change) {
  return serialise(name, async () => {
    const list = await readAll(name);
    const index = list.findIndex(match);
    if (index === -1) return null;
    list[index] = { ...list[index], ...change };
    await writeJson(name, list);
    return list[index];
  });
}

// ---- Documents (one object per file, e.g. site content) ----

export const readDoc = (name, fallback) => readJson(name, fallback);
export const writeDoc = (name, data) => serialise(name, () => writeJson(name, data));
