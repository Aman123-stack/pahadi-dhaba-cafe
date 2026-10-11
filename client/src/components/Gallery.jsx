import { Images } from 'lucide-react';
import { gsap, useGsap, zoomPan } from '../lib/animation.js';
import { mapPlaceUrl, useSite } from '../lib/site.js';
import SectionHeading from './SectionHeading.jsx';

// First photo is the large feature tile; the sixth spans two columns to close the grid.
const tileClass = (i) => (i === 0 ? 'col-span-2 row-span-2' : i === 5 ? 'col-span-2' : '');

export default function Gallery() {
  const site = useSite();
  // Tiles pop in one after another.
  const scope = useGsap((section) => {
    section.querySelectorAll('[data-tile]').forEach((tile, index) => {
      gsap.from(tile, {
        scrollTrigger: { trigger: tile, start: 'top 90%' },
        scale: 0.8,
        opacity: 0,
        duration: 0.6,
        delay: index * 0.05,
        ease: 'power2.out',
      });
    });
  });

  return (
    <section ref={scope} id="gallery" className="py-16 sm:py-24 bg-white">
      <div className="container mx-auto px-6">
        <SectionHeading eyebrow="📸 Pahadi Ambience & Food Gallery" title="Immerse In The" highlight="Pahadi Atmosphere">
          Explore our lush outdoor dining huts, crackling tandoor grills, evening illumination, and signature dishes.
        </SectionHeading>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {site.gallery.map((photo, i) => (
            <div key={`${i}-${photo.src}`} data-tile className={`img-zoom rounded-2xl overflow-hidden shadow-lg ${tileClass(i)}`} {...zoomPan}>
              <img src={photo.src} alt={photo.alt} loading="lazy" className={`w-full ${i === 0 ? 'h-full min-h-64' : 'h-64'} object-cover`} />
            </div>
          ))}
        </div>

        <div className="text-center mt-12" data-aos="fade-up">
          <a
            href={mapPlaceUrl(site.mapQuery)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 border-2 border-brand-orange text-brand-orange px-6 py-4 sm:px-10 sm:py-5 rounded-full text-base sm:text-lg font-bold hover:bg-brand-orange hover:text-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <Images className="w-5 h-5" />
            <span>View All 50+ Photos</span>
          </a>
        </div>
      </div>
    </section>
  );
}
