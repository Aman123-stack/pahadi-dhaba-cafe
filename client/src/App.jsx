import { useCallback, useEffect, useState } from 'react';
import AOS from 'aos';
import { gsap, ScrollTrigger, useGsap } from './lib/animation.js';
import { api } from './lib/api.js';
import { SiteContext } from './lib/site.js';
import Loader from './components/Loader.jsx';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import Stats from './components/Stats.jsx';
import About from './components/About.jsx';
import Menu from './components/Menu.jsx';
import Cabanas from './components/Cabanas.jsx';
import Gallery from './components/Gallery.jsx';
import Reviews from './components/Reviews.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import ScrollTop from './components/ScrollTop.jsx';
import ReservationModal from './components/ReservationModal.jsx';
import ReviewModal from './components/ReviewModal.jsx';

function LoadError({ message }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-dark text-brand-cream p-6 text-center">
      <div>
        <h1 className="font-serif text-3xl mb-3">We'll be right back</h1>
        <p className="text-brand-cream/70 mb-6">{message}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="bg-brand-orange text-white px-8 py-3 rounded-full font-bold hover:bg-brand-gold hover:text-brand-dark transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [site, setSite] = useState(null);
  const [siteError, setSiteError] = useState('');
  const [barDone, setBarDone] = useState(false);
  const [reservation, setReservation] = useState(null); // { type, prefill }
  const [reviewOpen, setReviewOpen] = useState(false);

  const finishLoading = useCallback(() => setBarDone(true), []);
  const openReservation = useCallback((type, prefill = {}) => setReservation({ type, prefill }), []);
  const loading = !barDone || !site;

  useEffect(() => {
    api('/api/site')
      .then(({ site }) => setSite(site))
      .catch((err) => setSiteError(err.message));
  }, []);

  useEffect(() => {
    if (site) document.title = `${site.name} | Rustic Hillside Dining in ${site.city || 'the Hills'}`;
  }, [site]);

  useEffect(() => {
    if (!site) return;
    AOS.init({ duration: 1200, once: false, offset: 50, easing: 'ease-out-cubic', mirror: true });
  }, [site]);

  useEffect(() => {
    if (loading) return;
    AOS.refresh();
    ScrollTrigger.refresh();
  }, [loading]);

  // Every section except the menu eases up into place as it scrolls in.
  const main = useGsap(
    (root) => {
      root.querySelectorAll(':scope > section:not(#menu)').forEach((section) => {
        gsap.from(section, {
          scrollTrigger: { trigger: section, start: 'top 80%', end: 'top 30%', scrub: 1 },
          y: 50,
          opacity: 0.5,
        });
      });
    },
    [!!site],
  );

  if (siteError) return <LoadError message={siteError} />;

  return (
    <>
      {loading && <Loader onDone={finishLoading} name={site?.logoTitle} />}
      {site && (
        <SiteContext.Provider value={site}>
          <Navbar />
          <main ref={main}>
            <Hero />
            <Stats />
            <About />
            <Menu />
            <Cabanas onReserve={openReservation} />
            <Gallery />
            <Reviews onShare={() => setReviewOpen(true)} />
            <Contact />
          </main>
          <Footer />
          <ScrollTop />

          {reservation && (
            <ReservationModal
              type={reservation.type}
              prefill={reservation.prefill}
              onClose={() => setReservation(null)}
            />
          )}
          {reviewOpen && <ReviewModal onClose={() => setReviewOpen(false)} />}
        </SiteContext.Provider>
      )}
    </>
  );
}
