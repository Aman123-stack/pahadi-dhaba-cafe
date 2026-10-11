import { useId } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { Field, ImageField, Section, TextField, inputClass } from './fields.jsx';

const TONES = [
  { value: 'orange', label: 'Orange' },
  { value: 'gold', label: 'Gold' },
  { value: 'blue', label: 'Blue' },
  { value: 'green', label: 'Green' },
];

function Select({ label, value, onChange, children }) {
  const id = useId();
  return (
    <Field label={label} id={id}>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
        {children}
      </select>
    </Field>
  );
}

function move(list, from, to) {
  if (to < 0 || to >= list.length) return list;
  const copy = [...list];
  const [item] = copy.splice(from, 1);
  copy.splice(to, 0, item);
  return copy;
}

export default function MenuEditor({ menu, onChange, token }) {
  const categories = menu.categories.filter((c) => c.id !== 'all');
  const setCategories = (cats) => onChange({ ...menu, categories: [menu.categories[0], ...cats] });
  const setItems = (items) => onChange({ ...menu, items });
  const updateItem = (i, patch) => setItems(menu.items.map((item, j) => (j === i ? { ...item, ...patch } : item)));

  function addCategory() {
    const taken = new Set(menu.categories.map((c) => c.id));
    let id = 'new-category';
    for (let n = 2; taken.has(id); n++) id = `new-category-${n}`;
    setCategories([...categories, { id, label: 'New category' }]);
  }

  function addDish() {
    setItems([
      ...menu.items,
      {
        id: '',
        name: 'New dish',
        category: categories[0]?.id ?? '',
        description: '',
        image: '',
        prepTime: '',
        serving: '',
        badge: null,
        spicy: false,
      },
    ]);
  }

  return (
    <div className="space-y-6">
      <Section title="Categories" description="The filter buttons above the dishes. “All Dishes” is always shown first.">
        <div className="space-y-3">
          {categories.map((cat, i) => {
            const used = menu.items.filter((item) => item.category === cat.id).length;
            return (
              <div key={cat.id} className="flex items-end gap-2">
                <div className="flex-1">
                  <TextField
                    label={`Category ${i + 1}${used ? ` · ${used} dish${used > 1 ? 'es' : ''}` : ''}`}
                    maxLength={40}
                    value={cat.label}
                    onChange={(label) => setCategories(categories.map((c, j) => (j === i ? { ...c, label } : c)))}
                  />
                </div>
                <button type="button" aria-label="Move up" onClick={() => setCategories(move(categories, i, i - 1))} className="p-2.5 rounded-lg border border-brand-brown/15 hover:bg-brand-cream">
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button type="button" aria-label="Move down" onClick={() => setCategories(move(categories, i, i + 1))} className="p-2.5 rounded-lg border border-brand-brown/15 hover:bg-brand-cream">
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  aria-label="Delete category"
                  title={used ? 'Move or delete its dishes first' : 'Delete category'}
                  disabled={used > 0 || categories.length === 1}
                  onClick={() => setCategories(categories.filter((_, j) => j !== i))}
                  className="p-2.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-30 disabled:pointer-events-none"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
        <button
          type="button"
          onClick={addCategory}
          className="inline-flex items-center gap-2 border-2 border-brand-orange text-brand-orange px-4 py-2 rounded-lg font-semibold hover:bg-brand-orange hover:text-white transition-colors"
        >
          <Plus className="w-4 h-4" /> Add category
        </button>
      </Section>

      <Section title="Dishes" description={`${menu.items.length} dish${menu.items.length === 1 ? '' : 'es'} on the website.`}>
        <div className="space-y-5">
          {menu.items.map((item, i) => (
            <div key={item.id || `new-${i}`} className="rounded-xl border border-brand-brown/15 p-4 space-y-4 bg-brand-cream/30">
              <div className="flex items-center justify-between gap-2">
                <p className="font-serif font-bold text-lg text-brand-dark truncate">{item.name || 'Untitled dish'}</p>
                <div className="flex gap-2 shrink-0">
                  <button type="button" aria-label="Move up" onClick={() => setItems(move(menu.items, i, i - 1))} className="p-2 rounded-lg border border-brand-brown/15 bg-white hover:bg-brand-cream">
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button type="button" aria-label="Move down" onClick={() => setItems(move(menu.items, i, i + 1))} className="p-2 rounded-lg border border-brand-brown/15 bg-white hover:bg-brand-cream">
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Delete dish"
                    onClick={() => window.confirm(`Delete “${item.name}”?`) && setItems(menu.items.filter((_, j) => j !== i))}
                    className="p-2 rounded-lg border border-red-200 bg-white text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid lg:grid-cols-[1fr_1.2fr] gap-4">
                <ImageField label="Photo" compact token={token} value={item.image} onChange={(image) => updateItem(i, { image })} />
                <div className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <TextField label="Dish name" maxLength={80} value={item.name} onChange={(name) => updateItem(i, { name })} />
                    <Select label="Category" value={item.category} onChange={(category) => updateItem(i, { category })}>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </Select>
                  </div>
                  <TextField label="Description" multiline maxLength={400} value={item.description} onChange={(description) => updateItem(i, { description })} />
                  <div className="grid sm:grid-cols-2 gap-4">
                    <TextField label="Cooking time" placeholder="e.g. 25 mins" maxLength={30} value={item.prepTime} onChange={(prepTime) => updateItem(i, { prepTime })} />
                    <TextField label="Serving size" placeholder="e.g. Serves 2" maxLength={40} value={item.serving} onChange={(serving) => updateItem(i, { serving })} />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-[auto_1fr_auto_auto] gap-4 items-end">
                <label className="flex items-center gap-2 font-semibold text-sm text-brand-dark pb-3">
                  <input
                    type="checkbox"
                    checked={!!item.badge}
                    onChange={(e) => updateItem(i, { badge: e.target.checked ? { icon: '⭐', label: 'SPECIAL', tone: 'orange' } : null })}
                    className="w-4 h-4 accent-brand-orange"
                  />
                  Show a badge
                </label>
                {item.badge ? (
                  <>
                    <TextField label="Badge text" maxLength={30} value={item.badge.label} onChange={(label) => updateItem(i, { badge: { ...item.badge, label } })} />
                    <TextField label="Emoji" maxLength={8} value={item.badge.icon} onChange={(icon) => updateItem(i, { badge: { ...item.badge, icon } })} />
                    <Select label="Colour" value={item.badge.tone} onChange={(tone) => updateItem(i, { badge: { ...item.badge, tone } })}>
                      {TONES.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </Select>
                  </>
                ) : (
                  <div className="sm:col-span-3" />
                )}
              </div>
              <label className="flex items-center gap-2 font-semibold text-sm text-brand-dark">
                <input type="checkbox" checked={!!item.spicy} onChange={(e) => updateItem(i, { spicy: e.target.checked })} className="w-4 h-4 accent-brand-orange" />
                🌶️ Mark as spicy
              </label>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addDish}
          disabled={!categories.length}
          className="inline-flex items-center gap-2 border-2 border-brand-orange text-brand-orange px-4 py-2 rounded-lg font-semibold hover:bg-brand-orange hover:text-white transition-colors"
        >
          <Plus className="w-4 h-4" /> Add dish
        </button>
      </Section>
    </div>
  );
}
