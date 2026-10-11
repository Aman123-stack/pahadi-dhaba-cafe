import { text, url, number, shape, list } from '../lib/validate.js';

// Default website content. Once someone saves from the admin page, the saved copy
// (storage/site.json) is used instead, so edit there — or here to change the defaults.
export const defaultSite = {
  name: 'Pahadi Dhaba & Cafe',
  logoTitle: 'PAHADI',
  logoSubtitle: 'Dhaba & Cafe',
  city: 'Bhubaneswar',
  description:
    "Bhubaneswar's rustic hillside dhaba and cafe. Renowned for slow-cooked Champaran Handi Mutton, Barwan Tangdi Kababs, and private outdoor cabanas.",

  hero: {
    image: '/images/hero-dining.jpg',
    badge: '🔥 Pahadi Dhaba • Cafe • Outdoor Gatherings',
    titleTop: 'Experience The',
    titleHighlight: 'Rustic Charm',
    titleBottom: 'Of The Hills',
    text:
      'Gather with friends and family over slow-cooked Champaran Handi Mutton, signature Barwan Tangdi Kabab, and refreshing cafe mocktails in private bamboo cabanas.',
    highlight: 'Happy Hour & Cabana Dining Active',
  },

  phone: '+91 79782 76380',
  address: 'Plot No.583, 158, Road,\nChandaka Industrial Estate, Patharagadia,\nBhubaneswar, Odisha 751024',
  mapQuery: 'Pahadi Dhaba and Cafe, Plot No.583, Chandaka Industrial Estate, Patharagadia, Bhubaneswar, Odisha 751024',
  hours: { days: 'Monday – Sunday', time: '11:00 AM – 11:30 PM' },
  landmarks:
    '5 mins from KIIT Square & Infocity Patia, on the picturesque scenic route toward Chandaka Elephant Reserve.',
  parking: 'Ample free parking available for 50+ four-wheelers and two-wheelers.',

  priceRange: '₹400-₹1,200',
  rating: 4.6,
  reviewCount: 1266,

  menuPdfUrl: '',
  social: { instagram: '', facebook: '' },

  aboutPhotos: [
    { src: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=600', alt: 'Tandoor grilled kababs' },
    { src: 'https://images.unsplash.com/photo-1475483768296-6163e08872a1?q=80&w=600', alt: 'Friends around a bonfire' },
    { src: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=600', alt: 'Dining area' },
    { src: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=600', alt: 'Outdoor seating' },
  ],
  cabanaPhotos: {
    outdoor: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?q=80&w=800',
    hall: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=800',
  },
  gallery: [
    { src: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?q=80&w=800', alt: 'Hillside evenings' },
    { src: 'https://images.unsplash.com/photo-1475483768296-6163e08872a1?q=80&w=400', alt: 'Bonfire nights' },
    { src: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=400', alt: 'Cafe delicacy' },
    { src: 'https://images.unsplash.com/photo-1525610553991-5690558ecad0?q=80&w=400', alt: 'Filter coffee' },
    { src: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=400', alt: 'Tandoor grills' },
    { src: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=800', alt: 'Restaurant interior' },
  ],
};

const photo = shape({ src: url({ required: true }), alt: text(120) });

export const siteSchema = shape({
  name: text(80, { required: true }),
  logoTitle: text(30, { required: true }),
  logoSubtitle: text(40),
  city: text(60),
  description: text(600),
  hero: shape({
    image: url({ required: true }),
    badge: text(80),
    titleTop: text(60),
    titleHighlight: text(60),
    titleBottom: text(60),
    text: text(400),
    highlight: text(80),
  }),
  phone: text(25, { required: true }),
  address: text(300, { required: true }),
  mapQuery: text(300, { required: true }),
  hours: shape({ days: text(60), time: text(60) }),
  landmarks: text(400),
  parking: text(400),
  priceRange: text(40),
  rating: number(0, 5),
  reviewCount: number(0, 10_000_000, { integer: true }),
  menuPdfUrl: url(),
  social: shape({ instagram: url(), facebook: url() }),
  aboutPhotos: list(photo, { min: 4, max: 4 }),
  cabanaPhotos: shape({ outdoor: url({ required: true }), hall: url({ required: true }) }),
  gallery: list(photo, { min: 1, max: 12 }),
});

// Fill keys added in newer versions of the defaults into an older saved copy.
export function withDefaults(saved, defaults = defaultSite) {
  if (saved == null || typeof saved !== 'object' || Array.isArray(saved)) return defaults;
  const out = { ...defaults };
  for (const [key, def] of Object.entries(defaults)) {
    if (!(key in saved)) continue;
    const isPlainObject = def && typeof def === 'object' && !Array.isArray(def);
    out[key] = isPlainObject ? withDefaults(saved[key], def) : saved[key];
  }
  return out;
}
