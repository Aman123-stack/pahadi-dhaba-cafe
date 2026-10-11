import { useEffect, useRef, useState } from 'react';
import { useSite } from '../lib/site.js';

function CountUp({ target, start, className }) {
  const [value, setValue] = useState(0);
  const decimals = Number.isInteger(target) ? 0 : 1;

  useEffect(() => {
    if (!start) return undefined;
    const duration = 2000;
    const begin = performance.now();
    let frame;
    const tick = (now) => {
      const t = Math.min(1, (now - begin) / duration);
      setValue(target * t);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [start, target]);

  const text = decimals ? value.toFixed(decimals) : Math.floor(value).toLocaleString('en-IN');
  return <p className={`count-up ${className}`}>{text}</p>;
}

export default function Stats() {
  const site = useSite();
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-brand-dark py-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
          <div data-aos="fade-up" data-aos-delay="0" className="elastic-bounce">
            <div className="flex items-center justify-center gap-2 mb-2" aria-hidden="true">
              {[0, 1, 2, 3, 4].map((i) => (
                <span key={i} className="star-animated text-brand-gold">★</span>
              ))}
            </div>
            <CountUp target={site.rating} start={visible} className="text-2xl sm:text-3xl font-bold text-brand-gold" />
            <p className="text-brand-cream/70 text-sm mt-1">Google Rating</p>
          </div>
          <div data-aos="fade-up" data-aos-delay="100" className="elastic-bounce">
            <CountUp target={site.reviewCount} start={visible} className="text-2xl sm:text-3xl font-bold text-brand-orange" />
            <p className="text-brand-cream/70 text-sm mt-1">Happy Patrons</p>
          </div>
          <div data-aos="fade-up" data-aos-delay="200" className="elastic-bounce">
            <CountUp target={65} start={visible} className="text-2xl sm:text-3xl font-bold text-brand-gold" />
            <p className="text-brand-cream/70 text-sm mt-1">Fine Ambiance Reports</p>
          </div>
          <div data-aos="fade-up" data-aos-delay="300" className="elastic-bounce">
            <p className="text-2xl sm:text-3xl font-bold text-brand-orange">{site.priceRange}</p>
            <p className="text-brand-cream/70 text-sm mt-1">Per Person</p>
          </div>
        </div>
      </div>
    </section>
  );
}
