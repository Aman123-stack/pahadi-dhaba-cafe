import { useEffect, useRef, useState } from 'react';
import { useBodyLock } from '../lib/useBodyLock.js';

// Centered dialog that scales in. Closes on Escape or a click on the backdrop.
export default function Modal({ onClose, label, maxWidth = 'max-w-2xl', children }) {
  const [shown, setShown] = useState(false);
  const panel = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;
  useBodyLock(true);

  useEffect(() => {
    const id = setTimeout(() => setShown(true), 10);
    const previous = document.activeElement;
    panel.current?.focus();
    const onKey = (e) => e.key === 'Escape' && close.current();
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(id);
      window.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && close.current()}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={`bg-white rounded-3xl p-5 sm:p-8 md:p-12 w-full ${maxWidth} mx-4 max-h-[90vh] overflow-y-auto outline-none transform transition-transform duration-500 ${shown ? 'scale-100' : 'scale-0'}`}
      >
        {children}
      </div>
    </div>
  );
}
