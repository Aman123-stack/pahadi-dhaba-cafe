import { Facebook, Flame, Instagram, MapPin, Phone } from 'lucide-react';
import { addressLines, mapPlaceUrl, telHref, useSite } from '../lib/site.js';

const QUICK_LINKS = [
  { href: '#about', label: 'Overview & Highlights' },
  { href: '#menu', label: 'Digital Dhaba Menu' },
  { href: '#cabanas', label: 'Reserve Cabana or Table' },
  { href: '#gallery', label: 'Video Reels & Photos' },
  { href: '#reviews', label: 'Customer Google Reviews' },
  { href: '#contact', label: 'Directions & Map' },
];

export default function Footer() {
  const site = useSite();
  const [firstLine, ...restLines] = addressLines(site.address);
  const socialLinks = [
    { href: site.social.instagram, icon: Instagram, label: 'Instagram' },
    { href: site.social.facebook, icon: Facebook, label: 'Facebook' },
    { href: mapPlaceUrl(site.mapQuery), icon: MapPin, label: 'Google Maps' },
  ].filter((link) => link.href);

  return (
    <footer className="bg-brand-dark text-white py-16">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="fire-logo">
                <Flame className="w-10 h-10 text-brand-orange" />
              </div>
              <div>
                <p className="font-serif text-2xl font-bold uppercase">{site.name.replace(/\s*&.*$/, '')}</p>
                <p className="text-xs tracking-widest text-brand-gold uppercase">
                  {site.logoSubtitle}
                  {site.city && ` • ${site.city}`}
                </p>
              </div>
            </div>
            <p className="text-white/70 mb-6 leading-relaxed">{site.description}</p>
            <p className="flex gap-1 text-brand-gold mb-2" aria-hidden="true">★★★★★</p>
            <p className="text-sm text-white/60">
              {site.rating} ({site.reviewCount.toLocaleString('en-IN')}+ Google Reviews)
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-6 text-brand-gold">Quick Navigation</h3>
            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="inline-block py-1.5 text-white/70 hover:text-brand-orange transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-6 text-brand-gold">Visit & Timings</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-white/60 mb-1">{site.hours.days}</p>
                <p className="font-bold">{site.hours.time}</p>
                {site.hero.highlight && <p className="text-sm text-brand-gold mt-1">{site.hero.highlight}</p>}
              </div>
              <div>
                <p className="text-sm text-white/60 mb-1">{firstLine}</p>
                <p className="text-white/90">{restLines.join(' ')}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-6 text-brand-gold">Direct Contact</h3>
            <div className="space-y-4">
              <a href={telHref(site.phone)} className="flex items-center gap-3 text-white hover:text-brand-orange transition-colors group">
                <div className="bg-brand-orange/20 p-3 rounded-lg group-hover:bg-brand-orange transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-white/60">Call Dhaba</p>
                  <p className="font-bold">{site.phone}</p>
                </div>
              </a>
              <p className="text-sm text-white/70">Call for priority cabana table booking & takeout inquiries.</p>

              <div className="pt-4">
                <p className="text-sm text-white/60 mb-3">Follow Us</p>
                <div className="flex gap-3">
                  {socialLinks.map(({ href, icon: Icon, label }) => (
                    <a
                      key={label}
                      href={href}
                      aria-label={label}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/10 p-3 rounded-lg hover:bg-brand-orange transition-colors"
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/60 text-sm">
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-white/60">
            <a href="#contact" className="hover:text-brand-orange transition-colors">Parties & Group Banquets</a>
            <a href="/admin" className="hover:text-brand-orange transition-colors">Staff Login</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
