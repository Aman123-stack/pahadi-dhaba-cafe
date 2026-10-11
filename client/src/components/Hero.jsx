import { ArrowRight, ChevronDown, Clock, Sparkles, Tent } from 'lucide-react';
import { gsap, useGsap, magnetic, mergeHandlers, ripple } from '../lib/animation.js';
import { useSite } from '../lib/site.js';

const magneticRipple = mergeHandlers(magnetic, { onClick: ripple });

export default function Hero() {
  const site = useSite();
  const { hero } = site;
  // Background drifts down and zooms as the hero scrolls away.
  const scope = useGsap((section) => {
    gsap.to(section.querySelector('#hero-bg'), {
      scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: true },
      y: 200,
      scale: 1.2,
    });
  });

  return (
    <section
      ref={scope}
      id="hero"
      className="relative min-h-screen lg:min-h-[760px] pt-28 pb-20 lg:pt-36 lg:pb-24 flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0">
        <img
          id="hero-bg"
          src={hero.image}
          alt={`${site.name} in the hills`}
          className="w-full h-full object-cover object-center"
          fetchpriority="high"
        />
        <div className="video-overlay" />
      </div>

      <div className="relative z-10 container mx-auto px-6 text-center">
        {hero.badge && (
        <div data-aos="fade-down" data-aos-duration="1000">
          <span className="inline-block bg-brand-orange/90 text-white px-6 py-2 rounded-full text-xs sm:text-sm font-semibold uppercase tracking-wider mb-6 backdrop-blur-sm border border-brand-gold/40 shadow-lg shadow-brand-orange/30">
            {hero.badge}
          </span>
        </div>
        )}

        <h1
          className="text-4xl sm:text-5xl md:text-7xl xl:text-8xl font-serif font-bold text-white mb-5 sm:mb-6 leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)]"
          data-aos="fade-up"
          data-aos-duration="1200"
          data-aos-delay="200"
        >
          {hero.titleTop}
          {hero.titleTop && <br />}
          <span className="gradient-text">{hero.titleHighlight}</span>
          {hero.titleBottom && <br />}
          {hero.titleBottom}
        </h1>

        <p
          className="text-base sm:text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8 font-light leading-relaxed"
          data-aos="fade-up"
          data-aos-duration="1200"
          data-aos-delay="400"
        >
          {hero.text}
        </p>

        <div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          data-aos="fade-up"
          data-aos-duration="1200"
          data-aos-delay="600"
        >
          <a
            href="#menu"
            {...magneticRipple}
            className="magnetic-btn ripple-btn glow-pulse-hover bg-brand-orange text-white px-8 py-4 sm:px-10 sm:py-5 rounded-full text-base sm:text-lg font-bold hover:bg-brand-gold hover:text-brand-dark transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex items-center justify-center w-full sm:w-auto gap-3 group"
          >
            <span>Explore Menu</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </a>
          <a
            href="#cabanas"
            {...magneticRipple}
            className="magnetic-btn ripple-btn glass text-brand-dark px-8 py-4 sm:px-10 sm:py-5 rounded-full text-base sm:text-lg font-bold hover:bg-white transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex items-center justify-center w-full sm:w-auto gap-3"
          >
            <Tent className="w-5 h-5" />
            <span>Reserve Cabana</span>
          </a>
        </div>

        <div
          className="glass mt-8 sm:mt-12 inline-flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-6 px-5 sm:px-8 py-4 rounded-3xl sm:rounded-full text-left"
          data-aos="fade-up"
          data-aos-duration="1200"
          data-aos-delay="800"
        >
          <div className="flex items-center gap-2 text-brand-dark">
            <Clock className="w-5 h-5 text-brand-orange" />
            <span className="font-semibold">Open Daily • {site.hours.time}</span>
          </div>
          {hero.highlight && (
            <div className="flex items-center gap-2 text-brand-dark">
              <Sparkles className="w-5 h-5 text-brand-gold" />
              <span className="font-semibold">{hero.highlight}</span>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce hidden lg:block">
        <ChevronDown className="w-8 h-8 text-white" />
      </div>
    </section>
  );
}
