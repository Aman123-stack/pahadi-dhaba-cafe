import { useEffect, useState } from 'react';
import { Flame, Menu as MenuIcon, Phone, X } from 'lucide-react';
import { NAV_LINKS, telHref, useSite } from '../lib/site.js';
import { useBodyLock } from '../lib/useBodyLock.js';

export default function Navbar() {
  const site = useSite();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useBodyLock(open);

  // Over the dark hero photo (desktop, not yet scrolled) the bar uses light text on a soft shade.
  // Below lg the bar always has a cream background (see index.css), so text stays dark there.
  const overHero = !scrolled;

  return (
    <>
      <nav
        id="navbar"
        className={`fixed w-full z-50 transition-all duration-500 ${
          overHero ? 'bg-gradient-to-b from-brand-dark/80 via-brand-dark/40 to-transparent' : 'glass shadow-lg'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <a href="#hero" className="flex items-center gap-3 group">
            <div className="fire-logo">
              <Flame className="w-8 h-8 sm:w-10 sm:h-10 text-brand-orange" />
            </div>
            <div>
              <p
                className={`font-serif text-xl sm:text-2xl font-bold tracking-wide group-hover:text-brand-orange transition-colors ${
                  overHero ? 'text-brand-dark lg:text-white lg:drop-shadow' : 'text-brand-dark'
                }`}
              >
                {site.logoTitle}
              </p>
              <p
                className={`text-xs font-semibold tracking-[0.25em] uppercase transition-colors ${
                  overHero ? 'text-brand-brown lg:text-brand-gold' : 'text-brand-orange'
                }`}
              >
                {site.logoSubtitle}
              </p>
            </div>
          </a>

          <div className="hidden lg:flex items-center gap-1 xl:gap-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`px-3 xl:px-4 py-2 rounded-full text-[15px] font-semibold tracking-wide transition-all duration-300 ${
                  overHero
                    ? 'text-white/95 drop-shadow hover:bg-white/15 hover:text-brand-gold'
                    : 'text-brand-dark hover:bg-brand-orange/10 hover:text-brand-orange'
                }`}
              >
                {link.label}
              </a>
            ))}
            <a
              href={telHref(site.phone)}
              className="ml-3 flex items-center gap-2 bg-brand-orange text-white px-6 py-3 rounded-full shadow-lg shadow-brand-orange/30 hover:bg-brand-gold hover:text-brand-dark transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
            >
              <Phone className="w-4 h-4" />
              <span className="font-semibold">{site.phone}</span>
            </a>
          </div>

          <button
            type="button"
            className="lg:hidden text-brand-dark p-2 -mr-2"
            aria-label="Open menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <MenuIcon className="w-8 h-8" />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 bg-brand-dark z-[60] transform transition-transform duration-500 lg:hidden ${open ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!open}
        inert={open ? undefined : ''}
      >
        <div className="flex flex-col items-center justify-center h-full gap-8 text-brand-cream">
          <button
            type="button"
            className="absolute top-4 right-4 p-3"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <X className="w-8 h-8" />
          </button>
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-2xl font-serif py-2 hover:text-brand-orange transition-colors"
            >
              {link.label}
            </a>
          ))}
          <a href={telHref(site.phone)} className="bg-brand-orange text-white px-8 py-4 rounded-full text-lg font-semibold mt-4">
            Call Now
          </a>
        </div>
      </div>
    </>
  );
}
