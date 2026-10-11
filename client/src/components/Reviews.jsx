import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { api } from '../lib/api.js';
import { gsap, useGsap, tilt } from '../lib/animation.js';
import SectionHeading from './SectionHeading.jsx';
import { useSite } from '../lib/site.js';

const initials = (name) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const Stars = ({ count = 5, className = '' }) => (
  <span className={className} aria-label={`${count} out of 5 stars`}>
    {'★'.repeat(count)}
  </span>
);

export default function Reviews({ onShare }) {
  const site = useSite();
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api('/api/reviews')
      .then((d) => !cancelled && setData(d))
      .catch(() => {}); // section still shows headline numbers without the cards
    return () => {
      cancelled = true;
    };
  }, []);

  const summary = data?.summary ?? { rating: site.rating, count: site.reviewCount, distribution: [] };
  const reviews = data?.reviews ?? [];

  // Cards flip in once they've loaded.
  const scope = useGsap(
    (section) => {
      section.querySelectorAll('[data-review]').forEach((card, index) => {
        gsap.from(card, {
          scrollTrigger: { trigger: card, start: 'top 85%' },
          rotateY: 90,
          opacity: 0,
          duration: 0.8,
          delay: index * 0.2,
          ease: 'power3.out',
        });
      });
    },
    [reviews.length],
  );

  const countText = summary.count.toLocaleString('en-IN');

  return (
    <section ref={scope} id="reviews" className="py-16 sm:py-24 bg-brand-cream">
      <div className="container mx-auto px-6">
        <SectionHeading
          eyebrow="⭐ Guest Experiences"
          eyebrowClass="bg-brand-gold/20 text-brand-dark"
          title={`Loved By Over ${countText}+`}
          highlight={`Patrons in ${site.city || "the Hills"}`}
        >
          Rated {summary.rating} Stars across Google. Here is what real food lovers, families, and techies from Infocity
          have to say.
        </SectionHeading>

        <div className="glass rounded-3xl p-5 sm:p-8 md:p-12 mb-10 sm:mb-12 max-w-5xl mx-auto" data-aos="fade-up" data-aos-delay="200">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                <span className="text-6xl font-bold text-brand-orange">{summary.rating}</span>
                <div>
                  <Stars className="flex gap-1 mb-1 text-brand-gold text-2xl" />
                  <p className="text-sm text-brand-brown/70">Based on {countText}+ Google Ratings</p>
                </div>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-green-600 font-semibold">
                <CheckCircle className="w-5 h-5" />
                <span>Google Verified Business Profile</span>
              </div>
            </div>

            <div className="space-y-3">
              {summary.distribution.map(({ stars, percent }) => (
                <div key={stars} className="flex items-center gap-4">
                  <span className="text-sm font-bold w-4">{stars}</span>
                  <div className="flex-grow h-3 bg-brand-brown/10 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-gold rounded-full" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="text-sm font-bold w-12 text-right">{percent}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={onShare}
              className="bg-brand-orange text-white px-8 py-4 rounded-full font-bold hover:bg-brand-dark transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              Share Your Experience
            </button>
            <p className="text-sm text-brand-brown/60 mt-2">No sign-up needed</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8" style={{ perspective: '1000px' }}>
          {reviews.map((review) => (
            <div key={review.id} data-review className="bg-white rounded-2xl p-8 shadow-lg hover-lift" {...tilt}>
              <Stars count={review.rating} className="flex gap-1 text-brand-gold mb-4" />
              <p className="text-brand-brown mb-4 leading-relaxed">“{review.text}”</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-brand-orange/20 rounded-full flex items-center justify-center font-bold text-brand-orange">
                  {initials(review.name)}
                </div>
                <div>
                  <p className="font-bold">{review.name}</p>
                  <p className="text-sm text-brand-brown/60">{review.when}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
