import { useState } from 'react';
import { Calendar, Clock, Flame, Users, Wind } from 'lucide-react';
import { tilt, zoomPan } from '../lib/animation.js';
import { todayISO, useSite } from '../lib/site.js';
import SectionHeading from './SectionHeading.jsx';

const ZONES = [
  {
    type: 'Outdoor Hill Cabana',
    photo: 'outdoor',
    badge: 'Most Popular',
    badgeClass: 'bg-brand-orange',
    text: 'Private thatched gazebo surrounded by lush greenery',
    features: [
      { icon: Flame, label: 'Bonfire Ambience' },
      { icon: Wind, label: 'Hill Breeze' },
    ],
    cta: 'Reserve Cabana',
  },
  {
    type: 'Royal AC Dining Hall',
    photo: 'hall',
    badge: 'Family & Corporate',
    badgeClass: 'bg-blue-500',
    text: 'Plush upholstered seating with climate control',
    features: [
      { icon: Wind, label: 'AC Comfort' },
      { icon: Users, label: 'Large Groups' },
    ],
    cta: 'Reserve Table',
  },
];

const QUICK_TIMES = [
  { value: '07:30 PM', label: 'Tonight • 07:30 PM' },
  { value: '12:00 PM', label: '12:00 PM' },
  { value: '01:00 PM', label: '01:00 PM' },
  { value: '07:00 PM', label: '07:00 PM' },
  { value: '08:00 PM', label: '08:00 PM' },
  { value: '09:00 PM', label: '09:00 PM' },
];

const QUICK_GUESTS = [
  { value: '3-4 People', label: '3-4 Friends (Cafe Gazebo)' },
  { value: '2 People', label: '2 People' },
  { value: '5-6 People', label: '5-6 People' },
  { value: '7-10 People', label: '7-10 People' },
  { value: '10+ People', label: '10+ People' },
];

const fieldClass =
  'w-full px-4 py-4 rounded-xl border-2 border-brand-brown/20 focus:border-brand-orange outline-none transition-all duration-300 bg-white';

export default function Cabanas({ onReserve }) {
  const site = useSite();
  const today = todayISO();
  const [date, setDate] = useState(today);
  const [time, setTime] = useState(QUICK_TIMES[0].value);
  const [guests, setGuests] = useState(QUICK_GUESTS[0].value);
  const [error, setError] = useState('');

  function handleQuickReserve(e) {
    e.preventDefault();
    if (!date) return setError('Please select a date for your reservation.');
    if (date < today) return setError('Please select today or a future date.');
    setError('');
    onReserve('Table', { date, time, guests });
  }

  return (
    <section id="cabanas" className="py-16 sm:py-24 bg-brand-cream relative overflow-hidden">
      <div className="container mx-auto px-6">
        <SectionHeading eyebrow="🏕️ Exclusive Dining Experience" title="Reserve Your Private" highlight="Table or Cabana">
          Choose your preferred seating zone — from breezy outdoor cabanas to our air-conditioned royal fine dining hall.
        </SectionHeading>

        <div className="grid md:grid-cols-2 gap-8">
          {ZONES.map((zone, i) => (
            <div
              key={zone.type}
              className="group relative rounded-3xl overflow-hidden hover-lift"
              data-aos="fade-up"
              data-aos-delay={i * 100}
              {...tilt}
            >
              <div className="img-zoom h-96" {...zoomPan}>
                <img src={site.cabanaPhotos[zone.photo]} alt={zone.type} loading="lazy" className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/50 to-transparent pointer-events-none" />
              <div className={`absolute top-4 left-4 ${zone.badgeClass} text-white px-4 py-2 rounded-full text-xs font-bold uppercase`}>
                {zone.badge}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <h3 className="text-3xl font-serif font-bold mb-2">{zone.type}</h3>
                <p className="text-white/90 mb-4">{zone.text}</p>
                <div className="flex items-center gap-6 text-sm mb-4">
                  {zone.features.map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => onReserve(zone.type)}
                  className="bg-white text-brand-dark px-6 py-3 rounded-full font-bold hover:bg-brand-orange hover:text-white transition-all duration-300"
                >
                  {zone.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Quick booking: pick date/time/guests here, name & phone in the modal */}
        <div className="glass rounded-3xl p-5 sm:p-8 md:p-12 mt-10 sm:mt-12" data-aos="fade-up" data-aos-delay="200">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-serif font-bold mb-2">Quick Table Reservation</h3>
            <p className="text-brand-brown/70">Select your date, time, and party size</p>
          </div>

          <form className="grid md:grid-cols-4 gap-6" onSubmit={handleQuickReserve} noValidate>
            <div>
              <label htmlFor="quick-date" className="block text-sm font-bold mb-2 text-brand-dark">Date</label>
              <div className="relative">
                <input
                  id="quick-date"
                  type="date"
                  min={today}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`${fieldClass} cursor-pointer`}
                  style={{ colorScheme: 'light' }}
                />
                <Calendar className="absolute right-4 top-4 w-5 h-5 text-brand-brown/40 pointer-events-none" />
              </div>
            </div>

            <div>
              <label htmlFor="quick-time" className="block text-sm font-bold mb-2 text-brand-dark">Time</label>
              <div className="relative">
                <select id="quick-time" value={time} onChange={(e) => setTime(e.target.value)} className={`${fieldClass} appearance-none`}>
                  {QUICK_TIMES.map((o) => (
                    <option key={o.label} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <Clock className="absolute right-4 top-4 w-5 h-5 text-brand-brown/40 pointer-events-none" />
              </div>
            </div>

            <div>
              <label htmlFor="quick-guests" className="block text-sm font-bold mb-2 text-brand-dark">Guests</label>
              <div className="relative">
                <select id="quick-guests" value={guests} onChange={(e) => setGuests(e.target.value)} className={`${fieldClass} appearance-none`}>
                  {QUICK_GUESTS.map((o) => (
                    <option key={o.label} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <Users className="absolute right-4 top-4 w-5 h-5 text-brand-brown/40 pointer-events-none" />
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-brand-orange text-white px-6 py-4 rounded-xl font-bold hover:bg-brand-dark transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                Check & Reserve
              </button>
            </div>
          </form>
          {error && (
            <p role="alert" className="mt-4 text-sm font-semibold text-red-700 text-center">⚠️ {error}</p>
          )}
        </div>
      </div>
    </section>
  );
}
