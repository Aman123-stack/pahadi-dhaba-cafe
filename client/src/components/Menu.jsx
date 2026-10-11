import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';
import { api } from '../lib/api.js';
import { ScrollTrigger, tilt } from '../lib/animation.js';
import { useSite } from '../lib/site.js';
import SectionHeading from './SectionHeading.jsx';

const BADGE_TONES = {
  orange: 'bg-brand-orange text-white',
  gold: 'bg-brand-gold text-brand-dark',
  blue: 'bg-blue-500 text-white',
  green: 'bg-green-500 text-white',
};

function MenuCard({ item }) {
  const [broken, setBroken] = useState(false);

  return (
    <div className="menu-card menu-appear bg-white rounded-2xl overflow-hidden shadow-lg hover-lift group" {...tilt}>
      <div className={`relative overflow-hidden h-64 ${broken ? 'bg-gradient-to-br from-brand-brown to-brand-orange' : ''}`}>
        {!broken && (
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            onError={() => setBroken(true)}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        )}
        {item.badge && (
          <div
            className={`absolute top-4 left-4 ${BADGE_TONES[item.badge.tone] ?? BADGE_TONES.orange} px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2`}
          >
            <span>{item.badge.icon}</span>
            <span>{item.badge.label}</span>
          </div>
        )}
        {item.spicy && (
          <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <span>🌶️</span>
            <span>SPICY</span>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start gap-3 mb-3">
          <h3 className="text-2xl font-serif font-bold group-hover:text-brand-orange transition-colors">{item.name}</h3>
          <span className="text-brand-orange font-bold text-xl shrink-0" aria-hidden="true">★★★</span>
        </div>
        <p className="text-brand-brown/70 mb-4 leading-relaxed">{item.description}</p>
        <div className="flex items-center gap-2 text-sm text-brand-brown/60">
          <Clock className="w-4 h-4" />
          <span>{item.prepTime}</span>
          <span>•</span>
          <span>{item.serving}</span>
        </div>
      </div>
    </div>
  );
}

export default function Menu() {
  const site = useSite();
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('all');

  useEffect(() => {
    let cancelled = false;
    api('/api/menu')
      .then((data) => !cancelled && setMenu(data))
      .catch((err) => !cancelled && setError(err.message));
    return () => {
      cancelled = true;
    };
  }, []);

  // The section changes height once dishes arrive or the filter changes; re-measure scroll animations below it.
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [menu, category]);

  const items = menu ? menu.items.filter((item) => category === 'all' || item.category === category) : [];

  return (
    <section id="menu" className="py-16 sm:py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <SectionHeading eyebrow="Our Signature Dishes" title="Chef's Special Menu" aos={false}>
          From traditional clay ovens to modern cafe delights
        </SectionHeading>

        {menu && (
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-10 sm:mb-12" role="group" aria-label="Filter dishes">
            {menu.categories.map((c) => (
              <button
                key={c.id}
                type="button"
                aria-pressed={category === c.id}
                onClick={() => setCategory(c.id)}
                className={`border px-4 py-2.5 sm:px-6 sm:py-3 text-sm sm:text-base rounded-full font-semibold transition-all duration-300 ${
                  category === c.id
                    ? 'border-brand-orange bg-brand-orange text-white'
                    : 'border-brand-orange/40 hover:bg-brand-orange hover:text-white'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        {!menu && !error && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-2xl bg-brand-cream h-[26rem] animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <p className="text-center text-brand-brown/70" role="alert">
            We couldn't load the menu right now. {error}
          </p>
        )}

        {menu && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {items.map((item) => (
              <MenuCard key={`${category}-${item.id}`} item={item} />
            ))}
          </div>
        )}

        {site.menuPdfUrl && (
        <div className="text-center mt-12">
          <a
            href={site.menuPdfUrl}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-3 bg-brand-orange text-white px-6 py-4 sm:px-10 sm:py-5 rounded-full text-base sm:text-lg font-bold hover:bg-brand-dark transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group"
          >
            <BookOpen className="w-5 h-5" />
            <span>View Full Menu (PDF)</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </a>
        </div>
        )}
      </div>
    </section>
  );
}
