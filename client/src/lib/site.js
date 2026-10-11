import { createContext, useContext } from 'react';

// Site content (name, hero, phone, address, photos...) comes from GET /api/site and is
// edited on the /admin page. Components read it with useSite().
export const SiteContext = createContext(null);
export const useSite = () => useContext(SiteContext);

// Helpers that derive links from the editable content.
export const telHref = (phone) => `tel:${phone.replace(/[^\d+]/g, '')}`;
export const addressLines = (address) => address.split('\n').map((l) => l.trim()).filter(Boolean);
export const mapEmbedUrl = (query) => `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
export const mapPlaceUrl = (query) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

export const NAV_LINKS = [
  { href: '#about', label: 'Overview' },
  { href: '#menu', label: 'Menu' },
  { href: '#cabanas', label: 'Cabanas' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#reviews', label: 'Reviews' },
  { href: '#contact', label: 'Visit Us' },
];

// Must match the lists the server accepts (server/src/routes/reservations.js).
export const TIME_OPTIONS = ['12:00 PM', '01:00 PM', '02:00 PM', '07:00 PM', '07:30 PM', '08:00 PM', '09:00 PM'];
export const GUEST_OPTIONS = ['2 People', '3-4 People', '5-6 People', '7-10 People', '10+ People'];

// Local calendar date as YYYY-MM-DD (what <input type="date"> uses).
export function todayISO() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}
