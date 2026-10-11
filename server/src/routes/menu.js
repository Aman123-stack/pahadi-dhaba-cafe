import { Router } from 'express';
import { categories, items, menuSchema } from '../data/menu.js';
import { readDoc, writeDoc } from '../lib/store.js';
import { requireAdmin } from '../lib/security.js';
import { ValidationError, slugify } from '../lib/validate.js';

const router = Router();

export const getMenu = () => readDoc('menu', { categories, items });

router.get('/', async (req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.json({ ok: true, ...(await getMenu()) });
});

router.put('/', requireAdmin, async (req, res) => {
  let menu;
  try {
    menu = menuSchema(req.body, 'Menu');
  } catch (err) {
    if (err instanceof ValidationError) return res.status(400).json({ ok: false, error: err.message });
    throw err;
  }

  // Give every category / dish a unique id; "all" is always the first filter.
  const unique = (base, taken) => {
    let id = base;
    for (let n = 2; taken.has(id); n++) id = `${base}-${n}`;
    taken.add(id);
    return id;
  };
  const catIds = new Set();
  const renamed = new Map();
  const cats = menu.categories
    .filter((c) => c.id !== 'all')
    .map((c) => {
      // Categories added in the admin page arrive with a placeholder id; name them after their label.
      const placeholder = !c.id || /^new-category(-\d+)?$/.test(c.id);
      const id = unique(slugify(placeholder ? c.label : c.id), catIds);
      if (c.id) renamed.set(c.id, id);
      return { id, label: c.label };
    });
  const itemIds = new Set();
  const dishes = menu.items.map((item) => ({
    ...item,
    id: unique(slugify(item.id || item.name), itemIds),
    category: renamed.get(item.category) ?? slugify(item.category),
  }));
  const missing = dishes.find((d) => !catIds.has(d.category));
  if (missing) return res.status(400).json({ ok: false, error: `“${missing.name}” uses a category that doesn't exist.` });

  const saved = { categories: [{ id: 'all', label: 'All Dishes' }, ...cats], items: dishes };
  await writeDoc('menu', saved);
  res.json({ ok: true, ...saved });
});

export default router;
