import { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';

export default function Loader({ onDone, name = 'PAHADI' }) {
  const [progress, setProgress] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    let value = 0;
    const timers = [];
    const interval = setInterval(() => {
      value = Math.min(100, value + Math.random() * 30);
      setProgress(value);
      if (value >= 100) {
        clearInterval(interval);
        timers.push(setTimeout(() => setFading(true), 300));
        timers.push(setTimeout(onDone, 800));
      }
    }, 200);
    return () => {
      clearInterval(interval);
      timers.forEach(clearTimeout);
    };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 bg-brand-dark z-[9999] flex items-center justify-center transition-opacity duration-500 ${fading ? 'opacity-0' : 'opacity-100'}`}
      role="progressbar"
      aria-label="Loading"
      aria-valuenow={Math.round(progress)}
    >
      <div className="text-center">
        <div className="fire-logo mb-6">
          <Flame className="w-20 h-20 text-brand-orange mx-auto" />
        </div>
        <h2 className="text-brand-cream font-serif text-3xl mb-1">{name}</h2>
        <p className="text-brand-gold text-xs tracking-[0.3em] uppercase mb-4">Dhaba & Cafe</p>
        <div className="w-64 h-1 bg-brand-brown rounded-full overflow-hidden">
          <div className="h-full bg-brand-orange rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}
