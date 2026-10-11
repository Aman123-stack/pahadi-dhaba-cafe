import { text, url, bool, oneOf, shape, list, optional } from '../lib/validate.js';

// Default signature dishes. Once the menu is saved from the admin page, storage/menu.json is used instead.
// badge.tone is one of: orange, gold, blue, green (styles live in the client).

export const BADGE_TONES = ['orange', 'gold', 'blue', 'green'];

export const menuSchema = shape({
  categories: list(shape({ id: text(60), label: text(40, { required: true }) }), { min: 1, max: 20 }),
  items: list(
    shape({
      id: text(60),
      name: text(80, { required: true }),
      category: text(60, { required: true }),
      description: text(400),
      image: url(),
      prepTime: text(30),
      serving: text(40),
      badge: optional(shape({ icon: text(8), label: text(30, { required: true }), tone: oneOf(BADGE_TONES) })),
      spicy: bool(),
    }),
    { max: 200 },
  ),
});

export const categories = [
  { id: 'all', label: 'All Dishes' },
  { id: 'champaran', label: 'Champaran & Handi' },
  { id: 'kababs', label: 'Starters & Kababs' },
  { id: 'curry', label: 'Royal Curries' },
  { id: 'biryani', label: 'Biryani & Breads' },
];

export const items = [
  {
    id: 'mutton-champaran',
    name: 'Mutton Champaran',
    category: 'champaran',
    description:
      'The legendary slow-cooked earthen claypot mutton cooked with whole garlic bulbs, cold-pressed mustard oil, and sealed dough.',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=600',
    prepTime: '35 mins',
    serving: '500g Handi (Serves 2)',
    badge: { icon: '🔥', label: "CHEF'S SPECIAL", tone: 'orange' },
    spicy: true,
  },
  {
    id: 'barwan-tangdi-kabab',
    name: 'Barwan Tangdi Kabab',
    category: 'kababs',
    description:
      'Juicy chicken drumsticks stuffed with spiced minced chicken, dry fruits, and char-grilled in tandoor with aromatic hill spices.',
    image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?q=80&w=600',
    prepTime: '22 mins',
    serving: '4 Pcs (Serves 2-3)',
    badge: { icon: '⭐', label: 'MOST POPULAR', tone: 'gold' },
  },
  {
    id: 'tandoori-pomfret',
    name: 'Tandoori Pomfret',
    category: 'kababs',
    description: 'Fresh pomfret marinated in coastal spices and grilled to perfection in our traditional tandoor.',
    image: 'https://images.unsplash.com/photo-1725393325387-07f0d4951528?q=80&w=600',
    prepTime: '18 mins',
    serving: 'Full Fish',
    badge: { icon: '🐟', label: 'SEAFOOD SPECIAL', tone: 'blue' },
  },
  {
    id: 'chicken-dum-biryani',
    name: 'Chicken Dum Biryani',
    category: 'biryani',
    description: 'Aromatic basmati rice layered with succulent chicken pieces, slow-cooked in a sealed handi.',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600',
    prepTime: '30 mins',
    serving: 'Serves 1-2',
  },
  {
    id: 'kadhai-chicken',
    name: 'Kadhai Chicken',
    category: 'curry',
    description: 'Tender chicken cooked in a traditional kadhai with bell peppers, tomatoes, and aromatic spices.',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?q=80&w=600',
    prepTime: '25 mins',
    serving: 'Serves 2',
  },
  {
    id: 'paneer-butter-masala',
    name: 'Paneer Butter Masala',
    category: 'curry',
    description: 'Cottage cheese cubes simmered in rich tomato gravy with butter and aromatic spices.',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=600',
    prepTime: '20 mins',
    serving: 'Serves 2',
    badge: { icon: '🌱', label: 'PURE VEG', tone: 'green' },
  },
];
