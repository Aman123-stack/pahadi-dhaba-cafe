import { Flame, Sparkles, Tent } from 'lucide-react';
import { tilt, zoomPan, mergeHandlers } from '../lib/animation.js';
import { useSite } from '../lib/site.js';

const HIGHLIGHTS = [
  {
    icon: Flame,
    bg: 'bg-brand-orange/10',
    color: 'text-brand-orange',
    title: 'Slow-Cooked Ahuna Mutton Curry',
    text: 'Legendary earthen claypot mutton with whole garlic and cold-pressed mustard oil',
  },
  {
    icon: Sparkles,
    bg: 'bg-brand-gold/20',
    color: 'text-brand-gold',
    title: 'Barwan Tangdi Kabab',
    text: 'Juicy chicken drumsticks stuffed with spiced minced chicken and dry fruits',
  },
  {
    icon: Tent,
    bg: 'bg-brand-orange/10',
    color: 'text-brand-orange',
    title: 'Private Bamboo Cabanas',
    text: 'Thatched gazebo surrounded by lush greenery with bonfire ambience',
  },
];

const photoHandlers = mergeHandlers(tilt, zoomPan);

export default function About() {
  const site = useSite();
  return (
    <section id="about" className="py-16 sm:py-24 bg-brand-cream">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div data-aos="fade-right" data-aos-duration="1000">
            <span className="inline-block bg-brand-orange text-white px-4 py-2 rounded-full text-xs font-bold mb-6 uppercase tracking-wider">
              🔥 Chef's Culinary Showcase
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold mb-6 leading-tight">
              Our Signature
              <br />
              <span className="text-brand-orange">Dhaba & Cafe Menu</span>
            </h2>
            <p className="text-lg text-brand-brown/80 mb-6 leading-relaxed">
              Carefully curated from traditional earthen-pot clay ovens to sizzling tandoor grills and refreshing mocktails.
            </p>
            <div className="space-y-4">
              {HIGHLIGHTS.map(({ icon: Icon, bg, color, title, text }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className={`${bg} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{title}</h3>
                    <p className="text-brand-brown/70">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div data-aos="fade-left" data-aos-duration="1000" className="relative">
            <div className="grid grid-cols-2 gap-4">
              {site.aboutPhotos.map((photo, i) => (
                <div
                  key={`${i}-${photo.src}`}
                  {...photoHandlers}
                  className={`img-zoom rounded-2xl overflow-hidden hover-lift ${i % 2 ? 'mt-8' : ''}`}
                >
                  <img src={photo.src} alt={photo.alt} loading="lazy" className="w-full h-64 object-cover" />
                </div>
              ))}
            </div>

            <div
              className="absolute -bottom-6 left-2 sm:-left-6 bg-brand-dark text-white p-4 sm:p-6 rounded-2xl shadow-2xl floating"
              data-aos="zoom-in"
              data-aos-delay="500"
            >
              <p className="text-sm mb-2 text-brand-gold">📍 Chandaka Hills</p>
              <p className="font-bold text-lg">Breezy Hillside Evenings</p>
              <p className="text-xs text-white/70 mt-1">Outdoor Cabanas Illuminated</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
