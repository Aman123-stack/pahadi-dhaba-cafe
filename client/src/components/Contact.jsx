import { useEffect, useRef, useState } from 'react';
import { Car, Clock, Copy, LocateFixed, MapPin, Navigation, Phone } from 'lucide-react';
import { gsap, useGsap } from '../lib/animation.js';
import { addressLines, mapEmbedUrl, telHref, useSite } from '../lib/site.js';
import SectionHeading from './SectionHeading.jsx';

const TRAVEL_MODES = [
  { id: 'driving', label: '🚗 Car' },
  { id: 'two-wheeler', label: '🛵 Bike' },
  { id: 'transit', label: '🚌 Transit' },
  { id: 'walking', label: '🚶 Walk' },
];

function Directions() {
  const site = useSite();
  const [origin, setOrigin] = useState('');
  const [coords, setCoords] = useState(null); // set when the visitor shares GPS location
  const [mode, setMode] = useState('driving');
  const [status, setStatus] = useState({ text: '', ok: true });

  function locateMe() {
    if (!navigator.geolocation) {
      setStatus({ text: 'Your browser cannot share location. Please type your starting point instead.', ok: false });
      return;
    }
    setStatus({ text: 'Finding your location…', ok: true });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords(`${pos.coords.latitude.toFixed(6)},${pos.coords.longitude.toFixed(6)}`);
        setOrigin('My current location');
        setStatus({ text: 'Location found. Tap "Get Directions" to open the route.', ok: true });
      },
      () =>
        setStatus({
          text: 'Could not get your location (permission denied or unavailable). Please type your starting point.',
          ok: false,
        }),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }

  function openDirections() {
    const typed = origin.trim();
    const params = new URLSearchParams({ api: '1', destination: site.mapQuery, travelmode: mode });
    if (coords) params.set('origin', coords);
    // Bias free-text hotel/landmark names toward the restaurant's city
    else if (typed) {
      const city = site.city.trim();
      params.set('origin', !city || typed.toLowerCase().includes(city.toLowerCase()) ? typed : `${typed}, ${city}`);
    }
    // With no origin, Google Maps uses the visitor's current location itself
    window.open(`https://www.google.com/maps/dir/?${params}`, '_blank', 'noopener');
    setStatus({ text: typed || coords ? 'Opening Google Maps…' : 'Opening Google Maps with your current location…', ok: true });
  }

  return (
    <div className="bg-white rounded-2xl p-5">
      <h3 className="font-serif font-bold text-xl mb-1">Get Directions</h3>
      <p className="text-sm text-brand-brown/60 mb-4">Enter where you are starting from, or use your current location.</p>

      <label htmlFor="directions-origin" className="block text-sm font-bold mb-2 text-brand-dark">Your starting point</label>
      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        <input
          id="directions-origin"
          type="text"
          placeholder="Hotel, area or landmark"
          value={origin}
          onChange={(e) => {
            setOrigin(e.target.value);
            setCoords(null); // typing a place overrides an earlier GPS fix
            setStatus({ text: '', ok: true });
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              openDirections();
            }
          }}
          className="flex-grow px-4 py-3 rounded-xl border-2 border-brand-brown/20 focus:border-brand-orange outline-none transition-all bg-white"
        />
        <button
          type="button"
          onClick={locateMe}
          className="px-4 py-3 rounded-xl border-2 border-brand-orange text-brand-orange font-semibold hover:bg-brand-orange hover:text-white transition-all flex items-center justify-center gap-2"
        >
          <LocateFixed className="w-4 h-4" />
          <span>Use my location</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4" role="group" aria-label="Travel mode">
        {TRAVEL_MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            aria-pressed={mode === m.id}
            onClick={() => setMode(m.id)}
            className={`px-4 py-3 rounded-full text-sm font-semibold transition-colors ${
              mode === m.id ? 'bg-brand-orange text-white' : 'bg-brand-brown/10 text-brand-dark'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={openDirections}
        className="w-full bg-brand-orange text-white px-6 py-4 rounded-xl font-bold hover:bg-brand-dark transition-all duration-300 flex items-center justify-center gap-2"
      >
        <Navigation className="w-5 h-5" />
        <span>Get Directions on Google Maps</span>
      </button>
      <p className={`text-sm mt-3 min-h-[1.25rem] ${status.ok ? 'text-green-700' : 'text-red-600'}`} role="status" aria-live="polite">
        {status.text}
      </p>
    </div>
  );
}

function CopyAddress() {
  const site = useSite();
  const [label, setLabel] = useState('Copy Address');
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(addressLines(site.address).join(' '));
      setLabel('Copied!');
    } catch {
      setLabel('Press Ctrl+C to copy');
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setLabel('Copy Address'), 2000);
  }

  return (
    <button type="button" onClick={copy} className="inline-flex items-center gap-2 text-brand-orange font-semibold mt-3 py-2 hover:gap-3 transition-all">
      <span>{label}</span>
      <Copy className="w-4 h-4" />
    </button>
  );
}

function InfoCard({ icon: Icon, iconBg, iconColor, title, children }) {
  return (
    <div data-info className="glass rounded-2xl p-8">
      <div className="flex items-start gap-4">
        <div className={`${iconBg} p-4 rounded-xl`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        <div className="flex-grow">
          <h3 className="font-bold text-xl mb-2">{title}</h3>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Contact() {
  const site = useSite();
  // Info cards slide in from alternating sides.
  const scope = useGsap((section) => {
    section.querySelectorAll('[data-info]').forEach((card, index) => {
      gsap.from(card, {
        scrollTrigger: { trigger: card, start: 'top 85%' },
        x: index % 2 === 0 ? -100 : 100,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      });
    });
  });

  return (
    <section ref={scope} id="contact" className="py-16 sm:py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <SectionHeading eyebrow={`📍 Find Us In ${site.city || 'the Hills'}`} title="Visit" highlight={site.name.toUpperCase()}>
          Located right along the serene Chandaka Industrial Estate corridor, just minutes from Patia, Infocity, and KIIT
          University.
        </SectionHeading>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div data-aos="fade-right">
            <div className="glass rounded-3xl p-2 h-full flex flex-col gap-2">
              <div className="rounded-2xl overflow-hidden flex-grow min-h-[320px] bg-brand-brown/10">
                <iframe
                  title={`${site.name} on Google Maps`}
                  className="w-full h-full min-h-[320px] border-0"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={mapEmbedUrl(site.mapQuery)}
                />
              </div>
              <Directions />
            </div>
          </div>

          <div className="space-y-8">
            <InfoCard icon={MapPin} iconBg="bg-brand-orange/10" iconColor="text-brand-orange" title="Our Address">
              <address className="not-italic text-brand-brown/70 leading-relaxed">
                {addressLines(site.address).map((line) => (
                  <span key={line} className="block">{line}</span>
                ))}
              </address>
              <CopyAddress />
            </InfoCard>

            <InfoCard icon={Clock} iconBg="bg-green-500/10" iconColor="text-green-600" title="Operating Hours">
              <div className="space-y-2">
                <div className="flex justify-between items-center gap-4 flex-wrap">
                  <span className="text-brand-brown/70">{site.hours.days}</span>
                  <span className="font-bold text-green-600">{site.hours.time}</span>
                </div>
                <div className="text-sm flex flex-wrap gap-2">
                  <span className="bg-green-500/10 text-green-700 px-3 py-1 rounded-full">Lunch</span>
                  <span className="bg-brand-orange/10 text-brand-orange px-3 py-1 rounded-full">Dinner</span>
                  <span className="bg-brand-gold/20 text-brand-dark px-3 py-1 rounded-full">Late Evening Cafe</span>
                </div>
              </div>
            </InfoCard>

            <InfoCard icon={Navigation} iconBg="bg-blue-500/10" iconColor="text-blue-600" title="Nearby Landmarks">
              <p className="text-brand-brown/70">{site.landmarks}</p>
            </InfoCard>

            <InfoCard icon={Car} iconBg="bg-brand-orange/10" iconColor="text-brand-orange" title="Valet & Parking">
              <p className="text-brand-brown/70">{site.parking}</p>
            </InfoCard>
          </div>
        </div>

        <div className="bg-brand-dark text-white rounded-3xl p-6 sm:p-12 mt-10 sm:mt-12 text-center" data-aos="fade-up">
          <h3 className="text-3xl font-serif font-bold mb-4">Table Reservations & Delivery</h3>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">Call us directly for priority cabana table booking & takeout inquiries</p>
          <a
            href={telHref(site.phone)}
            className="inline-flex items-center justify-center w-full sm:w-auto gap-3 sm:gap-4 bg-brand-orange text-white px-5 py-4 sm:px-12 sm:py-6 rounded-full text-xl sm:text-2xl font-bold hover:bg-brand-gold hover:text-brand-dark transition-all duration-300 hover:shadow-2xl hover:-translate-y-2"
          >
            <Phone className="w-6 h-6 sm:w-8 sm:h-8" />
            <span>{site.phone}</span>
          </a>
          <p className="text-sm text-white/60 mt-4">Available during business hours</p>
        </div>
      </div>
    </section>
  );
}
