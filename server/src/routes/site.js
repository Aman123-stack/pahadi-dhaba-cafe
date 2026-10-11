import { Router } from 'express';
import { defaultSite, siteSchema, withDefaults } from '../data/site.js';
import { readDoc, writeDoc } from '../lib/store.js';
import { requireAdmin } from '../lib/security.js';
import { ValidationError } from '../lib/validate.js';

const router = Router();

export const getSite = async () => withDefaults(await readDoc('site', null));

router.get('/', async (req, res) => {
  res.set('Cache-Control', 'no-cache');
  res.json({ ok: true, site: await getSite() });
});

router.put('/', requireAdmin, async (req, res) => {
  let site;
  try {
    site = siteSchema(req.body, '');
  } catch (err) {
    if (err instanceof ValidationError) return res.status(400).json({ ok: false, error: err.message });
    throw err;
  }
  await writeDoc('site', site);
  res.json({ ok: true, site });
});

// Put everything back to the built-in defaults.
router.delete('/', requireAdmin, async (req, res) => {
  await writeDoc('site', defaultSite);
  res.json({ ok: true, site: defaultSite });
});

export default router;
